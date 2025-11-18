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
    <Card className="flex flex-col h-[calc(100vh-12rem)]">
      <CardHeader className="border-b">
        <CardTitle>{roomName}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <MessageList roomId={roomId} currentUserId={currentUserId} />
        <MessageInput roomId={roomId} />
      </CardContent>
    </Card>
  )
}
