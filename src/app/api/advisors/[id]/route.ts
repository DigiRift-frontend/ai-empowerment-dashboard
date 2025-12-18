import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/advisors/[id] - Einzelnen Berater abrufen
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const advisor = await prisma.customerAdvisor.findUnique({
      where: { id: params.id },
      include: {
        customers: {
          select: {
            id: true,
            name: true,
            companyName: true,
            membership: {
              select: {
                tier: true,
              },
            },
          },
        },
      },
    })

    if (!advisor) {
      return NextResponse.json({ error: 'Advisor not found' }, { status: 404 })
    }

    return NextResponse.json(advisor)
  } catch (error) {
    console.error('Error fetching advisor:', error)
    return NextResponse.json({ error: 'Failed to fetch advisor' }, { status: 500 })
  }
}

// PATCH /api/advisors/[id] - Berater aktualisieren
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const advisor = await prisma.customerAdvisor.update({
      where: { id: params.id },
      data: {
        name: body.name,
        role: body.role,
        email: body.email,
        phone: body.phone,
        avatarUrl: body.avatarUrl,
        calendlyUrl: body.calendlyUrl,
      },
    })

    return NextResponse.json(advisor)
  } catch (error) {
    console.error('Error updating advisor:', error)
    return NextResponse.json({ error: 'Failed to update advisor' }, { status: 500 })
  }
}

// DELETE /api/advisors/[id] - Berater löschen
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if advisor has customers assigned
    const advisor = await prisma.customerAdvisor.findUnique({
      where: { id: params.id },
      include: { customers: true },
    })

    if (advisor && advisor.customers.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete advisor with assigned customers' },
        { status: 400 }
      )
    }

    await prisma.customerAdvisor.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting advisor:', error)
    return NextResponse.json({ error: 'Failed to delete advisor' }, { status: 500 })
  }
}
