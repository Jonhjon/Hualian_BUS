import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth/middleware'
import {
  findPassengerEligibility,
  checkBookingEligibility,
} from '@/lib/auth/passenger'
import { batchBookingSchema, buildPickupDateTime } from '@/lib/validators/booking.schema'
import { verifyCaptcha } from '@/lib/auth/captcha'
import { ok, err } from '@/lib/api/response'
import {
  ACTIVE_STATUSES,
  BookingStatus,
  BookingConflictError,
  BookingQuotaError,
  MAX_ACTIVE_BOOKINGS,
} from '@/lib/booking/constants'

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const body = await req.json().catch(() => null)
  if (!body) return err('請求格式錯誤', 400)

  const parsed = batchBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: '資料格式錯誤', details: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const { outbound, returnTrip, captchaToken } = parsed.data

  const captchaOk = await verifyCaptcha(captchaToken)
  if (!captchaOk) return err('機器人驗證未通過，請重新驗證', 400)

  const profile = await findPassengerEligibility(auth.payload.accountId)
  if (!profile) return err('找不到乘客資料', 404)
  const ineligible = checkBookingEligibility(profile)
  if (ineligible) return ineligible

  const outboundTime = buildPickupDateTime(outbound.pickupDate, outbound.pickupHour)
  if (!outboundTime) return err('預約時間格式錯誤', 422)
  if (outboundTime.getTime() <= Date.now()) return err('上車時段須晚於現在時間', 422)

  let returnTime: Date | null = null
  if (returnTrip) {
    returnTime = buildPickupDateTime(returnTrip.pickupDate, returnTrip.pickupHour)
    if (!returnTime) return err('回程時間格式錯誤', 422)
    if (returnTime.getTime() <= Date.now()) return err('回程時段須晚於現在時間', 422)
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const times = returnTime ? [outboundTime, returnTime] : [outboundTime]
        const [conflict, activeCount] = await Promise.all([
          tx.bookings.findFirst({
            where: {
              PassengerID: profile.PassengerID,
              PickupTime: { in: times },
              BookingStatus: { in: [...ACTIVE_STATUSES] },
            },
            select: { BookingID: true },
          }),
          tx.bookings.count({
            where: { PassengerID: profile.PassengerID, BookingStatus: { in: [...ACTIVE_STATUSES] } },
          }),
        ])
        if (conflict) throw new BookingConflictError()
        const needed = returnTrip ? 2 : 1
        if (activeCount + needed > MAX_ACTIVE_BOOKINGS) throw new BookingQuotaError()

        const outboundBooking = await tx.bookings.create({
          data: {
            PassengerID: profile.PassengerID,
            BookingType: profile.IdentityType,
            PickupTime: outboundTime,
            PickupAddr: outbound.pickupAddr,
            DropoffAddr: outbound.dropoffAddr,
            CompanionCount: outbound.companionCount,
            BookingStatus: BookingStatus.Pending,
            IsRoundTrip: !!returnTrip,
          },
        })

        let returnBooking: Awaited<ReturnType<typeof tx.bookings.create>> | null = null
        if (returnTrip && returnTime) {
          returnBooking = await tx.bookings.create({
            data: {
              PassengerID: profile.PassengerID,
              BookingType: profile.IdentityType,
              PickupTime: returnTime,
              PickupAddr: returnTrip.pickupAddr,
              DropoffAddr: returnTrip.dropoffAddr,
              CompanionCount: returnTrip.companionCount,
              BookingStatus: BookingStatus.Pending,
              IsRoundTrip: true,
            },
          })
        }

        return { outbound: outboundBooking, returnTrip: returnBooking }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        timeout: 10_000,
      },
    )

    return ok(result, 201)
  } catch (error) {
    if (error instanceof BookingConflictError) return err('您已在該時段有預約', 409)
    if (error instanceof BookingQuotaError) return err('已達同時預約上限（3 筆）', 422)
    throw error
  }
}
