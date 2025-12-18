import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/modules/[id]/criteria - Get acceptance criteria for a module
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const criteria = await prisma.acceptanceCriterion.findMany({
      where: { moduleId: params.id },
    })

    return NextResponse.json(criteria)
  } catch (error) {
    console.error('Error fetching criteria:', error)
    return NextResponse.json(
      { error: 'Failed to fetch criteria' },
      { status: 500 }
    )
  }
}

// PUT /api/modules/[id]/criteria - Replace all acceptance criteria for a module
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { criteria } = body

    if (!Array.isArray(criteria)) {
      return NextResponse.json(
        { error: 'criteria must be an array' },
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

    // Delete existing criteria and create new ones
    await prisma.acceptanceCriterion.deleteMany({
      where: { moduleId: params.id },
    })

    const newCriteria = await prisma.acceptanceCriterion.createMany({
      data: criteria.map((c: { description: string; accepted?: boolean }) => ({
        description: c.description,
        accepted: c.accepted || false,
        moduleId: params.id,
      })),
    })

    // Fetch and return the created criteria
    const savedCriteria = await prisma.acceptanceCriterion.findMany({
      where: { moduleId: params.id },
    })

    return NextResponse.json(savedCriteria)
  } catch (error) {
    console.error('Error saving criteria:', error)
    return NextResponse.json(
      { error: 'Failed to save criteria' },
      { status: 500 }
    )
  }
}

// POST /api/modules/[id]/criteria - Add a single criterion
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { description, accepted = false } = body

    if (!description) {
      return NextResponse.json(
        { error: 'description is required' },
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

    const criterion = await prisma.acceptanceCriterion.create({
      data: {
        description,
        accepted,
        moduleId: params.id,
      },
    })

    return NextResponse.json(criterion, { status: 201 })
  } catch (error) {
    console.error('Error creating criterion:', error)
    return NextResponse.json(
      { error: 'Failed to create criterion' },
      { status: 500 }
    )
  }
}
