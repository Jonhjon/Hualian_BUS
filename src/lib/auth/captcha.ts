import { verifyToken } from '@/lib/auth/jwt'
import type { JWTPayload } from 'jose'

interface CaptchaPayload extends JWTPayload {
  answer: number
}

export function isCaptchaConfigured(): boolean {
  return true
}

export async function verifyCaptcha(token: string | undefined | null): Promise<boolean> {
  if (!token) return false

  const colonIndex = token.indexOf(':')
  if (colonIndex === -1) return false

  const userAnswerStr = token.slice(0, colonIndex)
  const challengeToken = token.slice(colonIndex + 1)

  const userAnswer = Number(userAnswerStr)
  if (!Number.isInteger(userAnswer)) return false

  try {
    const payload = await verifyToken<CaptchaPayload>(challengeToken)
    return userAnswer === payload.answer
  } catch {
    return false
  }
}
