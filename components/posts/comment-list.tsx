import { CommentItem } from './comment-item'

interface CommentListProps {
  comments: Array<{
    id: string
    content: string
    createdAt: string
    author: {
      id: string
      name: string
    }
  }>
  postId: string
  currentUserId: string
}

export function CommentList({ comments, postId, currentUserId }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No comments yet. Be the first to comment!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  )
}
