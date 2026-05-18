export const BOOKING_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17] as const

export function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getAvailableHours(
  pickupDate: string | undefined,
  now: Date,
  minHour?: number,
): number[] {
  const todayStr = toLocalDateString(now)
  const base = [...BOOKING_HOURS]

  let hours: number[]
  if (!pickupDate || pickupDate > todayStr) {
    hours = base
  } else if (pickupDate === todayStr) {
    const currentHour = now.getHours()
    hours = base.filter(h => h > currentHour)
  } else {
    hours = []
  }

  if (minHour !== undefined) {
    hours = hours.filter(h => h > minHour)
  }

  return hours
}
