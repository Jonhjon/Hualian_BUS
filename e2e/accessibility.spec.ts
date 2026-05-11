import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('WCAG 2.0 AA — 登入頁', () => {
  test('has no critical axe violations', async ({ page }) => {
    await page.goto('/login')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    expect(results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious')).toHaveLength(0)
  })

  test('login form inputs have accessible labels', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel('帳號')).toBeVisible()
    await expect(page.getByLabel('密碼')).toBeVisible()
  })

  test('page has a document title', async ({ page }) => {
    await page.goto('/login')
    expect(await page.title()).not.toBe('')
  })
})

test.describe('WCAG 2.0 AA — 申請帳號頁', () => {
  test('has no critical axe violations on step 1', async ({ page }) => {
    await page.goto('/register')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    expect(results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious')).toHaveLength(0)
  })

  test('page has a document title', async ({ page }) => {
    await page.goto('/register')
    expect(await page.title()).not.toBe('')
  })
})
