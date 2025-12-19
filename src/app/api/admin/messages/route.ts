import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/messages - Alle Admin-Nachrichten abrufen
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const direction = searchParams.get('direction') as 'incoming' | 'outgoing' | null

    const where: Record<string, unknown> = {}
    if (unreadOnly) where.read = false
    if (direction) where.direction = direction

    const messages = await prisma.adminMessage.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching admin messages:', error)
    return NextResponse.json({ error: 'Failed to fetch admin messages' }, { status: 500 })
  }
}
