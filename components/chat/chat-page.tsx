'use client'

import { useChatRooms } from '@/lib/hooks/use-chat'
import { useSocket } from '@/lib/hooks/use-socket'
import { ChatRoom } from '@/components/chat/chat-room'
import { OnlineUsers } from '@/components/chat/online-users'
import { useEffect, useState } from 'react'

export function ChatPage() {
  const { data, isLoading, error } = useChatRooms()
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [currentUserName, setCurrentUserName] = useState<string>('')

  // Initialize socket with user info
  const { onlineUsers } = useSocket({
    userId: currentUserId,
    userName: currentUserName,
  })

  // Get current user ID and name from session
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session', {
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          setCurrentUserId(data.member.id)
          setCurrentUserName(data.member.name)
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
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <p className="text-destructive">Error loading chat: {error.message}</p>
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
          <p className="text-muted-foreground">No chat rooms available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 px-2 md:py-8 md:px-4 space-y-4 md:space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card/70 p-4 md:p-6 backdrop-blur-md">
        <h1 className="text-2xl md:text-3xl font-bold">가족 채팅</h1>
        <p className="text-sm text-muted-foreground mt-1">
          오늘의 이야기를 나누고 사진과 동영상을 공유해요.
        </p>
      </div>
      <OnlineUsers onlineUsers={onlineUsers} currentUserId={currentUserId} />
      <ChatRoom
        roomId={defaultRoom.id}
        roomName={defaultRoom.name}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
      />
    </div>
  )
}
