import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth/middleware'
import { findPassengerId } from '@/lib/auth/passenger'
import { feedbackSchema } from '@/lib/validators/feedback.schema'
import { BookingStatus } from '@/lib/booking/constants'
import { ok, err } from '@/lib/api/response'

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
  // Zod schema already constrains bookingId to a positive int within safe range.
  // Defensive: also reject non-integer values (e.g. floats coerced through JSON).
  if (!Number.isSafeInteger(input.bookingId)) return err('無效的預約編號', 400)
  const bookingIdBig = BigInt(input.bookingId)

  const passengerId = await findPassengerId(auth.payload.accountId)
  if (!passengerId) return err('找不到乘客資料', 404)

  const booking = await prisma.bookings.findFirst({
    where: { BookingID: bookingIdBig, PassengerID: passengerId },
    select: { BookingStatus: true },
  })
  if (!booking) return err('預約不存在', 404)
  if (booking.BookingStatus !== BookingStatus.Completed) {
    return err('只能對已完趟的預約評分', 409)
  }

  // Application-level duplicate guard. DB-level UNIQUE(BookingID) is missing
  // and noted as a schema task for the DBA.
  const existing = await prisma.feedback.findFirst({
    where: { BookingID: bookingIdBig },
    select: { FeedbackID: true },
  })
  if (existing) return err('此預約已經評分過', 409)

  const feedback = await prisma.feedback.create({
    data: {
      BookingID: bookingIdBig,
      Rating: input.rating,
      Comment: input.comment ?? null,
    },
  })

  return ok(feedback, 201)
}
