'use client'

import { useEffect, useRef } from 'react'
import { useChatMessages } from '@/lib/hooks/use-chat'
import { MessageItem } from './message-item'

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
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-red-500">
          Error loading messages: {error.message}
        </p>
      </div>
    )
  }

  const messages = data?.messages || []

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">
          No messages yet. Start the conversation!
        </p>
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
