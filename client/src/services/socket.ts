import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS, Player, RoomSettings, RoomState, DrawStroke, ChatMessage, RoundResult, FinalGameResult } from '@guess-the-11/shared';

// Determine backend URL
const getBackendUrl = (): string => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  // If running in browser and not localhost port 3000, fallback to same origin or port 4000
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return window.location.origin;
  }
  return 'http://localhost:4000';
};

class SocketService {
  public socket: Socket | null = null;
  private url: string = getBackendUrl();

  public connect(): Socket {
    if (!this.socket || !this.socket.connected) {
      this.socket = io(this.url, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log(`[Socket] Connected to backend: ${this.socket?.id}`);
      });

      this.socket.on('disconnect', (reason) => {
        console.warn(`[Socket] Disconnected: ${reason}`);
      });

      this.socket.on('connect_error', (err) => {
        console.error(`[Socket] Connection error:`, err);
      });
    }
    return this.socket;
  }

  public getSocket(): Socket {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Create room
  public createRoom(
    player: { id: string; username: string; avatar: string },
    settings: Partial<RoomSettings>
  ): Promise<{ success: boolean; roomCode?: string; state?: RoomState; error?: string }> {
    return new Promise((resolve) => {
      const s = this.getSocket();
      s.emit(SOCKET_EVENTS.CREATE_ROOM, { player, settings }, (res: any) => {
        resolve(res);
      });
    });
  }

  // Join room
  public joinRoom(
    roomCode: string,
    player: { id: string; username: string; avatar: string }
  ): Promise<{ success: boolean; roomCode?: string; state?: RoomState; error?: string }> {
    return new Promise((resolve) => {
      const s = this.getSocket();
      s.emit(SOCKET_EVENTS.JOIN_ROOM, { roomCode, player }, (res: any) => {
        resolve(res);
      });
    });
  }

  // Leave room
  public leaveRoom(roomCode: string, playerId: string): void {
    const s = this.getSocket();
    s.emit(SOCKET_EVENTS.LEAVE_ROOM, { roomCode, playerId });
  }

  // Reconnect
  public reconnectRoom(
    roomCode: string,
    playerId: string
  ): Promise<{ success: boolean; state?: RoomState; error?: string }> {
    return new Promise((resolve) => {
      const s = this.getSocket();
      s.emit(SOCKET_EVENTS.RECONNECT, { roomCode, playerId }, (res: any) => {
        resolve(res);
      });
    });
  }

  // Start game
  public startGame(roomCode: string, playerId: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const s = this.getSocket();
      s.emit(SOCKET_EVENTS.START_GAME, { roomCode, playerId }, (res: any) => {
        resolve(res);
      });
    });
  }

  // Submit guess
  public submitGuess(
    roomCode: string,
    playerId: string,
    guess: string
  ): Promise<{ success: boolean; isCorrect?: boolean; error?: string }> {
    return new Promise((resolve) => {
      const s = this.getSocket();
      s.emit(SOCKET_EVENTS.SUBMIT_GUESS, { roomCode, playerId, guess }, (res: any) => {
        resolve(res);
      });
    });
  }

  // Send chat
  public sendChat(roomCode: string, playerId: string, text: string): void {
    const s = this.getSocket();
    s.emit(SOCKET_EVENTS.SEND_CHAT, { roomCode, playerId, text });
  }

  // Drawing emits
  public emitDrawStroke(roomCode: string, playerId: string, stroke: DrawStroke): void {
    const s = this.getSocket();
    s.emit(SOCKET_EVENTS.DRAW_START, { roomCode, playerId, stroke });
  }

  public emitDrawUndo(roomCode: string, playerId: string): void {
    const s = this.getSocket();
    s.emit(SOCKET_EVENTS.DRAW_UNDO, { roomCode, playerId });
  }

  public emitDrawRedo(roomCode: string, playerId: string): void {
    const s = this.getSocket();
    s.emit(SOCKET_EVENTS.DRAW_REDO, { roomCode, playerId });
  }

  public emitDrawClear(roomCode: string, playerId: string): void {
    const s = this.getSocket();
    s.emit(SOCKET_EVENTS.DRAW_CLEAR, { roomCode, playerId });
  }
}

export const socketService = new SocketService();
