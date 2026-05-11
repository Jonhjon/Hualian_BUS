/**
 * @jest-environment node
 */
process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-bytes-long!!'

import { signAccessToken, signEmailToken, verifyToken, type AccessPayload, type EmailPayload } from './jwt'

describe('signAccessToken / verifyToken', () => {
  it('signs and verifies access token', async () => {
    const token = await signAccessToken({ accountId: 'abc-123', username: 'testuser', roleId: 4 })
    expect(typeof token).toBe('string')
    const payload = await verifyToken<AccessPayload>(token)
    expect(payload.accountId).toBe('abc-123')
    expect(payload.username).toBe('testuser')
    expect(payload.roleId).toBe(4)
  })

  it('throws when JWT_SECRET is not set', async () => {
    const original = process.env.JWT_SECRET
    delete process.env.JWT_SECRET
    await expect(
      signAccessToken({ accountId: 'x', username: 'x', roleId: 1 }),
    ).rejects.toThrow('JWT_SECRET is not set')
    process.env.JWT_SECRET = original
  })

  it('throws on invalid token', async () => {
    await expect(verifyToken('invalid.token.here')).rejects.toThrow()
  })
})

describe('signEmailToken', () => {
  it('signs reset token with purpose=reset', async () => {
    const token = await signEmailToken(
      { accountId: 'abc', email: 'user@example.com', purpose: 'reset' },
      '1h',
    )
    const payload = await verifyToken<EmailPayload>(token)
    expect(payload.purpose).toBe('reset')
    expect(payload.email).toBe('user@example.com')
  })

  it('signs verify token with purpose=verify', async () => {
    const token = await signEmailToken(
      { accountId: 'abc', email: 'user@example.com', purpose: 'verify' },
      '24h',
    )
    const payload = await verifyToken<EmailPayload>(token)
    expect(payload.purpose).toBe('verify')
  })
})
