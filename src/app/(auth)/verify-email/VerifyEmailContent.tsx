'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, MailCheck, MailX } from 'lucide-react'

function VerifyContent() {
  const token = useSearchParams().get('token') ?? ''
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => setStatus(r.ok ? 'success' : 'error'))
      .catch(() => setStatus('error'))
  }, [token])

  if (status === 'pending') {
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-6">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500" aria-hidden="true">
          <Loader2 size={30} className="animate-spin" />
        </span>
        <p className="text-base font-semibold text-ink">驗證中...</p>
        <p className="text-sm text-ink-soft">請稍候片刻</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-4">
        <span className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-success-soft text-success" aria-hidden="true">
          <MailCheck size={36} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-ink">Email 驗證成功！</h1>
          <p className="mt-1 text-sm text-ink-soft">您可以開始使用預約服務了</p>
        </div>
        <Link
          href="/login"
          className="inline-flex h-12 items-center justify-center rounded-md bg-accent-500 px-6 text-base font-semibold text-white shadow-soft hover:bg-accent-700"
        >
          前往登入
        </Link>
      </div>
    )
  }

  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-4">
      <span className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-danger-soft text-danger" aria-hidden="true">
        <MailX size={36} />
      </span>
      <div>
        <h1 className="text-2xl font-bold text-ink">驗證連結無效或已過期</h1>
        <p className="mt-1 text-sm text-ink-soft">請聯繫客服或重新申請驗證</p>
      </div>
      <Link href="/login" className="text-sm font-semibold text-brand-500 hover:text-accent-500">
        返回登入 →
      </Link>
    </div>
  )
}

export function VerifyEmailContent() {
  return (
    <Suspense
      fallback={
        <p role="status" className="flex items-center justify-center gap-2 py-6 text-ink-soft">
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          載入中...
        </p>
      }
    >
      <VerifyContent />
    </Suspense>
  )
}
