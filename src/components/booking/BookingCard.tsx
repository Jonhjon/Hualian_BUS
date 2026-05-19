'use client'
import Link from 'next/link'
import { Bus, MapPin, Users, ArrowRight, ArrowLeft, Repeat, ChevronRight, X, Star } from 'lucide-react'
import { useCancelBooking, type Booking } from '@/hooks/useBookings'
import { Badge } from '@/components/ui/Badge'
import { taipeiNowParts } from '@/lib/booking/timezone'

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral'
const STATUS_LABEL: Record<number, string> = {
  0: '預約成功',
  1: '排班完成',
  2: '已取消',
  3: '搭乘中',
  4: '已完趟',
  5: '後補',
}
const STATUS_TONE: Record<number, Tone> = {
  0: 'info',
  1: 'success',
  2: 'neutral',
  3: 'accent',
  4: 'success',
  5: 'warning',
}

const CANCELLABLE = new Set([0, 1, 5])
const FEEDBACK_ALLOWED_STATUS = 4

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('zh-TW', {
  timeZone: 'Asia/Taipei',
  weekday: 'short',
})

interface Props {
  booking: Booking
}

export function BookingCard({ booking }: Props) {
  const cancel = useCancelBooking()
  const canCancel = CANCELLABLE.has(booking.BookingStatus)
  const canGiveFeedback = booking.BookingStatus === FEEDBACK_ALLOWED_STATUS

  const date = new Date(booking.PickupTime)
  const taipei = taipeiNowParts(date)
  const day = String(taipei.day).padStart(2, '0')
  const month = `${taipei.month} 月`
  const weekday = WEEKDAY_FORMATTER.format(date)
  const time = `${String(taipei.hour).padStart(2, '0')}:${String(taipei.minute).padStart(2, '0')}`
  const year = taipei.year

  async function handleCancel() {
    if (!confirm('確定要取消此預約嗎？')) return
    const result = await cancel.mutateAsync(booking.BookingID)
    if (result?.data?.isLateCancel) {
      alert('注意：此為 24 小時內取消，將記錄逾期取消')
    }
  }

  return (
    <article
      aria-label={`預約 ${booking.BookingID}`}
      className="group flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-soft transition-shadow hover:shadow-card sm:flex-row sm:items-stretch sm:gap-5"
    >
      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:gap-1 sm:border-r sm:border-border sm:pr-5 sm:text-center">
        <div className="flex items-baseline gap-1 sm:flex-col sm:items-center sm:gap-0">
          <span className="text-3xl font-bold leading-none text-accent-500">{day}</span>
          <span className="text-xs font-semibold text-ink-soft">{month}</span>
        </div>
        <div className="flex flex-col sm:items-center">
          <span className="text-xs text-ink-muted">{year}・{weekday}</span>
          <span className="text-base font-bold text-ink">{time}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={STATUS_TONE[booking.BookingStatus]}>
            {STATUS_LABEL[booking.BookingStatus] ?? '未知'}
          </Badge>
          {booking.tripDirection === 'outbound' && (
            <Badge tone="info" icon={<ArrowRight size={11} aria-hidden="true" />}>去程</Badge>
          )}
          {booking.tripDirection === 'return' && (
            <Badge tone="accent" icon={<ArrowLeft size={11} aria-hidden="true" />}>回程</Badge>
          )}
          {booking.tripDirection === 'unknown_roundtrip' && (
            <Badge tone="neutral" icon={<Repeat size={11} aria-hidden="true" />}>去回程</Badge>
          )}
          {!booking.tripDirection && booking.IsRoundTrip && (
            <Badge tone="neutral" icon={<Repeat size={11} aria-hidden="true" />}>去回程</Badge>
          )}
          {booking.CompanionCount > 0 && (
            <Badge tone="neutral" icon={<Users size={11} aria-hidden="true" />}>隨行 {booking.CompanionCount} 人</Badge>
          )}
        </div>
        <p className="flex items-start gap-1.5 text-sm text-ink">
          <MapPin size={14} aria-hidden="true" className="mt-1 shrink-0 text-success" />
          <span className="truncate"><strong className="font-semibold text-ink-soft">上車</strong>　{booking.PickupAddr}</span>
        </p>
        <p className="flex items-start gap-1.5 text-sm text-ink">
          <MapPin size={14} aria-hidden="true" className="mt-1 shrink-0 text-accent-500" />
          <span className="truncate"><strong className="font-semibold text-ink-soft">下車</strong>　{booking.DropoffAddr}</span>
        </p>
        {booking.dispatchTasks?.[0]?.vehicle && (
          <p className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
            <Bus size={13} aria-hidden="true" className="text-brand-500" />
            車號 <strong className="font-semibold text-ink">{booking.dispatchTasks[0].vehicle.PlateNo}</strong>
            {booking.dispatchTasks[0].vehicle.VehicleType && <>（{booking.dispatchTasks[0].vehicle.VehicleType}）</>}
          </p>
        )}
      </div>

      <div className="flex flex-row items-center justify-end gap-2 sm:flex-col sm:items-end">
        <Link
          href={`/bookings/${booking.BookingID}`}
          className="inline-flex h-10 items-center gap-1 rounded-md border border-border bg-surface px-3 text-sm font-semibold text-brand-500 hover:bg-brand-50"
        >
          查看詳情
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
        {canGiveFeedback && (
          <Link
            href={`/feedback?bookingId=${booking.BookingID}`}
            className="inline-flex h-10 items-center gap-1 rounded-md bg-accent-500 px-3 text-sm font-semibold text-white shadow-soft hover:bg-accent-700"
          >
            <Star size={14} aria-hidden="true" />
            填寫回饋
          </Link>
        )}
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancel.isPending}
            className="inline-flex h-10 items-center gap-1 rounded-md border border-danger/40 bg-surface px-3 text-sm font-semibold text-danger hover:bg-danger-soft disabled:opacity-60"
          >
            <X size={14} aria-hidden="true" />
            {cancel.isPending ? '取消中...' : '取消預約'}
          </button>
        )}
      </div>
    </article>
  )
}
