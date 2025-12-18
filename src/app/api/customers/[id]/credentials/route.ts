import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Generate a random password
function generatePassword(length: number = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Generate a unique 4-digit PIN
async function generateUniquePin(): Promise<string> {
  let pin: string
  let isUnique = false
  let attempts = 0
  const maxAttempts = 100

  while (!isUnique && attempts < maxAttempts) {
    // Generate 4-digit PIN (1000-9999)
    pin = Math.floor(1000 + Math.random() * 9000).toString()

    // Check if PIN already exists
    const existing = await prisma.customer.findUnique({
      where: { customerCode: pin },
    })

    if (!existing) {
      isUnique = true
      return pin
    }

    attempts++
  }

  // If we couldn't find a unique 4-digit PIN, throw error
  throw new Error('Could not generate unique PIN after ' + maxAttempts + ' attempts')
}

// POST /api/customers/[id]/credentials - Generate new password or PIN
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { type } = body // 'password' or 'pin'

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    if (type === 'password') {
      const newPassword = generatePassword()

      // Store password (in production, this should be hashed!)
      await prisma.customer.update({
        where: { id: params.id },
        data: { password: newPassword },
      })

      return NextResponse.json({
        success: true,
        type: 'password',
        value: newPassword,
        message: 'Neues Passwort wurde generiert'
      })
    } else if (type === 'pin') {
      const newPin = await generateUniquePin()

      await prisma.customer.update({
        where: { id: params.id },
        data: { customerCode: newPin },
      })

      return NextResponse.json({
        success: true,
        type: 'pin',
        value: newPin,
        message: 'Neuer PIN wurde generiert'
      })
    } else {
      return NextResponse.json({ error: 'Invalid type. Use "password" or "pin"' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error generating credentials:', error)
    return NextResponse.json({ error: 'Failed to generate credentials' }, { status: 500 })
  }
}
