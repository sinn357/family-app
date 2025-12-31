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
        <p className="text-destructive">할일을 불러오는 중 오류가 발생했습니다: {error.message}</p>
      </div>
    )
  }

  // Flatten all pages into a single array of todos
  const todos = data?.pages.flatMap((page) => page.todos) || []

  if (todos.length === 0) {
    const getEmptyMessage = () => {
      if (debouncedSearch) {
        return {
          title: '할일을 찾을 수 없습니다',
          description: `"${debouncedSearch}"와(과) 일치하는 할일이 없습니다. 다른 검색어를 시도해보세요.`,
        }
      }

      switch (filter) {
        case 'assignedToMe':
          return {
            title: '할당된 할일이 없습니다',
            description: '모두 처리했습니다! 현재 할당된 할일이 없습니다.',
          }
        case 'createdByMe':
          return {
            title: '작성한 할일이 없습니다',
            description: '가족 할일을 정리하려면 새 할일을 추가하세요.',
          }
        default:
          return {
            title: '할일이 아직 없습니다',
            description: '가족 할일 정리를 시작하려면 첫 할일을 추가하세요.',
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
              placeholder="제목 또는 설명으로 할일 검색..."
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
            placeholder="제목 또는 설명으로 할일 검색..."
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
              <span>할일을 더 불러오는 중...</span>
            </div>
          )}
        </div>
      )}

      {/* End of list indicator */}
      {!hasNextPage && todos.length > 0 && (
        <div className="flex items-center justify-center py-6">
          <p className="text-sm text-muted-foreground">
            할일 목록의 끝에 도달했습니다
          </p>
        </div>
      )}
    </div>
  )
}
