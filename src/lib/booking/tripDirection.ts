import { taipeiDateStr } from './timezone'

export type TripDirection = 'outbound' | 'return' | 'oneway' | 'unknown_roundtrip'

export interface BookingForPairing {
  BookingID: string | bigint | number
  PassengerID: string | bigint | number
  PickupTime: Date | string
  PickupAddr: string
  DropoffAddr: string
  IsRoundTrip: boolean | null
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value)
}

function bookingKey(id: string | bigint | number): string {
  return typeof id === 'string' ? id : String(id)
}

export function computeTripDirections(
  bookings: BookingForPairing[],
): Map<string, TripDirection> {
  const result = new Map<string, TripDirection>()
  const groups = new Map<string, BookingForPairing[]>()

  for (const b of bookings) {
    if (!b.IsRoundTrip) {
      result.set(bookingKey(b.BookingID), 'oneway')
      continue
    }
    const date = taipeiDateStr(toDate(b.PickupTime))
    const groupKey = `${bookingKey(b.PassengerID)}|${date}`
    const arr = groups.get(groupKey)
    if (arr) arr.push(b)
    else groups.set(groupKey, [b])
  }

  groups.forEach((group) => {
    for (const target of group) {
      const targetId = bookingKey(target.BookingID)
      const targetTime = toDate(target.PickupTime).getTime()
      const sibling = group.find(
        (other: BookingForPairing) =>
          bookingKey(other.BookingID) !== targetId &&
          other.PickupAddr === target.DropoffAddr &&
          other.DropoffAddr === target.PickupAddr,
      )
      if (!sibling) {
        result.set(targetId, 'unknown_roundtrip')
        continue
      }
      const siblingTime = toDate(sibling.PickupTime).getTime()
      result.set(targetId, targetTime <= siblingTime ? 'outbound' : 'return')
    }
  })

  return result
}

export function tripDirectionLabel(direction: TripDirection | undefined): string {
  switch (direction) {
    case 'outbound':
      return '去程'
    case 'return':
      return '回程'
    case 'oneway':
      return '單程'
    case 'unknown_roundtrip':
    default:
      return '去回程'
  }
}
