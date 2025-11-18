import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/chat/rooms
 * Get all chat rooms
 */
export async function GET() {
  try {
    await requireAuth()

    // Get all chat rooms
    const rooms = await prisma.chatRoom.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    })

    // If no default room exists, create one
    if (!rooms.some((room) => room.isDefault)) {
      const defaultRoom = await prisma.chatRoom.create({
        data: {
          name: 'Family Chat',
          isDefault: true,
        },
      })
      rooms.unshift(defaultRoom)
    }

    return NextResponse.json({ rooms })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Get rooms error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
