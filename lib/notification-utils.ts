import { prisma } from '@/lib/db'
import type { NotificationType, RelatedType } from '@prisma/client'

interface CreateNotificationParams {
  type: NotificationType
  title: string
  content: string
  recipientId: string
  senderId?: string
  relatedType?: RelatedType
  relatedId?: string
}

/**
 * Create a notification and emit it via Socket.IO
 */
export async function createNotification(params: CreateNotificationParams) {
  const { type, title, content, recipientId, senderId, relatedType, relatedId } = params

  // Check notification settings
  const settings = await prisma.notificationSetting.findUnique({
    where: { memberId: recipientId },
  })

  // Check if user wants this type of notification
  if (settings) {
    if (type === 'COMMENT' && !settings.notifyOnComment) return null
    if (type === 'MENTION' && !settings.notifyOnMention) return null
    if (type === 'SYSTEM' && !settings.notifyOnSystem) return null
    if (type === 'TODO' && !settings.notifyOnTodo) return null
  }

  // Create notification
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

  // Emit notification via Socket.IO
  try {
    const io = (global as any).io
    if (io) {
      io.to(`notifications:${recipientId}`).emit('notification', notification)
    }
  } catch (error) {
    console.error('Failed to emit notification:', error)
  }

  return notification
}

/**
 * Create comment notification
 */
export async function notifyComment(params: {
  postId: string
  postAuthorId: string
  commentAuthorId: string
  commentAuthorName: string
}) {
  const { postId, postAuthorId, commentAuthorId, commentAuthorName } = params

  // Don't notify if user comments on their own post
  if (postAuthorId === commentAuthorId) return null

  return createNotification({
    type: 'COMMENT',
    title: '새 댓글',
    content: `${commentAuthorName}님이 게시글에 댓글을 남겼습니다.`,
    recipientId: postAuthorId,
    senderId: commentAuthorId,
    relatedType: 'POST',
    relatedId: postId,
  })
}

/**
 * Create todo assignment notification
 */
export async function notifyTodoAssignment(params: {
  todoId: string
  todoTitle: string
  assigneeId: string
  assignerId: string
  assignerName: string
}) {
  const { todoId, todoTitle, assigneeId, assignerId, assignerName } = params

  return createNotification({
    type: 'TODO',
    title: '새로운 할 일',
    content: `${assignerName}님이 "${todoTitle}"을(를) 할당했습니다.`,
    recipientId: assigneeId,
    senderId: assignerId,
    relatedType: 'TODO',
    relatedId: todoId,
  })
}
