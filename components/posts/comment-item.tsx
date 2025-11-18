'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import Image from 'next/image'
import { useUpdateComment, useDeleteComment } from '@/lib/hooks/use-posts'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Pencil, X, Trash2 } from 'lucide-react'

interface CommentItemProps {
  comment: {
    id: string
    content: string
    imageUrl?: string | null
    createdAt: string
    author: {
      id: string
      name: string
    }
  }
  postId: string
  currentUserId: string
}

function CommentItemComponent({ comment, postId, currentUserId }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const updateComment = useUpdateComment(postId)
  const deleteComment = useDeleteComment(postId)

  const formattedDate = useMemo(() => {
    return new Date(comment.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [comment.createdAt])

  const isAuthor = useMemo(() => {
    return comment.author.id === currentUserId
  }, [comment.author.id, currentUserId])

  const handleStartEdit = useCallback(() => {
    setEditContent(comment.content)
    setIsEditing(true)
  }, [comment.content])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setEditContent(comment.content)
  }, [comment.content])

  const handleSaveEdit = useCallback(async () => {
    if (!editContent.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    try {
      await updateComment.mutateAsync({
        commentId: comment.id,
        data: { content: editContent },
      })
      toast.success('Comment updated successfully!')
      setIsEditing(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update comment'
      console.error('Failed to update comment:', err)
      toast.error(message)
    }
  }, [editContent, updateComment, comment.id])

  const handleDelete = useCallback(async () => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      await deleteComment.mutateAsync(comment.id)
      toast.success('Comment deleted successfully!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete comment'
      console.error('Failed to delete comment:', err)
      toast.error(message)
    }
  }, [deleteComment, comment.id])

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-900">{comment.author.name}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{formattedDate}</span>
          {isAuthor && !isEditing && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartEdit}
                className="h-8 px-2"
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleteComment.isPending}
                className="h-8 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[80px]"
            disabled={updateComment.isPending}
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              disabled={updateComment.isPending}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveEdit}
              disabled={updateComment.isPending}
            >
              {updateComment.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {comment.imageUrl && (
            <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden">
              <Image
                src={comment.imageUrl}
                alt="Comment attachment"
                fill
                className="object-cover"
              />
            </div>
          )}
          <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
        </>
      )}
    </div>
  )
}

export const CommentItem = memo(CommentItemComponent)
