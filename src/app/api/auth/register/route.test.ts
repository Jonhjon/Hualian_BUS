/**
 * @jest-environment node
 */
process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-bytes-long!!'

jest.mock('@/lib/db', () => ({
  prisma: {
    account: { findFirst: jest.fn(), create: jest.fn() },
    passengerProfile: { findFirst: jest.fn(), create: jest.fn() },
    $transaction: jest.fn(),
  },
}))

import { POST } from './route'
import { prisma } from '@/lib/db'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

const validBody = {
  username: 'newuser01',
  password: 'password123',
  realName: '王小明',
  identityNo: 'A123456789',
  gender: '男',
  identityType: 1,
  birthDate: '1990-01-01',
  expiryDate: '2030-12-31',
  disabilityLevel: '中度',
  assistiveDevice: '輪椅',
  address: '花蓮縣花蓮市中正路1號',
  applicantName: '王大明',
  relationType: '子女',
  email: 'user@example.com',
  phone: '0912345678',
}

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => jest.clearAllMocks())

describe('POST /api/auth/register', () => {
  it('returns 201 on successful registration', async () => {
    ;(mockPrisma.account.findFirst as jest.Mock).mockResolvedValue(null)
    ;(mockPrisma.passengerProfile.findFirst as jest.Mock).mockResolvedValue(null)
    ;(mockPrisma.$transaction as jest.Mock).mockResolvedValue(undefined)

    const res = await POST(makeRequest(validBody) as never)
    expect(res.status).toBe(201)
  })

  it('returns 409 when username already exists', async () => {
    ;(mockPrisma.account.findFirst as jest.Mock).mockResolvedValue({ AccountID: 'existing' })

    const res = await POST(makeRequest(validBody) as never)
    expect(res.status).toBe(409)
    const data = await res.json()
    expect(data.error).toMatch(/帳號/)
  })

  it('returns 409 when identityNo already used', async () => {
    ;(mockPrisma.account.findFirst as jest.Mock).mockResolvedValue(null)
    ;(mockPrisma.passengerProfile.findFirst as jest.Mock).mockResolvedValue({ PassengerID: 'x' })

    const res = await POST(makeRequest(validBody) as never)
    expect(res.status).toBe(409)
    const data = await res.json()
    expect(data.error).toMatch(/身分證/)
  })

  it('returns 422 on invalid identity number', async () => {
    const res = await POST(makeRequest({ ...validBody, identityNo: 'A123456788' }) as never)
    expect(res.status).toBe(422)
  })

  it('returns 422 on short password', async () => {
    const res = await POST(makeRequest({ ...validBody, password: '1234567' }) as never)
    expect(res.status).toBe(422)
  })

  it('returns JSON 500 when registration transaction fails', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    ;(mockPrisma.account.findFirst as jest.Mock).mockResolvedValue(null)
    ;(mockPrisma.passengerProfile.findFirst as jest.Mock).mockResolvedValue(null)
    ;(mockPrisma.$transaction as jest.Mock).mockRejectedValue(new Error('database unavailable'))

    const res = await POST(makeRequest(validBody) as never)
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('申請失敗，請稍後再試')
    expect(JSON.stringify(data)).not.toContain('database unavailable')
    spy.mockRestore()
  })
})
