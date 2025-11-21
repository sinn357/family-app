import { redirect } from 'next/navigation'
import { getCurrentMember } from '@/lib/auth'
import { ProtectedNav } from '@/components/auth/protected-nav'
import { NotificationSettings } from '@/components/notifications/notification-settings'

export default async function SettingsPage() {
  const member = await getCurrentMember()

  if (!member) {
    redirect('/login')
  }

  return (
    <>
      <ProtectedNav member={member} />
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="max-w-2xl mx-auto">
          <NotificationSettings />
        </div>
      </main>
    </>
  )
}
