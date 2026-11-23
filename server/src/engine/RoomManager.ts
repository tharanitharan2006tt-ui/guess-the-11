import { GameRoom } from './GameRoom.js';
import { Player, RoomSettings, GAME_CONSTANTS } from '@guess-the-11/shared';
import { Server } from 'socket.io';

export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();
  private socketToPlayer: Map<string, { roomCode: string; playerId: string }> = new Map();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    // Periodic cleanup of abandoned rooms every 5 minutes
    setInterval(() => this.cleanupAbandonedRooms(), 5 * 60 * 1000);
  }

  // Generate unique 6-character alphanumeric room code
  public generateUniqueRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit ambiguous characters like 0, O, 1, I
    let code = '';
    let attempts = 0;
    do {
      code = '';
      for (let i = 0; i < GAME_CONSTANTS.ROOM_CODE_LENGTH; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      attempts++;
      if (attempts > 1000) break;
    } while (this.rooms.has(code));
    return code;
  }

  // Create a new room
  public createRoom(host: Player, settings: Partial<RoomSettings>): GameRoom {
    const code = this.generateUniqueRoomCode();
    const room = new GameRoom(code, host, settings, this.io);
    this.rooms.set(code, room);
    this.socketToPlayer.set(host.socketId, { roomCode: code, playerId: host.id });
    console.log(`[RoomManager] Room created: ${code} by ${host.username}`);
    return room;
  }

  // Get room
  public getRoom(code: string): GameRoom | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  // Quick Play Matchmaking
  public findQuickPlayRoom(): GameRoom | null {
    for (const room of this.rooms.values()) {
      if (!room.settings.isPrivate && room.status === 'waiting' && room.players.size < room.settings.maxPlayers) {
        return room;
      }
    }
    return null;
  }

  // Register socket
  public registerSocket(socketId: string, roomCode: string, playerId: string): void {
    this.socketToPlayer.set(socketId, { roomCode, playerId });
  }

  // Remove socket
  public handleSocketDisconnect(socketId: string): void {
    const session = this.socketToPlayer.get(socketId);
    if (!session) return;

    this.socketToPlayer.delete(socketId);
    const room = this.rooms.get(session.roomCode);
    if (room) {
      room.handleDisconnect(session.playerId);
      // If room is empty, destroy it
      const activePlayers = Array.from(room.players.values()).filter(p => p.isConnected);
      if (activePlayers.length === 0 && room.status === 'waiting') {
        console.log(`[RoomManager] Destroying empty room: ${session.roomCode}`);
        room.destroy();
        this.rooms.delete(session.roomCode);
      }
    }
  }

  // Admin stats
  public getStats() {
    let totalPlayers = 0;
    let activeGames = 0;
    let waitingRooms = 0;

    for (const room of this.rooms.values()) {
      totalPlayers += room.players.size;
      if (room.status === 'in_progress') activeGames++;
      if (room.status === 'waiting') waitingRooms++;
    }

    return {
      totalRooms: this.rooms.size,
      activeGames,
      waitingRooms,
      totalPlayers,
      popularCategories: ['Animals', 'Food', 'Sports', 'Technology', 'Movies']
    };
  }

  private cleanupAbandonedRooms(): void {
    const now = Date.now();
    for (const [code, room] of this.rooms.entries()) {
      const isStale = (now - room.createdAt) > 3 * 3600 * 1000; // 3 hours
      const noConnected = Array.from(room.players.values()).every(p => !p.isConnected);
      if (isStale || (noConnected && room.status !== 'in_progress')) {
        console.log(`[RoomManager] Cleaning up abandoned room: ${code}`);
        room.destroy();
        this.rooms.delete(code);
      }
    }
  }
}
