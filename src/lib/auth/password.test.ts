import { hashPassword, verifyPassword } from './password'

describe('hashPassword / verifyPassword', () => {
  it('hashes and verifies correct password', async () => {
    const hash = await hashPassword('mySecret123!')
    expect(await verifyPassword('mySecret123!', hash)).toBe(true)
  })

  it('rejects wrong password', async () => {
    const hash = await hashPassword('mySecret123!')
    expect(await verifyPassword('wrongPassword', hash)).toBe(false)
  })

  it('produces different hashes for same input', async () => {
    const h1 = await hashPassword('same')
    const h2 = await hashPassword('same')
    expect(h1).not.toBe(h2)
  })
})
