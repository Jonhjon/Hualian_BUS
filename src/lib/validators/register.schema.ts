import { z } from 'zod'
import { isValidTaiwanId } from './taiwan-id'

export const RELATION_TYPES = ['本人', '配偶', '子女', '父母', '兄弟姐妹', '祖父母'] as const
export const GENDER_OPTIONS = ['男', '女', '其他'] as const

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

export const step2Schema = z.object({
  realName: z.string().min(1, '請填寫姓名').max(50),
  identityNo: z.string().refine(isValidTaiwanId, '身分證字號格式錯誤'),
  gender: z.enum(GENDER_OPTIONS),
  identityType: z.union([z.literal(1), z.literal(2)]), // 1=復康, 2=長照
  expiryDate: z.string().min(1, '請填寫證明到期日'),
  birthDate: z.string().min(1, '請填寫生日'),
  disabilityLevel: z.string().min(1, '請填寫障礙等級／失能等級').max(20),
  assistiveDevice: z.string().min(1, '請填寫輔具，若無請填「無」').max(50),
  address: z.string().min(1, '請填寫地址').max(255),
})

export const step3Schema = z.object({
  applicantName: z.string().min(1, '請填寫申請人姓名').max(50),
  relationType: z.enum(RELATION_TYPES),
  email: z.string().email('請填寫有效的電子郵件').max(255),
  phone: z.string().regex(phonePattern, '請填寫有效的連絡電話'),
})

// Full payload used by POST /api/auth/register
export const registerApiSchema = baseCredentials.merge(step2Schema).merge(step3Schema)

export type RegisterApiInput = z.infer<typeof registerApiSchema>
