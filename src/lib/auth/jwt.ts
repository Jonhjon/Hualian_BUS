import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

export interface AccessPayload extends JWTPayload {
  accountId: string
  username: string
  roleId: number
}

export interface EmailPayload extends JWTPayload {
  accountId: string
  email: string
  purpose: 'verify' | 'reset'
}

function secret(): Uint8Array {
  const key = process.env.JWT_SECRET
  if (!key) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(key)
}

export async function signAccessToken(
  payload: Omit<AccessPayload, keyof JWTPayload>,
): Promise<string> {
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret())
}

export async function signEmailToken(
  payload: Omit<EmailPayload, keyof JWTPayload>,
  expiresIn: '1h' | '24h' = '1h',
): Promise<string> {
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret())
}

export async function verifyToken<T extends JWTPayload>(token: string): Promise<T> {
  const { payload } = await jwtVerify(token, secret())
  return payload as T
}
