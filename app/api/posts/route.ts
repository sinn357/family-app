import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { createPostSchema } from '@/lib/validations/post'
import { z } from 'zod'

/**
 * GET /api/posts
 * Get posts with cursor-based pagination and search
 * Query params:
 *  - cursor: ISO date string of last post (optional)
 *  - limit: number of posts to fetch (default: 10)
 *  - search: search query for title and content (optional)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const search = searchParams.get('search')

    // Build where clause for search
    const whereClause = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { content: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const posts = await prisma.post.findMany({
      take: limit + 1, // Fetch one extra to check if there are more
      ...(cursor && {
        cursor: {
          createdAt: new Date(cursor),
        },
        skip: 1, // Skip the cursor itself
      }),
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    let nextCursor: string | undefined = undefined
    if (posts.length > limit) {
      const nextPost = posts.pop() // Remove the extra post
      nextCursor = nextPost!.createdAt.toISOString()
    }

    return NextResponse.json({ posts, nextCursor })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Get posts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/posts
 * Create a new post
 */
export async function POST(request: NextRequest) {
  try {
    const member = await requireAuth()

    // Parse and validate request body
    const body = await request.json()
    const validated = createPostSchema.parse(body)

    // Create post
    const post = await prisma.post.create({
      data: {
        title: validated.title,
        content: validated.content,
        imageUrl: validated.imageUrl || null,
        authorId: member.id,
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

    return NextResponse.json({ post }, { status: 201 })
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

    console.error('Create post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
