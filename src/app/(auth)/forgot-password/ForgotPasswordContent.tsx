'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Send } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  username: z.string().min(1, '請填寫帳號'),
  email: z.string().email('請填寫有效的 Email'),
})

type Form = z.infer<typeof schema>

export function ForgotPasswordContent() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: Form) {
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setSent(true)
  }

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 rounded-lg border border-success/30 bg-success-soft px-4 py-6 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success" aria-hidden="true">
          <CheckCircle2 size={26} />
        </span>
        <p className="text-base font-semibold text-success">
          若帳號存在，重設連結已寄出
        </p>
        <p className="text-sm text-ink-soft">
          請檢查您的 Email 信箱（包含垃圾郵件夾）。
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <FormField label="帳號" htmlFor="username" required error={errors.username?.message}>
        <Input
          id="username"
          autoComplete="username"
          aria-required={true}
          aria-invalid={!!errors.username}
          aria-describedby={errors.username ? 'username-error' : undefined}
          invalid={!!errors.username}
          {...register('username')}
        />
      </FormField>
      <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-required={true}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          invalid={!!errors.email}
          {...register('email')}
        />
      </FormField>
      <Button
        type="submit"
        variant="accent"
        size="lg"
        fullWidth
        loading={isSubmitting}
        leftIcon={<Send size={18} aria-hidden="true" />}
      >
        {isSubmitting ? '寄送中...' : '寄送重設連結'}
      </Button>
    </form>
  )
}
