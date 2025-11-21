'use client'

import { useNotifications } from '@/lib/hooks/use-notifications'
import { NotificationItem } from './notification-item'

interface NotificationDropdownProps {
  userId: string
  onClose: () => void
}

export function NotificationDropdown({ userId, onClose }: NotificationDropdownProps) {
  const { notifications, markAsRead } = useNotifications({ userId })

  const handleNotificationClick = (notificationId: string, relatedType: string | null, relatedId: string | null) => {
    markAsRead(notificationId)

    // Navigate to related content
    if (relatedType === 'POST' && relatedId) {
      window.location.href = `/board/${relatedId}`
    } else if (relatedType === 'TODO' && relatedId) {
      window.location.href = `/todos`
    }

    onClose()
  }

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-white shadow-lg dark:bg-gray-800">
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold">알림</h3>
      </div>

      <div className="h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-gray-500">
            알림이 없습니다
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(
                  notification.id,
                  notification.relatedType,
                  notification.relatedId
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
