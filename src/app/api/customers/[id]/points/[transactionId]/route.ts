import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/customers/[id]/points/[transactionId] - Einzelne Transaktion abrufen
export async function GET(
  request: Request,
  { params }: { params: { id: string; transactionId: string } }
) {
  try {
    const transaction = await prisma.pointTransaction.findUnique({
      where: { id: params.transactionId },
      include: { module: { select: { id: true, name: true } } },
    })

    if (!transaction || transaction.customerId !== params.id) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    )
  }
}

// PATCH /api/customers/[id]/points/[transactionId] - Transaktion bearbeiten
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; transactionId: string } }
) {
  try {
    const body = await request.json()
    const { description, points, date, category, moduleId } = body

    // Get the customer to find their membershipId
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      select: { membershipId: true },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get the existing transaction
    const existingTransaction = await prisma.pointTransaction.findUnique({
      where: { id: params.transactionId },
    })

    if (!existingTransaction || existingTransaction.customerId !== params.id) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const oldPoints = existingTransaction.points
    const newPoints = points !== undefined ? parseFloat(points) : oldPoints
    const pointsDifference = newPoints - oldPoints

    // Update the transaction
    const updatedTransaction = await prisma.pointTransaction.update({
      where: { id: params.transactionId },
      data: {
        description: description ?? existingTransaction.description,
        points: newPoints,
        date: date ? new Date(date) : existingTransaction.date,
        category: category ?? existingTransaction.category,
        moduleId: moduleId !== undefined ? (moduleId || null) : existingTransaction.moduleId,
      },
      include: { module: { select: { id: true, name: true } } },
    })

    // Adjust membership points if points value changed
    if (pointsDifference !== 0) {
      await prisma.membership.update({
        where: { id: customer.membershipId },
        data: {
          usedPoints: {
            increment: pointsDifference,
          },
          remainingPoints: {
            decrement: pointsDifference,
          },
        },
      })
    }

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id]/points/[transactionId] - Transaktion löschen
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; transactionId: string } }
) {
  try {
    // Get the customer to find their membershipId
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      select: { membershipId: true },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get the existing transaction
    const existingTransaction = await prisma.pointTransaction.findUnique({
      where: { id: params.transactionId },
    })

    if (!existingTransaction || existingTransaction.customerId !== params.id) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const pointsToReverse = existingTransaction.points

    // Delete the transaction
    await prisma.pointTransaction.delete({
      where: { id: params.transactionId },
    })

    // Reverse the points in membership
    await prisma.membership.update({
      where: { id: customer.membershipId },
      data: {
        usedPoints: {
          decrement: pointsToReverse,
        },
        remainingPoints: {
          increment: pointsToReverse,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
