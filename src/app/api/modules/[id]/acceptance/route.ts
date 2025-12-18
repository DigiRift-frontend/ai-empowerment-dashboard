import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/modules/[id]/acceptance - Akzeptanzkriterien abrufen
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const criteria = await prisma.acceptanceCriterion.findMany({
      where: { moduleId: params.id },
      orderBy: {
        id: 'asc',
      },
    })

    return NextResponse.json(criteria)
  } catch (error) {
    console.error('Error fetching acceptance criteria:', error)
    return NextResponse.json({ error: 'Failed to fetch acceptance criteria' }, { status: 500 })
  }
}

// POST /api/modules/[id]/acceptance - Neues Kriterium hinzufügen
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const criterion = await prisma.acceptanceCriterion.create({
      data: {
        moduleId: params.id,
        description: body.description,
        accepted: body.accepted || false,
      },
    })

    return NextResponse.json(criterion, { status: 201 })
  } catch (error) {
    console.error('Error creating acceptance criterion:', error)
    return NextResponse.json({ error: 'Failed to create acceptance criterion' }, { status: 500 })
  }
}

// PATCH /api/modules/[id]/acceptance - Kriterium aktualisieren (accept/reject)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Update specific criterion
    if (body.criterionId) {
      const criterion = await prisma.acceptanceCriterion.update({
        where: { id: body.criterionId },
        data: {
          accepted: body.accepted,
        },
      })
      return NextResponse.json(criterion)
    }

    // Accept all criteria for the module
    if (body.acceptAll) {
      await prisma.acceptanceCriterion.updateMany({
        where: { moduleId: params.id },
        data: { accepted: true },
      })

      // Update module acceptance status
      await prisma.module.update({
        where: { id: params.id },
        data: {
          acceptanceStatus: 'akzeptiert',
          acceptedAt: new Date(),
          acceptedBy: body.acceptedBy,
        },
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Error updating acceptance criteria:', error)
    return NextResponse.json({ error: 'Failed to update acceptance criteria' }, { status: 500 })
  }
}
