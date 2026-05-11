import type { Metadata } from 'next'
import { Megaphone } from 'lucide-react'
import { AnnouncementList } from '@/components/announcement/AnnouncementList'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = {
  title: '最新公告 — 花蓮縣復康巴士預約系統',
}

export default function AnnouncementsPage() {
  return (
    <Container size="content">
      <PageHeader
        title="最新公告"
        description="服務異動、系統維護與重要通知"
        icon={<Megaphone size={22} aria-hidden="true" />}
      />
      <AnnouncementList />
    </Container>
  )
}
