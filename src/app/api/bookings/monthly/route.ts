import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth/middleware'
import { ok, err } from '@/lib/api/response'

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const year  = parseInt(searchParams.get('year')  ?? String(new Date().getFullYear()), 10)
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1), 10)

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return err('無效的年月參數', 400)
  }

  const monthStart = new Date(year, month - 1, 1)
  const monthEnd   = new Date(year, month, 1)

  const profile = await prisma.passengerProfile.findFirst({
    where: { AccountID: auth.payload.accountId },
    select: { PassengerID: true },
  })
  if (!profile) return err('找不到乘客資料', 404)

  const pid = profile.PassengerID

  const [bookings, totalCount, completedCount] = await Promise.all([
    prisma.bookings.findMany({
      where: {
        PassengerID: pid,
        PickupTime: { gte: monthStart, lt: monthEnd },
      },
      include: {
        passenger: {
          select: {
            RealName: true,
            Gender: true,
            AssistiveDevice: true,
            account: { select: { Username: true } },
          },
        },
        dispatchTasks: {
          include: {
            vehicle: { select: { PlateNo: true, VehicleType: true } },
            driver:  { select: { DriverName: true, DriverNo: true } },
          },
        },
      },
      orderBy: { PickupTime: 'asc' },
    }),
    prisma.bookings.count({
      where: { PassengerID: pid, PickupTime: { gte: monthStart, lt: monthEnd } },
    }),
    prisma.bookings.count({
      where: { PassengerID: pid, BookingStatus: 4, PickupTime: { gte: monthStart, lt: monthEnd } },
    }),
  ])

  return ok({ bookings, summary: { totalCount, completedCount, year, month } })
}
