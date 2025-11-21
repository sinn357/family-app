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
    <div className="container mx-auto py-4 md:py-8 px-3 md:px-4">
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          <span className="hidden sm:inline">Checklist</span>
          <span className="sm:hidden">Todos</span>
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-sm md:text-base">
              <span className="hidden sm:inline">Create Todo</span>
              <span className="sm:hidden">New</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-primary">Create New Todo</DialogTitle>
            </DialogHeader>
            <TodoForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6 border-l-4 border-l-accent/30">
        <CardHeader>
          <CardTitle className="text-lg text-primary">Filter Todos</CardTitle>
        </CardHeader>
        <CardContent>
          <TodoFilters currentFilter={filter} onFilterChange={setFilter} />
        </CardContent>
      </Card>

      <TodoList filter={filter} currentUserId={currentUserId} />
    </div>
  )
}
