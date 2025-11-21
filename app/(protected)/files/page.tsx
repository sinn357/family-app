import { getCurrentMember } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { FilesContainer } from '@/components/files/files-container'

export default async function FilesPage() {
  const member = await getCurrentMember()
  if (!member) redirect('/login')

  return (
    <div className="container mx-auto py-4 md:py-8 px-3 md:px-4">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">파일 공유</h1>
        <p className="text-sm md:text-base text-gray-600">
          가족과 문서를 공유하세요
        </p>
      </div>

      <FilesContainer currentUserId={member.id} />
    </div>
  )
}
