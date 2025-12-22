import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/schulungen - Alle Schulungen und Serien
export async function GET() {
  try {
    const [schulungen, serienRaw] = await Promise.all([
      prisma.schulung.findMany({
        include: {
          trainer: {
            select: {
              id: true,
              name: true,
              role: true,
              avatarUrl: true,
            },
          },
          materials: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: [
          { category: 'asc' },
          { title: 'asc' },
        ],
      }),
      prisma.schulungSerie.findMany({
        include: {
          schulungItems: {
            include: {
              schulung: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          title: 'asc',
        },
      }),
    ])

    // Add schulungIds computed from schulungItems for backward compatibility
    const serien = serienRaw.map(serie => ({
      ...serie,
      schulungIds: serie.schulungItems.map(item => item.schulungId),
    }))

    return NextResponse.json({ schulungen, serien })
  } catch (error) {
    console.error('Error fetching schulungen:', error)
    return NextResponse.json({ error: 'Failed to fetch schulungen' }, { status: 500 })
  }
}

// POST /api/schulungen - Neue Schulung erstellen
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const schulung = await prisma.schulung.create({
      data: {
        title: body.title,
        description: body.description,
        duration: body.duration,
        points: body.points,
        category: body.category,
        isCustom: body.isCustom || false,
        learningGoals: body.learningGoals || [],
        outcomes: body.outcomes || [],
        format: body.format || 'live',
        videoUrl: body.videoUrl || null,
        videoThumbnail: body.videoThumbnail || null,
        trainerId: body.trainerId || null,
        showInRoadmap: body.showInRoadmap ?? true,
        roadmapOrder: body.roadmapOrder || null,
      },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
            role: true,
            avatarUrl: true,
          },
        },
        materials: true,
      },
    })

    return NextResponse.json(schulung, { status: 201 })
  } catch (error) {
    console.error('Error creating schulung:', error)
    return NextResponse.json({ error: 'Failed to create schulung' }, { status: 500 })
  }
}
