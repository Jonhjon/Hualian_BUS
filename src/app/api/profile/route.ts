import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/db'
import { ok, err } from '@/lib/api/response'
import { maskIdentityNo } from '@/lib/utils/mask'

const STATUS_COMPLETED = 4
const STATUS_CANCELLED = 2

interface MonthlyStats {
  booked: number
  completed: number
  cancelled: number
}

function getMonthRange(now: Date): { start: Date; end: Date } {
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0)
  return { start, end }
}

async function getMonthlyStats(passengerId: string): Promise<MonthlyStats> {
  const { start, end } = getMonthRange(new Date())
  const groups = await prisma.bookings.groupBy({
    by: ['BookingStatus'],
    where: {
      PassengerID: passengerId,
      PickupTime: { gte: start, lt: end },
    },
    _count: { _all: true },
  })

  let booked = 0
  let completed = 0
  let cancelled = 0
  for (const g of groups) {
    const n = g._count._all
    booked += n
    if (g.BookingStatus === STATUS_COMPLETED) completed = n
    else if (g.BookingStatus === STATUS_CANCELLED) cancelled = n
  }
  return { booked, completed, cancelled }
}

export async function GET() {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const profile = await prisma.passengerProfile.findFirst({
    where: { AccountID: auth.payload.accountId },
  })
  if (!profile) return err('找不到乘客資料', 404)

  const monthlyStats = await getMonthlyStats(profile.PassengerID)

  return ok({
    username: auth.payload.username,
    realName: profile.RealName,
    identityNo: maskIdentityNo(profile.IdentityNo),
    identityType: profile.IdentityType,
    auditStatus: profile.AuditStatus,
    address: profile.Address,
    birthDate: profile.BirthDate,
    expiryDate: profile.ExpiryDate,
    disabilityLevel: profile.DisabilityLevel,
    assistiveDevice: profile.AssistiveDevice,
    monthlyStats,
  })
}
