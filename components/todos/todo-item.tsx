'use client'

import { useState } from 'react'
import { useToggleTodo, useDeleteTodo } from '@/lib/hooks/use-todos'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Trash2, User } from 'lucide-react'
import { differenceInCalendarDays, format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface TodoItemProps {
  todo: {
    id: string
    title: string
    description: string | null
    isDone: boolean
    dueDate?: string | null
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
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
      toast.success(todo.isDone ? '할일이 미완료로 변경되었습니다' : '할일이 완료되었습니다!')
    } catch (err) {
      console.error('Failed to toggle todo:', err)
      toast.error('할일 업데이트 실패')
    }
  }

  async function handleDelete() {
    if (!confirm('이 할일을 삭제하시겠습니까?')) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteTodo.mutateAsync(todo.id)
      toast.success('할일이 삭제되었습니다!')
    } catch (err) {
      const message = err instanceof Error ? err.message : '할일 삭제 실패. 작성자만 삭제할 수 있습니다.'
      console.error('Failed to delete todo:', err)
      toast.error(message)
      setIsDeleting(false)
    }
  }

  const creatorLetter = todo.creator.name.charAt(0).toUpperCase()
  const assigneeLetter = todo.assignee?.name.charAt(0).toUpperCase()
  const dueDate = todo.dueDate ? new Date(todo.dueDate) : null
  const daysLeft = dueDate ? differenceInCalendarDays(dueDate, new Date()) : null

  const priorityStyles: Record<string, string> = {
    LOW: 'bg-muted text-muted-foreground',
    MEDIUM: 'bg-primary/10 text-primary',
    HIGH: 'bg-amber-500/15 text-amber-600',
    URGENT: 'bg-destructive/15 text-destructive',
  }

  return (
    <Card className={`group transition-all duration-200 ${todo.isDone ? 'opacity-60 bg-success/5' : ''}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Checkbox
            checked={todo.isDone}
            onCheckedChange={handleToggle}
            disabled={toggleTodo.isPending}
            className="mt-1.5 w-5 h-5 data-[state=checked]:bg-success data-[state=checked]:border-success"
          />
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-base transition-colors ${
                todo.isDone ? 'line-through text-muted-foreground' : 'text-foreground group-hover:text-primary'
              }`}
            >
              {todo.title}
            </h3>
            {todo.description && (
              <p className={`text-sm mt-2 whitespace-pre-wrap ${todo.isDone ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                {todo.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {todo.priority && (
                <Badge className={`text-xs px-2 py-0.5 ${priorityStyles[todo.priority] || ''}`}>
                  {todo.priority === 'LOW' && '낮음'}
                  {todo.priority === 'MEDIUM' && '보통'}
                  {todo.priority === 'HIGH' && '높음'}
                  {todo.priority === 'URGENT' && '긴급'}
                </Badge>
              )}
              {dueDate && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {format(dueDate, 'M월 d일', { locale: ko })}
                  {daysLeft !== null && (
                    <span className="ml-1 text-muted-foreground">
                      {daysLeft === 0 ? '(D-day)' : daysLeft > 0 ? `(D-${daysLeft})` : `(D+${Math.abs(daysLeft)})`}
                    </span>
                  )}
                </Badge>
              )}
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-bold text-primary">
                  {creatorLetter}
                </div>
                <span className="text-xs text-muted-foreground">
                  {todo.creator.name}
                </span>
              </div>
              {todo.assignee && (
                <>
                  <span className="text-xs text-muted-foreground">→</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-success/20 to-info/20 flex items-center justify-center text-xs font-bold text-success">
                      {assigneeLetter}
                    </div>
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {todo.assignee.name}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </div>
          {isCreator && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
