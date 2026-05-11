'use client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth.store'

interface ApiError extends Error {
  status: number
}

async function apiFetch(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) {
    const err = new Error(json.error ?? '操作失敗') as ApiError
    err.status = res.status
    throw err
  }
  return json
}

export function getSafeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/bookings'
  return next
}

function getLoginNextPath(): string {
  if (typeof window === 'undefined') return '/bookings'
  return getSafeNextPath(new URLSearchParams(window.location.search).get('next'))
}

export function useLogin() {
  const setAuth = useAuthStore(s => s.setAuth)
  const router = useRouter()

  return useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      apiFetch('/api/auth/login', data),
    onSuccess: (_data, variables) => {
      setAuth(variables.username, 4)
      router.push(getLoginNextPath())
      router.refresh()
    },
  })
}

export function useRegister() {
  const router = useRouter()

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch('/api/auth/register', data),
    onSuccess: () => router.push('/login?registered=1'),
  })
}

export function useLogout() {
  const clearAuth = useAuthStore(s => s.clearAuth)
  const router = useRouter()

  return useMutation({
    mutationFn: () => apiFetch('/api/auth/logout', {}),
    onSuccess: () => {
      clearAuth()
      router.push('/announcements')
      router.refresh()
    },
  })
}
