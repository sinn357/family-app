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
