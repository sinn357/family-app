import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Trash2, Reply, Clock, Check, AlertCircle, CheckCheck, Pencil } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useInView } from 'react-intersection-observer'
import { EmojiPicker } from './emoji-picker'
import { MessageReactions } from './message-reactions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface MessageItemProps {
  message: {
    id: string
    roomId: string
    content: string
    imageUrl?: string | null
    mediaUrls?: string[]
    mediaTypes?: Array<'image' | 'video'>
    isDeleted?: boolean
    deletedAt?: string | null
    createdAt: string
    sender: {
      id: string
      name: string
    }
    replyTo?: {
      id: string
      content: string
      sender: {
        name: string
      }
    } | null
    reads?: Array<{
      readerId: string
      readAt: string
      reader: {
        name: string
      }
    }>
    reactions?: Array<{
      id: string
      userId: string
      emoji: string
      user: {
        name: string
      }
    }>
    isEdited?: boolean
    editedAt?: string | null
    status?: 'pending' | 'sent' | 'failed'
  }
  isCurrentUser: boolean
  currentUserId: string
  totalMembers: number
  onReply?: (message: any) => void
  onRetry?: (message: any) => void
}

export function MessageItem({ message, isCurrentUser, currentUserId, totalMembers, onReply, onRetry }: MessageItemProps) {
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Intersection Observer to mark message as read when visible
  const { ref, inView } = useInView({
    threshold: 0.5, // 50% visible
    triggerOnce: true, // Only trigger once
  })

  // Mark message as read when it comes into view
  useEffect(() => {
    if (inView && !isCurrentUser && !hasMarkedAsRead && message.id && !message.id.startsWith('temp-')) {
      // Check if current user already read this message
      const alreadyRead = message.reads?.some(read => read.readerId === currentUserId)

      if (!alreadyRead) {
        markAsRead()
      }
    }
  }, [inView, isCurrentUser, hasMarkedAsRead, message.id, message.reads, currentUserId])

  useEffect(() => {
    if (isEditing) {
      setEditContent(message.content)
    }
  }, [isEditing, message.content])

  async function markAsRead() {
    try {
      setHasMarkedAsRead(true)
      await fetch(`/api/chat/messages/${message.id}/read`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Failed to mark message as read:', error)
      setHasMarkedAsRead(false)
    }
  }

  async function handleReaction(emoji: string) {
    try {
      if (message.id.startsWith('temp-')) {
        toast.error('전송 중인 메시지에는 리액션할 수 없습니다')
        return
      }
      await fetch(`/api/chat/messages/${message.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
        credentials: 'include',
      })
    } catch (error) {
      console.error('Failed to add/remove reaction:', error)
      toast.error('리액션 처리 실패')
    }
  }

  const canEdit =
    isCurrentUser &&
    !message.isDeleted &&
    !message.id.startsWith('temp-') &&
    Date.now() - new Date(message.createdAt).getTime() <= 5 * 60 * 1000

  async function handleSaveEdit() {
    const nextContent = editContent.trim()
    if (!nextContent) {
      toast.error('수정 내용이 비어있습니다')
      return
    }

    try {
      setIsSavingEdit(true)
      const res = await fetch(`/api/chat/messages/${message.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: nextContent }),
        credentials: 'include',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '메시지 수정 실패')
      }

      const data = await res.json()
      queryClient.setQueryData(['chat', message.roomId, 'messages'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          messages: old.messages.map((msg: any) =>
            msg.id === message.id
              ? { ...msg, ...data.message }
              : msg
          ),
        }
      })

      toast.success('메시지를 수정했습니다')
      setIsEditing(false)
    } catch (error) {
      console.error('Edit error:', error)
      toast.error(error instanceof Error ? error.message : '수정 실패')
    } finally {
      setIsSavingEdit(false)
    }
  }

  const formattedTime = new Date(message.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const mediaItems = [
    ...(message.mediaUrls || []).map((url, index) => ({
      url,
      type: message.mediaTypes?.[index] || 'image',
    })),
    ...(message.imageUrl ? [{ url: message.imageUrl, type: 'image' as const }] : []),
  ]

  // Get first letter of sender name for avatar
  const avatarLetter = message.sender.name.charAt(0).toUpperCase()

  // Calculate unread count (total members - sender - readers)
  const getUnreadCount = () => {
    if (!isCurrentUser) return null

    const readsCount = message.reads?.length || 0
    // totalMembers - 1 (sender) - readsCount
    const unreadCount = totalMembers - 1 - readsCount

    return unreadCount > 0 ? unreadCount : null
  }

  // Status icon for current user's messages
  const getStatusIcon = () => {
    if (!isCurrentUser) return null

    // Priority: status > read status
    switch (message.status) {
      case 'pending':
        return <Clock className="w-3 h-3 text-muted-foreground animate-pulse" />
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-destructive" />
      case 'sent':
      default:
        // Show read status
        const unreadCount = getUnreadCount()

        if (unreadCount === null || unreadCount === 0) {
          // All read (CheckCheck with blue color)
          return <CheckCheck className="w-3 h-3 text-blue-500" />
        } else {
          // Some unread (single Check)
          return <Check className="w-3 h-3 text-muted-foreground" />
        }
    }
  }

  const unreadCount = getUnreadCount()

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

            <div
              className={`flex items-center gap-1.5 ${
                isCurrentUser ? 'justify-end mr-2' : 'ml-2'
              }`}
            >
              <p className="text-xs text-muted-foreground">{formattedTime}</p>
              {getStatusIcon()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={ref}
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
              {/* Replied message quote */}
              {message.replyTo && (
                <div className={`mb-2 pl-3 border-l-2 ${isCurrentUser ? 'border-primary-foreground/50' : 'border-primary/50'}`}>
                  <p className={`text-xs font-medium ${isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {message.replyTo.sender.name}
                  </p>
                  <p className={`text-xs mt-0.5 truncate ${isCurrentUser ? 'text-primary-foreground/60' : 'text-muted-foreground/80'}`}>
                    {message.replyTo.content}
                  </p>
                </div>
              )}

              {/* Image if present */}
              {mediaItems.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {mediaItems.map((item, index) => (
                    <div key={`${item.url}-${index}`} className="relative rounded-xl overflow-hidden border border-border/50">
                      {item.type === 'image' ? (
                        <Image
                          src={item.url}
                          alt="첨부 이미지"
                          width={300}
                          height={200}
                          className="object-cover rounded-xl w-full h-auto"
                        />
                      ) : (
                        <video
                          src={item.url}
                          controls
                          className="w-full h-auto rounded-xl"
                          preload="metadata"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {message.content && (
                <p className="text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">
                  {message.content}
                </p>
              )}
            </div>

            {/* Action buttons */}
            {isHovered && !isDeleting && (
              <div className={`absolute ${isCurrentUser ? 'right-2' : 'left-2'} -top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                {/* Emoji reaction button */}
                <EmojiPicker
                  onEmojiSelect={handleReaction}
                  disabled={message.id.startsWith('temp-')}
                />

                {/* Reply button */}
                {onReply && (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => onReply(message)}
                    className="bg-primary/10 hover:bg-primary/20 text-primary"
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </Button>
                )}

                {/* Edit button */}
                {canEdit && (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="bg-primary/10 hover:bg-primary/20 text-primary"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                )}

                {/* Delete button (자신의 메시지에만) */}
                {isCurrentUser && (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={handleDelete}
                    className="bg-destructive/10 hover:bg-destructive/20 text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Timestamp with status and unread count */}
          <div
            className={`flex items-center gap-1.5 ${
              isCurrentUser ? 'justify-end mr-2' : 'ml-2'
            }`}
          >
            {/* Unread count (카카오톡 스타일 - "1", "2") */}
            {isCurrentUser && unreadCount !== null && unreadCount > 0 && (
              <span className="text-xs font-medium text-destructive">
                {unreadCount}
              </span>
            )}
            <p className="text-xs text-muted-foreground">
              {formattedTime}
              {message.isEdited && <span className="ml-1">(수정됨)</span>}
            </p>
            {getStatusIcon()}
            {message.status === 'failed' && onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRetry(message)}
                className="h-5 px-2 text-xs text-destructive hover:text-destructive"
              >
                재전송
              </Button>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`${isCurrentUser ? 'mr-2' : 'ml-2'}`}>
              <MessageReactions
                reactions={message.reactions}
                currentUserId={currentUserId}
                onReactionClick={handleReaction}
              />
            </div>
          )}
        </div>
      </div>

      <EditMessageDialog
        isOpen={isEditing}
        onOpenChange={setIsEditing}
        editContent={editContent}
        onChange={setEditContent}
        onSave={handleSaveEdit}
        isSaving={isSavingEdit}
      />
    </div>
  )
}

function EditMessageDialog({
  isOpen,
  onOpenChange,
  editContent,
  onChange,
  onSave,
  isSaving,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editContent: string
  onChange: (value: string) => void
  onSave: () => void
  isSaving: boolean
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>메시지 수정</DialogTitle>
          <DialogDescription>수정은 5분 이내에만 가능합니다.</DialogDescription>
        </DialogHeader>
        <Textarea
          value={editContent}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[120px]"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            취소
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
