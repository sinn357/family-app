import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { createCommentSchema } from '@/lib/validations/post'
import { notifyComment } from '@/lib/notification-utils'
import { z } from 'zod'

/**
 * POST /api/posts/[postId]/comments
 * Create a new comment on a post
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const member = await requireAuth()
    const { postId } = await params

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validated = createCommentSchema.parse(body)

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: member.id,
        content: validated.content,
        imageUrl: validated.imageUrl || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Send notification to post author
    await notifyComment({
      postId,
      postAuthorId: post.authorId,
      commentAuthorId: member.id,
      commentAuthorName: member.name,
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Create comment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
