import { io, Socket } from 'socket.io-client';
import {
  SOCKET_EVENTS,
  RoomSettings,
  RoomState,
  DrawStroke
} from '@guess-the-11/shared';

export const DEFAULT_SERVER_URL = 'https://trails-compressed-whom-compare.trycloudflare.com';

// Determine backend URL with multi-device support
export const getBackendUrl = (): string => {
  // 1. Check local storage override if user configured it in-app
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('guessthe11_server_url');
    // Clean up any old expired tunnels
    if (stored && (stored.includes('remains-continent-shopzilla') || !stored.startsWith('http'))) {
      localStorage.setItem('guessthe11_server_url', DEFAULT_SERVER_URL);
      return DEFAULT_SERVER_URL;
    }
    if (stored && stored.trim()) {
      return stored.trim().replace(/\/+$/, '');
    }
  }

  // 2. Check build-time env variable
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '');
  }

  // 3. If running in a web browser on a remote domain/Vercel (and NOT Capacitor mobile), use same origin
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    !window.location.hostname.includes('127.0.0.1') &&
    !window.location.protocol.includes('capacitor')
  ) {
    return window.location.origin;
  }

  // 4. Default fallback: Live Global Cloud Server (works on ANY Wi-Fi, 4G, or network worldwide)
  return DEFAULT_SERVER_URL;
};

type ConnectionListener = (connected: boolean, url: string) => void;

class SocketService {
  public socket: Socket | null = null;
  private url: string = getBackendUrl();
  private connectionListeners: ConnectionListener[] = [];

  public getServerUrl(): string {
    return this.url;
  }

  public isConnected(): boolean {
    return Boolean(this.socket && this.socket.connected);
  }

  public onConnectionChange(listener: ConnectionListener): () => void {
    this.connectionListeners.push(listener);
    // Immediately invoke with current state
    listener(this.isConnected(), this.url);
    return () => {
      this.connectionListeners = this.connectionListeners.filter((l) => l !== listener);
    };
  }

  private notifyConnection(connected: boolean): void {
    this.connectionListeners.forEach((l) => l(connected, this.url));
  }

  public setServerUrl(newUrl: string): void {
    const cleanUrl = newUrl.trim().replace(/\/+$/, '');
    if (!cleanUrl) return;

    if (typeof window !== 'undefined') {
      localStorage.setItem('guessthe11_server_url', cleanUrl);
    }

    this.url = cleanUrl;
    this.disconnect();
    this.connect();
  }

  public connect(): Socket {
    if (!this.socket || !this.socket.connected) {
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
      }

      this.socket = io(this.url, {
        transports: ['polling', 'websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 25,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 15000
      });

      this.socket.on('connect', () => {
        console.log(`[Socket] Connected to backend: ${this.url} (${this.socket?.id})`);
        this.notifyConnection(true);
      });

      this.socket.on('disconnect', (reason) => {
        console.warn(`[Socket] Disconnected: ${reason}`);
        this.notifyConnection(false);
      });

      this.socket.on('connect_error', (err) => {
        console.warn(`[Socket] Connection error to ${this.url}:`, err.message);
        this.notifyConnection(false);
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
      this.notifyConnection(false);
    }
  }

  // Safe emit with timeout so promises never hang indefinitely on unreachable servers
  private emitWithTimeout<T>(
    event: string,
    payload: any,
    timeoutMs: number = 15000
  ): Promise<T> {
    return new Promise((resolve) => {
      const s = this.getSocket();
      let finished = false;

      const timer = setTimeout(() => {
        if (!finished) {
          finished = true;
          resolve({
            success: false,
            error: `Server connection timed out (${timeoutMs / 1000}s). Make sure server is running at ${this.url}`
          } as unknown as T);
        }
      }, timeoutMs);

      const doEmit = () => {
        try {
          s.emit(event, payload, (res: T) => {
            if (!finished) {
              finished = true;
              clearTimeout(timer);
              resolve(res);
            }
          });
        } catch (err: any) {
          if (!finished) {
            finished = true;
            clearTimeout(timer);
            resolve({
              success: false,
              error: err?.message || 'Socket emit failed'
            } as unknown as T);
          }
        }
      };

      if (s.connected) {
        doEmit();
      } else {
        // Wait for connect event or emit directly if reconnecting
        s.once('connect', () => {
          if (!finished) {
            doEmit();
          }
        });
        // Also ensure connection is attempted
        if (!s.active) {
          s.connect();
        }
      }
    });
  }

  // Create room
  public createRoom(
    player: { id: string; username: string; avatar: string },
    settings: Partial<RoomSettings>
  ): Promise<{ success: boolean; roomCode?: string; state?: RoomState; error?: string }> {
    return this.emitWithTimeout(SOCKET_EVENTS.CREATE_ROOM, { player, settings }, 15000);
  }

  // Join room with optional room password
  public joinRoom(
    roomCode: string,
    player: { id: string; username: string; avatar: string },
    password?: string
  ): Promise<{ success: boolean; roomCode?: string; state?: RoomState; error?: string; requiresPassword?: boolean }> {
    return this.emitWithTimeout(SOCKET_EVENTS.JOIN_ROOM, { roomCode, player, password }, 15000);
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
    return this.emitWithTimeout(SOCKET_EVENTS.RECONNECT, { roomCode, playerId }, 15000);
  }

  // Start game
  public startGame(roomCode: string, playerId: string): Promise<{ success: boolean; error?: string }> {
    return this.emitWithTimeout(SOCKET_EVENTS.START_GAME, { roomCode, playerId }, 15000);
  }

  // Submit guess
  public submitGuess(
    roomCode: string,
    playerId: string,
    guess: string
  ): Promise<{ success: boolean; isCorrect?: boolean; error?: string }> {
    return this.emitWithTimeout(SOCKET_EVENTS.SUBMIT_GUESS, { roomCode, playerId, guess }, 4000);
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
