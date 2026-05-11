import type { Metadata } from 'next'
import Link from 'next/link'
import { KeyRound } from 'lucide-react'
import { ForgotPasswordContent } from './ForgotPasswordContent'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = {
  title: '忘記密碼 — 花蓮縣復康巴士預約系統',
}

export default function ForgotPasswordPage() {
  return (
    <Card className="p-7 sm:p-9 animate-fade-in-up">
      <header className="mb-6 flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-500" aria-hidden="true">
          <KeyRound size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-ink">忘記密碼</h1>
          <p className="text-sm text-ink-soft">輸入帳號與 Email，重設連結將寄送至您的信箱</p>
        </div>
      </header>

      <ForgotPasswordContent />

      <p className="mt-6 border-t border-border/70 pt-5 text-center text-sm text-ink-soft">
        想起密碼了？{' '}
        <Link href="/login" className="font-semibold text-brand-500 hover:text-accent-500">
          返回登入
        </Link>
      </p>
    </Card>
  )
}
