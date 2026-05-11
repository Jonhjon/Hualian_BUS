import { bookingSchema } from './booking.schema'

function localStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const today = new Date()
today.setHours(0, 0, 0, 0)
const todayStr = localStr(today)
const futureDate = new Date(today); futureDate.setDate(today.getDate() + 3)
const futureDateStr = localStr(futureDate)
const pastDate = new Date(today); pastDate.setDate(today.getDate() - 1)
const pastDateStr = localStr(pastDate)
const tooFarDate = new Date(today); tooFarDate.setDate(today.getDate() + 8)
const tooFarDateStr = localStr(tooFarDate)

const valid = {
  bookingType: 1 as const,
  pickupDate: futureDateStr,
  pickupHour: 9,
  pickupAddr: '花蓮市中正路1號',
  dropoffAddr: '花蓮市民國路2號',
  companionCount: 0,
  isRoundTrip: false,
}

describe('bookingSchema', () => {
  it('accepts valid booking', () => {
    expect(bookingSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts today as pickup date', () => {
    expect(bookingSchema.safeParse({ ...valid, pickupDate: todayStr }).success).toBe(true)
  })

  it('rejects past date', () => {
    expect(bookingSchema.safeParse({ ...valid, pickupDate: pastDateStr }).success).toBe(false)
  })

  it('rejects date more than 7 days ahead', () => {
    expect(bookingSchema.safeParse({ ...valid, pickupDate: tooFarDateStr }).success).toBe(false)
  })

  it('rejects invalid hour (7)', () => {
    expect(bookingSchema.safeParse({ ...valid, pickupHour: 7 }).success).toBe(false)
  })

  it('rejects invalid hour (18)', () => {
    expect(bookingSchema.safeParse({ ...valid, pickupHour: 18 }).success).toBe(false)
  })

  it('accepts hour 17 (last valid slot)', () => {
    expect(bookingSchema.safeParse({ ...valid, pickupHour: 17 }).success).toBe(true)
  })

  it('rejects companionCount over 3', () => {
    expect(bookingSchema.safeParse({ ...valid, companionCount: 4 }).success).toBe(false)
  })

  it('rejects negative companionCount', () => {
    expect(bookingSchema.safeParse({ ...valid, companionCount: -1 }).success).toBe(false)
  })
})
