import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/schulungen/serien - Neue Serie erstellen
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Calculate total points from schulungen
    const schulungen = await prisma.schulung.findMany({
      where: {
        id: {
          in: body.schulungIds,
        },
      },
    })
    const totalPoints = schulungen.reduce((sum, s) => sum + s.points, 0)

    // Create serie
    const serie = await prisma.schulungSerie.create({
      data: {
        title: body.title,
        description: body.description,
        totalPoints,
      },
    })

    // Create serie items
    await Promise.all(
      body.schulungIds.map((schulungId: string, index: number) =>
        prisma.schulungSerieItem.create({
          data: {
            serieId: serie.id,
            schulungId,
            order: index + 1,
          },
        })
      )
    )

    // Fetch complete serie with items
    const completeSerie = await prisma.schulungSerie.findUnique({
      where: { id: serie.id },
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
    })

    return NextResponse.json(completeSerie, { status: 201 })
  } catch (error) {
    console.error('Error creating serie:', error)
    return NextResponse.json({ error: 'Failed to create serie' }, { status: 500 })
  }
}
