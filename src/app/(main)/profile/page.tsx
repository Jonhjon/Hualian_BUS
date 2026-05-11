import type { Metadata } from 'next'
import { User } from 'lucide-react'
import { ProfileContent } from './ProfileContent'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = {
  title: '個人資料 — 花蓮縣復康巴士預約系統',
}

export default function ProfilePage() {
  return (
    <Container size="content">
      <PageHeader
        title="個人資料"
        description="查看您的帳號狀態、本月趟次統計與註冊資訊"
        icon={<User size={22} aria-hidden="true" />}
      />
      <ProfileContent />
    </Container>
  )
}
