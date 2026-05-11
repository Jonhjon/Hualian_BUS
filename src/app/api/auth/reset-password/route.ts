import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { verifyToken, type EmailPayload } from '@/lib/auth/jwt'
import { hashPassword } from '@/lib/auth/password'
import { ok, err } from '@/lib/api/response'

const schema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(100),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return err('請求格式錯誤', 400)

  const parsed = schema.safeParse(body)
  if (!parsed.success) return err('資料格式錯誤', 422)

  const { token, newPassword } = parsed.data

  let payload: EmailPayload
  try {
    payload = await verifyToken<EmailPayload>(token)
  } catch {
    return err('連結已失效或過期', 400)
  }

  if (payload.purpose !== 'reset') return err('連結無效', 400)

  await prisma.account.update({
    where: { AccountID: payload.accountId },
    data: { PasswordHash: await hashPassword(newPassword) },
  })

  return ok({ message: '密碼已重設成功' })
}
