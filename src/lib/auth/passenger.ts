import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { err } from '@/lib/api/response'

export interface BookingEligibilityProfile {
  PassengerID: string
  IdentityType: number | null
  AuditStatus: number | null
  ExpiryDate: Date | null
}

export async function findPassengerId(accountId: string): Promise<string | null> {
  const p = await prisma.passengerProfile.findFirst({
    where: { AccountID: accountId },
    select: { PassengerID: true },
  })
  return p?.PassengerID ?? null
}

export async function findPassengerEligibility(
  accountId: string,
): Promise<BookingEligibilityProfile | null> {
  const p = await prisma.passengerProfile.findFirst({
    where: { AccountID: accountId },
    select: {
      PassengerID: true,
      IdentityType: true,
      AuditStatus: true,
      ExpiryDate: true,
    },
  })
  return p ?? null
}

// Returns an error response if the passenger is not eligible to book; null otherwise.
export function checkBookingEligibility(
  profile: BookingEligibilityProfile,
): NextResponse | null {
  if (profile.AuditStatus === 0) {
    return err('您的帳號尚在審核中，審核通過後始可預約', 403)
  }
  if (profile.AuditStatus === 2) {
    return err('您的帳號審核未通過，無法預約，請聯繫客服', 403)
  }
  if (profile.AuditStatus !== 1) {
    return err('帳號審核狀態異常，請聯繫客服', 403)
  }
  if (profile.IdentityType !== 1 && profile.IdentityType !== 2) {
    return err('帳號服務類型未設定，請先聯繫客服補齊個人資料', 422)
  }
  if (profile.ExpiryDate && profile.ExpiryDate.getTime() < Date.now()) {
    return err('您的證明已到期，請更新後再行預約', 403)
  }
  return null
}
