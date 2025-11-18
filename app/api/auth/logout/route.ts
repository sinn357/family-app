import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'

/**
 * POST /api/auth/logout
 * Logout endpoint - delete session and clear cookie
 */
export async function POST() {
  try {
    await deleteSession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
