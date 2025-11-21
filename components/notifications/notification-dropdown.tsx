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
    <>
      {/* Desktop dropdown */}
      <div className="hidden md:block absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-white shadow-lg dark:bg-gray-800">
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

      {/* Mobile full-screen modal */}
      <div className="md:hidden fixed inset-0 z-50 bg-white dark:bg-gray-900">
        <div className="border-b px-4 py-4 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900">
          <h3 className="text-lg font-semibold">알림</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="h-[calc(100vh-60px)] overflow-y-auto">
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
    </>
  )
}
