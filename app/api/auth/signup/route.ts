import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, createSession } from '@/lib/auth'
import { signupSchema } from '@/lib/validations/auth'
import { z } from 'zod'

/**
 * POST /api/auth/signup
 * Signup endpoint - create new member and session
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validated = signupSchema.parse(body)

    // Check if member name already exists
    const existingMember = await prisma.familyMember.findFirst({
      where: { name: validated.name },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'Name already taken' },
        { status: 400 }
      )
    }

    // Hash password
    const codeHash = await hashPassword(validated.password)

    // Create new member (default role: MEMBER)
    const member = await prisma.familyMember.create({
      data: {
        name: validated.name,
        codeHash,
        role: 'MEMBER',
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
    })

    // Create session
    await createSession(member.id, member.role)

    // Return member info
    return NextResponse.json(
      { member },
      { status: 201 }
    )
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    // Handle other errors
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
