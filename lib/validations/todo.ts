import { z } from 'zod'

/**
 * Create todo validation schema
 */
export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  description: z.string().max(5000).optional(),
  assignedTo: z.string().cuid().optional(),
})

export type CreateTodoInput = z.infer<typeof createTodoSchema>

/**
 * Update todo validation schema
 */
export const updateTodoSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).optional(),
  isDone: z.boolean().optional(),
  assignedTo: z.string().cuid().nullable().optional(),
})

export type UpdateTodoInput = z.infer<typeof updateTodoSchema>
