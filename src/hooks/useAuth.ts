'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth.store'
import { apiFetch } from '@/lib/api/client'

function postApi(url: string, body: unknown, fallbackErrorMessage = '操作失敗，請稍後再試') {
  return apiFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, { fallbackErrorMessage })
}

const CONTROL_OR_CRLF_ENCODED = /[\x00-\x1f\x7f]|%0[ad]/i

export function getSafeNextPath(next: string | null): string {
  if (!next) return '/bookings'
  // Must be a strict same-origin path.
  if (!next.startsWith('/')) return '/bookings'
  // Reject protocol-relative URLs (//evil.com) and backslash bypass
  // (some browsers treat /\evil.com as protocol-relative).
  if (next.startsWith('//') || next.startsWith('/\\')) return '/bookings'
  // Reject CRLF / control characters (response-splitting, log injection).
  if (CONTROL_OR_CRLF_ENCODED.test(next)) return '/bookings'
  return next
}

function getLoginNextPath(): string {
  if (typeof window === 'undefined') return '/bookings'
  return getSafeNextPath(new URLSearchParams(window.location.search).get('next'))
}

export function useLogin() {
  const setAuth = useAuthStore(s => s.setAuth)
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      postApi('/api/auth/login', data),
    onSuccess: (_data, variables) => {
      setAuth(variables.username, 4)
      queryClient.clear()
      router.push(getLoginNextPath())
      router.refresh()
    },
  })
}

export function useRegister() {
  const router = useRouter()

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      postApi('/api/auth/register', data, '申請失敗，請稍後再試'),
    onSuccess: () => router.push('/login?registered=1'),
  })
}

export function useLogout() {
  const clearAuth = useAuthStore(s => s.clearAuth)
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => postApi('/api/auth/logout', {}),
    onSuccess: () => {
      clearAuth()
      queryClient.clear()
      router.push('/announcements')
      router.refresh()
    },
  })
}
