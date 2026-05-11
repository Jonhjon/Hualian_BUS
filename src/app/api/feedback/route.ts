import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth/middleware'
import { feedbackSchema } from '@/lib/validators/feedback.schema'
import { ok, err } from '@/lib/api/response'

async function getPassengerId(accountId: string) {
  const p = await prisma.passengerProfile.findFirst({
    where: { AccountID: accountId },
    select: { PassengerID: true },
  })
  return p?.PassengerID ?? null
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const body = await req.json().catch(() => null)
  if (!body) return err('請求格式錯誤', 400)

  const parsed = feedbackSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: '資料格式錯誤', details: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const input = parsed.data
  const passengerId = await getPassengerId(auth.payload.accountId)
  if (!passengerId) return err('找不到乘客資料', 404)

  const booking = await prisma.bookings.findFirst({
    where: { BookingID: BigInt(input.bookingId), PassengerID: passengerId },
    select: { BookingStatus: true },
  })
  if (!booking) return err('預約不存在', 404)
  if (booking.BookingStatus !== 4) return err('只能對已完趟的預約評分', 409)

  const feedback = await prisma.feedback.create({
    data: {
      BookingID: BigInt(input.bookingId),
      Rating: input.rating,
      Comment: input.comment ?? null,
    },
  })

  return ok(feedback, 201)
}
