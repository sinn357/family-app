import { getCurrentMember } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MediaTabs } from '@/components/media/media-tabs'

export default async function FilesPage() {
  const member = await getCurrentMember()
  if (!member) redirect('/login')

  return (
    <div className="container mx-auto py-4 md:py-8 px-3 md:px-4">
      <MediaTabs currentUserId={member.id} defaultTab="files" />
    </div>
  )
}
