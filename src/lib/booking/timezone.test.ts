import {
  buildTaipeiPickupDateTime,
  taipeiDateStr,
  taipeiNowParts,
} from './timezone'

describe('buildTaipeiPickupDateTime', () => {
  it('returns the UTC instant matching a Taipei wall-clock time', () => {
    const d = buildTaipeiPickupDateTime('2026-05-20', 9)
    expect(d).not.toBeNull()
    expect(d!.toISOString()).toBe('2026-05-20T01:00:00.000Z')
  })

  it('handles midnight Taipei (00:00)', () => {
    const d = buildTaipeiPickupDateTime('2026-05-20', 0)
    expect(d!.toISOString()).toBe('2026-05-19T16:00:00.000Z')
  })

  it('handles 23:00 Taipei', () => {
    const d = buildTaipeiPickupDateTime('2026-05-20', 23)
    expect(d!.toISOString()).toBe('2026-05-20T15:00:00.000Z')
  })

  it('rejects malformed dateStr', () => {
    expect(buildTaipeiPickupDateTime('2026/05/20', 9)).toBeNull()
    expect(buildTaipeiPickupDateTime('2026-5-20', 9)).toBeNull()
    expect(buildTaipeiPickupDateTime('', 9)).toBeNull()
    expect(buildTaipeiPickupDateTime('not-a-date', 9)).toBeNull()
  })

  it('rejects out-of-range hour', () => {
    expect(buildTaipeiPickupDateTime('2026-05-20', -1)).toBeNull()
    expect(buildTaipeiPickupDateTime('2026-05-20', 24)).toBeNull()
    expect(buildTaipeiPickupDateTime('2026-05-20', 9.5)).toBeNull()
  })
})

describe('taipeiDateStr / taipeiNowParts', () => {
  it('returns the Taipei calendar date regardless of input UTC time', () => {
    const midUtc = new Date('2026-05-20T06:00:00Z')
    expect(taipeiDateStr(midUtc)).toBe('2026-05-20')
  })

  it('rolls forward when UTC is late evening but Taipei is next day', () => {
    const utcLate = new Date('2026-05-20T16:30:00Z')
    expect(taipeiDateStr(utcLate)).toBe('2026-05-21')
    const parts = taipeiNowParts(utcLate)
    expect(parts.year).toBe(2026)
    expect(parts.month).toBe(5)
    expect(parts.day).toBe(21)
    expect(parts.hour).toBe(0)
    expect(parts.minute).toBe(30)
  })

  it('handles boundary at 16:00 UTC = 00:00 Taipei next day', () => {
    const boundary = new Date('2026-05-20T16:00:00Z')
    expect(taipeiDateStr(boundary)).toBe('2026-05-21')
    expect(taipeiNowParts(boundary).hour).toBe(0)
  })
})
