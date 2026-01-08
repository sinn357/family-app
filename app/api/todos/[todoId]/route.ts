import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { updateTodoSchema } from '@/lib/validations/todo'
import { z } from 'zod'

/**
 * PATCH /api/todos/[todoId]
 * Update a todo (anyone can update, including toggling isDone)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ todoId: string }> }
) {
  try {
    await requireAuth()
    const { todoId } = await params

    // Check if todo exists
    const existingTodo = await prisma.todo.findUnique({
      where: { id: todoId },
      select: { id: true },
    })

    if (!existingTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validated = updateTodoSchema.parse(body)

    const dueDate = validated.dueDate !== undefined
      ? validated.dueDate
        ? new Date(validated.dueDate)
        : null
      : undefined

    // Update todo
    const todo = await prisma.todo.update({
      where: { id: todoId },
      data: {
        ...validated,
        ...(dueDate !== undefined ? { dueDate } : {}),
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

    return NextResponse.json({ todo })
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

    console.error('Update todo error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/todos/[todoId]
 * Delete a todo (creator only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ todoId: string }> }
) {
  try {
    const member = await requireAuth()
    const { todoId } = await params

    // Check if todo exists and user is the creator
    const existingTodo = await prisma.todo.findUnique({
      where: { id: todoId },
      select: { createdBy: true },
    })

    if (!existingTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    if (existingTodo.createdBy !== member.id) {
      return NextResponse.json(
        { error: 'Only creator can delete todo' },
        { status: 403 }
      )
    }

    // Delete todo
    await prisma.todo.delete({
      where: { id: todoId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Delete todo error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
