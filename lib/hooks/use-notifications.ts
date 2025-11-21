import { useEffect, useState } from 'react'
import { useSocket } from './use-socket'

export interface Notification {
  id: string
  type: 'COMMENT' | 'MENTION' | 'SYSTEM' | 'TODO'
  title: string
  content: string
  recipientId: string
  senderId: string | null
  sender: {
    id: string
    name: string
  } | null
  relatedType: 'POST' | 'COMMENT' | 'TODO' | null
  relatedId: string | null
  isRead: boolean
  readAt: Date | null
  createdAt: Date
}

interface UseNotificationsParams {
  userId?: string
  enabled?: boolean
}

export function useNotifications({ userId, enabled = true }: UseNotificationsParams = {}) {
  const { socket, isConnected } = useSocket()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Join notification room when connected
  useEffect(() => {
    if (socket && isConnected && userId && enabled) {
      socket.emit('join-notifications', userId)
    }
  }, [socket, isConnected, userId, enabled])

  // Listen for new notifications
  useEffect(() => {
    if (!socket || !enabled) return

    const handleNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev])
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1)
      }
    }

    socket.on('notification', handleNotification)

    return () => {
      socket.off('notification', handleNotification)
    }
  }, [socket, enabled])

  // Fetch initial notifications
  useEffect(() => {
    if (!enabled) return

    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications?limit=10')
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    }

    async function fetchUnreadCount() {
      try {
        const res = await fetch('/api/notifications/unread-count')
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.count)
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error)
      }
    }

    fetchNotifications()
    fetchUnreadCount()
  }, [enabled])

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      })

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, isRead: true, readAt: new Date() }
              : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
  }
}
