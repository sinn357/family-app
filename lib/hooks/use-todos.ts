import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateTodoInput, UpdateTodoInput } from '@/lib/validations/todo'
import { handleApiError } from '@/lib/utils/error'

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
        await handleApiError(res)
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
        await handleApiError(res)
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
        await handleApiError(res)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

/**
 * Toggle todo isDone status with optimistic update
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
        await handleApiError(res)
      }
      return res.json()
    },
    // Optimistic update
    onMutate: async ({ todoId, isDone }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      // Snapshot the previous value
      const previousTodos = queryClient.getQueriesData({ queryKey: ['todos'] })

      // Optimistically update all todo queries
      queryClient.setQueriesData<any>({ queryKey: ['todos'] }, (old: any) => {
        if (!old?.todos) return old
        return {
          ...old,
          todos: old.todos.map((todo: any) =>
            todo.id === todoId ? { ...todo, isDone } : todo
          ),
        }
      })

      // Return context with previous data for rollback
      return { previousTodos }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        context.previousTodos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      // Refetch after mutation completes
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

/**
 * Delete a todo with optimistic update
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
        await handleApiError(res)
      }
      return res.json()
    },
    // Optimistic update
    onMutate: async (todoId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      // Snapshot the previous value
      const previousTodos = queryClient.getQueriesData({ queryKey: ['todos'] })

      // Optimistically remove the todo
      queryClient.setQueriesData<any>({ queryKey: ['todos'] }, (old: any) => {
        if (!old?.todos) return old
        return {
          ...old,
          todos: old.todos.filter((todo: any) => todo.id !== todoId),
        }
      })

      return { previousTodos }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        context.previousTodos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
