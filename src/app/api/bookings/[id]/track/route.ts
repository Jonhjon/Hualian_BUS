import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth/middleware'
import { findPassengerId } from '@/lib/auth/passenger'
import { parseBookingId } from '@/lib/booking/constants'
import { ok, err } from '@/lib/api/response'

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
    select: { BookingID: true },
  })
  if (!booking) return err('預約不存在', 404)

  const task = await prisma.dispatchTasks.findFirst({
    where: { BookingID: bookingId },
    select: { VehicleID: true },
  })

  if (!task?.VehicleID) {
    return ok({ position: null, message: '尚未派車' })
  }

  const gps = await prisma.gPSLogs.findFirst({
    where: { VehicleID: task.VehicleID },
    orderBy: { Timestamp: 'desc' },
    select: { Latitude: true, Longitude: true, Speed: true, Timestamp: true },
  })

  if (!gps) return ok({ position: null, message: '尚無 GPS 資料' })

  return ok({
    position: {
      lat: Number(gps.Latitude),
      lng: Number(gps.Longitude),
      speed: Number(gps.Speed),
      timestamp: gps.Timestamp,
    },
  })
}
