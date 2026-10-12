import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { RoomManager } from './game/room-manager.js';
import { setupSocketHandlers } from './socket/handlers.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '4000', 10);
const CLIENT_ORIGINS = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'];

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests or configured origins
      if (!origin || CLIENT_ORIGINS.includes(origin) || CLIENT_ORIGINS.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local dev / testing
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    game: 'DEAD SIGNAL',
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Support ngrok tunnels, local tunnels, and custom hostnames
      callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 20000,
  pingInterval: 10000,
});

const roomManager = new RoomManager();
setupSocketHandlers(io, roomManager);

// Periodically clean up abandoned rooms every 10 minutes
const cleanupInterval = setInterval(() => {
  const cleaned = roomManager.cleanupOldRooms();
  if (cleaned > 0) {
    console.log(`[DEAD SIGNAL] Cleaned up ${cleaned} abandoned room(s)`);
  }
}, 10 * 60 * 1000);

server.listen(PORT, () => {
  console.log(`[DEAD SIGNAL] Authoritative Game Server running on port ${PORT}`);
  console.log(`[DEAD SIGNAL] Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
function shutdown(): void {
  console.log('[DEAD SIGNAL] Server shutting down...');
  clearInterval(cleanupInterval);
  io.close(() => {
    server.close(() => {
      console.log('[DEAD SIGNAL] Server stopped cleanly.');
      process.exit(0);
    });
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { app, server, io, roomManager };

