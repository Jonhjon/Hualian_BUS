import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { okPage } from '@/lib/api/response'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit = 10

  const [total, announcements] = await Promise.all([
    prisma.announcement.count(),
    prisma.announcement.findMany({
      orderBy: { PublishDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return okPage(announcements, { total, page, limit })
}
