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
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No comments yet. Be the first to comment!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })

        return (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{comment.author.name}</span>
              <span className="text-sm text-gray-500">{formattedDate}</span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          </div>
        )
      })}
    </div>
  )
}
