/**
 * @jest-environment node
 */
jest.mock('@/lib/auth/middleware', () => ({ requireAuth: jest.fn() }))
jest.mock('@/lib/db', () => ({
  prisma: {
    passengerProfile: { findFirst: jest.fn() },
    bookings: { findFirst: jest.fn() },
    feedback: { create: jest.fn() },
  },
}))

import { POST } from './route'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/db'

const mockAuth = requireAuth as jest.Mock
const mockPrisma = prisma as jest.Mocked<typeof prisma>
const PASSENGER_ID = 'p-uuid'

function req(body: unknown) {
  return new Request('http://localhost/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockAuth.mockResolvedValue({ payload: { accountId: 'a-uuid', username: 'u', roleId: 4 } })
  ;(mockPrisma.passengerProfile.findFirst as jest.Mock).mockResolvedValue({ PassengerID: PASSENGER_ID })
  ;(mockPrisma.bookings.findFirst as jest.Mock).mockResolvedValue({ BookingStatus: 4 })
  ;(mockPrisma.feedback.create as jest.Mock).mockResolvedValue({ FeedbackID: 1, Rating: 5 })
})

describe('POST /api/feedback', () => {
  it('returns 201 on valid feedback', async () => {
    const res = await POST(req({ bookingId: 1, rating: 5, comment: '很好' }) as never)
    expect(res.status).toBe(201)
  })

  it('returns 422 for rating out of range', async () => {
    const res = await POST(req({ bookingId: 1, rating: 6 }) as never)
    expect(res.status).toBe(422)
  })

  it('returns 409 when booking is not completed', async () => {
    ;(mockPrisma.bookings.findFirst as jest.Mock).mockResolvedValue({ BookingStatus: 0 })
    const res = await POST(req({ bookingId: 1, rating: 4 }) as never)
    expect(res.status).toBe(409)
  })

  it('returns 404 when booking not found', async () => {
    ;(mockPrisma.bookings.findFirst as jest.Mock).mockResolvedValue(null)
    const res = await POST(req({ bookingId: 999, rating: 3 }) as never)
    expect(res.status).toBe(404)
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ error: new Response('', { status: 401 }) })
    const res = await POST(req({ bookingId: 1, rating: 5 }) as never)
    expect(res.status).toBe(401)
  })
})
