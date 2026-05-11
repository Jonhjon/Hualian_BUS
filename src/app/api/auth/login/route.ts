import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth/password'
import { signAccessToken } from '@/lib/auth/jwt'
import { ok, err } from '@/lib/api/response'

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return err('請求格式錯誤', 400)

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) return err('請填寫帳號與密碼', 422)

  const { username, password } = parsed.data

  const account = await prisma.account.findFirst({ where: { Username: username } })
  if (!account) return err('帳號或密碼錯誤', 401)

  if (account.IsLocked) {
    return NextResponse.json(
      { success: false, error: '帳號已被鎖定，請聯繫客服' },
      { status: 423 },
    )
  }

  const valid = await verifyPassword(password, account.PasswordHash)
  if (!valid) return err('帳號或密碼錯誤', 401)

  const token = await signAccessToken({
    accountId: account.AccountID,
    username: account.Username,
    roleId: account.RoleID ?? PASSENGER_ROLE_ID,
  })

  await prisma.account.update({
    where: { AccountID: account.AccountID },
    data: {
      LastLoginIP:
        req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? '',
    },
  })

  const res = ok({ message: '登入成功' })
  res.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}

const PASSENGER_ROLE_ID = 4
