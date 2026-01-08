import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const reactionSchema = z.object({
  emoji: z.string().min(1).max(10),
})

/**
 * POST /api/chat/messages/[messageId]/reactions
 * Add or remove emoji reaction to a message
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const member = await requireAuth()
    const { messageId } = await params

    // Parse and validate request body
    const body = await request.json()
    const { emoji } = reactionSchema.parse(body)

    // Check if message exists
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: { id: true, roomId: true },
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if reaction already exists
    const existingReaction = await prisma.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: member.id,
          emoji,
        },
      },
    })

    let reaction
    let action: 'added' | 'removed'

    if (existingReaction) {
      // Remove reaction (toggle off)
      await prisma.messageReaction.delete({
        where: { id: existingReaction.id },
      })
      action = 'removed'
    } else {
      // Add reaction
      reaction = await prisma.messageReaction.create({
        data: {
          messageId,
          userId: member.id,
          emoji,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
      action = 'added'
    }

    // Emit Socket.IO event for real-time reaction update
    try {
      const io = (global as any).io
      if (io) {
        io.to(message.roomId).emit('message-reaction', {
          messageId,
          userId: member.id,
          userName: member.name,
          emoji,
          action,
        })
      }
    } catch (socketError) {
      console.error('Socket.IO emission error:', socketError)
      // Don't fail the request if socket emission fails
    }

    return NextResponse.json({
      action,
      reaction: action === 'added' ? reaction : null,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Add/remove reaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
