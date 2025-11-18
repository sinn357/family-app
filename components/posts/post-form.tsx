'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createPostSchema, type CreatePostInput } from '@/lib/validations/post'
import { useCreatePost } from '@/lib/hooks/use-posts'
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
import { Alert } from '@/components/ui/alert'
import { ImageUpload } from '@/components/ui/image-upload'

export function PostForm() {
  const router = useRouter()
  const createPost = useCreatePost()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      content: '',
      imageUrl: null,
    },
  })

  async function onSubmit(data: CreatePostInput) {
    try {
      setError(null)
      const result = await createPost.mutateAsync(data)
      toast.success('Post created successfully!')
      router.push(`/board/${result.post.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create post'
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
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter post title"
                  disabled={createPost.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your post..."
                  rows={10}
                  disabled={createPost.isPending}
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
                  disabled={createPost.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={createPost.isPending}>
            {createPost.isPending ? 'Creating...' : 'Create Post'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/board')}
            disabled={createPost.isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
