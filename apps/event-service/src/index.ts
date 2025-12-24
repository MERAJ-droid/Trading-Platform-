import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createClient } from 'redis';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3003;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const JWT_SECRET = process.env.JWT_SECRET!;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Store user sockets
const userSockets = new Map<string, Set<string>>();

async function main() {
  console.log('🚀 Starting Event Service...');
  
  // Create HTTP server
  const httpServer = createServer();
  
  // Create Socket.IO server
  const io = new Server(httpServer, {
    cors: {
      origin: CORS_ORIGIN,
      credentials: true,
    },
  });
  
  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      socket.data.userId = decoded.userId;
      socket.data.email = decoded.email;
      
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });
  
  // Handle connections
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`✅ User connected: ${userId} (${socket.id})`);
    
    // Register socket for user
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socket.id);
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${userId} (${socket.id})`);
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });
  
  // Create Redis subscriber
  const redisClient = createClient({ url: REDIS_URL });
  await redisClient.connect();
  console.log('✅ Connected to Redis');
  
  // Subscribe to order events
  await redisClient.subscribe('events:order:status', (message) => {
    try {
      const event = JSON.parse(message);
      const userId = event.userId;
      
      console.log(`📤 Broadcasting order event to user ${userId}:`, event.orderId);
      
      // Get all sockets for this user
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.forEach((socketId) => {
          io.to(socketId).emit('ORDER_UPDATE', event);
        });
      }
    } catch (error) {
      console.error('Error broadcasting event:', error);
    }
  });
  
  console.log('👂 Listening for order events on Redis channel: events:order:status');
  
  // Start server
  httpServer.listen(PORT, () => {
    console.log(`🚀 Event Service running on port ${PORT}`);
  });
}

main().catch(console.error);
