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
          setError('No changes to update')
          return
        }

        await updateMember.mutateAsync(updateData)
      } else {
        await createMember.mutateAsync(data as CreateMemberInput)
      }
      form.reset()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed')
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter member name"
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
                Password {isEditing && '(leave blank to keep current)'}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={isEditing ? 'Enter new password' : 'Enter password'}
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
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
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
              ? 'Updating...'
              : 'Creating...'
            : isEditing
            ? 'Update Member'
            : 'Create Member'}
        </Button>
      </form>
    </Form>
  )
}
