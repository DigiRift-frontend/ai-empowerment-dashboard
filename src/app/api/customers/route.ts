import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/customers - Liste aller Kunden
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        membership: true,
        advisor: true,
        modules: {
          select: {
            id: true,
            name: true,
            status: true,
            progress: true,
            monthlyMaintenancePoints: true,
          },
        },
        _count: {
          select: {
            modules: true,
            pointTransactions: true,
          },
        },
      },
      orderBy: {
        companyName: 'asc',
      },
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

// POST /api/customers - Neuen Kunden erstellen
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create membership first
    const membership = await prisma.membership.create({
      data: {
        tier: body.tier || 'M',
        monthlyPoints: body.monthlyPoints || 100,
        usedPoints: 0,
        remainingPoints: body.monthlyPoints || 100,
        monthlyPrice: body.monthlyPrice || 4900,
        contractStart: new Date(),
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        companyName: body.companyName,
        email: body.email,
        customerCode: body.customerCode || Math.floor(1000 + Math.random() * 9000).toString(),
        membershipId: membership.id,
        advisorId: body.advisorId,
      },
      include: {
        membership: true,
        advisor: true,
      },
    })

    // Create welcome message in customer's inbox
    await prisma.adminMessage.create({
      data: {
        customerId: customer.id,
        subject: 'Willkommen im AI Empowerment Programm!',
        content: `Hallo ${body.name},

herzlich willkommen bei uns! Wir freuen uns sehr, Sie als neuen Kunden begrüßen zu dürfen.

Ihr persönlicher Bereich wird gerade für Sie eingerichtet. In Kürze finden Sie hier:

• Ihre individuelle Roadmap mit allen geplanten Meilensteinen
• Den aktuellen Fortschritt Ihrer KI-Projekte
• Übersicht über Ihr Punktebudget und den Verbrauch
• Schulungsangebote für Ihr Team

Ihr persönlicher Ansprechpartner ${customer.advisor?.name || 'wird Ihnen in Kürze mitgeteilt'} steht Ihnen bei Fragen jederzeit zur Verfügung.

Wir wünschen Ihnen einen erfolgreichen Start!

Herzliche Grüße
Ihr AI Empowerment Team`,
        from: 'AI Empowerment Team',
        read: false,
      },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}
