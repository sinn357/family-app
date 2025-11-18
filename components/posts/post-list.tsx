'use client'

import { usePosts } from '@/lib/hooks/use-posts'
import { PostItem } from './post-item'
import { EmptyState } from '@/components/ui/empty-state'
import { PostListSkeleton } from './post-skeleton'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function PostList() {
  const { data, isLoading, error } = usePosts()

  if (isLoading) {
    return <PostListSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">Error loading posts: {error.message}</p>
      </div>
    )
  }

  const posts = data?.posts || []

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No posts yet"
        description="Be the first to share something with your family! Create a new post to get started."
        action={
          <Link href="/board/new">
            <Button className="bg-primary hover:bg-primary/90">
              Create First Post
            </Button>
          </Link>
        }
      />
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
