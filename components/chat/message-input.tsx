'use client'

import { useState, KeyboardEvent, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sendMessageSchema, type SendMessageInput } from '@/lib/validations/chat'
import { useSendMessage } from '@/lib/hooks/use-chat'
import { useSocket } from '@/lib/hooks/use-socket'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { MediaItem } from '@/components/ui/media-upload'
import { ReplyPreview } from './reply-preview'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { Plus, X, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface MessageInputProps {
  roomId: string
  currentUserId: string
  currentUserName: string
  replyingTo?: any | null
  onCancelReply?: () => void
  retryMessage?: any | null
}

export function MessageInput({ roomId, currentUserId, currentUserName, replyingTo, onCancelReply, retryMessage }: MessageInputProps) {
  const sendMessage = useSendMessage(roomId, currentUserId, currentUserName)
  const { socket } = useSocket()
  const [error, setError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const form = useForm<SendMessageInput>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      content: '',
      mediaUrls: [],
      mediaTypes: [],
      replyToId: null,
    },
  })

  // Update replyToId when replyingTo changes
  useEffect(() => {
    if (replyingTo) {
      form.setValue('replyToId', replyingTo.id)
    } else {
      form.setValue('replyToId', null)
    }
  }, [replyingTo, form])

  // Auto-retry failed message
  useEffect(() => {
    if (retryMessage) {
      const retryData = {
        content: retryMessage.content,
        mediaUrls: retryMessage.mediaUrls || [],
        mediaTypes: retryMessage.mediaTypes || [],
        replyToId: retryMessage.replyToId || null,
      }
      sendMessage.mutate(retryData)
    }
  }, [retryMessage, sendMessage])

  useEffect(() => {
    form.setValue('mediaUrls', mediaItems.map((item) => item.url))
    form.setValue('mediaTypes', mediaItems.map((item) => item.type))
  }, [mediaItems, form])

  const handleAttachClick = () => {
    if (isUploading) return
    fileInputRef.current?.click()
  }

  const handleRemoveMedia = (index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (mediaItems.length + files.length > 10) {
      toast.error('최대 10개까지 첨부할 수 있습니다')
      return
    }

    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      if (!isImage && !isVideo) {
        toast.error('이미지 또는 동영상만 첨부할 수 있습니다')
        return false
      }

      const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error(isVideo ? '동영상은 100MB 이하만 가능합니다' : '이미지는 5MB 이하만 가능합니다')
        return false
      }

      return true
    })

    if (validFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress({ current: 0, total: validFiles.length })

    try {
      const uploaded: MediaItem[] = []
      for (let i = 0; i < validFiles.length; i += 1) {
        const file = validFiles[i]
        setUploadProgress({ current: i + 1, total: validFiles.length })

        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })

        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || 'Upload failed')
        }

        const data = await res.json()
        uploaded.push({ url: data.url, type: data.type })
      }

      setMediaItems((prev) => [...prev, ...uploaded])
      toast.success('첨부 완료')
    } catch (error) {
      console.error('Media upload error:', error)
      toast.error(error instanceof Error ? error.message : '첨부 실패')
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || !roomId) return

    // Emit typing-start if not already typing
    if (!isTyping) {
      setIsTyping(true)
      socket.emit('typing-start', {
        roomId,
        userId: currentUserId,
        userName: currentUserName,
      })
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      socket.emit('typing-stop', {
        roomId,
        userId: currentUserId,
      })
    }, 3000)
  }

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (socket && isTyping) {
        socket.emit('typing-stop', {
          roomId,
          userId: currentUserId,
        })
      }
    }
  }, [socket, roomId, currentUserId, isTyping])

  async function onSubmit(data: SendMessageInput) {
    try {
      setError(null)

      // Stop typing indicator before sending
      if (isTyping && socket) {
        setIsTyping(false)
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        socket.emit('typing-stop', {
          roomId,
          userId: currentUserId,
        })
      }

      await sendMessage.mutateAsync(data)
      form.reset()
      setMediaItems([])

      // Cancel reply after sending
      if (onCancelReply) {
        onCancelReply()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '메시지 전송 실패'
      setError(message)
      toast.error(message)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      form.handleSubmit(onSubmit)()
    }
  }

  return (
    <div className="border-t border-border/50 bg-card/50 backdrop-blur-md">
      {/* Reply Preview */}
      {replyingTo && onCancelReply && (
        <div className="px-4 pt-3">
          <ReplyPreview message={replyingTo} onCancel={onCancelReply} />
        </div>
      )}

      <div className="p-4 md:p-5">
        {error && (
          <div className="mb-3 text-sm text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">
            {error}
          </div>
        )}
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            disabled={sendMessage.isPending || isUploading}
            className="hidden"
          />

          {mediaItems.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {mediaItems.map((item, index) => (
                <div key={`${item.url}-${index}`} className="relative rounded-lg overflow-hidden border border-border">
                  {item.type === 'image' ? (
                    <div className="relative aspect-video">
                      <Image
                        src={item.url}
                        alt="첨부 이미지"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <video
                      src={item.url}
                      controls
                      className="h-28 w-full object-cover"
                      preload="metadata"
                    />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => handleRemoveMedia(index)}
                    disabled={sendMessage.isPending || isUploading}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Message Input and Send Button */}
          <div className="flex gap-3 items-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleAttachClick}
              disabled={sendMessage.isPending || isUploading}
              className="h-10 w-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
            </Button>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      placeholder="메시지를 입력하세요... (Enter로 전송)"
                      className="resize-none text-sm md:text-base min-h-[60px] rounded-xl"
                      rows={2}
                      disabled={sendMessage.isPending}
                      onKeyDown={handleKeyDown}
                      onChange={(e) => {
                        field.onChange(e)
                        handleTyping()
                      }}
                      value={field.value}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="lg"
              disabled={
                sendMessage.isPending ||
                isUploading ||
                (!form.watch('content')?.trim() && mediaItems.length === 0)
              }
              className="self-end"
            >
              {sendMessage.isPending ? '📤' : '🚀'}
            </Button>
          </div>

          {uploadProgress && (
            <p className="text-xs text-muted-foreground">
              업로드 {uploadProgress.current}/{uploadProgress.total}
            </p>
          )}

          {form.formState.errors.content && (
            <p className="text-sm text-destructive">
              {form.formState.errors.content.message}
            </p>
          )}
        </form>
      </Form>
      </div>
    </div>
  )
}
