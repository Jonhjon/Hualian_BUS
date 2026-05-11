/**
 * @jest-environment node
 */
process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-bytes-long!!'

jest.mock('@/lib/db', () => ({
  prisma: {
    account: { findFirst: jest.fn(), update: jest.fn() },
  },
}))

import { POST } from './route'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth/password'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => jest.clearAllMocks())

describe('POST /api/auth/login', () => {
  it('returns 200 and sets cookie on valid credentials', async () => {
    const hash = await hashPassword('correctPass1')
    ;(mockPrisma.account.findFirst as jest.Mock).mockResolvedValue({
      AccountID: 'uuid-1',
      Username: 'testuser',
      PasswordHash: hash,
      RoleID: 4,
      IsLocked: false,
    })
    ;(mockPrisma.account.update as jest.Mock).mockResolvedValue({})

    const res = await POST(makeRequest({ username: 'testuser', password: 'correctPass1' }) as never)
    expect(res.status).toBe(200)
    expect(res.headers.get('set-cookie')).toContain('auth_token')
  })

  it('returns 401 for wrong password', async () => {
    const hash = await hashPassword('correctPass1')
    ;(mockPrisma.account.findFirst as jest.Mock).mockResolvedValue({
      AccountID: 'uuid-1',
      Username: 'testuser',
      PasswordHash: hash,
      RoleID: 4,
      IsLocked: false,
    })

    const res = await POST(makeRequest({ username: 'testuser', password: 'wrongpass' }) as never)
    expect(res.status).toBe(401)
  })

  it('returns 401 when account not found', async () => {
    ;(mockPrisma.account.findFirst as jest.Mock).mockResolvedValue(null)

    const res = await POST(makeRequest({ username: 'nobody', password: 'anything' }) as never)
    expect(res.status).toBe(401)
  })

  it('returns 423 when account is locked', async () => {
    const hash = await hashPassword('correctPass1')
    ;(mockPrisma.account.findFirst as jest.Mock).mockResolvedValue({
      AccountID: 'uuid-1',
      Username: 'testuser',
      PasswordHash: hash,
      RoleID: 4,
      IsLocked: true,
    })

    const res = await POST(makeRequest({ username: 'testuser', password: 'correctPass1' }) as never)
    expect(res.status).toBe(423)
  })

  it('returns 422 for missing fields', async () => {
    const res = await POST(makeRequest({ username: '' }) as never)
    expect(res.status).toBe(422)
  })
})
