import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth/middleware'
import { ok, err } from '@/lib/api/response'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const bookingId = BigInt(params.id)

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
