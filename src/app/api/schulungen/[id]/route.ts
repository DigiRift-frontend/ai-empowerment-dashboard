import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/schulungen/[id] - Einzelne Schulung mit Details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const schulung = await prisma.schulung.findUnique({
      where: { id: params.id },
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
    })

    if (!schulung) {
      return NextResponse.json(
        { error: 'Schulung not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(schulung)
  } catch (error) {
    console.error('Error fetching schulung:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schulung' },
      { status: 500 }
    )
  }
}

// PATCH /api/schulungen/[id] - Schulung aktualisieren
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const schulung = await prisma.schulung.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.duration !== undefined && { duration: body.duration }),
        ...(body.points !== undefined && { points: body.points }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.isCustom !== undefined && { isCustom: body.isCustom }),
        ...(body.learningGoals !== undefined && { learningGoals: body.learningGoals }),
        ...(body.outcomes !== undefined && { outcomes: body.outcomes }),
        ...(body.format !== undefined && { format: body.format }),
        ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl }),
        ...(body.videoThumbnail !== undefined && { videoThumbnail: body.videoThumbnail }),
        ...(body.trainerId !== undefined && { trainerId: body.trainerId }),
        ...(body.showInRoadmap !== undefined && { showInRoadmap: body.showInRoadmap }),
        ...(body.roadmapOrder !== undefined && { roadmapOrder: body.roadmapOrder }),
      },
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
    })

    return NextResponse.json(schulung)
  } catch (error) {
    console.error('Error updating schulung:', error)
    return NextResponse.json(
      { error: 'Failed to update schulung' },
      { status: 500 }
    )
  }
}

// DELETE /api/schulungen/[id] - Schulung löschen
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.schulung.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting schulung:', error)
    return NextResponse.json(
      { error: 'Failed to delete schulung' },
      { status: 500 }
    )
  }
}
