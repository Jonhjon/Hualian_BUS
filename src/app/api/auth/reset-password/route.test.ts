/**
 * @jest-environment node
 */
process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-bytes-long!!'

jest.mock('@/lib/db', () => ({
  prisma: {
    account: { update: jest.fn() },
  },
}))

import { POST } from './route'
import { signEmailToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => jest.clearAllMocks())

describe('POST /api/auth/reset-password', () => {
  it('returns 200 with valid reset token', async () => {
    const token = await signEmailToken(
      { accountId: 'uuid-1', email: 'test@example.com', purpose: 'reset' },
      '1h',
    )
    ;(mockPrisma.account.update as jest.Mock).mockResolvedValue({})

    const res = await POST(makeRequest({ token, newPassword: 'newpassword123' }) as never)
    expect(res.status).toBe(200)
  })

  it('returns 400 for expired/invalid token', async () => {
    const res = await POST(makeRequest({ token: 'invalid.token', newPassword: 'newpassword123' }) as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 for verify token used as reset token', async () => {
    const token = await signEmailToken(
      { accountId: 'uuid-1', email: 'test@example.com', purpose: 'verify' },
      '1h',
    )
    const res = await POST(makeRequest({ token, newPassword: 'newpassword123' }) as never)
    expect(res.status).toBe(400)
  })

  it('returns 422 for password too short', async () => {
    const token = await signEmailToken(
      { accountId: 'uuid-1', email: 'test@example.com', purpose: 'reset' },
      '1h',
    )
    const res = await POST(makeRequest({ token, newPassword: '1234567' }) as never)
    expect(res.status).toBe(422)
  })
})
