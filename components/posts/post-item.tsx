import Link from 'next/link'
import Image from 'next/image'
import { memo, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Calendar } from 'lucide-react'

interface PostItemProps {
  post: {
    id: string
    title: string
    content: string
    imageUrl?: string | null
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

  const avatarLetter = post.author.name.charAt(0).toUpperCase()

  return (
    <Link href={`/board/${post.id}`} className="group">
      <Card className="cursor-pointer overflow-hidden group-hover:scale-[1.01] transition-all duration-300">
        {/* Image Header if present */}
        {post.imageUrl && (
          <div className="relative w-full h-52 overflow-hidden">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {/* Author Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
              {avatarLetter}
            </div>

            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl mb-1 group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-xs">
                <span className="font-medium">{post.author.name}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formattedDate}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
            {excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-4">
              {post._count && (
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post._count.comments}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-primary font-medium group-hover:translate-x-1 transition-transform">
              Read more →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export const PostItem = memo(PostItemComponent)
