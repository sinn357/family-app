import { z } from 'zod'

/**
 * Send message validation schema
 */
export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
