import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/templates - Alle Modul-Templates
export async function GET() {
  try {
    const templates = await prisma.moduleTemplate.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

// POST /api/templates - Neues Template erstellen
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const template = await prisma.moduleTemplate.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        estimatedPoints: body.estimatedPoints,
        estimatedMaintenancePoints: body.estimatedMaintenancePoints,
        features: body.features || [],
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
