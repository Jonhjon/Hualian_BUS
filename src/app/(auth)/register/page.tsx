import type { Metadata } from 'next'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { RegisterForm } from '@/components/forms/RegisterForm'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = {
  title: '乘客申請 — 花蓮縣復康巴士預約系統',
}

export default function RegisterPage() {
  return (
    <Card className="p-7 sm:p-9 animate-fade-in-up">
      <header className="mb-6 flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-500" aria-hidden="true">
          <UserPlus size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-ink">申請乘客帳號</h1>
          <p className="text-sm text-ink-soft">填寫資料完成註冊，享受便利預約服務</p>
        </div>
      </header>

      <RegisterForm />

      <p className="mt-6 border-t border-border/70 pt-5 text-center text-sm text-ink-soft">
        已有帳號？{' '}
        <Link href="/login" className="font-semibold text-brand-500 hover:text-accent-500">
          直接登入
        </Link>
      </p>
    </Card>
  )
}
