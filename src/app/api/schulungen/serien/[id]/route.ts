import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/schulungen/serien/[id] - Einzelne Serie mit allen Details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

    const serie = await prisma.schulungSerie.findUnique({
      where: { id },
      include: {
        schulungItems: {
          include: {
            schulung: {
              include: {
                trainer: {
                  select: {
                    id: true,
                    name: true,
                    role: true,
                    avatarUrl: true,
                    calendlyUrl: true,
                  },
                },
                materials: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        certificates: {
          orderBy: { issuedAt: 'desc' },
        },
      },
    })

    if (!serie) {
      return NextResponse.json({ error: 'Serie not found' }, { status: 404 })
    }

    return NextResponse.json(serie)
  } catch (error) {
    console.error('Error fetching serie:', error)
    return NextResponse.json({ error: 'Failed to fetch serie' }, { status: 500 })
  }
}

// PATCH /api/schulungen/serien/[id] - Serie aktualisieren (z.B. Featured-Status)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const serie = await prisma.schulungSerie.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        isFeatured: body.isFeatured,
        featuredOrder: body.featuredOrder,
        heroImage: body.heroImage,
        heroTagline: body.heroTagline,
        benefits: body.benefits,
        targetAudience: body.targetAudience,
        certificateTitle: body.certificateTitle,
      },
      include: {
        schulungItems: {
          include: {
            schulung: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json(serie)
  } catch (error) {
    console.error('Error updating serie:', error)
    return NextResponse.json({ error: 'Failed to update serie' }, { status: 500 })
  }
}
