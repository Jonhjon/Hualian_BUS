import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, PlusCircle } from 'lucide-react'
import { BookingListView } from '@/components/booking/BookingListView'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = {
  title: '我的預約 — 花蓮縣復康巴士預約系統',
}

export default function BookingsPage() {
  return (
    <Container size="content">
      <PageHeader
        title="我的預約"
        description="管理您的預約紀錄、查看派車狀態與即時追蹤"
        icon={<CalendarDays size={22} aria-hidden="true" />}
        actions={
          <Link
            href="/bookings/new"
            className="inline-flex h-11 items-center gap-1.5 rounded-md bg-accent-500 px-5 text-sm font-semibold text-white shadow-soft hover:bg-accent-700"
          >
            <PlusCircle size={16} aria-hidden="true" />
            新增預約
          </Link>
        }
      />
      <BookingListView />
    </Container>
  )
}
