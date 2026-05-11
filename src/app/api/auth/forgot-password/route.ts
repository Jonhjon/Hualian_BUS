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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return err('請求格式錯誤', 400)

  const parsed = schema.safeParse(body)
  if (!parsed.success) return err('請填寫帳號與 Email', 422)

  const { username, email } = parsed.data

  const account = await prisma.account.findFirst({ where: { Username: username } })

  // Always 200 — prevent username enumeration
  if (!account) return ok({ message: '若帳號存在，重設連結已寄出' })

  const token = await signEmailToken(
    { accountId: account.AccountID, email, purpose: 'reset' },
    '1h',
  )
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`

  await sendEmail({
    to: email,
    subject: '花蓮縣復康巴士 — 密碼重設',
    html: resetPasswordTemplate(resetUrl),
  })

  return ok({ message: '若帳號存在，重設連結已寄出' })
}
