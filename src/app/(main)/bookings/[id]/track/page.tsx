'use client'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, RefreshCw, Loader2 } from 'lucide-react'
import { useVehicleTracking } from '@/hooks/useBookings'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'

const TrackingMap = dynamic(() => import('@/components/booking/TrackingMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{ height: 420 }}
      className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-brand-50 text-ink-soft"
    >
      <Loader2 size={18} className="animate-spin" aria-hidden="true" />
      地圖載入中...
    </div>
  ),
})

export default function TrackingPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useVehicleTracking(id)

  return (
    <Container size="content">
      <Link
        href={`/bookings/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-500 hover:text-accent-500"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        返回預約詳情
      </Link>
      <PageHeader
        title="即時追蹤"
        description="每 30 秒自動更新車輛位置"
        icon={<MapPin size={22} aria-hidden="true" />}
      />

      <Card className="mb-4 flex flex-wrap items-center gap-4 p-4">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-500">
          <RefreshCw size={14} aria-hidden="true" />
          {data?.data?.position?.timestamp
            ? `最後更新：${new Date(data.data.position.timestamp).toLocaleTimeString('zh-TW')}`
            : '等待車輛位置資訊'}
        </span>
        {data?.data?.position?.speed !== undefined && (
          <span className="inline-flex items-center gap-1 text-sm text-ink-soft">
            目前速度
            <strong className="font-bold text-ink">{data.data.position.speed.toFixed(1)} km/h</strong>
          </span>
        )}
      </Card>

      {isLoading ? (
        <p role="status" className="inline-flex items-center gap-2 text-ink-soft">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          載入中...
        </p>
      ) : (
        <TrackingMap
          position={data?.data?.position ?? null}
          message={data?.data?.message}
        />
      )}
    </Container>
  )
}
