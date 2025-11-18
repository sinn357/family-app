'use client'

import { useState } from 'react'
import { useToggleTodo, useDeleteTodo } from '@/lib/hooks/use-todos'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface TodoItemProps {
  todo: {
    id: string
    title: string
    description: string | null
    isDone: boolean
    createdAt: string
    creator: {
      id: string
      name: string
    }
    assignee: {
      id: string
      name: string
    } | null
  }
  currentUserId: string
}

export function TodoItem({ todo, currentUserId }: TodoItemProps) {
  const toggleTodo = useToggleTodo()
  const deleteTodo = useDeleteTodo()
  const [isDeleting, setIsDeleting] = useState(false)

  const isCreator = todo.creator.id === currentUserId

  async function handleToggle() {
    try {
      await toggleTodo.mutateAsync({
        todoId: todo.id,
        isDone: !todo.isDone,
      })
      toast.success(todo.isDone ? 'Todo marked as incomplete' : 'Todo completed!')
    } catch (err) {
      console.error('Failed to toggle todo:', err)
      toast.error('Failed to update todo')
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this todo?')) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteTodo.mutateAsync(todo.id)
      toast.success('Todo deleted successfully!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete todo. Only the creator can delete.'
      console.error('Failed to delete todo:', err)
      toast.error(message)
      setIsDeleting(false)
    }
  }

  return (
    <Card className={todo.isDone ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={todo.isDone}
            onCheckedChange={handleToggle}
            disabled={toggleTodo.isPending}
            className="mt-1"
          />
          <div className="flex-1">
            <h3
              className={`font-medium text-lg ${
                todo.isDone ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {todo.title}
            </h3>
            {todo.description && (
              <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">
                {todo.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs text-gray-500">
                Created by {todo.creator.name}
              </span>
              {todo.assignee && (
                <>
                  <span className="text-xs text-gray-400">·</span>
                  <Badge variant="secondary" className="text-xs">
                    Assigned to {todo.assignee.name}
                  </Badge>
                </>
              )}
            </div>
          </div>
          {isCreator && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
