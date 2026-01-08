import { z } from 'zod'

/**
 * Send message validation schema
 */
export const sendMessageSchema = z.object({
  content: z.string().max(5000).optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  mediaTypes: z.array(z.enum(['image', 'video'])).optional(),
  replyToId: z.string().optional().nullable(),
}).refine((data) => {
  const hasContent = !!data.content && data.content.trim().length > 0
  const hasMedia = (data.mediaUrls?.length || 0) > 0
  return hasContent || hasMedia
}, {
  message: 'Message cannot be empty',
  path: ['content'],
}).refine((data) => {
  if (!data.mediaUrls || !data.mediaTypes) return true
  return data.mediaUrls.length === data.mediaTypes.length
}, {
  message: 'Media URLs and types must have the same length',
  path: ['mediaTypes'],
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
