import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 */
export async function GET(request: NextRequest) {
  try {
    const member = await requireAuth()

    const count = await prisma.notification.count({
      where: {
        recipientId: member.id,
        isRead: false,
      },
    })

    return NextResponse.json({ count })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Get unread count error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
