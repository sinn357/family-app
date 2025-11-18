import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

interface UseSocketParams {
  userId?: string
  userName?: string
}

export function useSocket(params?: UseSocketParams) {
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Array<{ userId: string; userName: string; status: string }>>([])
  const hasEmittedOnline = useRef(false)

  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      socket = io({
        path: '/api/socket',
        addTrailingSlash: false,
      })

      socket.on('connect', () => {
        console.log('Socket connected:', socket?.id)
        setIsConnected(true)
      })

      socket.on('disconnect', () => {
        console.log('Socket disconnected')
        setIsConnected(false)
      })

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setIsConnected(false)
      })

      // Listen for user status changes
      socket.on('user-status-change', (data: { userId: string; userName?: string; status: string }) => {
        setOnlineUsers((prev) => {
          if (data.status === 'online') {
            // Add or update user as online
            const exists = prev.find((u) => u.userId === data.userId)
            if (exists) {
              return prev.map((u) =>
                u.userId === data.userId ? { ...u, status: 'online' } : u
              )
            }
            return [...prev, { userId: data.userId, userName: data.userName || 'Unknown', status: 'online' }]
          } else {
            // Mark user as offline
            return prev.map((u) =>
              u.userId === data.userId ? { ...u, status: 'offline' } : u
            )
          }
        })
      })
    }

    return () => {
      // Don't disconnect on unmount, keep the connection alive
      // socket?.disconnect()
    }
  }, [])

  // Emit user online status when connected and user info is available
  useEffect(() => {
    if (socket && isConnected && params?.userId && params?.userName && !hasEmittedOnline.current) {
      socket.emit('user-online', {
        userId: params.userId,
        userName: params.userName,
      })
      hasEmittedOnline.current = true

      // Cleanup: emit offline when unmounting
      return () => {
        if (socket) {
          socket.emit('user-offline', {
            userId: params.userId,
          })
          hasEmittedOnline.current = false
        }
      }
    }
  }, [socket, isConnected, params?.userId, params?.userName])

  return { socket, isConnected, onlineUsers }
}
