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

// Status label mapping for notifications
const statusLabels: Record<string, string> = {
  geplant: 'Geplant',
  in_arbeit: 'In Arbeit',
  im_test: 'Im Test',
  abgeschlossen: 'Abgeschlossen',
}

// PATCH /api/modules/[id] - Modul aktualisieren
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Fetch the current module to check for status changes
    const currentModule = await prisma.module.findUnique({
      where: { id: params.id },
      select: { status: true, name: true, customerId: true },
    })

    if (!currentModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

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
    if (body.testCompletedAt !== undefined) updateData.testCompletedAt = body.testCompletedAt ? new Date(body.testCompletedAt) : null
    if (body.testCompletedBy !== undefined) updateData.testCompletedBy = body.testCompletedBy
    // Abnahme (nach Fertigstellung - löst Wartungskosten aus)
    if (body.abnahmeStatus !== undefined) updateData.abnahmeStatus = body.abnahmeStatus
    if (body.abnahmeAt !== undefined) updateData.abnahmeAt = body.abnahmeAt ? new Date(body.abnahmeAt) : null
    if (body.abnahmeBy !== undefined) updateData.abnahmeBy = body.abnahmeBy
    // Live-Status (unabhängig vom Kanban-Status)
    if (body.liveStatus !== undefined) updateData.liveStatus = body.liveStatus
    // Anleitungen & Dokumentation
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl || null
    if (body.instructions !== undefined) updateData.instructions = body.instructions || null
    if (body.manualUrl !== undefined) updateData.manualUrl = body.manualUrl || null
    if (body.manualFilename !== undefined) updateData.manualFilename = body.manualFilename || null
    // Kunden-Verantwortlicher
    if (body.customerContactId !== undefined) updateData.customerContactId = body.customerContactId || null
    if (body.customerContactName !== undefined) updateData.customerContactName = body.customerContactName || null

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

    // If status changed, create notifications for the customer
    if (body.status !== undefined && body.status !== currentModule.status) {
      const oldStatusLabel = statusLabels[currentModule.status] || currentModule.status
      const newStatusLabel = statusLabels[body.status] || body.status

      // Create AdminMessage for status update history
      await prisma.adminMessage.create({
        data: {
          subject: `Status-Update: ${currentModule.name}`,
          content: `Das Modul "${currentModule.name}" wurde von "${oldStatusLabel}" auf "${newStatusLabel}" verschoben.`,
          from: 'System',
          messageType: 'status_update',
          customerId: currentModule.customerId,
        },
      })

      // If moved to "im_test", create action-required notification
      if (body.status === 'im_test') {
        await prisma.notification.create({
          data: {
            type: 'test_required',
            title: 'Test durchführen',
            message: `Das Modul "${currentModule.name}" ist bereit zum Testen. Bitte führen Sie den Test durch und geben Sie Feedback.`,
            actionRequired: true,
            relatedProjectId: params.id,
            relatedUrl: `/roadmap/${params.id}`,
            customerId: currentModule.customerId,
          },
        })
      }

      // If moved away from "im_test" (e.g., back to in_arbeit or to abgeschlossen),
      // mark test_required notifications as no longer actionRequired
      if (currentModule.status === 'im_test' && body.status !== 'im_test') {
        await prisma.notification.updateMany({
          where: {
            customerId: currentModule.customerId,
            relatedProjectId: params.id,
            type: 'test_required',
            actionRequired: true,
          },
          data: {
            actionRequired: false,
          },
        })
      }
    }

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
