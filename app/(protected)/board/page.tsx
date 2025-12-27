import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PostList } from '@/components/posts/post-list'
import { Plus } from 'lucide-react'

export default function BoardPage() {
  return (
    <div className="container mx-auto py-6 md:py-10 px-4 md:px-6">
      <div className="flex items-center justify-between mb-8 md:mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Family Board
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Share updates and memories
          </p>
        </div>
        <Link href="/board/new">
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Post</span>
            <span className="sm:hidden">New</span>
          </Button>
        </Link>
      </div>
      <PostList />
    </div>
  )
}
