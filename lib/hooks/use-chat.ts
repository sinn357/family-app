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
 * Get messages from a chat room with polling
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
    refetchInterval: 3000, // Poll every 3 seconds
  })
}

/**
 * Send a message to a chat room
 */
export function useSendMessage(roomId: string) {
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
    onSuccess: () => {
      // Invalidate messages query to refetch
      queryClient.invalidateQueries({ queryKey: ['chat', roomId, 'messages'] })
    },
  })
}
