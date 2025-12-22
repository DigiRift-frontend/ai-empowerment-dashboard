import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/customers/[id]/certificates - Alle Zertifikate eines Kunden
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: customerId } = await params

    const certificates = await prisma.certificate.findMany({
      where: { customerId },
      include: {
        serie: {
          select: {
            id: true,
            title: true,
            description: true,
            certificateTitle: true,
            schulungItems: {
              include: {
                schulung: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
        customer: {
          select: {
            companyName: true,
            advisor: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
        assignment: {
          select: {
            id: true,
            status: true,
            completedDate: true,
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    })

    return NextResponse.json(certificates)
  } catch (error) {
    console.error('Error fetching customer certificates:', error)
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 })
  }
}
