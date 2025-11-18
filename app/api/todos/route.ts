import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { createTodoSchema } from '@/lib/validations/todo'
import { z } from 'zod'

/**
 * GET /api/todos
 * Get all todos with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const member = await requireAuth()
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') // all | assignedToMe | createdByMe

    let whereClause = {}

    if (filter === 'assignedToMe') {
      whereClause = { assignedTo: member.id }
    } else if (filter === 'createdByMe') {
      whereClause = { createdBy: member.id }
    }

    const todos = await prisma.todo.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { isDone: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ todos })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Get todos error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/todos
 * Create a new todo
 */
export async function POST(request: NextRequest) {
  try {
    const member = await requireAuth()

    // Parse and validate request body
    const body = await request.json()
    const validated = createTodoSchema.parse(body)

    // Create todo
    const todo = await prisma.todo.create({
      data: {
        title: validated.title,
        description: validated.description,
        createdBy: member.id,
        assignedTo: validated.assignedTo || null,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ todo }, { status: 201 })
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

    console.error('Create todo error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
