'use client'

import { useEffect, useRef } from 'react'
import { useChatMessages } from '@/lib/hooks/use-chat'
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
  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
