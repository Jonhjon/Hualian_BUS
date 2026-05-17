import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth/middleware'
import { ok, err } from '@/lib/api/response'

const LATE_CANCEL_HOURS = 24

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const bookingId = BigInt(params.id)
  const booking = await prisma.bookings.findFirst({
    where: { BookingID: bookingId },
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
    prisma.bookings.count({ where: { PassengerID: pid, BookingStatus: 4, PickupTime: { gte: monthStart, lt: monthEnd } } }),
    prisma.bookings.count({ where: { PassengerID: pid, BookingStatus: 2, PickupTime: { gte: monthStart, lt: monthEnd } } }),
  ])

  return ok({ ...booking, monthStats: { monthlyTotal, monthlyCompleted, monthlyCancelled } })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const bookingId = BigInt(params.id)

  const booking = await prisma.bookings.findFirst({
    where: { BookingID: bookingId },
    select: { PassengerID: true, BookingStatus: true, PickupTime: true },
  })
  if (!booking) return err('預約不存在', 404)

  // Only allow cancellation of active bookings
  if (![0, 1, 5].includes(booking.BookingStatus ?? -1)) {
    return err('此預約狀態無法取消', 409)
  }

  await prisma.bookings.update({
    where: { BookingID: bookingId },
    data: { BookingStatus: 2 }, // 2=取消
  })

  const isLateCancel =
    booking.PickupTime != null &&
    booking.PickupTime.getTime() - Date.now() < LATE_CANCEL_HOURS * 60 * 60 * 1000

  return ok({ message: '已取消', isLateCancel })
}
