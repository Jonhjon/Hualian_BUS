'use client'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import {
  AlertTriangle,
  CalendarDays,
  MapPin,
  Users,
  Repeat,
  Wrench,
  Send,
  AlertCircle,
} from 'lucide-react'
import { bookingSchema, type BookingInput } from '@/lib/validators/booking.schema'
import { useCreateBooking } from '@/hooks/useBookings'
import { apiFetch } from '@/lib/api/client'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'

const HCAPTCHA_SITEKEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY ?? ''

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
const IDENTITY_LABEL: Record<number, string> = { 1: '復康（身障）', 2: '長照（失能）' }

function localStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getDateRange() {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const max = new Date(today); max.setDate(max.getDate() + 7)
  return { min: localStr(today), max: localStr(max) }
}

interface ProfileResponse {
  data: {
    realName: string | null
    gender: string | null
    identityType: number | null
    auditStatus: number | null
    birthDate: string | null
    expiryDate: string | null
    disabilityLevel: string | null
    assistiveDevice: string | null
  }
}

const AUDIT_MESSAGE: Record<number, string> = {
  0: '您的帳號尚在審核中，審核通過後始可預約',
  2: '您的帳號審核未通過，無法預約，請聯繫客服',
}

async function fetchProfile(): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>('/api/profile')
}

function SectionTitle({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="mb-4 flex items-start gap-2.5">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-500" aria-hidden="true">
        {icon}
      </span>
      <div>
        <h2 className="text-base font-bold text-ink">{title}</h2>
        {description && <p className="text-xs text-ink-soft">{description}</p>}
      </div>
    </div>
  )
}

function formatProfileDate(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return '—'
  }
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-cream px-3 py-2">
      <dt className="text-xs font-semibold text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-ink">{value || '—'}</dd>
    </div>
  )
}

export function BookingForm() {
  const router = useRouter()
  const create = useCreateBooking()
  const { min, max } = getDateRange()
  const profile = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  })

  const captchaRef = useRef<HCaptcha>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaError, setCaptchaError] = useState<string | null>(null)
  const captchaEnabled = HCAPTCHA_SITEKEY.length > 0

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { bookingType: 1, companionCount: 0, isRoundTrip: false },
  })

  const profileData = profile.data?.data
  const identityType = profileData?.identityType
  const auditStatus = profileData?.auditStatus
  const profileDisabilityLevel = profileData?.disabilityLevel
  const profileAssistiveDevice = profileData?.assistiveDevice
  const hasValidIdentityType = identityType === 1 || identityType === 2
  const isApproved = auditStatus === 1
  const auditMessage = typeof auditStatus === 'number' ? AUDIT_MESSAGE[auditStatus] : undefined
  const isRoundTrip = watch('isRoundTrip')

  useEffect(() => {
    if (hasValidIdentityType) {
      setValue('bookingType', identityType)
    }
  }, [hasValidIdentityType, identityType, setValue])

  useEffect(() => {
    if (profileDisabilityLevel) setValue('disabilityLevel', profileDisabilityLevel)
  }, [profileDisabilityLevel, setValue])

  useEffect(() => {
    if (profileAssistiveDevice) setValue('assistiveDevice', profileAssistiveDevice)
  }, [profileAssistiveDevice, setValue])

  async function onSubmit(data: BookingInput) {
    if (captchaEnabled && !captchaToken) {
      setCaptchaError('請先完成機器人驗證')
      return
    }
    setCaptchaError(null)

    const bookingData = hasValidIdentityType ? { ...data, bookingType: identityType } : data
    const firstPayload = { ...bookingData, captchaToken: captchaToken ?? undefined }
    await create.mutateAsync(firstPayload)
    if (data.isRoundTrip && data.returnPickupHour) {
      await create.mutateAsync({
        ...bookingData,
        pickupHour: data.returnPickupHour,
        pickupAddr: data.dropoffAddr,
        dropoffAddr: data.pickupAddr,
        isRoundTrip: true,
        captchaToken: captchaToken ?? undefined,
      })
    }
    captchaRef.current?.resetCaptcha()
    setCaptchaToken(null)
    router.push('/bookings')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {auditMessage && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning">
          <AlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
          <span>{auditMessage}</span>
        </div>
      )}

      <Card>
        <SectionTitle icon={<CalendarDays size={18} />} title="行程時間" description="選擇預約日期與上車時段" />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="預約日期" htmlFor="pickupDate" required error={errors.pickupDate?.message} hint={`可預約：${min} 至 ${max}`}>
            <Input
              id="pickupDate"
              type="date"
              min={min}
              max={max}
              aria-required={true}
              aria-invalid={!!errors.pickupDate}
              aria-describedby={errors.pickupDate ? 'pickupdate-error' : 'pickupDate-hint'}
              invalid={!!errors.pickupDate}
              {...register('pickupDate')}
            />
          </FormField>
          <FormField label="上車時段" htmlFor="pickupHour" required error={errors.pickupHour?.message}>
            <Select
              id="pickupHour"
              aria-required={true}
              aria-invalid={!!errors.pickupHour}
              aria-describedby={errors.pickupHour ? 'pickuphour-error' : undefined}
              invalid={!!errors.pickupHour}
              {...register('pickupHour', { valueAsNumber: true })}
            >
              {HOURS.map(h => (
                <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
              ))}
            </Select>
          </FormField>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={<MapPin size={18} />} title="上下車地點" description="輸入完整地址，可包含路名、巷弄、號" />
        <div className="flex flex-col gap-5">
          <FormField label="上車地址" htmlFor="pickupAddr" required error={errors.pickupAddr?.message}>
            <Input
              id="pickupAddr"
              aria-required={true}
              aria-invalid={!!errors.pickupAddr}
              aria-describedby={errors.pickupAddr ? 'pickupaddr-error' : undefined}
              invalid={!!errors.pickupAddr}
              {...register('pickupAddr')}
            />
          </FormField>
          <FormField label="下車地址" htmlFor="dropoffAddr" required error={errors.dropoffAddr?.message}>
            <Input
              id="dropoffAddr"
              aria-required={true}
              aria-invalid={!!errors.dropoffAddr}
              aria-describedby={errors.dropoffAddr ? 'dropoffaddr-error' : undefined}
              invalid={!!errors.dropoffAddr}
              {...register('dropoffAddr')}
            />
          </FormField>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={<Users size={18} />} title="服務類型與隨行資訊" description="依個人資料帶入服務類型" />
        <div className="flex flex-col gap-5">
          <FormField label="服務類型" htmlFor="bookingType">
            <Select
              id="bookingType"
              aria-required={true}
              disabled
              {...register('bookingType', { valueAsNumber: true })}
            >
              <option value={1}>復康（身障）</option>
              <option value={2}>長照（失能）</option>
            </Select>
            {profile.isLoading && <p className="mt-1 text-xs text-ink-muted">正在帶入帳號服務類型...</p>}
            {hasValidIdentityType && (
              <p className="mt-1 text-xs text-ink-muted">
                已依個人資料帶入：{IDENTITY_LABEL[identityType]}
              </p>
            )}
            {profile.isError && (
              <p role="alert" className="mt-1 text-xs font-medium text-danger">
                無法載入帳號服務類型，請重新登入後再預約
              </p>
            )}
          </FormField>

          <dl className="grid gap-3 sm:grid-cols-2">
            <ProfileItem label="姓名" value={profileData?.realName ?? '—'} />
            <ProfileItem label="性別" value={profileData?.gender ?? '—'} />
            <ProfileItem label="出生年月日" value={formatProfileDate(profileData?.birthDate)} />
            <ProfileItem label="證明到期日" value={formatProfileDate(profileData?.expiryDate)} />
            <ProfileItem label="類別" value={hasValidIdentityType ? IDENTITY_LABEL[identityType] : '—'} />
            <ProfileItem label="障礙等級／失能等級" value={profileDisabilityLevel ?? '—'} />
            <ProfileItem label="輔具" value={profileAssistiveDevice ?? '—'} />
          </dl>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="障礙等級／失能等級（選填）" htmlFor="disabilityLevel">
              <Input
                id="disabilityLevel"
                autoComplete="off"
                aria-invalid={!!errors.disabilityLevel}
                invalid={!!errors.disabilityLevel}
                {...register('disabilityLevel')}
              />
            </FormField>
            <FormField label="輔具（選填）" htmlFor="assistiveDevice">
              <Input
                id="assistiveDevice"
                autoComplete="off"
                aria-invalid={!!errors.assistiveDevice}
                invalid={!!errors.assistiveDevice}
                {...register('assistiveDevice')}
              />
            </FormField>
          </div>

          <FormField label="隨行人數" htmlFor="companionCount" hint="不含乘客本人">
            <Select
              id="companionCount"
              aria-describedby="companionCount-hint"
              {...register('companionCount', { valueAsNumber: true })}
            >
              {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n} 人</option>)}
            </Select>
          </FormField>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={<Repeat size={18} />} title="回程選項" description="若需要回程，將自動建立兩筆預約" />
        <div className="flex items-center gap-3 rounded-md border border-border bg-cream px-4 py-3">
          <input
            id="isRoundTrip"
            type="checkbox"
            className="h-5 w-5 rounded border-border text-accent-500 focus:ring-accent-500"
            {...register('isRoundTrip')}
          />
          <label
            htmlFor="isRoundTrip"
            className="cursor-pointer text-base font-medium text-ink"
          >
            去回程
          </label>
          <span aria-hidden="true" className="ml-auto text-xs text-ink-muted">
            勾選後出現回程時段
          </span>
        </div>

        {isRoundTrip && (
          <div className="mt-4">
            <FormField label="回程時段" htmlFor="returnPickupHour">
              <Select
                id="returnPickupHour"
                {...register('returnPickupHour', { valueAsNumber: true })}
              >
                {HOURS.map(h => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                ))}
              </Select>
            </FormField>
          </div>
        )}
      </Card>

      {captchaEnabled ? (
        <div className="flex flex-col gap-2">
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
            <Wrench size={14} aria-hidden="true" />
            機器人驗證
          </p>
          <HCaptcha
            ref={captchaRef}
            sitekey={HCAPTCHA_SITEKEY}
            onVerify={token => {
              setCaptchaToken(token)
              setCaptchaError(null)
            }}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
          />
          {captchaError && (
            <p role="alert" className="text-sm font-medium text-danger">{captchaError}</p>
          )}
        </div>
      ) : (
        <p className="rounded-md bg-brand-50 px-3 py-2 text-xs text-ink-muted">
          （開發模式：未設定 HCaptcha sitekey，已略過機器人驗證）
        </p>
      )}

      {create.error && (
        <p role="alert" className="flex items-center gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          <AlertCircle size={16} aria-hidden="true" />
          {(create.error as Error).message}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 -mb-4 mt-2 border-t border-border bg-surface/95 px-4 py-4 backdrop-blur sm:relative sm:mx-0 sm:mb-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <Button
          type="submit"
          variant="accent"
          size="lg"
          fullWidth
          loading={create.isPending}
          disabled={create.isPending || profile.isLoading || !hasValidIdentityType || !isApproved}
          leftIcon={<Send size={18} aria-hidden="true" />}
        >
          {create.isPending ? '送出中...' : '送出預約'}
        </Button>
      </div>
    </form>
  )
}
