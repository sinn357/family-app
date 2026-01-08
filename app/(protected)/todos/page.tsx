'use client'

import { useState, useEffect } from 'react'
import { TodoList } from '@/components/todos/todo-list'
import { TodoFilters } from '@/components/todos/todo-filters'
import { TodoForm } from '@/components/todos/todo-form'
import { TodoCalendar } from '@/components/todos/todo-calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, ListTodo } from 'lucide-react'
import { useTodosCalendar } from '@/lib/hooks/use-todos'

export default function TodosPage() {
  const [filter, setFilter] = useState<'all' | 'assignedToMe' | 'createdByMe'>('all')
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const { data: calendarData } = useTodosCalendar(filter)

  // Get current user ID from session
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session', {
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          setCurrentUserId(data.member.id)
        }
      } catch (err) {
        console.error('Failed to fetch session:', err)
      }
    }
    fetchSession()
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const handleChange = () => setIsMobile(mediaQuery.matches)
    handleChange()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <div className="container mx-auto py-6 md:py-10 px-4 md:px-6">
      <div className="rounded-2xl border border-border/60 bg-card/70 p-4 md:p-6 backdrop-blur-md mb-6 md:mb-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center">
              <ListTodo className="w-6 h-6 text-success" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">할일 & 캘린더</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                한 화면에서 일정과 할일을 관리하세요.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('list')}
            >
              리스트
            </Button>
            <Button
              variant={view === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('calendar')}
            >
              캘린더
            </Button>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">New Task</span>
              <span className="sm:hidden">New</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Create New Task
              </DialogTitle>
            </DialogHeader>
            <TodoForm
              initialDueDate={selectedDate}
              onSuccess={() => {
                setIsDialogOpen(false)
                setSelectedDate(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <TodoFilters currentFilter={filter} onFilterChange={setFilter} />
      </div>

      {isMobile ? (
        view === 'list' ? (
          <TodoList filter={filter} currentUserId={currentUserId} />
        ) : (
          <TodoCalendar
            todos={(calendarData?.todos || []) as any[]}
            onSelectDate={(date) => {
              setSelectedDate(date)
              setIsDialogOpen(true)
            }}
            onSelectTodo={() => setView('list')}
          />
        )
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <TodoList filter={filter} currentUserId={currentUserId} />
          <TodoCalendar
            todos={(calendarData?.todos || []) as any[]}
            onSelectDate={(date) => {
              setSelectedDate(date)
              setIsDialogOpen(true)
            }}
            onSelectTodo={() => setView('list')}
          />
        </div>
      )}
    </div>
  )
}
