'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { usePost, useDeletePost, useUpdatePost } from '@/lib/hooks/use-posts'
import { CommentList } from '@/components/posts/comment-list'
import { CommentForm } from '@/components/posts/comment-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Pencil, X } from 'lucide-react'

export default function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const resolvedParams = use(params)
  const { postId } = resolvedParams
  const router = useRouter()
  const { data, isLoading, error } = usePost(postId)
  const deletePost = useDeletePost()
  const updatePost = useUpdatePost(postId)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

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

  function handleStartEdit() {
    if (data?.post) {
      setEditTitle(data.post.title)
      setEditContent(data.post.content)
      setIsEditing(true)
    }
  }

  function handleCancelEdit() {
    setIsEditing(false)
    setEditTitle('')
    setEditContent('')
  }

  async function handleSaveEdit() {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error('Title and content cannot be empty')
      return
    }

    try {
      await updatePost.mutateAsync({
        title: editTitle,
        content: editContent,
      })
      toast.success('Post updated successfully!')
      setIsEditing(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update post'
      console.error('Failed to update post:', err)
      toast.error(message)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      await deletePost.mutateAsync(postId)
      toast.success('Post deleted successfully!')
      router.push('/board')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete post'
      console.error('Failed to delete post:', err)
      toast.error(message)
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
              {isEditing ? (
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-3xl mb-2 font-bold"
                  placeholder="Post title"
                  disabled={updatePost.isPending}
                />
              ) : (
                <CardTitle className="text-3xl mb-2">{post.title}</CardTitle>
              )}
              <CardDescription>
                by {post.author.name} · {formattedDate}
              </CardDescription>
            </div>
            {isAuthor && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={updatePost.isPending}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={updatePost.isPending}
                    >
                      {updatePost.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStartEdit}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={deletePost.isPending}
                    >
                      {deletePost.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[200px] text-lg"
              placeholder="Post content"
              disabled={updatePost.isPending}
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">
              {post.content}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Comments ({post.comments?.length || 0})
        </h2>

        <CommentForm postId={postId} />

        <CommentList comments={post.comments || []} postId={postId} />
      </div>
    </div>
  )
}
