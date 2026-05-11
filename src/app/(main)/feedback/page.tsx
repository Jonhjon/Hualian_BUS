import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageSquare, AlertCircle, ArrowLeft } from 'lucide-react'
import { FeedbackForm } from '@/components/feedback/FeedbackForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = {
  title: '意見回饋 — 花蓮縣復康巴士預約系統',
}

export default function FeedbackPage({ searchParams }: { searchParams: { bookingId?: string } }) {
  const bookingId = Number(searchParams.bookingId)

  if (!bookingId) {
    return (
      <Container size="narrow">
        <Card className="flex flex-col items-center gap-3 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-soft text-warning" aria-hidden="true">
            <AlertCircle size={26} />
          </span>
          <h1 className="text-xl font-bold text-ink">缺少預約資訊</h1>
          <p className="text-sm text-ink-soft">請從預約頁面進入意見回饋</p>
          <Link
            href="/bookings"
            className="inline-flex h-11 items-center gap-1.5 rounded-md bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            返回我的預約
          </Link>
        </Card>
      </Container>
    )
  }

  return (
    <Container size="narrow">
      <PageHeader
        title="意見回饋"
        description="您的回饋將協助我們持續改善服務品質"
        icon={<MessageSquare size={22} aria-hidden="true" />}
      />
      <p className="mb-5 rounded-md border border-border bg-brand-50 px-4 py-3 text-sm text-ink-soft">
        正在為預約編號 <strong className="font-bold text-brand-500">#{bookingId}</strong> 填寫回饋
      </p>
      <FeedbackForm bookingId={bookingId} />
    </Container>
  )
}
