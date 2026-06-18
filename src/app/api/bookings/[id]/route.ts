import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth/middleware'
import { findPassengerId } from '@/lib/auth/passenger'
import {
  BookingStatus,
  CANCELLABLE_STATUSES,
  parseBookingId,
} from '@/lib/booking/constants'
import { ok, err } from '@/lib/api/response'

const LATE_CANCEL_HOURS = 24

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const bookingId = parseBookingId(params.id)
  if (bookingId === null) return err('無效的預約編號', 400)

  const ownerId = await findPassengerId(auth.payload.accountId)
  if (!ownerId) return err('找不到乘客資料', 404)

  const booking = await prisma.bookings.findFirst({
    where: { BookingID: bookingId, PassengerID: ownerId },
    include: {
      passenger: {
        select: {
          RealName: true,
          Gender: true,
          DisabilityLevel: true,
          AssistiveDevice: true,
          ExpiryDate: true,
          Phone: true,
          account: { select: { Username: true } },
        },
      },
      dispatchTasks: {
        include: {
          vehicle: {
            select: { PlateNo: true, VehicleType: true, SeatCount: true },
          },
          driver: {
            select: { DriverName: true, DriverNo: true, Mobile: true },
          },
        },
      },
    },
  })
  if (!booking) return err('預約不存在', 404)

  const pid = booking.PassengerID
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const [monthlyTotal, monthlyCompleted, monthlyCancelled] = await Promise.all([
    prisma.bookings.count({ where: { PassengerID: pid, PickupTime: { gte: monthStart, lt: monthEnd } } }),
    prisma.bookings.count({ where: { PassengerID: pid, BookingStatus: BookingStatus.Completed, PickupTime: { gte: monthStart, lt: monthEnd } } }),
    prisma.bookings.count({ where: { PassengerID: pid, BookingStatus: BookingStatus.Cancelled, PickupTime: { gte: monthStart, lt: monthEnd } } }),
  ])

  return ok({ ...booking, monthStats: { monthlyTotal, monthlyCompleted, monthlyCancelled } })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const bookingId = parseBookingId(params.id)
  if (bookingId === null) return err('無效的預約編號', 400)

  const ownerId = await findPassengerId(auth.payload.accountId)
  if (!ownerId) return err('找不到乘客資料', 404)

  const booking = await prisma.bookings.findFirst({
    where: { BookingID: bookingId, PassengerID: ownerId },
    select: { PassengerID: true, BookingStatus: true, PickupTime: true },
  })
  if (!booking) return err('預約不存在', 404)

  if (
    booking.BookingStatus == null ||
    !CANCELLABLE_STATUSES.includes(booking.BookingStatus as (typeof CANCELLABLE_STATUSES)[number])
  ) {
    return err('此預約狀態無法取消', 409)
  }

  await prisma.bookings.update({
    where: { BookingID: bookingId },
    data: { BookingStatus: BookingStatus.Cancelled },
  })

  const isLateCancel =
    booking.PickupTime != null &&
    booking.PickupTime.getTime() - Date.now() < LATE_CANCEL_HOURS * 60 * 60 * 1000

  return ok({ message: '已取消', isLateCancel })
}
