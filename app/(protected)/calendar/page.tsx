import { getCurrentMember } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CalendarContainer } from '@/components/calendar/calendar-container'

export default async function CalendarPage() {
  const member = await getCurrentMember()
  if (!member) redirect('/login')

  return (
    <div className="container mx-auto py-4 md:py-8 px-3 md:px-4">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">가족 캘린더</h1>
        <p className="text-sm md:text-base text-gray-600">
          가족의 일정을 관리하세요
        </p>
      </div>

      <CalendarContainer currentUserId={member.id} />
    </div>
  )
}
