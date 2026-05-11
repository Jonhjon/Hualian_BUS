'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, LogIn } from 'lucide-react'
import { useLogin } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  username: z.string().min(1, '請填寫帳號'),
  password: z.string().min(1, '請填寫密碼'),
})

type FormValues = z.infer<typeof schema>

interface ApiError extends Error {
  status?: number
}

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const login = useLogin()

  function getErrorMessage(err: ApiError | null): string | null {
    if (!err) return null
    if (err.status === 423) return '帳號已被鎖定，請聯繫客服'
    return '帳號或密碼錯誤'
  }

  return (
    <form onSubmit={handleSubmit(data => login.mutate(data))} noValidate className="flex flex-col gap-5">
      <FormField label="帳號" htmlFor="username" required error={errors.username?.message}>
        <Input
          id="username"
          type="text"
          autoComplete="username"
          aria-required={true}
          aria-invalid={!!errors.username}
          aria-describedby={errors.username ? 'username-error' : undefined}
          invalid={!!errors.username}
          {...register('username')}
        />
      </FormField>

      <FormField label="密碼" htmlFor="password" required error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-required={true}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
          invalid={!!errors.password}
          {...register('password')}
        />
      </FormField>

      {login.error && (
        <p role="alert" className="flex items-center gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          <AlertCircle size={16} aria-hidden="true" />
          {getErrorMessage(login.error as ApiError)}
        </p>
      )}

      <Button
        type="submit"
        variant="accent"
        size="lg"
        fullWidth
        loading={login.isPending}
        leftIcon={<LogIn size={18} aria-hidden="true" />}
      >
        {login.isPending ? '登入中...' : '登入'}
      </Button>
    </form>
  )
}
