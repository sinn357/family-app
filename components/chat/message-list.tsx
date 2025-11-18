'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useChatMessages } from '@/lib/hooks/use-chat'
import { useSocket } from '@/lib/hooks/use-socket'
import { MessageItem } from './message-item'
import { EmptyState } from '@/components/ui/empty-state'
import { MessageListSkeleton } from './message-skeleton'
import { MessageCircle } from 'lucide-react'

interface MessageListProps {
  roomId: string
  currentUserId: string
}

export function MessageList({ roomId, currentUserId }: MessageListProps) {
  const { data, isLoading, error } = useChatMessages(roomId)
  const { socket, isConnected } = useSocket()
  const queryClient = useQueryClient()
  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

    socket.on('new-message', handleNewMessage)

    // Cleanup
    return () => {
      socket.off('new-message', handleNewMessage)
      socket.emit('leave-room', roomId)
    }
  }, [socket, roomId, queryClient])

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
      {messages.map((message: any) => (
        <MessageItem
          key={message.id}
          message={message}
          isCurrentUser={message.sender.id === currentUserId}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
