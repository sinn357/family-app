import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { SendMessageInput } from '@/lib/validations/chat'

/**
 * Get all chat rooms
 */
export function useChatRooms() {
  return useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: async () => {
      const res = await fetch('/api/chat/rooms', {
        credentials: 'include',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch rooms')
      }
      return res.json()
    },
  })
}

/**
 * Get messages from a chat room (real-time via WebSocket)
 */
export function useChatMessages(roomId: string) {
  return useQuery({
    queryKey: ['chat', roomId, 'messages'],
    queryFn: async () => {
      const res = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        credentials: 'include',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch messages')
      }
      return res.json()
    },
    enabled: !!roomId,
    // Removed polling - using WebSocket for real-time updates
  })
}

/**
 * Send a message to a chat room (with optimistic update)
 */
export function useSendMessage(roomId: string, currentUserId: string, currentUserName: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: SendMessageInput) => {
      const res = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to send message')
      }
      return res.json()
    },

    // Optimistic update - add message immediately with pending status
    onMutate: async (newMessage) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chat', roomId, 'messages'] })

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData(['chat', roomId, 'messages'])

      // Optimistically update cache
      const tempId = `temp-${Date.now()}`

      queryClient.setQueryData(['chat', roomId, 'messages'], (old: any) => {
        if (!old) return old

        // Find replyTo message if replyToId exists
        let replyToData = null
        if (newMessage.replyToId) {
          const replyMsg = old.messages.find((msg: any) => msg.id === newMessage.replyToId)
          if (replyMsg) {
            replyToData = {
              id: replyMsg.id,
              content: replyMsg.content,
              sender: {
                name: replyMsg.sender.name,
              },
            }
          }
        }

        const tempMessage = {
          id: tempId, // Temporary ID
          roomId,
          senderId: currentUserId,
          content: newMessage.content?.trim() || '',
          mediaUrls: newMessage.mediaUrls || [],
          mediaTypes: newMessage.mediaTypes || [],
          replyToId: newMessage.replyToId || null,
          replyTo: replyToData,
          createdAt: new Date().toISOString(),
          sender: {
            id: currentUserId,
            name: currentUserName,
          },
          reads: [], // Empty reads for new message
          reactions: [], // Empty reactions for new message
          status: 'pending' as const, // Sending status
        }

        return {
          ...old,
          messages: [...old.messages, tempMessage],
        }
      })

      return { previousMessages, tempId }
    },

    // On error, mark temp message as failed
    onError: (err, newMessage, context) => {
      queryClient.setQueryData(['chat', roomId, 'messages'], (old: any) => {
        if (!old) return old

        // Find temp message and mark as failed
        return {
          ...old,
          messages: old.messages.map((msg: any) =>
            msg.id === context?.tempId
              ? { ...msg, status: 'failed' as const }
              : msg
          ),
        }
      })
    },

    // On success, replace temp message with real message from server
    onSuccess: (data, _variables, context) => {
      queryClient.setQueryData(['chat', roomId, 'messages'], (old: any) => {
        if (!old) return old

        // Remove temp message and let WebSocket add the real one
        return {
          ...old,
          messages: old.messages.filter((msg: any) => msg.id !== context?.tempId),
        }
      })
    },
  })
}
