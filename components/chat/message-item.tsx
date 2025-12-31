import Image from 'next/image'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface MessageItemProps {
  message: {
    id: string
    content: string
    imageUrl?: string | null
    isDeleted?: boolean
    deletedAt?: string | null
    createdAt: string
    sender: {
      id: string
      name: string
    }
  }
  isCurrentUser: boolean
}

export function MessageItem({ message, isCurrentUser }: MessageItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const formattedTime = new Date(message.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // Get first letter of sender name for avatar
  const avatarLetter = message.sender.name.charAt(0).toUpperCase()

  async function handleDelete() {
    if (!confirm('이 메시지를 삭제하시겠습니까?')) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/chat/messages/${message.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '메시지 삭제 실패')
      }

      toast.success('메시지가 삭제되었습니다')
      // 메시지 목록은 자동으로 refetch됨 (React Query)
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : '삭제 실패')
      setIsDeleting(false)
    }
  }

  // 삭제된 메시지 표시
  if (message.isDeleted) {
    return (
      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 md:mb-5 px-2`}>
        <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar (삭제된 메시지도 표시) */}
          {!isCurrentUser && (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold flex-shrink-0">
              {avatarLetter}
            </div>
          )}

          <div className="flex flex-col gap-1">
            {!isCurrentUser && (
              <p className="text-xs font-medium text-muted-foreground ml-2">{message.sender.name}</p>
            )}

            {/* 삭제된 메시지 버블 */}
            <div className="rounded-2xl px-4 py-2.5 md:px-5 md:py-3 bg-muted/30 border border-dashed border-muted-foreground/30">
              <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                <span>🚫</span>
                <span>삭제된 메시지입니다</span>
              </p>
            </div>

            <p className={`text-xs text-muted-foreground ${isCurrentUser ? 'text-right mr-2' : 'ml-2'}`}>
              {formattedTime}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 md:mb-5 px-2 animate-in fade-in slide-in-from-bottom-2 duration-300 group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} relative`}>
        {/* Avatar */}
        {!isCurrentUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
            {avatarLetter}
          </div>
        )}

        <div className="flex flex-col gap-1 relative">
          {/* Sender name for others */}
          {!isCurrentUser && (
            <p className="text-xs font-medium text-muted-foreground ml-2">{message.sender.name}</p>
          )}

          {/* Message bubble */}
          <div className="relative">
            <div
              className={`rounded-2xl px-4 py-2.5 md:px-5 md:py-3 shadow-md transition-all duration-200 hover:shadow-lg ${
                isCurrentUser
                  ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm'
                  : 'bg-card/80 backdrop-blur-md text-card-foreground border border-border/50 rounded-bl-sm'
              }`}
            >
              {/* Image if present */}
              {message.imageUrl && (
                <div className="relative w-full mb-3 rounded-xl overflow-hidden">
                  <Image
                    src={message.imageUrl}
                    alt="첨부 이미지"
                    width={300}
                    height={200}
                    className="object-cover rounded-xl w-full h-auto"
                  />
                </div>
              )}

              <p className="text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">
                {message.content}
              </p>
            </div>

            {/* Delete button (자신의 메시지에만 표시) */}
            {isCurrentUser && isHovered && !isDeleting && (
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={handleDelete}
                className={`absolute ${isCurrentUser ? '-left-10' : '-right-10'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/10 hover:bg-destructive/20 text-destructive`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Timestamp */}
          <p
            className={`text-xs text-muted-foreground ${
              isCurrentUser ? 'text-right mr-2' : 'ml-2'
            }`}
          >
            {formattedTime}
          </p>
        </div>
      </div>
    </div>
  )
}
