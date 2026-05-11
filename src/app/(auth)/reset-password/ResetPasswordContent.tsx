'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'

const schema = z
  .object({
    newPassword: z.string().min(8, '密碼至少 8 字'),
    confirmPassword: z.string(),
  })
  .refine(d => d.newPassword === d.confirmPassword, {
    message: '兩次密碼不一致',
    path: ['confirmPassword'],
  })

type Form = z.infer<typeof schema>

function ResetPasswordForm() {
  const token = useSearchParams().get('token') ?? ''
  const [done, setDone] = useState(false)
  const [apiError, setApiError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: Form) {
    setApiError('')
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: data.newPassword }),
    })
    const json = await res.json()
    if (!res.ok) { setApiError(json.error ?? '重設失敗'); return }
    setDone(true)
  }

  if (!token) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border border-danger/30 bg-danger-soft px-4 py-6 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-danger/15 text-danger" aria-hidden="true">
          <AlertCircle size={26} />
        </span>
        <p className="text-base font-semibold text-danger">連結無效</p>
        <p className="text-sm text-ink-soft">請重新申請密碼重設。</p>
        <Link href="/forgot-password" className="text-sm font-semibold text-brand-500 hover:text-accent-500">
          重新申請 →
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 rounded-lg border border-success/30 bg-success-soft px-4 py-6 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success" aria-hidden="true">
          <CheckCircle2 size={26} />
        </span>
        <p className="text-base font-semibold text-success">密碼已重設成功！</p>
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-md bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          立即登入
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <FormField label="新密碼" htmlFor="newPassword" required error={errors.newPassword?.message} hint="至少 8 個字元">
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          aria-required={true}
          aria-invalid={!!errors.newPassword}
          aria-describedby={errors.newPassword ? 'newpassword-error' : 'newPassword-hint'}
          invalid={!!errors.newPassword}
          {...register('newPassword')}
        />
      </FormField>
      <FormField label="確認新密碼" htmlFor="confirmPassword" required error={errors.confirmPassword?.message}>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-required={true}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
          invalid={!!errors.confirmPassword}
          {...register('confirmPassword')}
        />
      </FormField>
      {apiError && (
        <p role="alert" className="flex items-center gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          <AlertCircle size={16} aria-hidden="true" />
          {apiError}
        </p>
      )}
      <Button
        type="submit"
        variant="accent"
        size="lg"
        fullWidth
        loading={isSubmitting}
        leftIcon={<ShieldCheck size={18} aria-hidden="true" />}
      >
        {isSubmitting ? '重設中...' : '確認重設'}
      </Button>
    </form>
  )
}

export function ResetPasswordContent() {
  return (
    <Suspense
      fallback={
        <p role="status" className="flex items-center justify-center gap-2 py-6 text-ink-soft">
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          載入中...
        </p>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
