// Booking status codes — match DB `Bookings.BookingStatus` column.
export const BookingStatus = {
  Pending: 0,      // 預約成功
  Confirmed: 1,    // 排班完成
  Cancelled: 2,    // 已取消
  Dispatched: 3,   // 搭乘中
  Completed: 4,    // 已完趟
  Standby: 5,      // 後補
} as const

export type BookingStatusValue =
  (typeof BookingStatus)[keyof typeof BookingStatus]

// Statuses that count toward the active-booking quota and same-time conflict checks.
export const ACTIVE_STATUSES: readonly BookingStatusValue[] = [
  BookingStatus.Pending,
  BookingStatus.Confirmed,
  BookingStatus.Dispatched,
  BookingStatus.Standby,
]

// Statuses a passenger may still cancel from.
export const CANCELLABLE_STATUSES: readonly BookingStatusValue[] = [
  BookingStatus.Pending,
  BookingStatus.Confirmed,
  BookingStatus.Standby,
]

export const MAX_ACTIVE_BOOKINGS = 3

// Errors thrown inside the booking-create transaction so the outer handler can map to HTTP status.
export class BookingConflictError extends Error {}
export class BookingQuotaError extends Error {}

// Validate booking-id path params before BigInt() — bare BigInt('abc') throws.
export function parseBookingId(raw: string): bigint | null {
  if (!/^\d+$/.test(raw)) return null
  try {
    return BigInt(raw)
  } catch {
    return null
  }
}
