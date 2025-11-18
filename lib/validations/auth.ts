import { z } from 'zod'

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().min(4, 'Password must be at least 4 characters'),
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Signup validation schema
 */
export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  confirmPassword: z.string().min(4, 'Password must be at least 4 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type SignupInput = z.infer<typeof signupSchema>
