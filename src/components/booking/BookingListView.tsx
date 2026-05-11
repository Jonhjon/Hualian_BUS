'use client'
import { useState } from 'react'
import Link from 'next/link'
import { CalendarX, ChevronLeft, ChevronRight, Loader2, AlertCircle, PlusCircle } from 'lucide-react'
import { useBookings } from '@/hooks/useBookings'
import { BookingCard } from './BookingCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'

type Tab = 'upcoming' | 'history'

const TAB_LABEL: Record<Tab, string> = {
  upcoming: '即將到來',
  history: '歷史紀錄',
}

export function BookingListView() {
  const [tab, setTab] = useState<Tab>('upcoming')
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useBookings(tab, page)

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" className="inline-flex w-fit gap-1 rounded-lg border border-border bg-brand-50 p-1">
        {(['upcoming', 'history'] as Tab[]).map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => { setTab(t); setPage(1) }}
            className={cn(
              'inline-flex h-9 items-center rounded-md px-4 text-sm font-semibold transition-colors',
              tab === t
                ? 'bg-surface text-brand-500 shadow-soft'
                : 'text-ink-soft hover:text-ink',
            )}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>

      {isLoading && (
        <p role="status" aria-live="polite" className="inline-flex items-center gap-2 text-ink-soft">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          載入中...
        </p>
      )}
      {isError && (
        <p role="alert" className="inline-flex items-center gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          <AlertCircle size={16} aria-hidden="true" />
          載入失敗，請重新整理
        </p>
      )}

      {data && data.data.length === 0 && (
        <EmptyState
          icon={<CalendarX size={26} aria-hidden="true" />}
          title={tab === 'upcoming' ? '目前沒有預約' : '尚無歷史紀錄'}
          description={tab === 'upcoming' ? '建立新的預約，輕鬆規劃下次行程' : '完成或取消的預約會顯示在這裡'}
          action={
            tab === 'upcoming' && (
              <Link
                href="/bookings/new"
                className="inline-flex h-11 items-center gap-1.5 rounded-md bg-accent-500 px-5 text-sm font-semibold text-white shadow-soft hover:bg-accent-700"
              >
                <PlusCircle size={16} aria-hidden="true" />
                新增預約
              </Link>
            )
          }
        />
      )}

      <div className="flex flex-col gap-4">
        {data?.data.map(b => <BookingCard key={b.BookingID} booking={b} />)}
      </div>

      {data && data.meta.total > data.meta.limit && (
        <nav aria-label="分頁" className="mt-2 flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="inline-flex h-10 items-center gap-1 rounded-md border border-border bg-surface px-3 text-sm font-medium text-ink-soft hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            上一頁
          </button>
          <span className="text-sm font-medium text-ink-soft">
            第 {page} / {Math.max(1, Math.ceil(data.meta.total / data.meta.limit))} 頁
          </span>
          <button
            disabled={page * data.meta.limit >= data.meta.total}
            onClick={() => setPage(p => p + 1)}
            className="inline-flex h-10 items-center gap-1 rounded-md border border-border bg-surface px-3 text-sm font-medium text-ink-soft hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            下一頁
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  )
}
