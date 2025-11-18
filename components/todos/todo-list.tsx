'use client'

import { useTodos } from '@/lib/hooks/use-todos'
import { TodoItem } from './todo-item'

interface TodoListProps {
  filter: 'all' | 'assignedToMe' | 'createdByMe'
  currentUserId: string
}

export function TodoList({ filter, currentUserId }: TodoListProps) {
  const { data, isLoading, error } = useTodos(filter)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading todos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">Error loading todos: {error.message}</p>
      </div>
    )
  }

  const todos = data?.todos || []

  if (todos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">No todos found. Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {todos.map((todo: any) => (
        <TodoItem key={todo.id} todo={todo} currentUserId={currentUserId} />
      ))}
    </div>
  )
}
