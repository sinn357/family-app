import { z } from 'zod'

/**
 * Create post validation schema
 */
export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  content: z.string().min(1, 'Content is required'),
})

export type CreatePostInput = z.infer<typeof createPostSchema>

/**
 * Update post validation schema
 */
export const updatePostSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  content: z.string().min(1).optional(),
})

export type UpdatePostInput = z.infer<typeof updatePostSchema>

/**
 * Create comment validation schema
 */
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>

/**
 * Update comment validation schema
 */
export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
})

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>
