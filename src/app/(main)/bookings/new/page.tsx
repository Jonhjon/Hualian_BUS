import type { Metadata } from 'next'
import { PlusCircle } from 'lucide-react'
import { BookingForm } from '@/components/booking/BookingForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = {
  title: '新增預約 — 花蓮縣復康巴士預約系統',
}

export default function NewBookingPage() {
  return (
    <Container size="content">
      <PageHeader
        title="新增預約"
        description="填寫行程資訊，最早今日、最晚 7 天後皆可預約"
        icon={<PlusCircle size={22} aria-hidden="true" />}
      />
      <BookingForm />
    </Container>
  )
}
