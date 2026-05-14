'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  User as UserIcon,
  IdCard,
  Calendar,
  ShieldCheck,
  Wrench,
  MapPin,
  Mail,
  Phone,
  Loader2,
  TrendingUp,
  CalendarCheck,
  XSquare,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { apiFetch, ApiError } from '@/lib/api/client'

const AUDIT_LABEL: Record<number, string> = { 0: '審核中', 1: '已通過', 2: '已駁回' }
const IDENTITY_LABEL: Record<number, string> = { 1: '復康（身障）', 2: '長照（失能）' }

async function fetchProfile() {
  return apiFetch<{ data: Record<string, unknown> }>('/api/profile')
}

function formatDate(value: unknown): string {
  if (!value || typeof value !== 'string') return '—'
  try {
    return new Date(value).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return '—'
  }
}

export function ProfileContent() {
  const { data, isLoading, error } = useQuery<{ data: Record<string, unknown> }, ApiError>({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  })

  if (isLoading) {
    return (
      <p role="status" className="inline-flex items-center gap-2 py-8 text-ink-soft">
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        載入中...
      </p>
    )
  }

  if (error) {
    const loginExpired = error.status === 401
    return (
      <Card variant="default" className="border-danger/30 bg-danger-soft">
        <div role="alert" className="flex flex-col gap-3">
          <p className="inline-flex items-center gap-2 text-base font-semibold text-danger">
            <AlertCircle size={18} aria-hidden="true" />
            {loginExpired ? '登入已過期，請重新登入' : error.message}
          </p>
          {loginExpired && (
            <Link
              href="/login?next=/profile"
              className="inline-flex h-11 w-fit items-center justify-center rounded-md bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              前往登入
            </Link>
          )}
        </div>
      </Card>
    )
  }

  const p = data?.data
  const auditStatus = Number(p?.auditStatus ?? 0)
  const stats = (p?.monthlyStats as { booked?: number; completed?: number; cancelled?: number } | undefined) ?? {}

  const auditTone: 'success' | 'warning' | 'danger' = auditStatus === 1 ? 'success' : auditStatus === 2 ? 'danger' : 'warning'
  const AuditIcon = auditStatus === 1 ? CheckCircle2 : auditStatus === 2 ? XCircle : Clock

  return (
    <div className="flex flex-col gap-5">
      <div
        role="status"
        aria-live="polite"
        className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
          auditTone === 'success' ? 'border-success/30 bg-success-soft text-success' :
          auditTone === 'danger' ? 'border-danger/30 bg-danger-soft text-danger' :
          'border-warning/30 bg-warning-soft text-warning'
        }`}
      >
        <AuditIcon size={20} aria-hidden="true" />
        <p className="text-base font-bold">
          帳號狀態：{AUDIT_LABEL[auditStatus]}
        </p>
      </div>

      <Card>
        <h2 className="mb-4 inline-flex items-center gap-2 text-base font-bold text-ink">
          <TrendingUp size={16} aria-hidden="true" className="text-brand-500" />
          本月趟次統計
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <StatItem icon={<CalendarCheck size={18} />} label="訂車趟次" value={stats.booked ?? 0} tone="info" />
          <StatItem icon={<CheckCircle2 size={18} />} label="實際搭乘" value={stats.completed ?? 0} tone="success" />
          <StatItem icon={<XSquare size={18} />} label="取消趟次" value={stats.cancelled ?? 0} tone="danger" />
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 inline-flex items-center gap-2 text-base font-bold text-ink">
          <UserIcon size={16} aria-hidden="true" className="text-brand-500" />
          基本資料
        </h2>
        <dl className="grid gap-y-3 text-sm">
          <ProfileRow icon={<UserIcon size={14} />} label="登入帳號" value={String(p?.username || '—')} />
          <ProfileRow icon={<UserIcon size={14} />} label="姓名" value={String(p?.realName || '—')} />
          <ProfileRow icon={<UserIcon size={14} />} label="性別" value={String(p?.gender || '—')} />
          <ProfileRow icon={<IdCard size={14} />} label="身分證字號" value={String(p?.identityNo || '—')} />
          <ProfileRow icon={<Mail size={14} />} label="電子郵件" value={String(p?.email || '—')} />
          <ProfileRow icon={<Phone size={14} />} label="聯絡電話" value={String(p?.phone || '—')} />
          <ProfileRow
            icon={<ShieldCheck size={14} />}
            label="服務類型"
            value={p?.identityType ? IDENTITY_LABEL[Number(p.identityType)] : '—'}
          />
          <ProfileRow icon={<Calendar size={14} />} label="生日" value={formatDate(p?.birthDate)} />
          <ProfileRow
            icon={<Calendar size={14} />}
            label="證明到期日"
            value={formatDate(p?.expiryDate)}
            badge={
              p?.expiryDate ? (
                <Badge tone="warning">期限</Badge>
              ) : null
            }
          />
          <ProfileRow icon={<ShieldCheck size={14} />} label="障礙等級／失能等級" value={String(p?.disabilityLevel || '—')} />
          <ProfileRow icon={<Wrench size={14} />} label="輔具" value={String(p?.assistiveDevice || '—')} />
          <ProfileRow icon={<MapPin size={14} />} label="地址" value={String(p?.address || '—')} />
        </dl>
      </Card>
    </div>
  )
}

interface StatItemProps {
  icon: React.ReactNode
  label: string
  value: number
  tone: 'info' | 'success' | 'danger'
}

function StatItem({ icon, label, value, tone }: StatItemProps) {
  const toneClasses = {
    info: 'bg-info-soft text-info',
    success: 'bg-success-soft text-success',
    danger: 'bg-danger-soft text-danger',
  }[tone]
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-cream px-3 py-4 text-center">
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses}`} aria-hidden="true">
        {icon}
      </span>
      <span className="text-xs text-ink-soft">{label}</span>
      <span className="text-2xl font-bold text-ink">{value}</span>
    </div>
  )
}

function ProfileRow({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode
  label: string
  value: string
  badge?: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0">
      <dt className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted sm:text-sm">
        <span className="text-brand-500" aria-hidden="true">{icon}</span>
        {label}
      </dt>
      <dd className="font-semibold text-ink">{value}</dd>
      <div>{badge}</div>
    </div>
  )
}
