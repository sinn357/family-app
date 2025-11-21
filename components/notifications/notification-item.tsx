'use client'

import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { MessageCircle, AtSign, Bell as BellIcon, CheckSquare } from 'lucide-react'
import type { Notification } from '@/lib/hooks/use-notifications'

interface NotificationItemProps {
  notification: Notification
  onClick: () => void
}

const typeIcons = {
  COMMENT: MessageCircle,
  MENTION: AtSign,
  SYSTEM: BellIcon,
  TODO: CheckSquare,
}

const typeColors = {
  COMMENT: 'text-blue-500',
  MENTION: 'text-purple-500',
  SYSTEM: 'text-gray-500',
  TODO: 'text-green-500',
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const Icon = typeIcons[notification.type]
  const iconColor = typeColors[notification.type]
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: ko,
  })

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      <div className="flex gap-3">
        <div className={`mt-1 flex-shrink-0 ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-sm">{notification.title}</p>
            {!notification.isRead && (
              <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {notification.content}
          </p>

          <p className="text-xs text-gray-500">{timeAgo}</p>
        </div>
      </div>
    </button>
  )
}
