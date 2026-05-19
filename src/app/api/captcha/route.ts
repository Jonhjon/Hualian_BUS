import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'

export const dynamic = 'force-dynamic'

function secret(): Uint8Array {
  const key = process.env.JWT_SECRET
  if (!key) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(key)
}

export async function GET() {
  const a = Math.floor(Math.random() * 10) + 1
  const b = Math.floor(Math.random() * 10) + 1
  const answer = a + b

  const challengeToken = await new SignJWT({ answer })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(secret())

  return NextResponse.json({ question: `${a} + ${b} = ?`, challengeToken })
}
