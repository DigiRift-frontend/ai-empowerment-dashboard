import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/customers/[id]/membership - Membership aktualisieren
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // First find the customer's membership
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: { membership: true },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    if (!customer.membership) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 })
    }

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (body.tier !== undefined) updateData.tier = body.tier
    if (body.monthlyPoints !== undefined) updateData.monthlyPoints = body.monthlyPoints
    if (body.monthlyPrice !== undefined) updateData.monthlyPrice = body.monthlyPrice
    if (body.discountPercent !== undefined) updateData.discountPercent = body.discountPercent
    if (body.bonusPoints !== undefined) updateData.bonusPoints = body.bonusPoints
    if (body.usedPoints !== undefined) updateData.usedPoints = body.usedPoints
    if (body.remainingPoints !== undefined) updateData.remainingPoints = body.remainingPoints
    if (body.contractStart !== undefined) updateData.contractStart = new Date(body.contractStart)
    if (body.contractEnd !== undefined) updateData.contractEnd = body.contractEnd ? new Date(body.contractEnd) : null
    if (body.periodStart !== undefined) updateData.periodStart = new Date(body.periodStart)
    if (body.periodEnd !== undefined) updateData.periodEnd = new Date(body.periodEnd)

    // Auto-calculate remainingPoints if monthlyPoints or usedPoints changed
    if (body.monthlyPoints !== undefined || body.usedPoints !== undefined) {
      const newMonthlyPoints = body.monthlyPoints ?? customer.membership.monthlyPoints
      const newUsedPoints = body.usedPoints ?? customer.membership.usedPoints
      updateData.remainingPoints = newMonthlyPoints - newUsedPoints
    }

    const updatedMembership = await prisma.membership.update({
      where: { id: customer.membership.id },
      data: updateData,
    })

    return NextResponse.json(updatedMembership)
  } catch (error) {
    console.error('Error updating membership:', error)
    return NextResponse.json({ error: 'Failed to update membership' }, { status: 500 })
  }
}
