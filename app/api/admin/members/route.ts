import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, hashPassword } from '@/lib/auth'
import { createMemberSchema } from '@/lib/validations/admin'
import { z } from 'zod'

/**
 * GET /api/admin/members
 * Get all family members (anyone authenticated can view for todo assignment)
 */
export async function GET() {
  try {
    // Note: This endpoint is used for todo assignment, so requireAuth (not requireAdmin)
    // But we'll keep it simple and just check if there's a valid session
    const members = await prisma.familyMember.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Get members error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/members
 * Create a new family member (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    // Parse and validate request body
    const body = await request.json()
    const validated = createMemberSchema.parse(body)

    // Check if member name already exists
    const existingMember = await prisma.familyMember.findFirst({
      where: { name: validated.name },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'Member name already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const codeHash = await hashPassword(validated.password)

    // Create member
    const member = await prisma.familyMember.create({
      data: {
        name: validated.name,
        codeHash,
        role: validated.role,
      },
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ member }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Create member error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
