import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)

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
    }

    return () => {
      // Don't disconnect on unmount, keep the connection alive
      // socket?.disconnect()
    }
  }, [])

  return { socket, isConnected }
}
