import Link from 'next/link'
import { memo, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PostItemProps {
  post: {
    id: string
    title: string
    content: string
    createdAt: string
    author: {
      id: string
      name: string
    }
    _count?: {
      comments: number
    }
  }
}

function PostItemComponent({ post }: PostItemProps) {
  const formattedDate = useMemo(() => {
    return new Date(post.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }, [post.createdAt])

  const excerpt = useMemo(() => {
    return post.content.length > 150
      ? post.content.slice(0, 150) + '...'
      : post.content
  }, [post.content])

  return (
    <Link href={`/board/${post.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
              <CardDescription>
                by {post.author.name} · {formattedDate}
              </CardDescription>
            </div>
            {post._count && post._count.comments > 0 && (
              <Badge variant="secondary" className="ml-4">
                {post._count.comments} {post._count.comments === 1 ? 'comment' : 'comments'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 whitespace-pre-wrap">{excerpt}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

export const PostItem = memo(PostItemComponent)
