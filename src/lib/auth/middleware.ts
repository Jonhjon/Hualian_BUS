import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyToken, type AccessPayload } from './jwt'

type AuthResult =
  | { payload: AccessPayload; error?: never }
  | { payload?: never; error: NextResponse }

export async function requireAuth(): Promise<AuthResult> {
  const token = cookies().get('auth_token')?.value
  if (!token) {
    return { error: NextResponse.json({ success: false, error: '請先登入' }, { status: 401 }) }
  }
  try {
    const payload = await verifyToken<AccessPayload>(token)
    return { payload }
  } catch {
    return {
      error: NextResponse.json(
        { success: false, error: '登入已過期，請重新登入' },
        { status: 401 },
      ),
    }
  }
}
