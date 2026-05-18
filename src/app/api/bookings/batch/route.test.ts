/**
 * @jest-environment node
 */
process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-bytes-long!!'

jest.mock('@/lib/auth/middleware', () => ({
  requireAuth: jest.fn(),
}))

jest.mock('@/lib/db', () => {
  const prismaMock: Record<string, unknown> = {
    passengerProfile: { findFirst: jest.fn() },
    bookings: { findFirst: jest.fn(), count: jest.fn(), create: jest.fn() },
  }
  prismaMock.$transaction = jest.fn((cb: (tx: typeof prismaMock) => unknown) => cb(prismaMock))
  return { prisma: prismaMock }
})

jest.mock('@/lib/auth/captcha', () => ({
  verifyCaptcha: jest.fn().mockResolvedValue(true),
}))

import { POST } from './route'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/db'

const mockAuth = requireAuth as jest.Mock
const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockTransaction = (mockPrisma as unknown as { $transaction: jest.Mock }).$transaction

const PASSENGER_ID = 'passenger-uuid-1'
const ACCOUNT_ID = 'account-uuid-1'
const authPayload = { payload: { accountId: ACCOUNT_ID, username: 'test', roleId: 4 } }

function tomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 3)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const outboundBody = {
  pickupDate: tomorrow(),
  pickupHour: 9,
  pickupAddr: '花蓮市中正路1號',
  dropoffAddr: '花蓮市民國路2號',
  companionCount: 0,
  isRoundTrip: true,
}

const returnBody = {
  pickupDate: tomorrow(),
  pickupHour: 14,
  pickupAddr: '花蓮市民國路2號',
  dropoffAddr: '花蓮市中正路1號',
  companionCount: 0,
  isRoundTrip: false,
}

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/bookings/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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

describe('POST /api/bookings/batch', () => {
  it('creates both outbound and return bookings on success', async () => {
    ;(mockPrisma.bookings.findFirst as jest.Mock).mockResolvedValue(null)
    ;(mockPrisma.bookings.count as jest.Mock).mockResolvedValue(0)
    ;(mockPrisma.bookings.create as jest.Mock).mockResolvedValue({ BookingID: BigInt(1) })

    const res = await POST(makeRequest({ outbound: outboundBody, returnTrip: returnBody }) as never)

    expect(res.status).toBe(201)
    expect(mockPrisma.bookings.create).toHaveBeenCalledTimes(2)
    expect(mockTransaction).toHaveBeenCalledTimes(1)
    const opts = mockTransaction.mock.calls[0][1]
    expect(opts).toMatchObject({ isolationLevel: 'Serializable' })
  })

  it('creates only outbound when returnTrip omitted', async () => {
    ;(mockPrisma.bookings.findFirst as jest.Mock).mockResolvedValue(null)
    ;(mockPrisma.bookings.count as jest.Mock).mockResolvedValue(0)
    ;(mockPrisma.bookings.create as jest.Mock).mockResolvedValue({ BookingID: BigInt(1) })

    const oneWayBody = { ...outboundBody, isRoundTrip: false }
    const res = await POST(makeRequest({ outbound: oneWayBody }) as never)

    expect(res.status).toBe(201)
    expect(mockPrisma.bookings.create).toHaveBeenCalledTimes(1)
  })

  it('rejects when isRoundTrip=true but returnTrip missing', async () => {
    const res = await POST(makeRequest({ outbound: outboundBody }) as never)
    expect(res.status).toBe(422)
    expect(mockPrisma.bookings.create).not.toHaveBeenCalled()
  })

  it('rejects when returnTrip pickupHour <= outbound pickupHour', async () => {
    const res = await POST(
      makeRequest({ outbound: outboundBody, returnTrip: { ...returnBody, pickupHour: 9 } }) as never,
    )
    expect(res.status).toBe(422)
  })

  it('rolls back entire batch when conflict found on return trip', async () => {
    ;(mockPrisma.bookings.findFirst as jest.Mock).mockResolvedValue({ BookingID: BigInt(99) })

    const res = await POST(makeRequest({ outbound: outboundBody, returnTrip: returnBody }) as never)

    expect(res.status).toBe(409)
    expect(mockPrisma.bookings.create).not.toHaveBeenCalled()
  })

  it('rejects entire batch when quota would be exceeded by the pair', async () => {
    ;(mockPrisma.bookings.findFirst as jest.Mock).mockResolvedValue(null)
    ;(mockPrisma.bookings.count as jest.Mock).mockResolvedValue(2) // already 2, needs 2 more → 4 > 3

    const res = await POST(makeRequest({ outbound: outboundBody, returnTrip: returnBody }) as never)

    expect(res.status).toBe(422)
    expect(mockPrisma.bookings.create).not.toHaveBeenCalled()
  })

  it('allows single outbound when quota would just reach 3', async () => {
    ;(mockPrisma.bookings.findFirst as jest.Mock).mockResolvedValue(null)
    ;(mockPrisma.bookings.count as jest.Mock).mockResolvedValue(2)
    ;(mockPrisma.bookings.create as jest.Mock).mockResolvedValue({ BookingID: BigInt(1) })

    const oneWayBody = { ...outboundBody, isRoundTrip: false }
    const res = await POST(makeRequest({ outbound: oneWayBody }) as never)

    expect(res.status).toBe(201)
    expect(mockPrisma.bookings.create).toHaveBeenCalledTimes(1)
  })

  it('uses passenger IdentityType, not request bookingType', async () => {
    ;(mockPrisma.bookings.findFirst as jest.Mock).mockResolvedValue(null)
    ;(mockPrisma.bookings.count as jest.Mock).mockResolvedValue(0)
    ;(mockPrisma.bookings.create as jest.Mock).mockResolvedValue({ BookingID: BigInt(1) })

    const oneWayBody = { ...outboundBody, isRoundTrip: false, bookingType: 2 }
    await POST(makeRequest({ outbound: oneWayBody }) as never)

    expect(mockPrisma.bookings.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ BookingType: 1 }),
      }),
    )
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({
      error: new Response(JSON.stringify({ error: '請先登入' }), { status: 401 }),
    })

    const res = await POST(makeRequest({ outbound: outboundBody, returnTrip: returnBody }) as never)
    expect(res.status).toBe(401)
  })

  it('returns 400 when captcha fails', async () => {
    const { verifyCaptcha } = jest.requireMock('@/lib/auth/captcha') as { verifyCaptcha: jest.Mock }
    verifyCaptcha.mockResolvedValueOnce(false)

    const oneWayBody = { ...outboundBody, isRoundTrip: false }
    const res = await POST(makeRequest({ outbound: oneWayBody }) as never)

    expect(res.status).toBe(400)
  })
})
