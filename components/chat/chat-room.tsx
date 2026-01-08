'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { MessageList } from './message-list'
import { MessageInput } from './message-input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChatMessages } from '@/lib/hooks/use-chat'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Images, Search } from 'lucide-react'

interface ChatRoomProps {
  roomId: string
  roomName: string
  currentUserId: string
  currentUserName: string
}

export function ChatRoom({ roomId, roomName, currentUserId, currentUserName }: ChatRoomProps) {
  const [replyingTo, setReplyingTo] = useState<any | null>(null)
  const [retryMessage, setRetryMessage] = useState<any | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null)
  const queryClient = useQueryClient()
  const { data } = useChatMessages(roomId)

  const handleReply = (message: any) => {
    setReplyingTo(message)
  }

  const handleCancelReply = () => {
    setReplyingTo(null)
  }

  const handleRetry = (message: any) => {
    // Remove failed message from cache
    queryClient.setQueryData(['chat', roomId, 'messages'], (old: any) => {
      if (!old) return old
      return {
        ...old,
        messages: old.messages.filter((msg: any) => msg.id !== message.id),
      }
    })

    // Set retry message to trigger re-send
    setRetryMessage(message)

    // Clear retry message after a short delay
    setTimeout(() => setRetryMessage(null), 100)
  }

  useEffect(() => {
    if (!isSearchOpen) {
      setSearchQuery('')
      setSearchResults([])
    }
  }, [isSearchOpen])

  useEffect(() => {
    if (!isSearchOpen) return
    const trimmed = searchQuery.trim()
    if (trimmed.length < 2) {
      setSearchResults([])
      return
    }

    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true)
        const res = await fetch(`/api/chat/rooms/${roomId}/messages?search=${encodeURIComponent(trimmed)}`, {
          credentials: 'include',
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || '검색 실패')
        }
        const payload = await res.json()
        setSearchResults(payload.messages || [])
      } catch (error) {
        console.error('Search error:', error)
        toast.error(error instanceof Error ? error.message : '검색 실패')
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchQuery, isSearchOpen, roomId])

  const mediaItems = useMemo((): Array<{
    url: string
    type: 'image' | 'video'
    messageId: string
    senderName?: string
    createdAt: string
  }> => {
    const messages = data?.messages || []
    return messages.flatMap((message: any) => {
      const items = [
        ...(message.mediaUrls || []).map((url: string, index: number) => ({
          url,
          type: message.mediaTypes?.[index] || 'image',
          messageId: message.id,
          senderName: message.sender?.name,
          createdAt: message.createdAt,
        })),
        ...(message.imageUrl ? [{
          url: message.imageUrl,
          type: 'image',
          messageId: message.id,
          senderName: message.sender?.name,
          createdAt: message.createdAt,
        }] : []),
      ]
      return items
    })
  }, [data?.messages])

  const handleSelectSearchResult = (messageId: string) => {
    const target = document.getElementById(`message-${messageId}`)
    if (!target) {
      toast.error('현재 화면에 없는 메시지입니다')
      return
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setIsSearchOpen(false)
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-12rem)] max-h-screen">
      <CardHeader className="border-b px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg md:text-xl">{roomName}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setIsGalleryOpen(true)}>
              <Images className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <MessageList
          roomId={roomId}
          currentUserId={currentUserId}
          onReply={handleReply}
          onRetry={handleRetry}
        />
        <MessageInput
          roomId={roomId}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          replyingTo={replyingTo}
          onCancelReply={handleCancelReply}
          retryMessage={retryMessage}
        />
      </CardContent>

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>채팅 검색</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="메시지를 검색하세요 (2자 이상)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="max-h-80 overflow-y-auto space-y-2">
            {isSearching && (
              <p className="text-sm text-muted-foreground">검색 중...</p>
            )}
            {!isSearching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground">검색 결과가 없습니다</p>
            )}
            {searchResults.map((message) => (
              <button
                key={message.id}
                className="w-full text-left rounded-lg border border-border/60 p-3 hover:bg-accent/40 transition-colors"
                onClick={() => handleSelectSearchResult(message.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{message.sender?.name || '알 수 없음'}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <p className="text-sm mt-1 line-clamp-2">{message.content || '미디어 메시지'}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>미디어 갤러리</DialogTitle>
          </DialogHeader>
          {mediaItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">첨부된 미디어가 없습니다</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {mediaItems.map((item, index) => (
                <button
                  key={`${item.url}-${index}`}
                  onClick={() => setActiveMediaIndex(index)}
                  className="relative rounded-lg overflow-hidden border border-border/60"
                >
                  {item.type === 'image' ? (
                    <img src={item.url} alt="미디어" className="w-full h-28 object-cover" />
                  ) : (
                    <video src={item.url} className="w-full h-28 object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={activeMediaIndex !== null} onOpenChange={(open) => !open && setActiveMediaIndex(null)}>
        <DialogContent className="sm:max-w-3xl">
          {activeMediaIndex !== null && mediaItems[activeMediaIndex] && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{mediaItems[activeMediaIndex].senderName || '알 수 없음'}</span>
                <span>{new Date(mediaItems[activeMediaIndex].createdAt).toLocaleString('ko-KR')}</span>
              </div>
              {mediaItems[activeMediaIndex].type === 'image' ? (
                <img
                  src={mediaItems[activeMediaIndex].url}
                  alt="미디어"
                  className="w-full max-h-[70vh] object-contain rounded-lg"
                />
              ) : (
                <video
                  src={mediaItems[activeMediaIndex].url}
                  controls
                  className="w-full max-h-[70vh] rounded-lg"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
