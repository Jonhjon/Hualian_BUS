import { z } from 'zod'
import { buildTaipeiPickupDateTime, taipeiDateStr } from '@/lib/booking/timezone'

const VALID_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

function isValidBookingDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false
  const todayStr = taipeiDateStr()
  const todayInstant = new Date(`${todayStr}T00:00:00+08:00`)
  const maxInstant = new Date(todayInstant.getTime() + 7 * 24 * 60 * 60 * 1000)
  const maxStr = taipeiDateStr(maxInstant)
  return dateStr >= todayStr && dateStr <= maxStr
}

export function buildPickupDateTime(dateStr: string, hour: number): Date | null {
  return buildTaipeiPickupDateTime(dateStr, hour)
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
