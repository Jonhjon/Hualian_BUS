/**
 * @jest-environment node
 */
process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-bytes-long!!'

import { SignJWT } from 'jose'
import { isCaptchaConfigured, verifyCaptcha } from './captcha'

function secret(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_SECRET!)
}

async function makeChallengeToken(answer: number, expiresIn = '5m'): Promise<string> {
  return new SignJWT({ answer })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret())
}

describe('isCaptchaConfigured', () => {
  it('always returns true', () => {
    expect(isCaptchaConfigured()).toBe(true)
  })
})

describe('verifyCaptcha', () => {
  it('returns false for null', async () => {
    expect(await verifyCaptcha(null)).toBe(false)
  })

  it('returns false for undefined', async () => {
    expect(await verifyCaptcha(undefined)).toBe(false)
  })

  it('returns false for empty string', async () => {
    expect(await verifyCaptcha('')).toBe(false)
  })

  it('returns false when token has no colon separator', async () => {
    expect(await verifyCaptcha('invalidtoken')).toBe(false)
  })

  it('returns true when answer matches signed token', async () => {
    const challengeToken = await makeChallengeToken(8)
    expect(await verifyCaptcha(`8:${challengeToken}`)).toBe(true)
  })

  it('returns false when answer is wrong', async () => {
    const challengeToken = await makeChallengeToken(8)
    expect(await verifyCaptcha(`7:${challengeToken}`)).toBe(false)
  })

  it('returns false when challenge token is expired', async () => {
    const expiredToken = await new SignJWT({ answer: 5 })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) - 10)
      .sign(secret())
    expect(await verifyCaptcha(`5:${expiredToken}`)).toBe(false)
  })

  it('returns false when challenge token is invalid JWT', async () => {
    expect(await verifyCaptcha('8:not.a.valid.jwt')).toBe(false)
  })

  it('returns false for non-integer answer (float)', async () => {
    const challengeToken = await makeChallengeToken(8)
    expect(await verifyCaptcha(`8.5:${challengeToken}`)).toBe(false)
  })

  it('returns false when token is signed with wrong secret', async () => {
    const wrongSecret = new TextEncoder().encode('totally-wrong-secret-key-12345678')
    const badToken = await new SignJWT({ answer: 8 })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(wrongSecret)
    expect(await verifyCaptcha(`8:${badToken}`)).toBe(false)
  })
})
