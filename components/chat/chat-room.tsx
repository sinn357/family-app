'use client'

import { MessageList } from './message-list'
import { MessageInput } from './message-input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ChatRoomProps {
  roomId: string
  roomName: string
  currentUserId: string
}

export function ChatRoom({ roomId, roomName, currentUserId }: ChatRoomProps) {
  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-12rem)] max-h-screen">
      <CardHeader className="border-b px-4 py-3 md:px-6 md:py-4">
        <CardTitle className="text-lg md:text-xl">{roomName}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <MessageList roomId={roomId} currentUserId={currentUserId} />
        <MessageInput roomId={roomId} />
      </CardContent>
    </Card>
  )
}
