/**
 * @jest-environment node
 */
process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-bytes-long!!'

import { verifyToken } from '@/lib/auth/jwt'
import type { JWTPayload } from 'jose'
import { GET } from './route'

interface CaptchaPayload extends JWTPayload {
  answer: number
}

describe('GET /api/captcha', () => {
  it('returns 200 with question and challengeToken', async () => {
    const res = await GET()
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(typeof json.question).toBe('string')
    expect(typeof json.challengeToken).toBe('string')
  })

  it('question matches pattern "A + B = ?"', async () => {
    const res = await GET()
    const { question } = await res.json()
    expect(question).toMatch(/^\d+ \+ \d+ = \?$/)
  })

  it('challengeToken encodes the correct answer', async () => {
    const res = await GET()
    const { question, challengeToken } = await res.json()

    const [a, b] = question.replace(' = ?', '').split(' + ').map(Number)
    const expectedAnswer = a + b

    const payload = await verifyToken<CaptchaPayload>(challengeToken)
    expect(payload.answer).toBe(expectedAnswer)
  })

  it('challengeToken has ~5min expiry', async () => {
    const before = Math.floor(Date.now() / 1000)
    const res = await GET()
    const { challengeToken } = await res.json()

    const payload = await verifyToken<CaptchaPayload>(challengeToken)
    const margin = 60
    expect(payload.exp!).toBeGreaterThan(before + 300 - margin)
    expect(payload.exp!).toBeLessThan(before + 300 + margin)
  })

  it('generates different questions across calls', async () => {
    const questions = new Set<string>()
    for (let i = 0; i < 20; i++) {
      const res = await GET()
      const { question } = await res.json()
      questions.add(question)
    }
    expect(questions.size).toBeGreaterThan(1)
  })

  it('numbers in question are between 1 and 10', async () => {
    for (let i = 0; i < 10; i++) {
      const res = await GET()
      const { question } = await res.json()
      const [a, b] = question.replace(' = ?', '').split(' + ').map(Number)
      expect(a).toBeGreaterThanOrEqual(1)
      expect(a).toBeLessThanOrEqual(10)
      expect(b).toBeGreaterThanOrEqual(1)
      expect(b).toBeLessThanOrEqual(10)
    }
  })
})
