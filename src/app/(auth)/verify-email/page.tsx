import type { Metadata } from 'next'
import { VerifyEmailContent } from './VerifyEmailContent'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = {
  title: 'Email 驗證 — 花蓮縣復康巴士預約系統',
}

export default function VerifyEmailPage() {
  return (
    <Card className="p-8 sm:p-10 animate-fade-in-up text-center">
      <VerifyEmailContent />
    </Card>
  )
}
