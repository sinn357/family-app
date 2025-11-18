import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateTodoInput, UpdateTodoInput } from '@/lib/validations/todo'

/**
 * Get all todos with optional filter
 */
export function useTodos(filter?: 'all' | 'assignedToMe' | 'createdByMe') {
  return useQuery({
    queryKey: ['todos', filter],
    queryFn: async () => {
      const params = filter && filter !== 'all' ? `?filter=${filter}` : ''
      const res = await fetch(`/api/todos${params}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch todos')
      }
      return res.json()
    },
  })
}

/**
 * Create a new todo
 */
export function useCreateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTodoInput) => {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create todo')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

/**
 * Update a todo
 */
export function useUpdateTodo(todoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateTodoInput) => {
      const res = await fetch(`/api/todos/${todoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update todo')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

/**
 * Toggle todo isDone status
 */
export function useToggleTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ todoId, isDone }: { todoId: string; isDone: boolean }) => {
      const res = await fetch(`/api/todos/${todoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDone }),
        credentials: 'include',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update todo')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

/**
 * Delete a todo
 */
export function useDeleteTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (todoId: string) => {
      const res = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete todo')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
