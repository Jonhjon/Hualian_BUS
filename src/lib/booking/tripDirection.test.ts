import {
  computeTripDirections,
  tripDirectionLabel,
  type BookingForPairing,
} from './tripDirection'

function makeBooking(overrides: Partial<BookingForPairing>): BookingForPairing {
  return {
    BookingID: '1',
    PassengerID: 'p1',
    PickupTime: new Date('2026-05-20T01:00:00Z'),
    PickupAddr: 'A',
    DropoffAddr: 'B',
    IsRoundTrip: true,
    ...overrides,
  }
}

describe('computeTripDirections', () => {
  it('marks an empty list as an empty map', () => {
    expect(computeTripDirections([]).size).toBe(0)
  })

  it('marks IsRoundTrip=false bookings as oneway', () => {
    const b = makeBooking({ BookingID: '10', IsRoundTrip: false })
    const map = computeTripDirections([b])
    expect(map.get('10')).toBe('oneway')
  })

  it('marks IsRoundTrip=null bookings as oneway', () => {
    const b = makeBooking({ BookingID: '11', IsRoundTrip: null })
    expect(computeTripDirections([b]).get('11')).toBe('oneway')
  })

  it('pairs a same-day round-trip and marks earlier=outbound, later=return', () => {
    const outbound = makeBooking({
      BookingID: '20',
      PickupTime: new Date('2026-05-20T01:00:00Z'), // 09:00 Taipei
      PickupAddr: 'Home',
      DropoffAddr: 'Hospital',
    })
    const returnTrip = makeBooking({
      BookingID: '21',
      PickupTime: new Date('2026-05-20T08:00:00Z'), // 16:00 Taipei
      PickupAddr: 'Hospital',
      DropoffAddr: 'Home',
    })
    const map = computeTripDirections([returnTrip, outbound])
    expect(map.get('20')).toBe('outbound')
    expect(map.get('21')).toBe('return')
  })

  it('returns unknown_roundtrip when addresses are not mirrored', () => {
    const a = makeBooking({
      BookingID: '30',
      PickupTime: new Date('2026-05-20T01:00:00Z'),
      PickupAddr: 'X',
      DropoffAddr: 'Y',
    })
    const b = makeBooking({
      BookingID: '31',
      PickupTime: new Date('2026-05-20T08:00:00Z'),
      PickupAddr: 'X',
      DropoffAddr: 'Z', // not mirrored
    })
    const map = computeTripDirections([a, b])
    expect(map.get('30')).toBe('unknown_roundtrip')
    expect(map.get('31')).toBe('unknown_roundtrip')
  })

  it('does not pair across different Taipei calendar dates', () => {
    const a = makeBooking({
      BookingID: '40',
      PickupTime: new Date('2026-05-20T01:00:00Z'), // 2026-05-20 Taipei
      PickupAddr: 'Home',
      DropoffAddr: 'Hospital',
    })
    const b = makeBooking({
      BookingID: '41',
      PickupTime: new Date('2026-05-21T01:00:00Z'), // 2026-05-21 Taipei
      PickupAddr: 'Hospital',
      DropoffAddr: 'Home',
    })
    const map = computeTripDirections([a, b])
    expect(map.get('40')).toBe('unknown_roundtrip')
    expect(map.get('41')).toBe('unknown_roundtrip')
  })

  it('does not pair bookings from different passengers', () => {
    const a = makeBooking({
      BookingID: '50',
      PassengerID: 'pA',
      PickupTime: new Date('2026-05-20T01:00:00Z'),
      PickupAddr: 'Home',
      DropoffAddr: 'Hospital',
    })
    const b = makeBooking({
      BookingID: '51',
      PassengerID: 'pB',
      PickupTime: new Date('2026-05-20T08:00:00Z'),
      PickupAddr: 'Hospital',
      DropoffAddr: 'Home',
    })
    const map = computeTripDirections([a, b])
    expect(map.get('50')).toBe('unknown_roundtrip')
    expect(map.get('51')).toBe('unknown_roundtrip')
  })

  it('mixes oneway and a paired round-trip correctly', () => {
    const single = makeBooking({ BookingID: '60', IsRoundTrip: false })
    const out = makeBooking({
      BookingID: '61',
      PickupTime: new Date('2026-05-20T01:00:00Z'),
      PickupAddr: 'A',
      DropoffAddr: 'B',
    })
    const ret = makeBooking({
      BookingID: '62',
      PickupTime: new Date('2026-05-20T09:00:00Z'),
      PickupAddr: 'B',
      DropoffAddr: 'A',
    })
    const map = computeTripDirections([single, out, ret])
    expect(map.get('60')).toBe('oneway')
    expect(map.get('61')).toBe('outbound')
    expect(map.get('62')).toBe('return')
  })

  it('accepts bigint and number BookingIDs and stringifies them as map keys', () => {
    const out: BookingForPairing = {
      BookingID: BigInt(100),
      PassengerID: BigInt(7),
      PickupTime: new Date('2026-05-20T01:00:00Z'),
      PickupAddr: 'A',
      DropoffAddr: 'B',
      IsRoundTrip: true,
    }
    const ret: BookingForPairing = {
      BookingID: 101,
      PassengerID: BigInt(7),
      PickupTime: new Date('2026-05-20T08:00:00Z'),
      PickupAddr: 'B',
      DropoffAddr: 'A',
      IsRoundTrip: true,
    }
    const map = computeTripDirections([out, ret])
    expect(map.get('100')).toBe('outbound')
    expect(map.get('101')).toBe('return')
  })
})

describe('tripDirectionLabel', () => {
  it('maps each direction to its zh-TW label', () => {
    expect(tripDirectionLabel('outbound')).toBe('去程')
    expect(tripDirectionLabel('return')).toBe('回程')
    expect(tripDirectionLabel('oneway')).toBe('單程')
    expect(tripDirectionLabel('unknown_roundtrip')).toBe('去回程')
  })

  it('falls back to 去回程 for undefined', () => {
    expect(tripDirectionLabel(undefined)).toBe('去回程')
  })
})
