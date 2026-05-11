import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']
const PUBLIC_PATHS = ['/', '/announcements', ...AUTH_PATHS]

async function isValidToken(token: string | undefined): Promise<boolean> {
  if (!token || !process.env.JWT_SECRET) return false

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
    return true
  } catch {
    return false
  }
}

function redirectToLogin(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('next', `${pathname}${search}`)
  const res = NextResponse.redirect(loginUrl)
  res.cookies.delete('auth_token')
  return res
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const token = req.cookies.get('auth_token')?.value
  const isLoggedIn = await isValidToken(token)
  const isAuthPath = AUTH_PATHS.some(p => pathname.startsWith(p))
  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`))

  if (!isLoggedIn && !isPublic && !pathname.startsWith('/api')) {
    return redirectToLogin(req)
  }
  if (isLoggedIn && isAuthPath) {
    return NextResponse.redirect(new URL('/bookings', req.url))
  }

  if (!isLoggedIn && token) {
    const res = NextResponse.next()
    res.cookies.delete('auth_token')
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
