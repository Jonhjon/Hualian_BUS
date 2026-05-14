'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ChevronRight, Loader2, AlertCircle, Megaphone } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { apiFetch } from '@/lib/api/client'

interface Announcement {
  PostID: number
  Title: string
  PublishDate: string | null
}

export function AnnouncementList() {
  const { data, isLoading, isError } = useQuery<{ data: Announcement[] }>({
    queryKey: ['announcements'],
    queryFn: () => apiFetch<{ data: Announcement[] }>('/api/announcements'),
  })

  if (isLoading) {
    return (
      <p role="status" className="inline-flex items-center gap-2 text-ink-soft">
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        載入中...
      </p>
    )
  }
  if (isError) {
    return (
      <p role="alert" className="inline-flex items-center gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
        <AlertCircle size={16} aria-hidden="true" />
        載入失敗，請重新整理
      </p>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        icon={<Megaphone size={26} aria-hidden="true" />}
        title="目前沒有公告"
        description="新公告會在這裡顯示"
      />
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.data.map(a => {
        const date = a.PublishDate ? new Date(a.PublishDate) : null
        const day = date ? String(date.getDate()).padStart(2, '0') : '--'
        const month = date ? `${date.getMonth() + 1} 月` : ''

        return (
          <li key={a.PostID}>
            <Link
              href={`/announcements/${a.PostID}`}
              className="group flex items-stretch gap-4 rounded-lg border border-border bg-surface p-4 shadow-soft transition-shadow hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40"
            >
              <div className="flex shrink-0 flex-col items-center justify-center rounded-md bg-brand-50 px-3 py-2 text-center sm:px-4">
                <span className="text-2xl font-bold leading-none text-brand-500">{day}</span>
                <span className="mt-0.5 text-xs font-semibold text-ink-soft">{month}</span>
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <h2 className="text-base font-bold text-ink group-hover:text-brand-500 sm:text-lg">
                  {a.Title}
                </h2>
                {date && (
                  <p className="mt-1 text-xs text-ink-muted">
                    {date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
              <ChevronRight size={18} aria-hidden="true" className="shrink-0 self-center text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
