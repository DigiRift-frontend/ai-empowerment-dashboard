import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/customers/[id] - Einzelnen Kunden abrufen
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        membership: true,
        advisor: true,
        modules: {
          include: {
            acceptanceCriteria: true,
            testFeedback: true,
            assignee: true,
          },
          orderBy: {
            roadmapOrder: 'asc',
          },
        },
        pointTransactions: {
          orderBy: {
            date: 'desc',
          },
          take: 50,
        },
        externalCosts: {
          orderBy: {
            date: 'desc',
          },
        },
        workshops: {
          orderBy: {
            date: 'desc',
          },
        },
        decisions: {
          orderBy: {
            date: 'desc',
          },
        },
        meetings: {
          orderBy: {
            date: 'asc',
          },
        },
        notifications: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        adminMessages: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        schulungAssignments: {
          include: {
            schulung: true,
            serie: {
              include: {
                schulungItems: {
                  include: {
                    schulung: true,
                  },
                  orderBy: {
                    order: 'asc',
                  },
                },
              },
            },
          },
        },
        teamMembers: {
          orderBy: {
            name: 'asc',
          },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
}

// PATCH /api/customers/[id] - Kunden aktualisieren
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: body.name,
        companyName: body.companyName,
        email: body.email,
        advisorId: body.advisorId,
      },
      include: {
        membership: true,
        advisor: true,
      },
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}

// DELETE /api/customers/[id] - Kunden löschen
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.customer.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
}
