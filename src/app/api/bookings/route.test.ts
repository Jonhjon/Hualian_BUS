/**
 * @jest-environment node
 */
process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-bytes-long!!'

jest.mock('@/lib/auth/middleware', () => ({
  requireAuth: jest.fn(),
}))

jest.mock('@/lib/db', () => {
  const prismaMock: Record<string, unknown> = {
    passengerProfile: { findFirst: jest.fn(), update: jest.fn() },
    bookings: { findFirst: jest.fn(), count: jest.fn(), findMany: jest.fn(), create: jest.fn() },
  }
  prismaMock.$transaction = jest.fn((cb: (tx: typeof prismaMock) => unknown) => cb(prismaMock))
  return { prisma: prismaMock }
})

jest.mock('@/lib/auth/captcha', () => ({
  verifyCaptcha: jest.fn().mockResolvedValue(true),
  isCaptchaConfigured: jest.fn().mockReturnValue(false),
}))

import { GET, POST } from './route'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/db'

const mockAuth = requireAuth as jest.Mock
const mockPrisma = prisma as jest.Mocked<typeof prisma>

const PASSENGER_ID = 'passenger-uuid-1'
const ACCOUNT_ID = 'account-uuid-1'
const authPayload = { payload: { accountId: ACCOUNT_ID, username: 'test', roleId: 4 } }

function today(hourOffset = 3): string {
  const d = new Date()
  d.setDate(d.getDate() + hourOffset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const validBody = {
  pickupDate: today(),
  pickupHour: 9,
  pickupAddr: '花蓮市中正路1號',
  dropoffAddr: '花蓮市民國路2號',
  companionCount: 0,
  isRoundTrip: false,
}

function makeRequest(body?: unknown) {
  return new Request('http://localhost/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? validBody),
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockAuth.mockResolvedValue(authPayload)
  ;(mockPrisma.passengerProfile.findFirst as jest.Mock).mockResolvedValue({
    PassengerID: PASSENGER_ID,
    IdentityType: 1,
    AuditStatus: 1,
    ExpiryDate: null,
  })
})

describe('POST /api/bookings', () => {
  it('returns 201 on successful booking', async () => {
    ;(mockPrisma.bookings.findFirst as jest.Mock).mockResolvedValue(null)
    ;(mockPrisma.bookings.count as jest.Mock).mockResolvedValue(0)
    ;(mockPrisma.bookings.create as jest.Mock).mockResolvedValue({ BookingID: BigInt(1), BookingStatus: 0 })

    const res = await POST(makeRequest() as never)
    expect(res.status).toBe(201)
  })

  it('uses passenger identity type instead of trusting request bookingType', async () => {
    ;(mockPrisma.passengerProfile.findFirst as jest.Mock).mockResolvedValue({
      PassengerID: PASSENGER_ID,
      IdentityType: 1,
      AuditStatus: 1,
      ExpiryDate: null,
    })
    ;(mockPrisma.bookings.findFirst as jest.Mock).mockResolvedValue(null)
    ;(mockPrisma.bookings.count as jest.Mock).mockResolvedValue(0)
    ;(mockPrisma.bookings.create as jest.Mock).mockResolvedValue({ BookingID: BigInt(1), BookingStatus: 0 })

    const res = await POST(makeRequest({ ...validBody, bookingType: 2 }) as never)

    expect(res.status).toBe(201)
    expect(mockPrisma.bookings.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ BookingType: 1 }),
      }),
    )
  })

  it('returns 422 when passenger identity type is missing', async () => {
    ;(mockPrisma.passengerProfile.findFirst as jest.Mock).mockResolvedValue({
      PassengerID: PASSENGER_ID,
      IdentityType: null,
      AuditStatus: 1,
      ExpiryDate: null,
    })

    const res = await POST(makeRequest() as never)
    expect(res.status).toBe(422)
  })

  it('returns 409 when same time slot already booked', async () => {
    ;(mockPrisma.bookings.findFirst as jest.Mock).mockResolvedValue({ BookingID: BigInt(99) })

    const res = await POST(makeRequest() as never)
    expect(res.status).toBe(409)
  })

  it('returns 422 when active bookings >= 3', async () => {
    ;(mockPrisma.bookings.findFirst as jest.Mock).mockResolvedValue(null)
    ;(mockPrisma.bookings.count as jest.Mock).mockResolvedValue(3)

    const res = await POST(makeRequest() as never)
    expect(res.status).toBe(422)
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({
      error: new Response(JSON.stringify({ error: '請先登入' }), { status: 401 }),
    })

    const res = await POST(makeRequest() as never)
    expect(res.status).toBe(401)
  })

  it('returns 422 for invalid booking data', async () => {
    const res = await POST(makeRequest({ ...validBody, companionCount: 5 }) as never)
    expect(res.status).toBe(422)
  })

  it('wraps conflict/quota/create in a Serializable transaction', async () => {
    ;(mockPrisma.bookings.findFirst as jest.Mock).mockResolvedValue(null)
    ;(mockPrisma.bookings.count as jest.Mock).mockResolvedValue(0)
    ;(mockPrisma.bookings.create as jest.Mock).mockResolvedValue({ BookingID: BigInt(1), BookingStatus: 0 })

    const res = await POST(makeRequest() as never)

    expect(res.status).toBe(201)
    expect((mockPrisma as unknown as { $transaction: jest.Mock }).$transaction).toHaveBeenCalledTimes(1)
    const call = (mockPrisma as unknown as { $transaction: jest.Mock }).$transaction.mock.calls[0]
    expect(call[1]).toMatchObject({ isolationLevel: 'Serializable' })
  })

  it('does not create booking when conflict detected inside transaction', async () => {
    ;(mockPrisma.bookings.findFirst as jest.Mock).mockResolvedValue({ BookingID: BigInt(99) })

    const res = await POST(makeRequest() as never)

    expect(res.status).toBe(409)
    expect(mockPrisma.bookings.create).not.toHaveBeenCalled()
  })

  it('does not create booking when quota exceeded inside transaction', async () => {
    ;(mockPrisma.bookings.findFirst as jest.Mock).mockResolvedValue(null)
    ;(mockPrisma.bookings.count as jest.Mock).mockResolvedValue(3)

    const res = await POST(makeRequest() as never)

    expect(res.status).toBe(422)
    expect(mockPrisma.bookings.create).not.toHaveBeenCalled()
  })

  it('never updates passenger profile from booking endpoint (read-only fields)', async () => {
    ;(mockPrisma.bookings.findFirst as jest.Mock).mockResolvedValue(null)
    ;(mockPrisma.bookings.count as jest.Mock).mockResolvedValue(0)
    ;(mockPrisma.bookings.create as jest.Mock).mockResolvedValue({ BookingID: BigInt(1), BookingStatus: 0 })

    // Even if a stale client sends these legacy fields, the schema ignores them
    // and the API must not write them back to PassengerProfile.
    const res = await POST(
      makeRequest({ ...validBody, disabilityLevel: '重度', assistiveDevice: '助行器' }) as never,
    )

    expect(res.status).toBe(201)
    expect(mockPrisma.passengerProfile.update).not.toHaveBeenCalled()
  })
})

describe('GET /api/bookings', () => {
  it('returns booking list', async () => {
    ;(mockPrisma.bookings.count as jest.Mock).mockResolvedValue(1)
    ;(mockPrisma.bookings.findMany as jest.Mock).mockResolvedValue([{ BookingID: BigInt(1) }])

    const req = new Request('http://localhost/api/bookings')
    const res = await GET(req as never)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.meta.total).toBe(1)
  })
})
