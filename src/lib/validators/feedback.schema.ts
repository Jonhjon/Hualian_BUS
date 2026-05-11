import { z } from 'zod'

export const feedbackSchema = z.object({
  bookingId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
})

export type FeedbackInput = z.infer<typeof feedbackSchema>
