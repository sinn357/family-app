import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentMember } from '@/lib/auth'
import { ProtectedNav } from '@/components/auth/protected-nav'

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode
}) {
  // Check authentication
  const member = await getCurrentMember()

  if (!member) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProtectedNav member={member} />
      <main>{children}</main>
    </div>
  )
}
