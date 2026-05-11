import { AnnouncementDetail } from '@/components/announcement/AnnouncementDetail'
import { Container } from '@/components/ui/Container'

export default function AnnouncementDetailPage({ params }: { params: { id: string } }) {
  return (
    <Container size="content">
      <AnnouncementDetail id={params.id} />
    </Container>
  )
}
