import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/customers/[id]/team/[memberId] - Team-Mitglied aktualisieren
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const body = await request.json()

    const teamMember = await prisma.customerTeamMember.update({
      where: { id: params.memberId },
      data: {
        name: body.name,
        role: body.role,
        department: body.department,
        email: body.email || null,
        phone: body.phone || null,
        moduleId: body.moduleId || null,
      },
    })

    return NextResponse.json(teamMember)
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 })
  }
}

// DELETE /api/customers/[id]/team/[memberId] - Team-Mitglied löschen
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    await prisma.customerTeamMember.delete({
      where: { id: params.memberId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 })
  }
}
