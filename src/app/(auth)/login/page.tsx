import type { Metadata } from 'next'
import Link from 'next/link'
import { LogIn } from 'lucide-react'
import { LoginForm } from '@/components/forms/LoginForm'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = {
  title: '登入 — 花蓮縣復康巴士預約系統',
}

export default function LoginPage() {
  return (
    <Card className="p-7 sm:p-9 animate-fade-in-up">
      <header className="mb-6 flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-500" aria-hidden="true">
          <LogIn size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-ink">會員登入</h1>
          <p className="text-sm text-ink-soft">使用帳號密碼登入預約系統</p>
        </div>
      </header>

      <LoginForm />

      <div className="mt-6 flex flex-col gap-2 border-t border-border/70 pt-5 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 text-ink-soft">
          <span>還沒有帳號？</span>
          <Link href="/register" className="font-semibold text-brand-500 hover:text-accent-500">
            立即申請 →
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-ink-soft">
          <span>忘記密碼了嗎？</span>
          <Link href="/forgot-password" className="font-semibold text-brand-500 hover:text-accent-500">
            重設密碼 →
          </Link>
        </div>
      </div>
    </Card>
  )
}
