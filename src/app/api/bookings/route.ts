import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth/middleware'
import {
  findPassengerEligibility,
  checkBookingEligibility,
} from '@/lib/auth/passenger'
import { bookingSchema, buildPickupDateTime } from '@/lib/validators/booking.schema'
import { verifyCaptcha } from '@/lib/auth/captcha'
import { ok, okPage, err } from '@/lib/api/response'
import {
  ACTIVE_STATUSES,
  BookingStatus,
  BookingConflictError,
  BookingQuotaError,
  MAX_ACTIVE_BOOKINGS,
} from '@/lib/booking/constants'
import { computeTripDirections, type BookingForPairing } from '@/lib/booking/tripDirection'

const ONE_DAY_MS = 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const profile = await findPassengerEligibility(auth.payload.accountId)
  if (!profile) return err('找不到乘客資料', 404)

  const { searchParams } = new URL(req.url)
  const statusParam = searchParams.get('status')
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit = 10

  const where = statusParam === 'history'
    ? { PassengerID: profile.PassengerID, BookingStatus: { in: [BookingStatus.Cancelled, BookingStatus.Completed] } }
    : statusParam === 'upcoming'
    ? { PassengerID: profile.PassengerID, BookingStatus: { in: [...ACTIVE_STATUSES] } }
    : { PassengerID: profile.PassengerID }

  const [total, bookings] = await Promise.all([
    prisma.bookings.count({ where }),
    prisma.bookings.findMany({
      where,
      orderBy: { PickupTime: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        dispatchTasks: {
          include: {
            vehicle: {
              select: { PlateNo: true, VehicleType: true },
            },
            driver: {
              select: { DriverName: true, DriverNo: true },
            },
          },
        },
      },
    }),
  ])

  const roundTripTimes = bookings
    .filter((b): b is typeof b & { PickupTime: Date } => !!b.IsRoundTrip && !!b.PickupTime)
    .map((b) => b.PickupTime.getTime())
  let pairingInput: BookingForPairing[] = []
  if (roundTripTimes.length > 0) {
    const min = new Date(Math.min(...roundTripTimes) - ONE_DAY_MS)
    const max = new Date(Math.max(...roundTripTimes) + ONE_DAY_MS)
    const siblings = await prisma.bookings.findMany({
      where: {
        PassengerID: profile.PassengerID,
        IsRoundTrip: true,
        PickupTime: { gte: min, lte: max },
      },
      select: {
        BookingID: true,
        PassengerID: true,
        PickupTime: true,
        PickupAddr: true,
        DropoffAddr: true,
        IsRoundTrip: true,
      },
    })
    pairingInput = siblings
      .filter((s): s is typeof s & { PassengerID: string; PickupTime: Date } =>
        !!s.PassengerID && !!s.PickupTime,
      )
      .map((s) => ({
        BookingID: s.BookingID,
        PassengerID: s.PassengerID,
        PickupTime: s.PickupTime,
        PickupAddr: s.PickupAddr ?? '',
        DropoffAddr: s.DropoffAddr ?? '',
        IsRoundTrip: true,
      }))
  }

  const directions = computeTripDirections(pairingInput)

  const enriched = bookings.map((b) => ({
    ...b,
    tripDirection:
      directions.get(String(b.BookingID)) ?? (b.IsRoundTrip ? 'unknown_roundtrip' : 'oneway'),
  }))

  return okPage(enriched, { total, page, limit })
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const body = await req.json().catch(() => null)
  if (!body) return err('請求格式錯誤', 400)

  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: '資料格式錯誤', details: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const input = parsed.data

  const captchaOk = await verifyCaptcha(input.captchaToken)
  if (!captchaOk) return err('機器人驗證未通過，請重新驗證', 400)

  const profile = await findPassengerEligibility(auth.payload.accountId)
  if (!profile) return err('找不到乘客資料', 404)
  const ineligible = checkBookingEligibility(profile)
  if (ineligible) return ineligible

  const pickupTime = buildPickupDateTime(input.pickupDate, input.pickupHour)
  if (!pickupTime) return err('預約時間格式錯誤', 422)
  if (pickupTime.getTime() <= Date.now()) {
    return err('上車時段須晚於現在時間', 422)
  }
  if (input.isRoundTrip && input.returnPickupHour !== undefined) {
    const returnTime = buildPickupDateTime(input.pickupDate, input.returnPickupHour)
    if (returnTime && returnTime.getTime() <= Date.now()) {
      return err('回程時段須晚於現在時間', 422)
    }
  }

  try {
    const booking = await prisma.$transaction(
      async (tx) => {
        const conflict = await tx.bookings.findFirst({
          where: {
            PassengerID: profile.PassengerID,
            PickupTime: pickupTime,
            BookingStatus: { in: [...ACTIVE_STATUSES] },
          },
        })
        if (conflict) throw new BookingConflictError()

        const activeCount = await tx.bookings.count({
          where: { PassengerID: profile.PassengerID, BookingStatus: { in: [...ACTIVE_STATUSES] } },
        })
        if (activeCount >= MAX_ACTIVE_BOOKINGS) throw new BookingQuotaError()

        return tx.bookings.create({
          data: {
            PassengerID: profile.PassengerID,
            BookingType: profile.IdentityType,
            PickupTime: pickupTime,
            PickupAddr: input.pickupAddr,
            DropoffAddr: input.dropoffAddr,
            CompanionCount: input.companionCount,
            BookingStatus: BookingStatus.Pending,
            IsRoundTrip: input.isRoundTrip,
          },
        })
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )

    return ok(booking, 201)
  } catch (error) {
    if (error instanceof BookingConflictError) return err('您已在該時段有預約', 409)
    if (error instanceof BookingQuotaError) return err('已達同時預約上限（3 筆）', 422)
    throw error
  }
}
