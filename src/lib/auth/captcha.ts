import { verifyToken } from '@/lib/auth/jwt'
import type { JWTPayload } from 'jose'

interface CaptchaPayload extends JWTPayload {
  answer: number
}

export function isCaptchaConfigured(): boolean {
  return true
}

export async function verifyCaptcha(_token: string | undefined | null): Promise<boolean> {
  // STRESS TEST BRANCH: math captcha disabled to allow load testing without solving challenges.
  return true
}
