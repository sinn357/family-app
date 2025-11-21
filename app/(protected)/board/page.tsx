import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PostList } from '@/components/posts/post-list'

export default function BoardPage() {
  return (
    <div className="container mx-auto py-4 md:py-8 px-3 md:px-4">
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Board</h1>
        <Link href="/board/new">
          <Button className="bg-primary hover:bg-primary/90 text-sm md:text-base">
            <span className="hidden sm:inline">Create Post</span>
            <span className="sm:hidden">New</span>
          </Button>
        </Link>
      </div>
      <PostList />
    </div>
  )
}
