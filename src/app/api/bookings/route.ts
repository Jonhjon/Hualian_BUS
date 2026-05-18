import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth/middleware'
import { bookingSchema, buildPickupDateTime } from '@/lib/validators/booking.schema'
import { verifyCaptcha } from '@/lib/auth/captcha'
import { ok, okPage, err } from '@/lib/api/response'

class BookingConflictError extends Error {}
class BookingQuotaError extends Error {}

const ACTIVE_STATUSES = [0, 1, 3, 5]
const MAX_ACTIVE = 3

async function getPassengerProfile(accountId: string) {
  const profile = await prisma.passengerProfile.findFirst({
    where: { AccountID: accountId },
    select: { PassengerID: true, IdentityType: true, AuditStatus: true, ExpiryDate: true },
  })
  return profile ?? null
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const profile = await getPassengerProfile(auth.payload.accountId)
  if (!profile) return err('找不到乘客資料', 404)

  const { searchParams } = new URL(req.url)
  const statusParam = searchParams.get('status')
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit = 10

  const where = statusParam === 'history'
    ? { PassengerID: profile.PassengerID, BookingStatus: { in: [2, 4] } }
    : statusParam === 'upcoming'
    ? { PassengerID: profile.PassengerID, BookingStatus: { in: ACTIVE_STATUSES } }
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

  return okPage(bookings, { total, page, limit })
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

  const profile = await getPassengerProfile(auth.payload.accountId)
  if (!profile) return err('找不到乘客資料', 404)
  if (profile.AuditStatus === 0) {
    return err('您的帳號尚在審核中，審核通過後始可預約', 403)
  }
  if (profile.AuditStatus === 2) {
    return err('您的帳號審核未通過，無法預約，請聯繫客服', 403)
  }
  if (profile.AuditStatus !== 1) {
    return err('帳號審核狀態異常，請聯繫客服', 403)
  }
  if (profile.IdentityType !== 1 && profile.IdentityType !== 2) {
    return err('帳號服務類型未設定，請先聯繫客服補齊個人資料', 422)
  }
  if (profile.ExpiryDate && profile.ExpiryDate.getTime() < Date.now()) {
    return err('您的證明已到期，請更新後再行預約', 403)
  }

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
            BookingStatus: { in: ACTIVE_STATUSES },
          },
        })
        if (conflict) throw new BookingConflictError()

        const activeCount = await tx.bookings.count({
          where: { PassengerID: profile.PassengerID, BookingStatus: { in: ACTIVE_STATUSES } },
        })
        if (activeCount >= MAX_ACTIVE) throw new BookingQuotaError()

        return tx.bookings.create({
          data: {
            PassengerID: profile.PassengerID,
            BookingType: profile.IdentityType,
            PickupTime: pickupTime,
            PickupAddr: input.pickupAddr,
            DropoffAddr: input.dropoffAddr,
            CompanionCount: input.companionCount,
            BookingStatus: 0,
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
