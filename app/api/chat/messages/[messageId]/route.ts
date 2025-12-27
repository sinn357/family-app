import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

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
