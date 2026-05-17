/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { SignJWT } from 'jose'
import { middleware } from './middleware'

process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-bytes-long!!'

function request(path: string, cookie?: string) {
  return new NextRequest(`http://localhost${path}`, {
    headers: cookie ? { cookie } : undefined,
  })
}

async function authCookie() {
  const token = await new SignJWT({ accountId: 'account-1', username: 'testuser', roleId: 4 })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET))
  return `auth_token=${token}`
}

describe('middleware public and protected routes', () => {
  it('allows anonymous users to browse announcements', async () => {
    const res = await middleware(request('/announcements'))
    expect(res.headers.get('location')).toBeNull()
  })

  it('redirects the home page to the page handler instead of login', async () => {
    const res = await middleware(request('/'))
    expect(res.headers.get('location')).toBeNull()
  })

  it('redirects anonymous booking pages to login with next path', async () => {
    const res = await middleware(request('/bookings/new?from=nav'))
    expect(res.headers.get('location')).toBe(
      'http://localhost/login?next=%2Fbookings%2Fnew%3Ffrom%3Dnav',
    )
  })

  it('redirects users with invalid tokens back to login on protected pages', async () => {
    const res = await middleware(request('/profile', 'auth_token=bad-token'))
    expect(res.headers.get('location')).toBe('http://localhost/login?next=%2Fprofile')
  })

  it('redirects authenticated users away from auth pages', async () => {
    const res = await middleware(request('/login', await authCookie()))
    expect(res.headers.get('location')).toBe('http://localhost/bookings')
  })
})
