import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/customers/[id]/notifications/[notificationId] - Update notification
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; notificationId: string } }
) {
  try {
    const body = await request.json()
    const { read, actionRequired } = body

    // Verify the notification belongs to the customer
    const existingNotification = await prisma.notification.findUnique({
      where: { id: params.notificationId },
    })

    if (!existingNotification || existingNotification.customerId !== params.id) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (read !== undefined) updateData.read = read
    if (actionRequired !== undefined) updateData.actionRequired = actionRequired

    const updatedNotification = await prisma.notification.update({
      where: { id: params.notificationId },
      data: updateData,
    })

    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id]/notifications/[notificationId] - Delete notification
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; notificationId: string } }
) {
  try {
    // Verify the notification belongs to the customer
    const existingNotification = await prisma.notification.findUnique({
      where: { id: params.notificationId },
    })

    if (!existingNotification || existingNotification.customerId !== params.id) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    await prisma.notification.delete({
      where: { id: params.notificationId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}
