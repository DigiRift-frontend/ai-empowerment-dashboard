import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/modules/[id]/feedback - Test-Feedback abrufen
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const feedback = await prisma.testFeedback.findMany({
      where: { moduleId: params.id },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }
}

// POST /api/modules/[id]/feedback - Neues Feedback hinzufügen
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const feedback = await prisma.testFeedback.create({
      data: {
        moduleId: params.id,
        feedback: body.feedback,
        resolved: false,
      },
    })

    return NextResponse.json(feedback, { status: 201 })
  } catch (error) {
    console.error('Error creating feedback:', error)
    return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 })
  }
}

// PATCH /api/modules/[id]/feedback - Feedback als gelöst markieren
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const feedback = await prisma.testFeedback.update({
      where: { id: body.feedbackId },
      data: {
        resolved: body.resolved,
      },
    })

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Error updating feedback:', error)
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 })
  }
}
