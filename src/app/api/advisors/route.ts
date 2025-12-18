import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/advisors - Alle Kundenberater abrufen
export async function GET() {
  try {
    const advisors = await prisma.customerAdvisor.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(advisors)
  } catch (error) {
    console.error('Error fetching advisors:', error)
    return NextResponse.json({ error: 'Failed to fetch advisors' }, { status: 500 })
  }
}

// POST /api/advisors - Neuen Kundenberater erstellen
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const advisor = await prisma.customerAdvisor.create({
      data: {
        name: body.name,
        role: body.role,
        email: body.email,
        phone: body.phone,
        avatarUrl: body.avatarUrl,
        calendlyUrl: body.calendlyUrl,
      },
    })

    return NextResponse.json(advisor)
  } catch (error) {
    console.error('Error creating advisor:', error)
    return NextResponse.json({ error: 'Failed to create advisor' }, { status: 500 })
  }
}
