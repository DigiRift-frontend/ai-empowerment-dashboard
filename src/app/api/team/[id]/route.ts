import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/team/[id] - Einzelnes Teammitglied abrufen
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const teamMember = await prisma.teamMember.findUnique({
      where: { id: params.id },
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
    })

    if (!teamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    return NextResponse.json(teamMember)
  } catch (error) {
    console.error('Error fetching team member:', error)
    return NextResponse.json({ error: 'Failed to fetch team member' }, { status: 500 })
  }
}

// PATCH /api/team/[id] - Teammitglied aktualisieren
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.role !== undefined) updateData.role = body.role
    if (body.department !== undefined) updateData.department = body.department
    if (body.email !== undefined) updateData.email = body.email
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl || null
    if (body.calendlyUrl !== undefined) updateData.calendlyUrl = body.calendlyUrl || null

    const updatedMember = await prisma.teamMember.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignedModules: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 })
  }
}

// DELETE /api/team/[id] - Teammitglied löschen
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First, remove the assigneeId from all modules assigned to this team member
    await prisma.module.updateMany({
      where: { assigneeId: params.id },
      data: { assigneeId: null },
    })

    // Then delete the team member
    await prisma.teamMember.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 })
  }
}
