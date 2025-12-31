'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTodoSchema, type CreateTodoInput } from '@/lib/validations/todo'
import { useCreateTodo } from '@/lib/hooks/use-todos'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'
import { toast } from 'sonner'

interface TodoFormProps {
  onSuccess?: () => void
}

export function TodoForm({ onSuccess }: TodoFormProps) {
  const createTodo = useCreateTodo()
  const [error, setError] = useState<string | null>(null)
  const [members, setMembers] = useState<Array<{ id: string; name: string }>>([])

  const form = useForm<CreateTodoInput>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: {
      title: '',
      description: '',
      assignedTo: undefined,
    },
  })

  // Fetch family members for assignment
  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch('/api/admin/members', {
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          setMembers(data.members || [])
        }
      } catch (err) {
        console.error('Failed to fetch members:', err)
      }
    }
    fetchMembers()
  }, [])

  async function onSubmit(data: CreateTodoInput) {
    try {
      setError(null)
      await createTodo.mutateAsync(data)
      toast.success('할일이 추가되었습니다!')
      form.reset()
      onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : '할일 추가 실패'
      setError(message)
      toast.error(message)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <p className="text-sm">{error}</p>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input
                  placeholder="할일 제목을 입력하세요"
                  disabled={createTodo.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명 (선택)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="세부사항을 입력하세요..."
                  rows={3}
                  disabled={createTodo.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assignedTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>담당자 (선택)</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={createTodo.isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="가족 구성원 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="unassigned">미할당</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createTodo.isPending}>
          {createTodo.isPending ? '추가 중...' : '할일 추가'}
        </Button>
      </form>
    </Form>
  )
}
