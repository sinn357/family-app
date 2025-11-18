import { redirect } from 'next/navigation'
import { getCurrentMember } from '@/lib/auth'

export default async function RootPage() {
  // Check if user is logged in
  const member = await getCurrentMember()

  if (member) {
    // Already logged in - redirect to protected home page
    redirect('/home')
  } else {
    // Not logged in - redirect to login
    redirect('/login')
  }
}
