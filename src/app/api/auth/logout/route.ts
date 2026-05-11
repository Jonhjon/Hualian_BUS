import { NextResponse } from 'next/server'

export function POST() {
  const res = NextResponse.json({ success: true, data: { message: '已登出' } })
  res.cookies.delete('auth_token')
  return res
}
