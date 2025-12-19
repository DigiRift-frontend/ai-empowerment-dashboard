import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/admin/messages/[id] - Nachricht als gelesen markieren
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const message = await prisma.adminMessage.update({
      where: { id: params.id },
      data: {
        read: body.read !== undefined ? body.read : true,
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error updating admin message:', error)
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
}

// DELETE /api/admin/messages/[id] - Nachricht löschen
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.adminMessage.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting admin message:', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
