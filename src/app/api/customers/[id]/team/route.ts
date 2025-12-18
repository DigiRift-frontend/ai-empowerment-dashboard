import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/customers/[id]/team - Team-Mitglieder eines Kunden abrufen
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const teamMembers = await prisma.customerTeamMember.findMany({
      where: { customerId: params.id },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(teamMembers)
  } catch (error) {
    console.error('Error fetching customer team members:', error)
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
  }
}

// POST /api/customers/[id]/team - Neues Team-Mitglied erstellen
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const teamMember = await prisma.customerTeamMember.create({
      data: {
        name: body.name,
        role: body.role,
        department: body.department,
        email: body.email || null,
        phone: body.phone || null,
        moduleId: body.moduleId || null,
        customerId: params.id,
      },
    })

    return NextResponse.json(teamMember, { status: 201 })
  } catch (error) {
    console.error('Error creating team member:', error)
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 })
  }
}
