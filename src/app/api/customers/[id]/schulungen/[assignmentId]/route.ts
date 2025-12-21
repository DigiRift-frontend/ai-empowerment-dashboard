import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/customers/[id]/schulungen/[assignmentId] - Einzelne Schulungszuweisung
export async function GET(
  request: Request,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    const assignment = await prisma.customerSchulungAssignment.findFirst({
      where: {
        id: params.assignmentId,
        customerId: params.id,
      },
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
            materials: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        serie: {
          include: {
            schulungItems: {
              include: {
                schulung: {
                  include: {
                    trainer: true,
                    materials: true,
                  },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error fetching assignment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignment' },
      { status: 500 }
    )
  }
}

// PATCH /api/customers/[id]/schulungen/[assignmentId] - Status/Feedback aktualisieren
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    const body = await request.json()

    const assignment = await prisma.customerSchulungAssignment.update({
      where: {
        id: params.assignmentId,
        customerId: params.id,
      },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.scheduledDate !== undefined && {
          scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
        }),
        ...(body.completedDate !== undefined && {
          completedDate: body.completedDate ? new Date(body.completedDate) : null,
        }),
        ...(body.completedSchulungIds !== undefined && {
          completedSchulungIds: body.completedSchulungIds,
        }),
        ...(body.rating !== undefined && { rating: body.rating }),
        ...(body.feedback !== undefined && { feedback: body.feedback }),
        ...(body.feedback !== undefined && { feedbackDate: new Date() }),
        ...(body.participants !== undefined && { participants: body.participants }),
        ...(body.participantCount !== undefined && { participantCount: body.participantCount }),
      },
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
            materials: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        serie: {
          include: {
            schulungItems: {
              include: {
                schulung: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error updating assignment:', error)
    return NextResponse.json(
      { error: 'Failed to update assignment' },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id]/schulungen/[assignmentId] - Zuweisung löschen
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    await prisma.customerSchulungAssignment.delete({
      where: {
        id: params.assignmentId,
        customerId: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting assignment:', error)
    return NextResponse.json(
      { error: 'Failed to delete assignment' },
      { status: 500 }
    )
  }
}
