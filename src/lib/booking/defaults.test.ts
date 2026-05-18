import { getDefaultBookingValues } from './defaults'

function makeNow(year: number, month: number, day: number, hour: number, minute = 0): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0)
}

describe('getDefaultBookingValues', () => {
  it('uses today and first available hour during business hours', () => {
    const now = makeNow(2026, 5, 18, 10, 0)
    expect(getDefaultBookingValues(now)).toEqual({
      pickupDate: '2026-05-18',
      pickupHour: 11,
    })
  })

  it('uses today and 17 when current hour is 16', () => {
    const now = makeNow(2026, 5, 18, 16, 0)
    expect(getDefaultBookingValues(now)).toEqual({
      pickupDate: '2026-05-18',
      pickupHour: 17,
    })
  })

  it('rolls over to tomorrow at 17:30 (no slots left today)', () => {
    const now = makeNow(2026, 5, 18, 17, 30)
    expect(getDefaultBookingValues(now)).toEqual({
      pickupDate: '2026-05-19',
      pickupHour: 8,
    })
  })

  it('rolls over to tomorrow across month boundary', () => {
    const now = makeNow(2026, 5, 31, 18, 0)
    expect(getDefaultBookingValues(now)).toEqual({
      pickupDate: '2026-06-01',
      pickupHour: 8,
    })
  })

  it('rolls over to tomorrow across year boundary', () => {
    const now = makeNow(2026, 12, 31, 18, 0)
    expect(getDefaultBookingValues(now)).toEqual({
      pickupDate: '2027-01-01',
      pickupHour: 8,
    })
  })

  it('uses today and 8 when current hour is before 8', () => {
    const now = makeNow(2026, 5, 18, 7, 0)
    expect(getDefaultBookingValues(now)).toEqual({
      pickupDate: '2026-05-18',
      pickupHour: 8,
    })
  })
})
