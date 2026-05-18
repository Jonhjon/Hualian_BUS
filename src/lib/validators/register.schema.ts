import { z } from 'zod'
import { isValidTaiwanId } from './taiwan-id'

export const RELATION_TYPES = ['本人', '配偶', '子女', '父母', '兄弟姐妹', '祖父母'] as const
export const GENDER_OPTIONS = ['男', '女', '其他'] as const

export const REHAB_LEVELS = ['輕度', '中度', '重度', '極重度'] as const
export const LTC_LEVELS = [
  'CMS 第1級',
  'CMS 第2級',
  'CMS 第3級',
  'CMS 第4級',
  'CMS 第5級',
  'CMS 第6級',
  'CMS 第7級',
  'CMS 第8級',
] as const
export type RehabLevel = (typeof REHAB_LEVELS)[number]
export type LtcLevel = (typeof LTC_LEVELS)[number]

const phonePattern = /^[0-9+()\-\s]{8,20}$/

const baseCredentials = z.object({
  username: z
    .string()
    .min(4, '帳號至少 4 字')
    .max(50, '帳號最多 50 字')
    .regex(/^[a-zA-Z0-9_]+$/, '帳號只允許英數字與底線'),
  password: z.string().min(8, '密碼至少 8 字').max(100, '密碼太長'),
})

export const step1Schema = baseCredentials
  .extend({ confirmPassword: z.string() })
  .refine(d => d.password === d.confirmPassword, {
    message: '兩次密碼不一致',
    path: ['confirmPassword'],
  })

const step2Object = z.object({
  realName: z.string().min(1, '請填寫姓名').max(50),
  identityNo: z.string().refine(isValidTaiwanId, '身分證字號格式錯誤'),
  gender: z.enum(GENDER_OPTIONS),
  identityType: z.union([z.literal(1), z.literal(2)]), // 1=復康, 2=長照
  expiryDate: z.string().min(1, '請填寫證明到期日'),
  birthDate: z
    .string()
    .min(1, '請填寫生日')
    .refine(value => !Number.isNaN(new Date(value).getTime()), '生日格式錯誤')
    .refine(value => {
      const today = new Date().toISOString().slice(0, 10)
      return value <= today
    }, '生日不可晚於今天'),
  disabilityLevel: z.string().min(1, '請選擇障礙等級／失能等級').max(20),
  assistiveDevice: z.string().min(1, '請填寫輔具，若無請填「無」').max(50),
  address: z.string().min(1, '請填寫地址').max(255),
})

function refineDisabilityLevel<T extends { identityType: 1 | 2; disabilityLevel: string }>(
  data: T,
  ctx: z.RefinementCtx,
) {
  const validSet: readonly string[] = data.identityType === 1 ? REHAB_LEVELS : LTC_LEVELS
  if (!validSet.includes(data.disabilityLevel)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['disabilityLevel'],
      message:
        data.identityType === 1
          ? '請選擇有效的障礙等級（輕度／中度／重度／極重度）'
          : '請選擇有效的失能等級（CMS 第1級～CMS 第8級）',
    })
  }
}

export const step2Schema = step2Object.superRefine(refineDisabilityLevel)

export const step3Schema = z.object({
  applicantName: z.string().min(1, '請填寫申請人姓名').max(50),
  relationType: z.enum(RELATION_TYPES),
  email: z.string().email('請填寫有效的電子郵件').max(255),
  phone: z.string().regex(phonePattern, '請填寫有效的連絡電話'),
})

// Full payload used by POST /api/auth/register
export const registerApiSchema = baseCredentials
  .merge(step2Object)
  .merge(step3Schema)
  .superRefine(refineDisabilityLevel)

export type RegisterApiInput = z.infer<typeof registerApiSchema>
