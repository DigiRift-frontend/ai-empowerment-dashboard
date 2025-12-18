import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/modules/[id]/feedback - Get test feedback for a module
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const feedback = await prisma.testFeedback.findMany({
      where: { moduleId: params.id },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

// POST /api/modules/[id]/feedback - Add test feedback
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { feedback } = body

    if (!feedback) {
      return NextResponse.json(
        { error: 'feedback is required' },
        { status: 400 }
      )
    }

    // Verify module exists
    const existingModule = await prisma.module.findUnique({
      where: { id: params.id },
    })

    if (!existingModule) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      )
    }

    const testFeedback = await prisma.testFeedback.create({
      data: {
        feedback,
        resolved: false,
        moduleId: params.id,
      },
    })

    return NextResponse.json(testFeedback, { status: 201 })
  } catch (error) {
    console.error('Error creating feedback:', error)
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    )
  }
}
