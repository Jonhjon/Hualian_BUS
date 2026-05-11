import type { Metadata } from 'next'
import { LockKeyhole } from 'lucide-react'
import { ResetPasswordContent } from './ResetPasswordContent'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = {
  title: '重設密碼 — 花蓮縣復康巴士預約系統',
}

export default function ResetPasswordPage() {
  return (
    <Card className="p-7 sm:p-9 animate-fade-in-up">
      <header className="mb-6 flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-500" aria-hidden="true">
          <LockKeyhole size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-ink">重設密碼</h1>
          <p className="text-sm text-ink-soft">請輸入新的密碼以完成重設</p>
        </div>
      </header>

      <ResetPasswordContent />
    </Card>
  )
}
