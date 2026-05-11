import { NextRequest } from 'next/server'
import { z } from 'zod'
import { verifyToken, type EmailPayload } from '@/lib/auth/jwt'
import { ok, err } from '@/lib/api/response'

const schema = z.object({ token: z.string().min(1) })

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return err('請求格式錯誤', 400)

  const parsed = schema.safeParse(body)
  if (!parsed.success) return err('資料格式錯誤', 422)

  let payload: EmailPayload
  try {
    payload = await verifyToken<EmailPayload>(parsed.data.token)
  } catch {
    return err('連結已失效或過期', 400)
  }

  if (payload.purpose !== 'verify') return err('連結無效', 400)

  return ok({ message: 'Email 驗證成功', accountId: payload.accountId })
}
