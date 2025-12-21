import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/customers/[id]/points - Alle Punktetransaktionen abrufen
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transactions = await prisma.pointTransaction.findMany({
      where: { customerId: params.id },
      include: {
        module: { select: { id: true, name: true } },
        schulungAssignment: {
          select: {
            id: true,
            schulung: { select: { id: true, title: true } },
            serie: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching point transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch point transactions' },
      { status: 500 }
    )
  }
}

// POST /api/customers/[id]/points - Punkte buchen
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { description, points, date, category, moduleId, schulungId } = body

    if (!description || points === undefined || !date || !category) {
      return NextResponse.json(
        { error: 'Description, points, date and category are required' },
        { status: 400 }
      )
    }

    const pointsValue = parseFloat(points)

    // Get the customer to find their membershipId
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      select: { membershipId: true },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Create the point transaction
    const transaction = await prisma.pointTransaction.create({
      data: {
        description,
        points: pointsValue,
        date: new Date(date),
        category,
        customerId: params.id,
        moduleId: moduleId || null,
        schulungAssignmentId: schulungId || null,
      },
    })

    // Update the customer's used and remaining points in their membership
    await prisma.membership.update({
      where: { id: customer.membershipId },
      data: {
        usedPoints: {
          increment: pointsValue,
        },
        remainingPoints: {
          decrement: pointsValue,
        },
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error booking points:', error)
    return NextResponse.json(
      { error: 'Failed to book points' },
      { status: 500 }
    )
  }
}
