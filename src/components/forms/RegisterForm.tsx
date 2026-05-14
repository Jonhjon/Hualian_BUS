'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Send } from 'lucide-react'
import { useRegister } from '@/hooks/useAuth'
import { GENDER_OPTIONS, RELATION_TYPES, step1Schema, step2Schema, step3Schema } from '@/lib/validators/register.schema'
import { Input, Select } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

type Step1 = z.infer<typeof step1Schema>
type Step2 = z.infer<typeof step2Schema>
type Step3 = z.infer<typeof step3Schema>

const TOTAL_STEPS = 3

const STEP_LABELS = ['帳號設定', '乘客資料', '申請聯絡'] as const

function Stepper({ current }: { current: number }) {
  return (
    <ol
      aria-label="申請進度"
      className="mb-6 flex items-center gap-2"
    >
      {STEP_LABELS.map((label, i) => {
        const num = i + 1
        const isActive = num === current
        const isDone = num < current
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div className="flex flex-1 items-center gap-2">
              <span
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors',
                  isActive && 'bg-accent-500 text-white shadow-soft',
                  isDone && 'bg-brand-500 text-white',
                  !isActive && !isDone && 'bg-brand-50 text-ink-soft',
                )}
              >
                {isDone ? <CheckCircle2 size={18} aria-hidden="true" /> : num}
              </span>
              <span
                className={cn(
                  'text-xs font-semibold sm:text-sm',
                  isActive ? 'text-ink' : 'text-ink-soft',
                )}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  'hidden h-px flex-1 sm:block',
                  isDone ? 'bg-brand-500' : 'bg-border',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export function RegisterForm() {
  const [step, setStep] = useState(1)
  const [step1Data, setStep1Data] = useState<Omit<Step1, 'confirmPassword'> | null>(null)
  const [step2Data, setStep2Data] = useState<Step2 | null>(null)
  const register_ = useRegister()

  const step1Form = useForm<Step1>({ resolver: zodResolver(step1Schema) })
  const step2Form = useForm<Step2>({ resolver: zodResolver(step2Schema) })
  const step3Form = useForm<Step3>({ resolver: zodResolver(step3Schema) })

  function handleStep1(data: Step1) {
    const { confirmPassword: _, ...rest } = data
    setStep1Data(rest)
    setStep(2)
  }

  function handleStep2(data: Step2) {
    setStep2Data(data)
    setStep(3)
  }

  function handleStep3(data: Step3) {
    if (!step1Data || !step2Data) return
    register_.mutate({ ...step1Data, ...step2Data, ...data })
  }

  if (register_.isSuccess) {
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-success-soft text-success">
          <CheckCircle2 size={32} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-ink">申請成功！</h2>
          <p className="mt-1 text-sm text-ink-soft">請等待審核，我們將盡快與您聯繫。</p>
        </div>
        <a
          href="/login"
          className="inline-flex h-12 items-center justify-center rounded-md bg-brand-500 px-6 text-base font-semibold text-white hover:bg-brand-700"
        >
          返回登入
        </a>
      </div>
    )
  }

  const e1 = step1Form.formState.errors
  const e2 = step2Form.formState.errors
  const e3 = step3Form.formState.errors

  return (
    <div>
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        步驟 {step} / {TOTAL_STEPS}
      </p>

      <Stepper current={step} />

      {step === 1 && (
        <form
          onSubmit={step1Form.handleSubmit(handleStep1)}
          noValidate
          aria-label="申請帳號 — 步驟 1：帳號設定"
          className="flex flex-col gap-5"
        >
          <FormField label="帳號" htmlFor="username" required error={e1.username?.message} hint="登入時使用的帳號名稱">
            <Input
              id="username"
              autoComplete="username"
              aria-required={true}
              aria-invalid={!!e1.username}
              aria-describedby={e1.username ? 'username-error' : 'username-hint'}
              invalid={!!e1.username}
              {...step1Form.register('username')}
            />
          </FormField>
          <FormField label="密碼" htmlFor="password" required error={e1.password?.message}>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-required={true}
              aria-invalid={!!e1.password}
              aria-describedby={e1.password ? 'password-error' : undefined}
              invalid={!!e1.password}
              {...step1Form.register('password')}
            />
          </FormField>
          <FormField
            label="確認密碼"
            htmlFor="confirmPassword"
            required
            error={e1.confirmPassword?.message}
          >
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-required={true}
              aria-invalid={!!e1.confirmPassword}
              aria-describedby={e1.confirmPassword ? 'confirm-password-error' : undefined}
              invalid={!!e1.confirmPassword}
              {...step1Form.register('confirmPassword')}
            />
          </FormField>
          <div className="mt-2 flex justify-end">
            <Button type="submit" variant="accent" rightIcon={<ArrowRight size={16} aria-hidden="true" />}>
              下一步
            </Button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={step2Form.handleSubmit(handleStep2)}
          noValidate
          aria-label="申請帳號 — 步驟 2：乘客資料"
          className="flex flex-col gap-5"
        >
          <FormField label="真實姓名" htmlFor="realName" required error={e2.realName?.message}>
            <Input
              id="realName"
              autoComplete="name"
              aria-required={true}
              aria-invalid={!!e2.realName}
              aria-describedby={e2.realName ? 'realname-error' : undefined}
              invalid={!!e2.realName}
              {...step2Form.register('realName')}
            />
          </FormField>
          <FormField label="身分證字號" htmlFor="identityNo" required error={e2.identityNo?.message}>
            <Input
              id="identityNo"
              autoComplete="off"
              aria-required={true}
              aria-invalid={!!e2.identityNo}
              aria-describedby={e2.identityNo ? 'identityno-error' : undefined}
              invalid={!!e2.identityNo}
              {...step2Form.register('identityNo')}
            />
          </FormField>
          <FormField label="性別" htmlFor="gender" required error={e2.gender?.message}>
            <Select
              id="gender"
              aria-required={true}
              aria-invalid={!!e2.gender}
              aria-describedby={e2.gender ? 'gender-error' : undefined}
              invalid={!!e2.gender}
              {...step2Form.register('gender')}
            >
              <option value="">請選擇</option>
              {GENDER_OPTIONS.map(gender => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="服務類型" htmlFor="identityType" required error={e2.identityType?.message}>
            <Select
              id="identityType"
              aria-required={true}
              aria-invalid={!!e2.identityType}
              aria-describedby={e2.identityType ? 'identitytype-error' : undefined}
              invalid={!!e2.identityType}
              {...step2Form.register('identityType', { valueAsNumber: true })}
            >
              <option value="">請選擇</option>
              <option value={1}>復康（身障）</option>
              <option value={2}>長照（失能）</option>
            </Select>
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="生日" htmlFor="birthDate" required error={e2.birthDate?.message}>
              <Input
                id="birthDate"
                type="date"
                autoComplete="bday"
                aria-required={true}
                aria-invalid={!!e2.birthDate}
                aria-describedby={e2.birthDate ? 'birthdate-error' : undefined}
                invalid={!!e2.birthDate}
                {...step2Form.register('birthDate')}
              />
            </FormField>
            <FormField
              label="證明到期日"
              htmlFor="expiryDate"
              required
              error={e2.expiryDate?.message}
              hint="身障/長照證明的到期日；過期後將無法預約。"
            >
              <Input
                id="expiryDate"
                type="date"
                aria-required={true}
                aria-invalid={!!e2.expiryDate}
                aria-describedby={e2.expiryDate ? 'expirydate-error' : 'expirydate-hint'}
                invalid={!!e2.expiryDate}
                {...step2Form.register('expiryDate')}
              />
            </FormField>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="障礙等級／失能等級" htmlFor="disabilityLevel" required error={e2.disabilityLevel?.message}>
              <Input
                id="disabilityLevel"
                autoComplete="off"
                aria-required={true}
                aria-invalid={!!e2.disabilityLevel}
                aria-describedby={e2.disabilityLevel ? 'disabilitylevel-error' : undefined}
                invalid={!!e2.disabilityLevel}
                {...step2Form.register('disabilityLevel')}
              />
            </FormField>
            <FormField label="輔具" htmlFor="assistiveDevice" required error={e2.assistiveDevice?.message} hint="若無使用輔具，請填「無」。">
              <Input
                id="assistiveDevice"
                autoComplete="off"
                aria-required={true}
                aria-invalid={!!e2.assistiveDevice}
                aria-describedby={e2.assistiveDevice ? 'assistivedevice-error' : 'assistivedevice-hint'}
                invalid={!!e2.assistiveDevice}
                {...step2Form.register('assistiveDevice')}
              />
            </FormField>
          </div>
          <FormField label="地址" htmlFor="address" required error={e2.address?.message}>
            <Input
              id="address"
              autoComplete="street-address"
              aria-required={true}
              aria-invalid={!!e2.address}
              aria-describedby={e2.address ? 'address-error' : undefined}
              invalid={!!e2.address}
              {...step2Form.register('address')}
            />
          </FormField>
          <div className="mt-2 flex justify-between gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(1)}
              leftIcon={<ArrowLeft size={16} aria-hidden="true" />}
            >
              上一步
            </Button>
            <Button type="submit" variant="accent" rightIcon={<ArrowRight size={16} aria-hidden="true" />}>
              下一步
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form
          onSubmit={step3Form.handleSubmit(handleStep3)}
          noValidate
          aria-label="申請帳號 — 步驟 3：申請人與聯絡資料"
          className="flex flex-col gap-5"
        >
          <p className="rounded-md bg-brand-50 px-4 py-3 text-sm text-ink-soft">
            若由本人申請，關係請選擇「本人」；若由親友代為申請，請填寫代申請人資訊。
          </p>
          <FormField label="申請人姓名" htmlFor="applicantName" required error={e3.applicantName?.message}>
            <Input
              id="applicantName"
              autoComplete="name"
              aria-required={true}
              aria-invalid={!!e3.applicantName}
              aria-describedby={e3.applicantName ? 'applicantname-error' : undefined}
              invalid={!!e3.applicantName}
              {...step3Form.register('applicantName')}
            />
          </FormField>
          <FormField label="與乘客關係" htmlFor="relationType" required error={e3.relationType?.message}>
            <Select
              id="relationType"
              aria-required={true}
              aria-invalid={!!e3.relationType}
              aria-describedby={e3.relationType ? 'relationtype-error' : undefined}
              invalid={!!e3.relationType}
              {...step3Form.register('relationType')}
            >
              <option value="">請選擇</option>
              {RELATION_TYPES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="電子郵件" htmlFor="email" required error={e3.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-required={true}
              aria-invalid={!!e3.email}
              aria-describedby={e3.email ? 'email-error' : undefined}
              invalid={!!e3.email}
              {...step3Form.register('email')}
            />
          </FormField>
          <FormField label="連絡電話" htmlFor="phone" required error={e3.phone?.message}>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              aria-required={true}
              aria-invalid={!!e3.phone}
              aria-describedby={e3.phone ? 'phone-error' : undefined}
              invalid={!!e3.phone}
              {...step3Form.register('phone')}
            />
          </FormField>
          {register_.error && (
            <p role="alert" className="flex items-center gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
              <AlertCircle size={16} aria-hidden="true" />
              {(register_.error as Error).message || '申請失敗，請稍後再試'}
            </p>
          )}
          <div className="mt-2 flex justify-between gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(2)}
              leftIcon={<ArrowLeft size={16} aria-hidden="true" />}
            >
              上一步
            </Button>
            <Button
              type="submit"
              variant="accent"
              loading={register_.isPending}
              leftIcon={register_.isPending ? undefined : <Send size={16} aria-hidden="true" />}
            >
              {register_.isPending ? '送出中...' : '送出申請'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
