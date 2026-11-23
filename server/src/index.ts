import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { CONFIG } from './config.js';
import { RoomManager } from './engine/RoomManager.js';
import { setupSocketHandlers } from './socket/index.js';
import { createApiRouter } from './routes/api.js';

const app = express();
const httpServer = createServer(app);

// CORS configuration for web & mobile Capacitor
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingInterval: 25000,
  pingTimeout: 20000
});

// Initialize Room Manager & Sockets
const roomManager = new RoomManager(io);
setupSocketHandlers(io, roomManager);

// Mount API routes
app.use(createApiRouter(roomManager));

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start listening
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(CONFIG.PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 GUESS THE 11 - REALTIME SERVER RUNNING`);
    console.log(`📡 Port: ${CONFIG.PORT}`);
    console.log(`🌍 Environment: ${CONFIG.NODE_ENV}`);
    console.log(`🎮 Socket.IO: Ready for 11-player rooms`);
    console.log(`===============================================`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, closing HTTP server...');
  httpServer.close(() => {
    console.log('[Server] Process terminated');
  });
});

export { app, httpServer, io, roomManager };
