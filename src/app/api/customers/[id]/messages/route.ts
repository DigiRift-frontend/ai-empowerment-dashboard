import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/customers/[id]/messages - Send a message to/from customer
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { subject, content, from, direction, messageType } = body

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      )
    }

    // Determine direction: 'outgoing' = from Admin to Customer, 'incoming' = from Customer to Admin
    const messageDirection = direction || (from === 'Admin' ? 'outgoing' : 'incoming')

    const createData: Record<string, unknown> = {
      customerId: params.id,
      subject,
      content,
      from: from || 'Admin',
      direction: messageDirection,
      read: messageDirection === 'outgoing', // Outgoing messages are "read" by admin immediately
      customerRead: false, // Customer hasn't read yet
    }

    // Only add messageType if provided
    if (messageType) {
      createData.messageType = messageType
    }

    const message = await prisma.adminMessage.create({
      data: createData as any,
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}

// GET /api/customers/[id]/messages - Get all messages for a customer
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const messages = await prisma.adminMessage.findMany({
      where: { customerId: params.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
