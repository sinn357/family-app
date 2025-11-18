'use client'

import { useState, KeyboardEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sendMessageSchema, type SendMessageInput } from '@/lib/validations/chat'
import { useSendMessage } from '@/lib/hooks/use-chat'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface MessageInputProps {
  roomId: string
}

export function MessageInput({ roomId }: MessageInputProps) {
  const sendMessage = useSendMessage(roomId)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<SendMessageInput>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      content: '',
    },
  })

  async function onSubmit(data: SendMessageInput) {
    try {
      setError(null)
      await sendMessage.mutateAsync(data)
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
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
    <div className="border-t border-gray-200 p-4 bg-white">
      {error && (
        <div className="mb-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
        <Textarea
          placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
          className="flex-1 resize-none"
          rows={2}
          disabled={sendMessage.isPending}
          onKeyDown={handleKeyDown}
          {...form.register('content')}
        />
        <Button
          type="submit"
          disabled={sendMessage.isPending || !form.watch('content')?.trim()}
          className="self-end"
        >
          {sendMessage.isPending ? 'Sending...' : 'Send'}
        </Button>
      </form>
      {form.formState.errors.content && (
        <p className="text-sm text-red-600 mt-1">
          {form.formState.errors.content.message}
        </p>
      )}
    </div>
  )
}
