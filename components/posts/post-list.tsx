'use client'

import { usePosts } from '@/lib/hooks/use-posts'
import { PostItem } from './post-item'
import { EmptyState } from '@/components/ui/empty-state'
import { PostListSkeleton } from './post-skeleton'
import { MessageSquare, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useEffect, useRef } from 'react'

export function PostList() {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosts()

  // Intersection Observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

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

  // Flatten all pages into a single array of posts
  const posts = data?.pages.flatMap((page) => page.posts) || []

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

      {/* Loading indicator for next page */}
      {hasNextPage && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-8"
        >
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading more posts...</span>
            </div>
          )}
        </div>
      )}

      {/* End of list indicator */}
      {!hasNextPage && posts.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">
            You've reached the end of the posts
          </p>
        </div>
      )}
    </div>
  )
}
