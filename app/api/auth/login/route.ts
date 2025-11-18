import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, createSession } from '@/lib/auth'
import { loginSchema } from '@/lib/validations/auth'
import { z } from 'zod'

/**
 * POST /api/auth/login
 * Login endpoint - verify credentials and create session
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validated = loginSchema.parse(body)

    // Find member by name
    const member = await prisma.familyMember.findFirst({
      where: { name: validated.name },
      select: {
        id: true,
        name: true,
        role: true,
        codeHash: true,
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(
      validated.password,
      member.codeHash
    )

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create session
    await createSession(member.id, member.role)

    // Return member info (without password hash)
    return NextResponse.json({
      member: {
        id: member.id,
        name: member.name,
        role: member.role,
      },
    })
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    // Handle other errors
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
