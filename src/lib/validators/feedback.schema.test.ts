import { feedbackSchema } from './feedback.schema'

describe('feedbackSchema', () => {
  it('accepts valid feedback', () => {
    expect(feedbackSchema.safeParse({ bookingId: 1, rating: 5, comment: '很好' }).success).toBe(true)
  })

  it('accepts feedback without comment', () => {
    expect(feedbackSchema.safeParse({ bookingId: 1, rating: 3 }).success).toBe(true)
  })

  it('rejects rating below 1', () => {
    expect(feedbackSchema.safeParse({ bookingId: 1, rating: 0 }).success).toBe(false)
  })

  it('rejects rating above 5', () => {
    expect(feedbackSchema.safeParse({ bookingId: 1, rating: 6 }).success).toBe(false)
  })

  it('rejects comment over 500 chars', () => {
    expect(feedbackSchema.safeParse({ bookingId: 1, rating: 4, comment: 'x'.repeat(501) }).success).toBe(false)
  })

  it('accepts comment exactly 500 chars', () => {
    expect(feedbackSchema.safeParse({ bookingId: 1, rating: 4, comment: 'x'.repeat(500) }).success).toBe(true)
  })

  it('rejects non-positive bookingId', () => {
    expect(feedbackSchema.safeParse({ bookingId: 0, rating: 4 }).success).toBe(false)
  })
})
