import { z } from 'zod'

/**
 * Create member validation schema
 */
export const createMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  role: z.enum(['MEMBER', 'ADMIN']),
})

export type CreateMemberInput = z.infer<typeof createMemberSchema>

/**
 * Update member validation schema
 */
export const updateMemberSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  password: z.string().min(4).optional(),
})

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
