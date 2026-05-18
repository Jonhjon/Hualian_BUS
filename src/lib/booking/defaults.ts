import { getAvailableHours, toLocalDateString } from './availableHours'

export interface BookingDefaults {
  pickupDate: string
  pickupHour: number
}

export function getDefaultBookingValues(now: Date): BookingDefaults {
  const todayStr = toLocalDateString(now)
  const todayHours = getAvailableHours(todayStr, now)

  if (todayHours.length > 0) {
    return { pickupDate: todayStr, pickupHour: todayHours[0] }
  }

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return { pickupDate: toLocalDateString(tomorrow), pickupHour: 8 }
}
