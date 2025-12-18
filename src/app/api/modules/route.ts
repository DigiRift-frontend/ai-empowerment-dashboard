import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/modules - Alle Module (optional gefiltert nach customerId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    const modules = await prisma.module.findMany({
      where: customerId ? { customerId } : undefined,
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
          },
        },
        assignee: true,
        acceptanceCriteria: true,
        testFeedback: true,
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(modules)
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
  }
}

// POST /api/modules - Neues Modul erstellen
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newModule = await prisma.module.create({
      data: {
        name: body.name,
        description: body.description,
        status: body.status || 'geplant',
        priority: body.priority || 'mittel',
        progress: body.progress || 0,
        monthlyMaintenancePoints: body.monthlyMaintenancePoints || 0,
        softwareUrl: body.softwareUrl,
        showInRoadmap: body.showInRoadmap ?? true,
        roadmapOrder: body.roadmapOrder,
        customerId: body.customerId,
        assigneeId: body.assigneeId,
        customerContactId: body.customerContactId,
        customerContactName: body.customerContactName,
        videoUrl: body.videoUrl,
        instructions: body.instructions,
        manualUrl: body.manualUrl,
        manualFilename: body.manualFilename,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
      },
      include: {
        customer: true,
        assignee: true,
      },
    })

    return NextResponse.json(newModule, { status: 201 })
  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 })
  }
}
