'use client'

import { useTodos } from '@/lib/hooks/use-todos'
import { TodoItem } from './todo-item'
import { EmptyState } from '@/components/ui/empty-state'
import { TodoListSkeleton } from './todo-skeleton'
import { CheckSquare } from 'lucide-react'

interface TodoListProps {
  filter: 'all' | 'assignedToMe' | 'createdByMe'
  currentUserId: string
}

export function TodoList({ filter, currentUserId }: TodoListProps) {
  const { data, isLoading, error } = useTodos(filter)

  if (isLoading) {
    return <TodoListSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">Error loading todos: {error.message}</p>
      </div>
    )
  }

  const todos = data?.todos || []

  if (todos.length === 0) {
    const getEmptyMessage = () => {
      switch (filter) {
        case 'assignedToMe':
          return {
            title: 'No tasks assigned to you',
            description: 'You\'re all caught up! No tasks are currently assigned to you.',
          }
        case 'createdByMe':
          return {
            title: 'You haven\'t created any todos',
            description: 'Create a new todo to organize tasks for your family.',
          }
        default:
          return {
            title: 'No todos yet',
            description: 'Create your first todo to start organizing family tasks.',
          }
      }
    }

    const message = getEmptyMessage()

    return (
      <EmptyState
        icon={CheckSquare}
        title={message.title}
        description={message.description}
      />
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
