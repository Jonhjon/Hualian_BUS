import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Roles (RoleID 由外部設定，此處僅確保測試帳號的角色存在)
  // 1=系統管理員, 2=調度員, 3=司機, 4=乘客
  await prisma.roles.upsert({
    where: { RoleID: 4 },
    update: {},
    create: { RoleID: 4, RoleName: '乘客' },
  })

  // Test announcement
  const exists = await prisma.announcement.count()
  if (exists === 0) {
    await prisma.announcement.create({
      data: {
        Title: '系統公告：服務時間調整',
        Content: '本系統預約服務時間為每日 08:00–17:00，整點制。如有疑問請洽客服。',
        PublishDate: new Date(),
      },
    })
    console.log('✅ 已建立測試公告')
  }

  // Test passenger account (dev only)
  const testUsername = 'testuser'
  const existing = await prisma.account.findFirst({ where: { Username: testUsername } })
  if (!existing) {
    const hash = await bcrypt.hash('Password123', 12)
    const account = await prisma.account.create({
      data: {
        Username: testUsername,
        PasswordHash: hash,
        RoleID: 4,
      },
    })
    await prisma.passengerProfile.create({
      data: {
        AccountID: account.AccountID,
        RealName: '測試使用者',
        IdentityNo: 'A123456789',
        IdentityType: 1,
        Gender: 1,
        Email: 'testuser@example.com',
        Phone: '0912345678',
        DisabilityLevel: '中度',
        AssistiveDevice: '輪椅',
        BirthDate: new Date('1990-01-01'),
        Address: '花蓮縣花蓮市中正路1號',
        AuditStatus: 1, // auto-approved for dev
      },
    })
    console.log('✅ 已建立測試帳號 testuser / Password123')
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
