import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/customers/[id]/notifications/[notificationId] - Update notification (mark as read)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; notificationId: string } }
) {
  try {
    const body = await request.json()
    const { read } = body

    // Verify the notification belongs to the customer
    const existingNotification = await prisma.notification.findUnique({
      where: { id: params.notificationId },
    })

    if (!existingNotification || existingNotification.customerId !== params.id) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: params.notificationId },
      data: {
        read: read !== undefined ? read : existingNotification.read,
      },
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
