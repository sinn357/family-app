import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/admin/members
 * Get all family members (anyone can view for todo assignment)
 */
export async function GET() {
  try {
    await requireAuth()

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
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Get members error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
