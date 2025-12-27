'use client'

import { useState, useEffect } from 'react'
import { TodoList } from '@/components/todos/todo-list'
import { TodoFilters } from '@/components/todos/todo-filters'
import { TodoForm } from '@/components/todos/todo-form'
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

export default function TodosPage() {
  const [filter, setFilter] = useState<'all' | 'assignedToMe' | 'createdByMe'>('all')
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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

  return (
    <div className="container mx-auto py-6 md:py-10 px-4 md:px-6">
      <div className="flex items-center justify-between mb-8 md:mb-10 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center">
            <ListTodo className="w-6 h-6 text-success" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Family Todos
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-0.5">
              Track tasks and stay organized
            </p>
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
            <TodoForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <TodoFilters currentFilter={filter} onFilterChange={setFilter} />
      </div>

      <TodoList filter={filter} currentUserId={currentUserId} />
    </div>
  )
}
