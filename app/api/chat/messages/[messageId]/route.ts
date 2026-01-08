import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma as db } from '@/lib/db'

// DELETE /api/chat/messages/[messageId] - 메시지 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const member = await requireAuth()
    const { messageId } = await params

    // 메시지 조회
    const message = await db.chatMessage.findUnique({
      where: { id: messageId },
    })

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    // 본인이 작성한 메시지만 삭제 가능
    if (message.senderId !== member.id) {
      return NextResponse.json(
        { error: 'You can only delete your own messages' },
        { status: 403 }
      )
    }

    // Soft delete - isDeleted를 true로, content를 빈 문자열로
    await db.chatMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        content: '', // 내용 삭제
        imageUrl: null, // 이미지도 삭제
        mediaUrls: [],
        mediaTypes: [],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete message error:', error)
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}

// PATCH /api/chat/messages/[messageId] - 메시지 수정
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const member = await requireAuth()
    const { messageId } = await params
    const body = await req.json()
    const content = typeof body.content === 'string' ? body.content.trim() : ''

    if (!content) {
      return NextResponse.json(
        { error: 'Message content cannot be empty' },
        { status: 400 }
      )
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Message content is too long' },
        { status: 400 }
      )
    }

    const message = await db.chatMessage.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        senderId: true,
        roomId: true,
        createdAt: true,
        isDeleted: true,
      },
    })

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    if (message.senderId !== member.id) {
      return NextResponse.json(
        { error: 'You can only edit your own messages' },
        { status: 403 }
      )
    }

    if (message.isDeleted) {
      return NextResponse.json(
        { error: 'Cannot edit deleted message' },
        { status: 400 }
      )
    }

    const fiveMinutesMs = 5 * 60 * 1000
    if (Date.now() - new Date(message.createdAt).getTime() > fiveMinutesMs) {
      return NextResponse.json(
        { error: 'Message can only be edited within 5 minutes' },
        { status: 400 }
      )
    }

    const updated = await db.chatMessage.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                name: true,
              },
            },
          },
        },
        reads: {
          select: {
            readerId: true,
            readAt: true,
            reader: {
              select: {
                name: true,
              },
            },
          },
        },
        reactions: {
          select: {
            id: true,
            userId: true,
            emoji: true,
            createdAt: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    try {
      const io = (global as any).io
      if (io) {
        io.to(message.roomId).emit('message-edit', {
          messageId,
          content: updated.content,
          isEdited: updated.isEdited,
          editedAt: updated.editedAt,
        })
      }
    } catch (socketError) {
      console.error('Socket.IO emission error:', socketError)
    }

    return NextResponse.json({ message: updated })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Edit message error:', error)
    return NextResponse.json(
      { error: 'Failed to edit message' },
      { status: 500 }
    )
  }
}
