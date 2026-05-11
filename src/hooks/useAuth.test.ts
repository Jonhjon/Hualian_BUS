import { getSafeNextPath } from './useAuth'

describe('getSafeNextPath', () => {
  it('returns valid same-site paths', () => {
    expect(getSafeNextPath('/bookings/new')).toBe('/bookings/new')
    expect(getSafeNextPath('/bookings/new?from=nav')).toBe('/bookings/new?from=nav')
  })

  it('falls back for missing or external paths', () => {
    expect(getSafeNextPath(null)).toBe('/bookings')
    expect(getSafeNextPath('https://example.com')).toBe('/bookings')
    expect(getSafeNextPath('//example.com')).toBe('/bookings')
  })
})
