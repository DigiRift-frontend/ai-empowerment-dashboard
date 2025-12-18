import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/modules/[id] - Einzelnes Modul abrufen
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const foundModule = await prisma.module.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            name: true,
          },
        },
        assignee: true,
        acceptanceCriteria: true,
        testFeedback: {
          orderBy: {
            date: 'desc',
          },
        },
        historyEntries: {
          orderBy: {
            date: 'desc',
          },
        },
        milestones: {
          orderBy: {
            date: 'asc',
          },
        },
      },
    })

    if (!foundModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    return NextResponse.json(foundModule)
  } catch (error) {
    console.error('Error fetching module:', error)
    return NextResponse.json({ error: 'Failed to fetch module' }, { status: 500 })
  }
}

// PATCH /api/modules/[id] - Modul aktualisieren
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Build update data dynamically
    const updateData: Record<string, unknown> = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.status !== undefined) updateData.status = body.status
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.progress !== undefined) updateData.progress = body.progress
    if (body.monthlyMaintenancePoints !== undefined) updateData.monthlyMaintenancePoints = body.monthlyMaintenancePoints
    if (body.softwareUrl !== undefined) updateData.softwareUrl = body.softwareUrl
    if (body.showInRoadmap !== undefined) updateData.showInRoadmap = body.showInRoadmap
    if (body.roadmapOrder !== undefined) updateData.roadmapOrder = body.roadmapOrder
    if (body.assigneeId !== undefined) updateData.assigneeId = body.assigneeId || null
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null
    if (body.targetDate !== undefined) updateData.targetDate = body.targetDate ? new Date(body.targetDate) : null
    if (body.completedDate !== undefined) updateData.completedDate = body.completedDate ? new Date(body.completedDate) : null
    if (body.acceptanceStatus !== undefined) updateData.acceptanceStatus = body.acceptanceStatus
    if (body.acceptedAt !== undefined) updateData.acceptedAt = body.acceptedAt ? new Date(body.acceptedAt) : null
    if (body.acceptedBy !== undefined) updateData.acceptedBy = body.acceptedBy

    const updatedModule = await prisma.module.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: true,
        assignee: true,
        acceptanceCriteria: true,
        testFeedback: true,
      },
    })

    return NextResponse.json(updatedModule)
  } catch (error) {
    console.error('Error updating module:', error)
    return NextResponse.json({ error: 'Failed to update module' }, { status: 500 })
  }
}

// DELETE /api/modules/[id] - Modul löschen
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.module.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting module:', error)
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 })
  }
}
