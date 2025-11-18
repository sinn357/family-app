import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { createToken, verifyToken, type JWTPayload } from './jwt'

const SESSION_COOKIE_NAME = 'family_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

/**
 * Create a new session for a family member
 */
export async function createSession(memberId: string, role: 'MEMBER' | 'ADMIN') {
  const token = createToken({ memberId, role })
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  // Store session in database
  await prisma.session.create({
    data: {
      memberId,
      token,
      expiresAt,
    },
  })

  // Set session cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })

  return token
}

/**
 * Get current session from cookie
 */
export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) return null

  // Verify token
  const payload = verifyToken(token)
  if (!payload) return null

  // Check if session exists in database and is not expired
  const session = await prisma.session.findUnique({
    where: { token },
  })

  if (!session || session.expiresAt < new Date()) {
    // Session expired or doesn't exist, clear cookie
    await deleteSession()
    return null
  }

  return payload
}

/**
 * Delete current session
 */
export async function deleteSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (token) {
    // Delete from database
    await prisma.session.deleteMany({
      where: { token },
    })
  }

  // Clear cookie
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Get current member from session
 */
export async function getCurrentMember() {
  const session = await getSession()
  if (!session) return null

  const member = await prisma.familyMember.findUnique({
    where: { id: session.memberId },
    select: {
      id: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return member
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const member = await getCurrentMember()
  if (!member) {
    throw new Error('Authentication required')
  }
  return member
}

/**
 * Require admin role - throws if not admin
 */
export async function requireAdmin() {
  const member = await requireAuth()
  if (member.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
  return member
}
