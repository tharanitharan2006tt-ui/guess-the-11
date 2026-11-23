import { Router } from 'express';
import { RoomManager } from '../engine/RoomManager.js';
import { DatabaseService } from '../database.js';
import { CONFIG } from '../config.js';

export function createApiRouter(roomManager: RoomManager): Router {
  const router = Router();

  // Health check (supports both /health and /api/health)
  const handleHealth = (_req: any, res: any) => {
    res.json({
      status: 'ok',
      service: 'Guess The 11 Backend',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  };

  router.get('/health', handleHealth);
  router.get('/api/health', handleHealth);

  // Admin stats endpoint (PHASE 20)
  router.get('/api/admin/stats', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${CONFIG.ADMIN_SECRET}`) {
      // Allow local development check or require admin token
      if (CONFIG.NODE_ENV === 'production' && req.query.secret !== CONFIG.ADMIN_SECRET) {
        return res.status(401).json({ error: 'Unauthorized admin access' });
      }
    }

    const roomStats = roomManager.getStats();
    const leaderboard = await DatabaseService.getLeaderboard(10);

    res.json({
      success: true,
      data: {
        activeRooms: roomStats.totalRooms,
        activeGames: roomStats.activeGames,
        waitingRooms: roomStats.waitingRooms,
        onlinePlayers: roomStats.totalPlayers,
        popularCategories: roomStats.popularCategories,
        topLeaderboard: leaderboard,
        serverTime: new Date().toISOString()
      }
    });
  });

  // Global public leaderboard (PHASE 15)
  router.get('/api/leaderboard', async (_req, res) => {
    const list = await DatabaseService.getLeaderboard(25);
    res.json({ success: true, leaderboard: list });
  });

  // Quick Play lookup
  router.get('/api/rooms/quick-play', (_req, res) => {
    const room = roomManager.findQuickPlayRoom();
    if (room) {
      res.json({ success: true, roomCode: room.code });
    } else {
      res.json({ success: false, message: 'No available open room found. You can create one!' });
    }
  });

  // Room details lookup
  router.get('/api/rooms/:code', (req, res) => {
    const room = roomManager.getRoom(req.params.code);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    res.json({ success: true, state: room.getState() });
  });

  return router;
}
