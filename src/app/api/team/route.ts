import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/team - Alle Teammitglieder
export async function GET() {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      include: {
        assignedModules: {
          select: {
            id: true,
            name: true,
            status: true,
            customer: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(teamMembers)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
  }
}

// POST /api/team - Neues Teammitglied erstellen
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const teamMember = await prisma.teamMember.create({
      data: {
        name: body.name,
        role: body.role,
        department: body.department,
        email: body.email,
        avatarUrl: body.avatarUrl,
        calendlyUrl: body.calendlyUrl,
      },
    })

    return NextResponse.json(teamMember, { status: 201 })
  } catch (error) {
    console.error('Error creating team member:', error)
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 })
  }
}
