import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { sendMessageSchema } from '@/lib/validations/chat'
import { z } from 'zod'

/**
 * GET /api/chat/rooms/[roomId]/messages
 * Get messages from a chat room
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await requireAuth()
    const { roomId } = await params

    // Get messages from the room
    const messages = await prisma.chatMessage.findMany({
      where: { roomId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 100, // Limit to last 100 messages
    })

    return NextResponse.json({ messages })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/chat/rooms/[roomId]/messages
 * Send a message to a chat room
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const member = await requireAuth()
    const { roomId } = await params

    // Parse and validate request body
    const body = await request.json()
    const validated = sendMessageSchema.parse(body)

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        roomId,
        senderId: member.id,
        content: validated.content,
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

    return NextResponse.json({ message }, { status: 201 })
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

    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
