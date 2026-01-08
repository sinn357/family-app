'use client'

import { useState, KeyboardEvent, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sendMessageSchema, type SendMessageInput } from '@/lib/validations/chat'
import { useSendMessage } from '@/lib/hooks/use-chat'
import { useSocket } from '@/lib/hooks/use-socket'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MediaUpload, type MediaItem } from '@/components/ui/media-upload'
import { ReplyPreview } from './reply-preview'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { toast } from 'sonner'

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
          {/* Media Upload */}
          <FormItem>
            <FormLabel className="text-xs font-medium text-muted-foreground">
              📎 사진/동영상 첨부 (선택)
            </FormLabel>
            <FormControl>
              <MediaUpload
                value={mediaItems}
                onChange={setMediaItems}
                disabled={sendMessage.isPending}
              />
            </FormControl>
          </FormItem>

          {/* Message Input and Send Button */}
          <div className="flex gap-3">
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
                (!form.watch('content')?.trim() && mediaItems.length === 0)
              }
              className="self-end"
            >
              {sendMessage.isPending ? '📤' : '🚀'}
            </Button>
          </div>

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
