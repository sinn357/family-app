import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/notifications
 * Get user's notifications with pagination
 * Query params:
 *  - cursor: notification ID (optional)
 *  - limit: number of notifications (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const member = await requireAuth()

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const notifications = await prisma.notification.findMany({
      take: limit + 1,
      ...(cursor && {
        cursor: {
          id: cursor,
        },
        skip: 1,
      }),
      where: {
        recipientId: member.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    let nextCursor: string | undefined = undefined
    if (notifications.length > limit) {
      const nextNotification = notifications.pop()
      nextCursor = nextNotification!.id
    }

    return NextResponse.json({ notifications, nextCursor })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications
 * Create a notification (internal use)
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const { type, title, content, recipientId, senderId, relatedType, relatedId } = body

    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        content,
        recipientId,
        senderId: senderId || null,
        relatedType: relatedType || null,
        relatedId: relatedId || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Create notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
