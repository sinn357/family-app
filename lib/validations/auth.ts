import { z } from 'zod'

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().min(4, 'Password must be at least 4 characters'),
})

export type LoginInput = z.infer<typeof loginSchema>
