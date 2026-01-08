import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

/**
 * POST /api/chat/messages/[messageId]/read
 * Mark a message as read by the current user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const member = await requireAuth()
    const { messageId } = await params

    // Check if message exists
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: { id: true, senderId: true },
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Don't allow marking own message as read
    if (message.senderId === member.id) {
      return NextResponse.json(
        { error: 'Cannot mark own message as read' },
        { status: 400 }
      )
    }

    // Create or update read status (upsert to avoid duplicates)
    const messageRead = await prisma.messageRead.upsert({
      where: {
        messageId_readerId: {
          messageId,
          readerId: member.id,
        },
      },
      create: {
        messageId,
        readerId: member.id,
      },
      update: {
        readAt: new Date(),
      },
    })

    // Emit Socket.IO event for real-time read status update
    try {
      const io = (global as any).io
      if (io) {
        // Get the room ID from the message
        const msg = await prisma.chatMessage.findUnique({
          where: { id: messageId },
          select: { roomId: true },
        })

        if (msg) {
          io.to(msg.roomId).emit('message-read', {
            messageId,
            readerId: member.id,
            readerName: member.name,
            readAt: messageRead.readAt,
          })
        }
      }
    } catch (socketError) {
      console.error('Socket.IO emission error:', socketError)
      // Don't fail the request if socket emission fails
    }

    return NextResponse.json({ success: true, read: messageRead })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Mark message as read error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
