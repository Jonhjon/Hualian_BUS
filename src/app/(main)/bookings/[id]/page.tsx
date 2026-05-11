'use client'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowLeft,
  Bus,
  ChevronRight,
  Loader2,
  MapPin,
  User as UserIcon,
  Clock,
  Phone,
  Navigation as NavigationIcon,
} from 'lucide-react'
import type { Booking } from '@/hooks/useBookings'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

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

const TYPE_LABEL: Record<number, string> = {
  1: '復康（身障）',
  2: '長照（失能）',
}

interface BookingDetailResponse {
  success: boolean
  data: Booking
}

async function fetchBooking(id: string): Promise<BookingDetailResponse> {
  const res = await fetch(`/api/bookings/${id}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? '載入預約資料失敗')
  return json
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => fetchBooking(id),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <Container size="content">
        <p role="status" className="inline-flex items-center gap-2 text-ink-soft">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          載入中...
        </p>
      </Container>
    )
  }

  if (error || !data) {
    return (
      <Container size="content">
        <Card className="flex flex-col gap-3 border-danger/30 bg-danger-soft">
          <p role="alert" className="inline-flex items-center gap-2 text-base font-semibold text-danger">
            <AlertCircle size={18} aria-hidden="true" />
            {(error as Error | undefined)?.message ?? '無法載入此預約'}
          </p>
          <Link href="/bookings" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-500 hover:text-accent-500">
            <ArrowLeft size={14} aria-hidden="true" />
            返回預約清單
          </Link>
        </Card>
      </Container>
    )
  }

  const booking = data.data
  const task = booking.dispatchTasks?.[0]
  const date = new Date(booking.PickupTime)
  const fullDate = date.toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  const eta = task?.EstimatedArrival
    ? new Date(task.EstimatedArrival).toLocaleString('zh-TW', {
      hour: '2-digit', minute: '2-digit',
    })
    : null

  return (
    <Container size="content">
      <Link
        href="/bookings"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-500 hover:text-accent-500"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        返回預約清單
      </Link>

      <header className="mb-6 flex flex-col gap-3 border-b border-border/70 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink-soft">{fullDate}</p>
          <h1 className="mt-1 text-3xl font-bold text-ink sm:text-4xl">{time}</h1>
          <p className="mt-2 text-sm text-ink-muted">預約編號 #{booking.BookingID}</p>
        </div>
        <Badge tone={STATUS_TONE[booking.BookingStatus]} className="text-sm">
          {STATUS_LABEL[booking.BookingStatus] ?? '未知'}
        </Badge>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <h2 className="mb-4 inline-flex items-center gap-2 text-base font-bold text-ink">
            <NavigationIcon size={16} aria-hidden="true" className="text-brand-500" />
            行程資訊
          </h2>
          <ol className="relative flex flex-col gap-5 border-l-2 border-dashed border-border pl-6">
            <li>
              <span
                aria-hidden="true"
                className="absolute -left-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-success ring-4 ring-success-soft"
              />
              <p className="text-xs font-semibold uppercase tracking-wider text-success">上車</p>
              <p className="mt-0.5 text-base font-semibold text-ink">{booking.PickupAddr}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-muted">
                <Clock size={12} aria-hidden="true" />
                {time}
              </p>
            </li>
            <li>
              <span
                aria-hidden="true"
                className="absolute -left-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 ring-4 ring-accent-50"
                style={{ marginTop: 0 }}
              />
              <p className="text-xs font-semibold uppercase tracking-wider text-accent-700">下車</p>
              <p className="mt-0.5 text-base font-semibold text-ink">{booking.DropoffAddr}</p>
            </li>
          </ol>

          <dl className="mt-6 grid grid-cols-2 gap-y-3 border-t border-border/70 pt-5 text-sm">
            <dt className="text-ink-muted">服務類型</dt>
            <dd className="font-semibold text-ink">{TYPE_LABEL[booking.BookingType] ?? '—'}</dd>
            <dt className="text-ink-muted">隨行人數</dt>
            <dd className="font-semibold text-ink">{booking.CompanionCount} 人</dd>
            <dt className="text-ink-muted">去回程</dt>
            <dd className="font-semibold text-ink">{booking.IsRoundTrip ? '是' : '否'}</dd>
          </dl>
        </Card>

        <Card>
          <h2 className="mb-4 inline-flex items-center gap-2 text-base font-bold text-ink">
            <Bus size={16} aria-hidden="true" className="text-brand-500" />
            派車資訊
          </h2>
          {task?.vehicle ? (
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-ink-muted">車號</dt>
              <dd className="font-bold text-ink">{task.vehicle.PlateNo}</dd>
              {task.vehicle.VehicleType && (
                <>
                  <dt className="text-ink-muted">車型</dt>
                  <dd className="text-ink">{task.vehicle.VehicleType}</dd>
                </>
              )}
              {task.driver?.DriverName && (
                <>
                  <dt className="inline-flex items-center gap-1 text-ink-muted">
                    <UserIcon size={12} aria-hidden="true" />司機
                  </dt>
                  <dd className="text-ink">{task.driver.DriverName}<span className="text-ink-muted">（{task.driver.DriverNo}）</span></dd>
                </>
              )}
              {eta && (
                <>
                  <dt className="inline-flex items-center gap-1 text-ink-muted">
                    <Clock size={12} aria-hidden="true" />預計到達
                  </dt>
                  <dd className="font-bold text-accent-500">{eta}</dd>
                </>
              )}
            </dl>
          ) : (
            <p className="rounded-md bg-brand-50 px-3 py-3 text-sm text-ink-soft">尚未派車，請耐心等候</p>
          )}

          {[1, 3].includes(booking.BookingStatus) && (
            <Link
              href={`/bookings/${booking.BookingID}/track`}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-md bg-brand-500 px-4 text-sm font-semibold text-white shadow-soft hover:bg-brand-700"
            >
              <MapPin size={16} aria-hidden="true" />
              即時追蹤
              <ChevronRight size={14} aria-hidden="true" />
            </Link>
          )}

          <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink-muted">
            <Phone size={12} aria-hidden="true" />
            預約專線：03-822-7171
          </p>
        </Card>
      </div>
    </Container>
  )
}
