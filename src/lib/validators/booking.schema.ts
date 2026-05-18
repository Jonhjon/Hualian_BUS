import { z } from 'zod'

const VALID_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

function parseLocalDate(dateStr: string): Date | null {
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return null
  const [y, m, d] = parts
  const date = new Date(y, m - 1, d)
  return isNaN(date.getTime()) ? null : date
}

function isValidBookingDate(dateStr: string): boolean {
  const date = parseLocalDate(dateStr)
  if (!date) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const max = new Date(today)
  max.setDate(max.getDate() + 7)
  return date >= today && date <= max
}

export function buildPickupDateTime(dateStr: string, hour: number): Date | null {
  const date = parseLocalDate(dateStr)
  if (!date) return null
  const target = new Date(date)
  target.setHours(hour, 0, 0, 0)
  return target
}

const baseBookingObject = z.object({
  pickupDate: z
    .string()
    .refine(isValidBookingDate, '預約日期必須在今天到 7 天後之間'),
  pickupHour: z
    .number()
    .int()
    .refine(h => VALID_HOURS.includes(h), '請選擇有效時段（08–17 整點）'),
  pickupAddr: z.string().min(1, '請填寫上車地址').max(255),
  dropoffAddr: z.string().min(1, '請填寫下車地址').max(255),
  companionCount: z.number().int().min(0).max(3),
  isRoundTrip: z.boolean().default(false),
  returnPickupHour: z
    .number()
    .int()
    .optional()
    .refine(h => h === undefined || VALID_HOURS.includes(h), '回程時段無效'),
  captchaToken: z.string().min(1).optional(),
})

export const bookingSchema = baseBookingObject.refine(
  d => !d.isRoundTrip || (d.returnPickupHour !== undefined && d.returnPickupHour > d.pickupHour),
  { message: '勾選去回程時，請選擇晚於去程的回程時段', path: ['returnPickupHour'] },
)

export type BookingInput = z.infer<typeof bookingSchema>

const batchSingleSchema = baseBookingObject.omit({ captchaToken: true, returnPickupHour: true })

export const batchBookingSchema = z
  .object({
    outbound: batchSingleSchema,
    returnTrip: batchSingleSchema.optional(),
    captchaToken: z.string().min(1).optional(),
  })
  .refine(
    d => !d.outbound.isRoundTrip || d.returnTrip !== undefined,
    { message: '勾選去回程時，必須提供回程資料', path: ['returnTrip'] },
  )
  .refine(
    d => !d.returnTrip || d.returnTrip.pickupHour > d.outbound.pickupHour,
    { message: '回程時段須晚於去程時段', path: ['returnTrip', 'pickupHour'] },
  )
  .refine(
    d => !d.returnTrip || d.returnTrip.pickupDate === d.outbound.pickupDate,
    { message: '回程日期須與去程相同', path: ['returnTrip', 'pickupDate'] },
  )

export type BatchBookingInput = z.infer<typeof batchBookingSchema>
