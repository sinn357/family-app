'use client'

import { useTodos } from '@/lib/hooks/use-todos'
import { TodoItem } from './todo-item'
import { EmptyState } from '@/components/ui/empty-state'
import { TodoListSkeleton } from './todo-skeleton'
import { CheckSquare, Loader2, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useEffect, useRef, useState } from 'react'

interface TodoListProps {
  filter: 'all' | 'assignedToMe' | 'createdByMe'
  currentUserId: string
}

export function TodoList({ filter, currentUserId }: TodoListProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTodos(filter, debouncedSearch || undefined)

  // Intersection Observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

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

  // Flatten all pages into a single array of todos
  const todos = data?.pages.flatMap((page) => page.todos) || []

  if (todos.length === 0) {
    const getEmptyMessage = () => {
      if (debouncedSearch) {
        return {
          title: 'No todos found',
          description: `No todos match "${debouncedSearch}". Try a different search.`,
        }
      }

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
      <>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search todos by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <EmptyState
          icon={CheckSquare}
          title={message.title}
          description={message.description}
        />
      </>
    )
  }

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search todos by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Todos */}
      {todos.map((todo: any) => (
        <TodoItem key={todo.id} todo={todo} currentUserId={currentUserId} />
      ))}

      {/* Loading indicator for next page */}
      {hasNextPage && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-6"
        >
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading more todos...</span>
            </div>
          )}
        </div>
      )}

      {/* End of list indicator */}
      {!hasNextPage && todos.length > 0 && (
        <div className="flex items-center justify-center py-6">
          <p className="text-sm text-muted-foreground">
            You've reached the end of the todos
          </p>
        </div>
      )}
    </div>
  )
}
