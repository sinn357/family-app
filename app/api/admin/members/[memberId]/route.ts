import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, hashPassword } from '@/lib/auth'
import { updateMemberSchema } from '@/lib/validations/admin'
import { z } from 'zod'

/**
 * PATCH /api/admin/members/[memberId]
 * Update a family member (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    await requireAdmin()
    const { memberId } = await params

    // Check if member exists
    const existingMember = await prisma.familyMember.findUnique({
      where: { id: memberId },
      select: { id: true, name: true },
    })

    if (!existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validated = updateMemberSchema.parse(body)

    // Check if new name already exists (if name is being changed)
    if (validated.name && validated.name !== existingMember.name) {
      const nameExists = await prisma.familyMember.findFirst({
        where: {
          name: validated.name,
          NOT: { id: memberId },
        },
      })

      if (nameExists) {
        return NextResponse.json(
          { error: 'Member name already exists' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (validated.name) {
      updateData.name = validated.name
    }
    if (validated.password) {
      updateData.codeHash = await hashPassword(validated.password)
    }

    // Update member
    const member = await prisma.familyMember.update({
      where: { id: memberId },
      data: updateData,
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ member })
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

    console.error('Update member error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
