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

  it('rejects isRoundTrip=true without returnPickupHour', () => {
    const result = bookingSchema.safeParse({ ...valid, isRoundTrip: true })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find(i => i.path.includes('returnPickupHour'))
      expect(issue).toBeDefined()
    }
  })

  it('rejects isRoundTrip=true with returnPickupHour <= pickupHour', () => {
    expect(
      bookingSchema.safeParse({
        ...valid,
        pickupHour: 10,
        isRoundTrip: true,
        returnPickupHour: 10,
      }).success,
    ).toBe(false)
  })

  it('accepts isRoundTrip=true with valid returnPickupHour > pickupHour', () => {
    expect(
      bookingSchema.safeParse({
        ...valid,
        pickupHour: 10,
        isRoundTrip: true,
        returnPickupHour: 15,
      }).success,
    ).toBe(true)
  })

  it('strips unknown fields like legacy bookingType', () => {
    const result = bookingSchema.safeParse({ ...valid, bookingType: 2 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect('bookingType' in result.data).toBe(false)
    }
  })
})
