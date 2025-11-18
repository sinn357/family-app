'use client'

import { usePosts } from '@/lib/hooks/use-posts'
import { PostItem } from './post-item'

export function PostList() {
  const { data, isLoading, error } = usePosts()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading posts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">Error loading posts: {error.message}</p>
      </div>
    )
  }

  const posts = data?.posts || []

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">No posts yet. Be the first to create one!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post: any) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  )
}
