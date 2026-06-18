import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { signEmailToken } from '@/lib/auth/jwt'
import { sendEmail } from '@/lib/email/mailer'
import { resetPasswordTemplate } from '@/lib/email/templates'
import { ok, err } from '@/lib/api/response'

const schema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
})

// Prefer server-only BASE_URL; fall back to NEXT_PUBLIC_BASE_URL for backwards compat.
const BASE_URL =
  process.env.BASE_URL ??
  process.env.NEXT_PUBLIC_BASE_URL ??
  'http://localhost:3000'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return err('請求格式錯誤', 400)

  const parsed = schema.safeParse(body)
  if (!parsed.success) return err('請填寫帳號與 Email', 422)

  const { username, email } = parsed.data
  const genericResponse = ok({ message: '若帳號與 Email 相符，重設連結已寄出' })

  const account = await prisma.account.findFirst({
    where: { Username: username },
    include: {
      passengers: {
        select: { Email: true },
        take: 1,
      },
    },
  })

  // Always 200 — prevent username/email enumeration
  if (!account) return genericResponse

  // CRITICAL: email must match the email registered on the account.
  // Otherwise any attacker who knows a username could send themselves a
  // reset link and take over the account.
  const storedEmail = account.passengers[0]?.Email
  if (!storedEmail || storedEmail.toLowerCase() !== email.toLowerCase()) {
    return genericResponse
  }

  const token = await signEmailToken(
    { accountId: account.AccountID, email: storedEmail, purpose: 'reset' },
    '1h',
  )
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`

  await sendEmail({
    to: storedEmail,
    subject: '花蓮縣復康巴士 — 密碼重設',
    html: resetPasswordTemplate(resetUrl),
  })

  return genericResponse
}
