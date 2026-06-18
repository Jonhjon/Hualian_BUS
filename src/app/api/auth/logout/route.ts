import { ok } from '@/lib/api/response'

export function POST() {
  const res = ok({ message: '已登出' })
  res.cookies.delete('auth_token')
  return res
}
