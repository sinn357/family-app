import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import type { Server as NetServer, Socket } from 'net'
import type { NextApiResponse } from 'next'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer {
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

  return io
}
