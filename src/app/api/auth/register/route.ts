import { NextRequest, NextResponse } from 'next/server'
import { registerApiSchema } from '@/lib/validators/register.schema'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth/password'
import { ok, err } from '@/lib/api/response'

const PASSENGER_ROLE_ID = 4
const GENDER_MAP: Record<string, number> = { '男': 1, '女': 2, '其他': 0 }

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return err('請求格式錯誤', 400)

  const parsed = registerApiSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: '資料格式錯誤', details: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const input = parsed.data

  const existingAccount = await prisma.account.findFirst({
    where: { Username: input.username },
  })
  if (existingAccount) return err('帳號已存在', 409)

  const existingProfile = await prisma.passengerProfile.findFirst({
    where: { IdentityNo: input.identityNo },
  })
  if (existingProfile) return err('身分證字號已被使用', 409)

  const passwordHash = await hashPassword(input.password)

  try {
    await prisma.$transaction(async tx => {
      const account = await tx.account.create({
        data: {
          Username: input.username,
          PasswordHash: passwordHash,
          RoleID: PASSENGER_ROLE_ID,
        },
      })
      const profile = await tx.passengerProfile.create({
        data: {
          AccountID: account.AccountID,
          RealName: input.realName,
          IdentityNo: input.identityNo,
          IdentityType: input.identityType,
          Gender: GENDER_MAP[input.gender] ?? 0,
          Email: input.email,
          Phone: input.phone,
          DisabilityLevel: input.disabilityLevel,
          AssistiveDevice: input.assistiveDevice,
          BirthDate: input.birthDate ? new Date(input.birthDate) : null,
          ExpiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
          Address: input.address,
          AuditStatus: 0,
        },
      })
      await tx.relationship.create({
        data: {
          PassengerID: profile.PassengerID,
          ApplicantName: input.applicantName,
          RelationType: input.relationType,
        },
      })
    })
  } catch (error) {
    console.error('Registration failed', error)
    return err('申請失敗，請稍後再試', 500)
  }

  return ok({ message: '申請成功，等待審核' }, 201)
}
