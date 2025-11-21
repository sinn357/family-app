import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/notifications/settings
 * Get user's notification settings
 */
export async function GET(request: NextRequest) {
  try {
    const member = await requireAuth()

    let settings = await prisma.notificationSetting.findUnique({
      where: { memberId: member.id },
    })

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.notificationSetting.create({
        data: {
          memberId: member.id,
          notifyOnComment: true,
          notifyOnMention: true,
          notifyOnSystem: true,
          notifyOnTodo: true,
        },
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Get notification settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications/settings
 * Update user's notification settings
 */
export async function PATCH(request: NextRequest) {
  try {
    const member = await requireAuth()
    const body = await request.json()

    const settings = await prisma.notificationSetting.upsert({
      where: { memberId: member.id },
      update: {
        notifyOnComment: body.notifyOnComment ?? undefined,
        notifyOnMention: body.notifyOnMention ?? undefined,
        notifyOnSystem: body.notifyOnSystem ?? undefined,
        notifyOnTodo: body.notifyOnTodo ?? undefined,
      },
      create: {
        memberId: member.id,
        notifyOnComment: body.notifyOnComment ?? true,
        notifyOnMention: body.notifyOnMention ?? true,
        notifyOnSystem: body.notifyOnSystem ?? true,
        notifyOnTodo: body.notifyOnTodo ?? true,
      },
    })

    return NextResponse.json({ settings })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Update notification settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
