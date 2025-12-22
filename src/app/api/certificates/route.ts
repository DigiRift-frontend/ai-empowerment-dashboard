import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Helper: Generate unique hash for certificate
function generateCertificateHash(
  serieId: string,
  participantName: string,
  customerId: string,
  issuedAt: Date
): string {
  const hash = crypto
    .createHash('sha256')
    .update(`${serieId}-${participantName}-${customerId}-${issuedAt.toISOString()}`)
    .digest('hex')
    .substring(0, 12)
    .toUpperCase()
  return hash
}

// GET /api/certificates - Alle Zertifikate (optional gefiltert)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const serieId = searchParams.get('serieId')
    const hash = searchParams.get('hash')

    const where: any = {}
    if (customerId) where.customerId = customerId
    if (serieId) where.serieId = serieId
    if (hash) where.hash = hash

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        serie: {
          select: {
            id: true,
            title: true,
            certificateTitle: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    })

    return NextResponse.json(certificates)
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 })
  }
}

// POST /api/certificates - Zertifikate erstellen (für mehrere Teilnehmer)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { serieId, customerId, assignmentId, participantNames } = body

    if (!serieId || !customerId || !assignmentId || !participantNames?.length) {
      return NextResponse.json(
        { error: 'serieId, customerId, assignmentId and participantNames are required' },
        { status: 400 }
      )
    }

    // Verify the assignment exists and belongs to the customer
    const assignment = await prisma.customerSchulungAssignment.findFirst({
      where: {
        id: assignmentId,
        customerId,
        serieId,
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found or does not match' },
        { status: 404 }
      )
    }

    // Create certificates for each participant
    const issuedAt = new Date()
    const certificates = await Promise.all(
      participantNames.map(async (name: string) => {
        const trimmedName = name.trim()
        if (!trimmedName) return null

        const hash = generateCertificateHash(serieId, trimmedName, customerId, issuedAt)

        // Check if certificate with this hash already exists
        const existing = await prisma.certificate.findUnique({
          where: { hash },
        })

        if (existing) {
          return existing
        }

        return prisma.certificate.create({
          data: {
            participantName: trimmedName,
            hash,
            issuedAt,
            serieId,
            customerId,
            assignmentId,
          },
          include: {
            serie: {
              select: {
                id: true,
                title: true,
                certificateTitle: true,
              },
            },
          },
        })
      })
    )

    // Filter out null values
    const createdCertificates = certificates.filter(Boolean)

    return NextResponse.json(createdCertificates, { status: 201 })
  } catch (error) {
    console.error('Error creating certificates:', error)
    return NextResponse.json({ error: 'Failed to create certificates' }, { status: 500 })
  }
}

// PATCH /api/certificates - Download-Zähler erhöhen
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hash = searchParams.get('hash')

    if (!hash) {
      return NextResponse.json({ error: 'hash is required' }, { status: 400 })
    }

    const certificate = await prisma.certificate.update({
      where: { hash },
      data: {
        downloadCount: { increment: 1 },
      },
    })

    return NextResponse.json(certificate)
  } catch (error) {
    console.error('Error updating certificate:', error)
    return NextResponse.json({ error: 'Failed to update certificate' }, { status: 500 })
  }
}
