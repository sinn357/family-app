'use client'

import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useChatMessages } from '@/lib/hooks/use-chat'
import { useSocket } from '@/lib/hooks/use-socket'
import { MessageItem } from './message-item'
import { TypingIndicator } from './typing-indicator'
import { EmptyState } from '@/components/ui/empty-state'
import { MessageListSkeleton } from './message-skeleton'
import { DateSeparator } from './date-separator'
import { MessageCircle } from 'lucide-react'
import { isSameDay } from 'date-fns'

interface MessageListProps {
  roomId: string
  currentUserId: string
  onReply?: (message: any) => void
  onRetry?: (message: any) => void
}

export function MessageList({ roomId, currentUserId, onReply, onRetry }: MessageListProps) {
  const { data, isLoading, error } = useChatMessages(roomId)
  const { socket, isConnected } = useSocket()
  const queryClient = useQueryClient()
  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [typingUsers, setTypingUsers] = useState<Array<{ userId: string; userName: string }>>([ ])
  const [totalMembers, setTotalMembers] = useState(5) // Default 5 (4 members + 1 admin)

  // Get total family members count
  useEffect(() => {
    async function fetchMembersCount() {
      try {
        const res = await fetch('/api/admin/members', {
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          setTotalMembers(data.members?.length || 5)
        }
      } catch (err) {
        console.error('Failed to fetch members count:', err)
      }
    }
    fetchMembersCount()
  }, [])

  // Join room and listen for new messages via WebSocket
  useEffect(() => {
    if (!socket || !roomId) return

    // Join the room
    socket.emit('join-room', roomId)

    // Listen for new messages
    const handleNewMessage = (message: any) => {
      queryClient.setQueryData(['chat', roomId, 'messages'], (old: any) => {
        if (!old) return old

        // Check if message already exists (avoid duplicates)
        const exists = old.messages.some((m: any) => m.id === message.id)
        if (exists) return old

        return {
          ...old,
          messages: [...old.messages, message],
        }
      })
    }

    // Listen for typing indicators
    const handleUserTyping = (data: { userId: string; userName: string }) => {
      // Don't show if it's the current user
      if (data.userId === currentUserId) return

      setTypingUsers((prev) => {
        // Avoid duplicates
        if (prev.some((u) => u.userId === data.userId)) return prev
        return [...prev, data]
      })
    }

    const handleUserStoppedTyping = (data: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId))
    }

    // Listen for message read events
    const handleMessageRead = (data: { messageId: string; readerId: string; readerName: string; readAt: string }) => {
      queryClient.setQueryData(['chat', roomId, 'messages'], (old: any) => {
        if (!old) return old

        return {
          ...old,
          messages: old.messages.map((msg: any) =>
            msg.id === data.messageId
              ? {
                  ...msg,
                  reads: [
                    ...(msg.reads || []),
                    {
                      readerId: data.readerId,
                      readAt: data.readAt,
                      reader: { name: data.readerName },
                    },
                  ],
                }
              : msg
          ),
        }
      })
    }

    const handleMessageEdit = (data: { messageId: string; content: string; isEdited: boolean; editedAt: string }) => {
      queryClient.setQueryData(['chat', roomId, 'messages'], (old: any) => {
        if (!old) return old

        return {
          ...old,
          messages: old.messages.map((msg: any) =>
            msg.id === data.messageId
              ? { ...msg, content: data.content, isEdited: data.isEdited, editedAt: data.editedAt }
              : msg
          ),
        }
      })
    }

    // Listen for message reaction events
    const handleMessageReaction = (data: {
      messageId: string
      userId: string
      userName: string
      emoji: string
      action: 'added' | 'removed'
    }) => {
      queryClient.setQueryData(['chat', roomId, 'messages'], (old: any) => {
        if (!old) return old

        return {
          ...old,
          messages: old.messages.map((msg: any) => {
            if (msg.id !== data.messageId) return msg

            const reactions = msg.reactions || []

            if (data.action === 'added') {
              // Add reaction (check if it already exists to avoid duplicates)
              const exists = reactions.some(
                (r: any) => r.userId === data.userId && r.emoji === data.emoji
              )
              if (exists) return msg

              return {
                ...msg,
                reactions: [
                  ...reactions,
                  {
                    id: `temp-${Date.now()}`,
                    userId: data.userId,
                    emoji: data.emoji,
                    user: { name: data.userName },
                  },
                ],
              }
            } else {
              // Remove reaction
              return {
                ...msg,
                reactions: reactions.filter(
                  (r: any) => !(r.userId === data.userId && r.emoji === data.emoji)
                ),
              }
            }
          }),
        }
      })
    }

    socket.on('new-message', handleNewMessage)
    socket.on('user-typing', handleUserTyping)
    socket.on('user-stopped-typing', handleUserStoppedTyping)
    socket.on('message-read', handleMessageRead)
    socket.on('message-reaction', handleMessageReaction)
    socket.on('message-edit', handleMessageEdit)

    // Cleanup
    return () => {
      socket.off('new-message', handleNewMessage)
      socket.off('user-typing', handleUserTyping)
      socket.off('user-stopped-typing', handleUserStoppedTyping)
      socket.off('message-read', handleMessageRead)
      socket.off('message-reaction', handleMessageReaction)
      socket.off('message-edit', handleMessageEdit)
      socket.emit('leave-room', roomId)
    }
  }, [socket, roomId, queryClient, currentUserId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.messages])

  if (isLoading) {
    return <MessageListSkeleton />
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-destructive">
          Error loading messages: {error.message}
        </p>
      </div>
    )
  }

  const messages = data?.messages || []

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={MessageCircle}
          title="No messages yet"
          description="Start the conversation by sending the first message to your family!"
        />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
      {messages.map((message: any, index: number) => {
        // 날짜 구분선 표시 여부 확인
        const showDateSeparator =
          index === 0 ||
          !isSameDay(new Date(messages[index - 1].createdAt), new Date(message.createdAt))

        return (
          <div key={message.id} id={`message-${message.id}`}>
            {showDateSeparator && <DateSeparator date={message.createdAt} />}
            <MessageItem
              message={message}
              isCurrentUser={message.sender.id === currentUserId}
              currentUserId={currentUserId}
              totalMembers={totalMembers}
              onReply={onReply}
              onRetry={onRetry}
            />
          </div>
        )
      })}
      <TypingIndicator typingUsers={typingUsers} />
      <div ref={messagesEndRef} />
    </div>
  )
}
