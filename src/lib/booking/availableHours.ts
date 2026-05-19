import { taipeiNowParts } from './timezone'

export const BOOKING_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17] as const

export function toLocalDateString(date: Date): string {
  return taipeiNowParts(date).dateStr
}

export function getAvailableHours(
  pickupDate: string | undefined,
  now: Date,
  minHour?: number,
): number[] {
  const taipei = taipeiNowParts(now)
  const todayStr = taipei.dateStr
  const base = [...BOOKING_HOURS]

  let hours: number[]
  if (!pickupDate || pickupDate > todayStr) {
    hours = base
  } else if (pickupDate === todayStr) {
    hours = base.filter(h => h > taipei.hour)
  } else {
    hours = []
  }

  if (minHour !== undefined) {
    hours = hours.filter(h => h > minHour)
  }

  return hours
}
