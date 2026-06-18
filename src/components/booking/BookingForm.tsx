'use client'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  CalendarDays,
  MapPin,
  Users,
  Repeat,
  Wrench,
  Send,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { bookingSchema, type BookingInput } from '@/lib/validators/booking.schema'
import { useCreateBatchBooking } from '@/hooks/useBookings'
import { apiFetch } from '@/lib/api/client'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { getAvailableHours, toLocalDateString } from '@/lib/booking/availableHours'
import { getDefaultBookingValues } from '@/lib/booking/defaults'
import { taipeiDateStr } from '@/lib/booking/timezone'

const IDENTITY_LABEL: Record<number, string> = { 1: '復康（身障）', 2: '長照（失能）' }

function identityLabel(identityType: number | null | undefined): string {
  if (identityType == null) return '—'
  return IDENTITY_LABEL[identityType] ?? '—'
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000

// Derive both bounds in Asia/Taipei so the picker matches server-side isValidBookingDate
// for users in any browser timezone.
function getDateRange(now: Date) {
  const todayStr = taipeiDateStr(now)
  const maxStr = taipeiDateStr(new Date(now.getTime() + 7 * ONE_DAY_MS))
  return { min: todayStr, max: maxStr }
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

interface MathChallenge {
  question: string
  challengeToken: string
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
  const create = useCreateBatchBooking()
  const [now, setNow] = useState<Date>(() => new Date())
  const { min, max } = getDateRange(now)
  const profile = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  })

  const [mathChallenge, setMathChallenge] = useState<MathChallenge | null>(null)
  const [mathAnswer, setMathAnswer] = useState('')
  const [captchaError, setCaptchaError] = useState<string | null>(null)
  const [captchaLoading, setCaptchaLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { companionCount: 0, isRoundTrip: false },
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
  const pickupDate = watch('pickupDate')
  const pickupHour = watch('pickupHour')
  const returnPickupHour = watch('returnPickupHour')

  const pickupHours = useMemo(
    () => getAvailableHours(pickupDate, now),
    [pickupDate, now],
  )
  const returnHours = useMemo(
    () => getAvailableHours(pickupDate, now, pickupHour),
    [pickupDate, now, pickupHour],
  )
  const hasNoPickupHours = pickupHours.length === 0
  const hasNoReturnHours = isRoundTrip && returnHours.length === 0

  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (getValues('pickupDate')) return
    const defaults = getDefaultBookingValues(new Date())
    setValue('pickupDate', defaults.pickupDate)
    setValue('pickupHour', defaults.pickupHour)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (pickupHour === undefined) return
    if (pickupHours.length === 0) return
    if (!pickupHours.includes(pickupHour)) {
      setValue('pickupHour', pickupHours[0])
    }
  }, [pickupHours, pickupHour, setValue])

  useEffect(() => {
    if (!isRoundTrip) {
      if (returnPickupHour !== undefined) {
        setValue('returnPickupHour', undefined)
      }
      return
    }
    if (returnHours.length === 0) return
    if (returnPickupHour === undefined || !returnHours.includes(returnPickupHour)) {
      setValue('returnPickupHour', returnHours[0])
    }
  }, [isRoundTrip, returnHours, returnPickupHour, setValue])

  async function fetchCaptcha() {
    setCaptchaLoading(true)
    setMathAnswer('')
    setCaptchaError(null)
    try {
      const data = await apiFetch<MathChallenge>('/api/captcha')
      setMathChallenge(data)
    } catch {
      setCaptchaError('無法載入驗證題目，請稍後再試')
    } finally {
      setCaptchaLoading(false)
    }
  }

  useEffect(() => {
    // fetchCaptcha already converts errors to setCaptchaError state; swallow any
    // post-unmount rejection so it doesn't become an unhandled-promise warning.
    fetchCaptcha().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(data: BookingInput) {
    if (!mathChallenge || !mathAnswer.trim()) {
      setCaptchaError('請先完成算數驗證')
      return
    }
    setCaptchaError(null)

    const captchaToken = `${mathAnswer.trim()}:${mathChallenge.challengeToken}`
    const outbound = {
      pickupDate: data.pickupDate,
      pickupHour: data.pickupHour,
      pickupAddr: data.pickupAddr,
      dropoffAddr: data.dropoffAddr,
      companionCount: data.companionCount,
      isRoundTrip: data.isRoundTrip,
    }
    const returnTrip = data.isRoundTrip && data.returnPickupHour
      ? {
          pickupDate: data.pickupDate,
          pickupHour: data.returnPickupHour,
          pickupAddr: data.dropoffAddr,
          dropoffAddr: data.pickupAddr,
          companionCount: data.companionCount,
          isRoundTrip: false,
        }
      : undefined
    try {
      await create.mutateAsync({ outbound, returnTrip, captchaToken })
    } catch (error) {
      await fetchCaptcha()
      const message = error instanceof Error ? error.message : ''
      if (message.includes('驗證')) {
        setCaptchaError('驗證碼錯誤，已換新題目，請重新作答')
      }
      throw error
    }
    await fetchCaptcha()
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
          <FormField
            label="上車時段"
            htmlFor="pickupHour"
            required
            error={errors.pickupHour?.message}
            hint={hasNoPickupHours ? '今日已無可預約時段，請改選其他日期' : undefined}
          >
            <Select
              id="pickupHour"
              aria-required={true}
              aria-invalid={!!errors.pickupHour || hasNoPickupHours}
              aria-describedby={errors.pickupHour ? 'pickuphour-error' : undefined}
              invalid={!!errors.pickupHour || hasNoPickupHours}
              disabled={hasNoPickupHours}
              {...register('pickupHour', { valueAsNumber: true })}
            >
              {pickupHours.length === 0 ? (
                <option value="">無可預約時段</option>
              ) : (
                pickupHours.map(h => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                ))
              )}
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
              value={hasValidIdentityType ? String(identityType) : ''}
              onChange={() => { /* read-only, value derived from profile */ }}
            >
              <option value="">—</option>
              <option value="1">復康（身障）</option>
              <option value="2">長照（失能）</option>
            </Select>
            {profile.isLoading && <p className="mt-1 text-xs text-ink-muted">正在帶入帳號服務類型...</p>}
            {hasValidIdentityType && (
              <p className="mt-1 text-xs text-ink-muted">
                已依個人資料帶入：{identityLabel(identityType)}
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
            <ProfileItem label="類別" value={identityLabel(hasValidIdentityType ? identityType : null)} />
            <ProfileItem label="障礙等級／失能等級" value={profileDisabilityLevel ?? '—'} />
            <ProfileItem label="輔具" value={profileAssistiveDevice ?? '—'} />
          </dl>

          <p className="text-xs text-ink-muted">
            如需修改障礙等級／失能等級或輔具，請至「個人資料」頁。
          </p>

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
            <FormField
              label="回程時段"
              htmlFor="returnPickupHour"
              error={errors.returnPickupHour?.message}
              hint={hasNoReturnHours ? '去程時段已是當日最後時段，請改選較早的去程' : undefined}
            >
              <Select
                id="returnPickupHour"
                aria-invalid={!!errors.returnPickupHour || hasNoReturnHours}
                invalid={!!errors.returnPickupHour || hasNoReturnHours}
                disabled={hasNoReturnHours}
                {...register('returnPickupHour', { valueAsNumber: true })}
              >
                {returnHours.length === 0 ? (
                  <option value="">無可選回程時段</option>
                ) : (
                  returnHours.map(h => (
                    <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                  ))
                )}
              </Select>
            </FormField>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle
          icon={<Wrench size={18} />}
          title="算數驗證"
          description="請計算以下算式並填入答案，防止自動化程式送出預約"
        />
        {captchaLoading ? (
          <p className="text-sm text-ink-muted">載入驗證題目中...</p>
        ) : mathChallenge ? (
          <div className="flex flex-col gap-3">
            <div
              className="inline-flex w-fit items-center justify-center rounded-lg bg-accent-50 px-6 py-4"
              aria-live="polite"
              aria-label={`算數驗證：${mathChallenge.question}`}
            >
              <span className="text-2xl font-bold tracking-widest text-accent-600">
                {mathChallenge.question}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="captchaAnswer"
                type="number"
                inputMode="numeric"
                placeholder="輸入答案"
                aria-label="算數驗證碼答案"
                aria-describedby={captchaError ? 'captcha-error' : undefined}
                invalid={!!captchaError}
                value={mathAnswer}
                onChange={e => {
                  setMathAnswer(e.target.value)
                  if (captchaError) setCaptchaError(null)
                }}
                className="w-28"
                min={0}
                max={99}
              />
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={fetchCaptcha}
                disabled={captchaLoading}
                leftIcon={<RefreshCw size={14} aria-hidden="true" />}
              >
                換一題
              </Button>
            </div>
            {captchaError && (
              <p id="captcha-error" role="alert" className="text-sm font-medium text-danger">
                {captchaError}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-danger">{captchaError ?? '無法載入驗證題目'}</p>
            <Button type="button" variant="secondary" size="sm" onClick={fetchCaptcha}>
              重試
            </Button>
          </div>
        )}
      </Card>

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
          disabled={
            create.isPending ||
            profile.isLoading ||
            !hasValidIdentityType ||
            !isApproved ||
            hasNoPickupHours ||
            hasNoReturnHours
          }
          leftIcon={<Send size={18} aria-hidden="true" />}
        >
          {create.isPending ? '送出中...' : '送出預約'}
        </Button>
      </div>
    </form>
  )
}
