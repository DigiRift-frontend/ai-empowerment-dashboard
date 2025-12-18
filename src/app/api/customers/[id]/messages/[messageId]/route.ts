import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/customers/[id]/messages/[messageId] - Update message (mark as read)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; messageId: string } }
) {
  try {
    const body = await request.json()
    const { read } = body

    // Verify the message belongs to the customer
    const existingMessage = await prisma.adminMessage.findUnique({
      where: { id: params.messageId },
    })

    if (!existingMessage || existingMessage.customerId !== params.id) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const updatedMessage = await prisma.adminMessage.update({
      where: { id: params.messageId },
      data: {
        read: read !== undefined ? read : existingMessage.read,
      },
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id]/messages/[messageId] - Delete message
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; messageId: string } }
) {
  try {
    // Verify the message belongs to the customer
    const existingMessage = await prisma.adminMessage.findUnique({
      where: { id: params.messageId },
    })

    if (!existingMessage || existingMessage.customerId !== params.id) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    await prisma.adminMessage.delete({
      where: { id: params.messageId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}
