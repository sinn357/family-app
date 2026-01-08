import { redirect } from 'next/navigation'
import { getCurrentMember } from '@/lib/auth'
import { MediaTabs } from '@/components/media/media-tabs'

export default async function PhotosPage() {
  const member = await getCurrentMember()
  if (!member) redirect('/login')

  return (
    <div className="container mx-auto py-6 md:py-10 px-4 md:px-6">
      <MediaTabs currentUserId={member.id} defaultTab="photos" />
    </div>
  )
}
