import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/calendar
 * Get calendar events for a date range
 * Query params:
 *  - start: ISO date string (required)
 *  - end: ISO date string (required)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    if (!start || !end) {
      return NextResponse.json(
        { error: 'Start and end dates are required' },
        { status: 400 }
      )
    }

    const events = await prisma.calendarEvent.findMany({
      where: {
        startAt: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startAt: 'asc',
      },
    })

    return NextResponse.json({ events })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Get calendar events error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/calendar
 * Create a new calendar event
 */
export async function POST(request: NextRequest) {
  try {
    const member = await requireAuth()
    const body = await request.json()

    const { title, description, startAt, endAt, location, color, isAllDay } = body

    if (!title || !startAt) {
      return NextResponse.json(
        { error: 'Title and start date are required' },
        { status: 400 }
      )
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description: description || null,
        startAt: new Date(startAt),
        endAt: endAt ? new Date(endAt) : null,
        location: location || null,
        color: color || null,
        isAllDay: isAllDay || false,
        createdBy: member.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Create calendar event error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
