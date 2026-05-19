'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowLeft, Calendar, Loader2, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { apiFetch } from '@/lib/api/client'

interface Announcement {
  PostID: number
  Title: string
  Content: string | null
  PublishDate: string | null
}

export function AnnouncementDetail({ id }: { id: string }) {
  const { data, isLoading, isError } = useQuery<{ data: Announcement }>({
    queryKey: ['announcement', id],
    queryFn: () => apiFetch<{ data: Announcement }>(`/api/announcements/${id}`),
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
        載入失敗
      </p>
    )
  }

  const a = data?.data

  return (
    <>
      <Link
        href="/announcements"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-500 hover:text-accent-500"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        返回公告列表
      </Link>
      <article>
        <Card className="p-7 sm:p-8">
          <header className="mb-6 border-b border-border/70 pb-5">
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">{a?.Title}</h1>
            {a?.PublishDate && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-muted">
                <Calendar size={14} aria-hidden="true" className="text-brand-500" />
                發布日期：{new Date(a.PublishDate).toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </header>
          <div className="whitespace-pre-wrap text-base leading-relaxed text-ink">
            {a?.Content}
          </div>
        </Card>
      </article>
    </>
  )
}
