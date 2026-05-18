import { BOOKING_HOURS, getAvailableHours, toLocalDateString } from './availableHours'

function makeNow(year: number, month: number, day: number, hour: number, minute = 0): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0)
}

describe('toLocalDateString', () => {
  it('pads month and day with leading zeros', () => {
    expect(toLocalDateString(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(toLocalDateString(new Date(2026, 10, 30))).toBe('2026-11-30')
  })
})

describe('getAvailableHours', () => {
  const now = makeNow(2026, 5, 18, 14, 30)
  const todayStr = '2026-05-18'
  const tomorrowStr = '2026-05-19'
  const yesterdayStr = '2026-05-17'

  it('returns all 10 hours for a future date', () => {
    expect(getAvailableHours(tomorrowStr, now)).toEqual([...BOOKING_HOURS])
  })

  it('returns empty array for a past date', () => {
    expect(getAvailableHours(yesterdayStr, now)).toEqual([])
  })

  it('filters out current and past hours for today at 14:30', () => {
    expect(getAvailableHours(todayStr, now)).toEqual([15, 16, 17])
  })

  it('returns empty array for today after 17:00', () => {
    const lateNow = makeNow(2026, 5, 18, 17, 30)
    expect(getAvailableHours(todayStr, lateNow)).toEqual([])
  })

  it('returns [17] for today at 16:30 (boundary)', () => {
    const boundary = makeNow(2026, 5, 18, 16, 30)
    expect(getAvailableHours(todayStr, boundary)).toEqual([17])
  })

  it('returns all hours when pickupDate is undefined (default)', () => {
    expect(getAvailableHours(undefined, now)).toEqual([...BOOKING_HOURS])
  })

  it('applies minHour filter for return trip (future date)', () => {
    expect(getAvailableHours(tomorrowStr, now, 15)).toEqual([16, 17])
  })

  it('applies minHour filter together with today filter', () => {
    // today at 10:00, minHour=12 → [13..17] filtered by minHour=12 → [13..17]
    const morningNow = makeNow(2026, 5, 18, 10, 0)
    expect(getAvailableHours(todayStr, morningNow, 12)).toEqual([13, 14, 15, 16, 17])
  })

  it('returns empty when minHour equals last valid hour', () => {
    expect(getAvailableHours(tomorrowStr, now, 17)).toEqual([])
  })
})
