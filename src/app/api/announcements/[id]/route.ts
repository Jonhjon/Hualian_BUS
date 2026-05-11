import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { ok, err } from '@/lib/api/response'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id)
  if (isNaN(id)) return err('無效的公告 ID', 400)

  const announcement = await prisma.announcement.findFirst({ where: { PostID: id } })
  if (!announcement) return err('公告不存在', 404)

  return ok(announcement)
}
