'use client'

import { useState, KeyboardEvent, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sendMessageSchema, type SendMessageInput } from '@/lib/validations/chat'
import { useSendMessage } from '@/lib/hooks/use-chat'
import { useSocket } from '@/lib/hooks/use-socket'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/ui/image-upload'
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
}

export function MessageInput({ roomId, currentUserId, currentUserName }: MessageInputProps) {
  const sendMessage = useSendMessage(roomId)
  const { socket } = useSocket()
  const [error, setError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const form = useForm<SendMessageInput>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      content: '',
      imageUrl: null,
    },
  })

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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message'
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
    <div className="border-t border-gray-200 p-3 md:p-4 bg-white">
      {error && (
        <div className="mb-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 md:space-y-3">
          {/* Image Upload */}
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-gray-600">
                  Attach Image (Optional)
                </FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value || undefined}
                    onChange={field.onChange}
                    disabled={sendMessage.isPending}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Message Input and Send Button */}
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      placeholder="Type a message..."
                      className="resize-none text-sm md:text-base"
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
              disabled={sendMessage.isPending || !form.watch('content')?.trim()}
              className="self-end px-3 md:px-4"
            >
              {sendMessage.isPending ? 'Sending...' : 'Send'}
            </Button>
          </div>

          {form.formState.errors.content && (
            <p className="text-sm text-red-600">
              {form.formState.errors.content.message}
            </p>
          )}
        </form>
      </Form>
    </div>
  )
}
