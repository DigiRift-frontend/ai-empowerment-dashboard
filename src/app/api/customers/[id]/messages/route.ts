import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/customers/[id]/messages - Send a message to customer
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { subject, content, from } = body

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      )
    }

    const message = await prisma.adminMessage.create({
      data: {
        customerId: params.id,
        subject,
        content,
        from: from || 'Admin',
        read: false,
      },
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
