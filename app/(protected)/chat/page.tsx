'use client'

import { useChatRooms } from '@/lib/hooks/use-chat'
import { ChatRoom } from '@/components/chat/chat-room'
import { useEffect, useState } from 'react'

export default function ChatPage() {
  const { data, isLoading, error } = useChatRooms()
  const [currentUserId, setCurrentUserId] = useState<string>('')

  // Get current user ID from session
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session', {
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          setCurrentUserId(data.member.id)
        }
      } catch (err) {
        console.error('Failed to fetch session:', err)
      }
    }
    fetchSession()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <p className="text-gray-500">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <p className="text-red-500">Error loading chat: {error.message}</p>
        </div>
      </div>
    )
  }

  const rooms = data?.rooms || []
  const defaultRoom = rooms.find((room: any) => room.isDefault) || rooms[0]

  if (!defaultRoom) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <p className="text-gray-500">No chat rooms available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <ChatRoom
        roomId={defaultRoom.id}
        roomName={defaultRoom.name}
        currentUserId={currentUserId}
      />
    </div>
  )
}
