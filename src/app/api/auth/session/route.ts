import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('customer_session')

    if (!sessionCookie?.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const customer = await prisma.customer.findUnique({
      where: { id: sessionCookie.value },
      select: {
        id: true,
        name: true,
        companyName: true,
        email: true,
      },
    })

    if (!customer) {
      // Invalid session, clear cookie
      cookieStore.delete('customer_session')
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      customer,
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { authenticated: false, error: 'Session error' },
      { status: 500 }
    )
  }
}
