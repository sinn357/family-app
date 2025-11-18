import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import type { CreatePostInput, UpdatePostInput, CreateCommentInput, UpdateCommentInput } from '@/lib/validations/post'
import { handleApiError } from '@/lib/utils/error'

/**
 * Get posts with infinite scroll pagination
 */
export function usePosts() {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const url = new URL('/api/posts', window.location.origin)
      if (pageParam) {
        url.searchParams.set('cursor', pageParam)
      }
      url.searchParams.set('limit', '10')

      const res = await fetch(url.toString(), {
        credentials: 'include',
      })
      if (!res.ok) {
        await handleApiError(res)
      }
      return res.json()
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  })
}

/**
 * Get a single post
 */
export function usePost(postId: string) {
  return useQuery({
    queryKey: ['posts', postId],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${postId}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        await handleApiError(res)
      }
      return res.json()
    },
    enabled: !!postId,
  })
}

/**
 * Create a new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePostInput) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) {
        await handleApiError(res)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

/**
 * Update a post
 */
export function useUpdatePost(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdatePostInput) => {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) {
        await handleApiError(res)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['posts', postId] })
    },
  })
}

/**
 * Delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        await handleApiError(res)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

/**
 * Create a comment on a post
 */
export function useCreateComment(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCommentInput) => {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) {
        await handleApiError(res)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', postId] })
    },
  })
}

/**
 * Update a comment
 */
export function useUpdateComment(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ commentId, data }: { commentId: string; data: UpdateCommentInput }) => {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) {
        await handleApiError(res)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', postId] })
    },
  })
}

/**
 * Delete a comment
 */
export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        await handleApiError(res)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', postId] })
    },
  })
}
