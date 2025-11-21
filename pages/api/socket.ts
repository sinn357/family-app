import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import type { NextApiRequest } from 'next'
import type { NextApiResponseServerIO } from '@/lib/socket-server'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...')

    const httpServer: HTTPServer = res.socket.server as any
    const io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    })

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      // Join user's personal notification room
      socket.on('join-notifications', (userId: string) => {
        const room = `notifications:${userId}`
        socket.join(room)
        console.log(`Socket ${socket.id} joined notification room for user ${userId}`)
      })

      // Join a chat room
      socket.on('join-room', (roomId: string) => {
        socket.join(roomId)
        console.log(`Socket ${socket.id} joined room ${roomId}`)
      })

      // Leave a chat room
      socket.on('leave-room', (roomId: string) => {
        socket.leave(roomId)
        console.log(`Socket ${socket.id} left room ${roomId}`)
      })

      // Typing indicators
      socket.on('typing-start', (data: { roomId: string; userId: string; userName: string }) => {
        socket.to(data.roomId).emit('user-typing', {
          userId: data.userId,
          userName: data.userName,
        })
      })

      socket.on('typing-stop', (data: { roomId: string; userId: string }) => {
        socket.to(data.roomId).emit('user-stopped-typing', {
          userId: data.userId,
        })
      })

      // User presence
      socket.on('user-online', (data: { userId: string; userName: string }) => {
        socket.broadcast.emit('user-status-change', {
          userId: data.userId,
          userName: data.userName,
          status: 'online',
        })
      })

      socket.on('user-offline', (data: { userId: string }) => {
        socket.broadcast.emit('user-status-change', {
          userId: data.userId,
          status: 'offline',
        })
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })

    res.socket.server.io = io
    // Store io instance globally for access from App Router
    ;(global as any).io = io
    console.log('Socket.IO server initialized')
  } else {
    console.log('Socket.IO server already running')
  }

  res.end()
}
