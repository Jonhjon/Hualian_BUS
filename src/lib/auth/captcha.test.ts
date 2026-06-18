/**
 * @jest-environment node
 *
 * STRESS TEST BRANCH: captcha 已停用，verifyCaptcha 永遠回傳 true。
 * 此測試僅驗證 stub 行為，原本的 JWT challenge 測試保留在 main 分支。
 */
process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-bytes-long!!'

import { isCaptchaConfigured, verifyCaptcha } from './captcha'

describe('isCaptchaConfigured', () => {
  it('always returns true', () => {
    expect(isCaptchaConfigured()).toBe(true)
  })
})

describe('verifyCaptcha (stress-test stub)', () => {
  it('returns true for null', async () => {
    expect(await verifyCaptcha(null)).toBe(true)
  })

  it('returns true for undefined', async () => {
    expect(await verifyCaptcha(undefined)).toBe(true)
  })

  it('returns true for any token string', async () => {
    expect(await verifyCaptcha('anything')).toBe(true)
  })
})
