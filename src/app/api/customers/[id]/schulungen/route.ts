import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/customers/[id]/schulungen - Schulungen eines Kunden
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const assignments = await prisma.customerSchulungAssignment.findMany({
      where: { customerId: params.id },
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching customer schulungen:', error)
    return NextResponse.json({ error: 'Failed to fetch schulungen' }, { status: 500 })
  }
}

// POST /api/customers/[id]/schulungen - Schulung zuweisen
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const assignment = await prisma.customerSchulungAssignment.create({
      data: {
        customerId: params.id,
        schulungId: body.schulungId || null,
        serieId: body.serieId || null,
        status: body.status || 'geplant',
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
      },
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
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Error assigning schulung:', error)
    return NextResponse.json({ error: 'Failed to assign schulung' }, { status: 500 })
  }
}
