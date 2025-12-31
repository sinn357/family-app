'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createMemberSchema,
  updateMemberSchema,
  type CreateMemberInput,
  type UpdateMemberInput,
} from '@/lib/validations/admin'
import { useCreateMember, useUpdateMember } from '@/lib/hooks/use-admin'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'

interface MemberFormProps {
  member?: {
    id: string
    name: string
    role: 'MEMBER' | 'ADMIN'
  }
  onSuccess?: () => void
}

export function MemberForm({ member, onSuccess }: MemberFormProps) {
  const isEditing = !!member
  const createMember = useCreateMember()
  const updateMember = useUpdateMember(member?.id || '')
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CreateMemberInput | UpdateMemberInput>({
    resolver: zodResolver(isEditing ? updateMemberSchema : createMemberSchema),
    defaultValues: isEditing
      ? {
          name: member.name,
          password: '',
        }
      : {
          name: '',
          password: '',
          role: 'MEMBER',
        },
  })

  async function onSubmit(data: CreateMemberInput | UpdateMemberInput) {
    try {
      setError(null)
      if (isEditing) {
        // Only send fields that have values
        const updateData: UpdateMemberInput = {}
        if (data.name && data.name !== member.name) {
          updateData.name = data.name
        }
        if (data.password && data.password.trim() !== '') {
          updateData.password = data.password
        }

        if (Object.keys(updateData).length === 0) {
          setError('수정할 내용이 없습니다')
          return
        }

        await updateMember.mutateAsync(updateData)
      } else {
        await createMember.mutateAsync(data as CreateMemberInput)
      }
      form.reset()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : '작업 실패')
    }
  }

  const isPending = isEditing ? updateMember.isPending : createMember.isPending

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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input
                  placeholder="멤버 이름을 입력하세요"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                비밀번호 {isEditing && '(기존 유지하려면 비워두세요)'}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={isEditing ? '새 비밀번호를 입력하세요' : '비밀번호를 입력하세요'}
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEditing && (
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>역할</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="역할 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MEMBER">멤버</SelectItem>
                    <SelectItem value="ADMIN">관리자</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEditing
              ? '업데이트 중...'
              : '생성 중...'
            : isEditing
            ? '멤버 수정'
            : '멤버 생성'}
        </Button>
      </form>
    </Form>
  )
}
