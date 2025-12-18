import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/customers/[id]/notifications - Get all notifications for a customer
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { customerId: params.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST /api/customers/[id]/notifications - Create a notification
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      type,
      title,
      message,
      actionRequired = false,
      relatedProjectId,
      relatedUrl,
    } = body

    // Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'type, title, and message are required' },
        { status: 400 }
      )
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        actionRequired,
        relatedProjectId,
        relatedUrl,
        customerId: params.id,
      },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
