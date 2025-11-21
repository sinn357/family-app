'use client'

import Link from 'next/link'
import { MessageSquare, FileText, CheckSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface SearchResultsProps {
  results: {
    posts: any[]
    comments: any[]
    todos: any[]
  }
  onClose: () => void
}

export function SearchResults({ results, onClose }: SearchResultsProps) {
  const hasResults = results.posts.length > 0 || results.comments.length > 0 || results.todos.length > 0

  if (!hasResults) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        No results found
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Posts */}
      {results.posts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-500 uppercase">
            <FileText className="h-4 w-4" />
            Posts ({results.posts.length})
          </div>
          <div className="space-y-2">
            {results.posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/board/${post.id}`}
                onClick={onClose}
                className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="font-medium text-sm mb-1">{post.title}</div>
                <div className="text-xs text-gray-500 line-clamp-2">{post.content}</div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>{post.author.name}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}</span>
                  <span>•</span>
                  <span>{post._count.comments} comments</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      {results.comments.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-500 uppercase">
            <MessageSquare className="h-4 w-4" />
            Comments ({results.comments.length})
          </div>
          <div className="space-y-2">
            {results.comments.map((comment: any) => (
              <Link
                key={comment.id}
                href={`/board/${comment.postId}`}
                onClick={onClose}
                className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="text-xs text-gray-500 mb-1">
                  Comment on: {comment.post.title}
                </div>
                <div className="text-sm line-clamp-2">{comment.content}</div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>{comment.author.name}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ko })}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Todos */}
      {results.todos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-500 uppercase">
            <CheckSquare className="h-4 w-4" />
            Todos ({results.todos.length})
          </div>
          <div className="space-y-2">
            {results.todos.map((todo: any) => (
              <Link
                key={todo.id}
                href="/todos"
                onClick={onClose}
                className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="font-medium text-sm mb-1">{todo.title}</div>
                {todo.description && (
                  <div className="text-xs text-gray-500 line-clamp-2">{todo.description}</div>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>Created by {todo.creator.name}</span>
                  {todo.assignee && (
                    <>
                      <span>•</span>
                      <span>Assigned to {todo.assignee.name}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className={todo.isDone ? 'text-green-500' : 'text-yellow-500'}>
                    {todo.isDone ? 'Done' : 'Pending'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
