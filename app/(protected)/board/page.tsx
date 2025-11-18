import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PostList } from '@/components/posts/post-list'

export default function BoardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Family Board</h1>
        <Link href="/board/new">
          <Button>Create Post</Button>
        </Link>
      </div>
      <PostList />
    </div>
  )
}
