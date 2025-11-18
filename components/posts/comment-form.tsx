'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createCommentSchema, type CreateCommentInput } from '@/lib/validations/post'
import { useCreateComment } from '@/lib/hooks/use-posts'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { ImageUpload } from '@/components/ui/image-upload'
import { toast } from 'sonner'

interface CommentFormProps {
  postId: string
}

export function CommentForm({ postId }: CommentFormProps) {
  const createComment = useCreateComment(postId)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CreateCommentInput>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: '',
      imageUrl: null,
    },
  })

  async function onSubmit(data: CreateCommentInput) {
    try {
      setError(null)
      await createComment.mutateAsync(data)
      toast.success('Comment added successfully!')
      form.reset()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add comment'
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
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Write a comment..."
                  rows={3}
                  disabled={createComment.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image (Optional)</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value || undefined}
                  onChange={field.onChange}
                  disabled={createComment.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createComment.isPending}>
          {createComment.isPending ? 'Adding...' : 'Add Comment'}
        </Button>
      </form>
    </Form>
  )
}
