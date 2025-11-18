import { NextResponse } from 'next/server'
import { getCurrentMember } from '@/lib/auth'

/**
 * GET /api/auth/session
 * Get current session - returns member info if authenticated
 */
export async function GET() {
  try {
    const member = await getCurrentMember()

    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      member: {
        id: member.id,
        name: member.name,
        role: member.role,
      },
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
