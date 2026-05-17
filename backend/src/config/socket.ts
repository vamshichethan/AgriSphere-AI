import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`⚡ WS Client connected: ${socket.id}`);

    // Join personal room on auth
    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`   ↳ User ${userId} joined their room`);
    });

    // Join a listing room (for price alerts, bid activity)
    socket.on('join:listing', (listingId: string) => {
      socket.join(`listing:${listingId}`);
    });

    socket.on('disconnect', () => {
      console.log(`⚡ WS Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

// Utility emitters
export const emitToUser = (userId: string, event: string, data: unknown) => {
  getIO().to(`user:${userId}`).emit(event, data);
};

export const broadcastToAll = (event: string, data: unknown) => {
  getIO().emit(event, data);
};
