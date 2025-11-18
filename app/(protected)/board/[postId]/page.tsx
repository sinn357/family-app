'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { usePost, useDeletePost } from '@/lib/hooks/use-posts'
import { CommentList } from '@/components/posts/comment-list'
import { CommentForm } from '@/components/posts/comment-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'

export default function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const resolvedParams = use(params)
  const { postId } = resolvedParams
  const router = useRouter()
  const { data, isLoading, error } = usePost(postId)
  const deletePost = useDeletePost()
  const [currentUserId, setCurrentUserId] = useState<string>('')

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

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      await deletePost.mutateAsync(postId)
      router.push('/board')
    } catch (err) {
      console.error('Failed to delete post:', err)
      alert('Failed to delete post')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading post...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-12">
          <p className="text-red-500">Error loading post: {error.message}</p>
        </div>
      </div>
    )
  }

  const post = data?.post

  if (!post) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Post not found</p>
        </div>
      </div>
    )
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const isAuthor = post.author.id === currentUserId

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push('/board')}>
          ← Back to Board
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{post.title}</CardTitle>
              <CardDescription>
                by {post.author.name} · {formattedDate}
              </CardDescription>
            </div>
            {isAuthor && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deletePost.isPending}
              >
                {deletePost.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">
            {post.content}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Comments ({post.comments?.length || 0})
        </h2>

        <CommentForm postId={postId} />

        <CommentList comments={post.comments || []} />
      </div>
    </div>
  )
}
