'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMonthlyBookings } from '@/hooks/useBookings'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral'

const STATUS_LABEL: Record<number, string> = {
  0: '預約成功', 1: '排班完成', 2: '已取消',
  3: '搭乘中', 4: '已完趟', 5: '後補',
}
const STATUS_TONE: Record<number, Tone> = {
  0: 'info', 1: 'success', 2: 'neutral',
  3: 'accent', 4: 'success', 5: 'warning',
}
const GENDER_LABEL: Record<number, string> = { 0: '其他', 1: '男', 2: '女' }

function MonthNav({ year, month, onChange }: {
  year: number; month: number
  onChange: (y: number, m: number) => void
}) {
  const prev = () => month === 1 ? onChange(year - 1, 12) : onChange(year, month - 1)
  const next = () => {
    const now = new Date()
    if (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)) return
    month === 12 ? onChange(year + 1, 1) : onChange(year, month + 1)
  }
  const isCurrentMonth = (() => {
    const now = new Date()
    return year === now.getFullYear() && month === now.getMonth() + 1
  })()

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={prev}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-surface-2"
        aria-label="上個月"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="min-w-[7rem] text-center text-sm font-semibold text-ink">
        {year} 年 {month} 月
      </span>
      <button
        onClick={next}
        disabled={isCurrentMonth}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-surface-2 disabled:opacity-40"
        aria-label="下個月"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

export default function MonthlyBookingsPage() {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const { data, isLoading, error } = useMonthlyBookings(year, month)

  const bookings = data?.data?.bookings ?? []
  const summary  = data?.data?.summary

  return (
    <Container size="wide">
      <Link
        href="/bookings"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-500 hover:text-accent-500"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        返回預約清單
      </Link>

      <PageHeader
        title="月份預約明細"
        description="查看以月為單位的完整預約記錄與派車資訊"
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <MonthNav year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m) }} />
        {summary && (
          <div className="flex gap-4 text-sm">
            <span className="text-ink-muted">
              本月訂車 <strong className="text-ink">{summary.totalCount}</strong> 趟
            </span>
            <span className="text-ink-muted">
              實際搭乘 <strong className="text-success">{summary.completedCount}</strong> 趟
            </span>
          </div>
        )}
      </div>

      {isLoading && (
        <p role="status" className="inline-flex items-center gap-2 text-ink-soft">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          載入中...
        </p>
      )}

      {error && (
        <Card className="flex items-center gap-2 border-danger/30 bg-danger-soft text-danger">
          <AlertCircle size={16} aria-hidden="true" />
          {(error as Error).message ?? '無法載入資料'}
        </Card>
      )}

      {!isLoading && !error && bookings.length === 0 && (
        <Card className="py-10 text-center text-ink-soft">
          本月尚無預約記錄
        </Card>
      )}

      {bookings.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-3 py-3">狀態</th>
                <th className="px-3 py-3">訂車時間</th>
                <th className="px-3 py-3">編號</th>
                <th className="px-3 py-3">姓名</th>
                <th className="px-3 py-3">性別</th>
                <th className="px-3 py-3">搭乘日期</th>
                <th className="px-3 py-3">輔具</th>
                <th className="px-3 py-3">上車地點</th>
                <th className="px-3 py-3">下車地點</th>
                <th className="px-3 py-3">去回程</th>
                <th className="px-3 py-3">訂車帳號</th>
                <th className="px-3 py-3">車號</th>
                <th className="px-3 py-3">車型</th>
                <th className="px-3 py-3">司機</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((b) => {
                const task = b.dispatchTasks?.[0]
                const pickupDate = b.PickupTime
                  ? new Date(b.PickupTime).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', dateStyle: 'short', timeStyle: 'short' })
                  : '—'
                const createdAt = b.CreatedAt
                  ? new Date(b.CreatedAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', dateStyle: 'short', timeStyle: 'short' })
                  : '—'
                return (
                  <tr key={b.BookingID} className="hover:bg-surface-2/50">
                    <td className="whitespace-nowrap px-3 py-3">
                      <Badge tone={STATUS_TONE[b.BookingStatus] ?? 'neutral'}>
                        {STATUS_LABEL[b.BookingStatus] ?? '—'}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink-muted">{createdAt}</td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/bookings/${b.BookingID}`}
                        className="font-semibold text-brand-500 hover:underline"
                      >
                        #{b.BookingID}
                      </Link>
                    </td>
                    <td className="px-3 py-3">{b.passenger?.RealName ?? '—'}</td>
                    <td className="px-3 py-3">{b.passenger?.Gender != null ? GENDER_LABEL[b.passenger.Gender] ?? '—' : '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3">{pickupDate}</td>
                    <td className="px-3 py-3">{b.passenger?.AssistiveDevice ?? '—'}</td>
                    <td className="max-w-[10rem] truncate px-3 py-3" title={b.PickupAddr}>{b.PickupAddr}</td>
                    <td className="max-w-[10rem] truncate px-3 py-3" title={b.DropoffAddr}>{b.DropoffAddr}</td>
                    <td className="px-3 py-3">{b.IsRoundTrip ? '去回程' : '單程'}</td>
                    <td className="px-3 py-3">{b.passenger?.account?.Username ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3 font-semibold">{task?.vehicle?.PlateNo ?? '未派車'}</td>
                    <td className="px-3 py-3">{task?.vehicle?.VehicleType ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {task?.driver
                        ? `${task.driver.DriverName ?? ''}（${task.driver.DriverNo}）`
                        : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  )
}
