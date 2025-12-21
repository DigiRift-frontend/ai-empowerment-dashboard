import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/schulungen/[id]/materials - Alle Materialien einer Schulung
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const materials = await prisma.schulungMaterial.findMany({
      where: { schulungId: params.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(materials)
  } catch (error) {
    console.error('Error fetching materials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch materials' },
      { status: 500 }
    )
  }
}

// POST /api/schulungen/[id]/materials - Neues Material hinzufügen
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Verify schulung exists
    const schulung = await prisma.schulung.findUnique({
      where: { id: params.id },
    })

    if (!schulung) {
      return NextResponse.json(
        { error: 'Schulung not found' },
        { status: 404 }
      )
    }

    const material = await prisma.schulungMaterial.create({
      data: {
        schulungId: params.id,
        title: body.title,
        fileUrl: body.fileUrl,
        fileType: body.fileType,
      },
    })

    return NextResponse.json(material, { status: 201 })
  } catch (error) {
    console.error('Error creating material:', error)
    return NextResponse.json(
      { error: 'Failed to create material' },
      { status: 500 }
    )
  }
}

// DELETE /api/schulungen/[id]/materials - Material löschen (mit materialId in body)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const materialId = searchParams.get('materialId')

    if (!materialId) {
      return NextResponse.json(
        { error: 'materialId is required' },
        { status: 400 }
      )
    }

    await prisma.schulungMaterial.delete({
      where: {
        id: materialId,
        schulungId: params.id, // Ensure material belongs to this schulung
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting material:', error)
    return NextResponse.json(
      { error: 'Failed to delete material' },
      { status: 500 }
    )
  }
}
