import { io, Socket } from 'socket.io-client';
import {
  SOCKET_EVENTS,
  RoomSettings,
  RoomState,
  DrawStroke
} from '@guess-the-11/shared';

export const DEFAULT_SERVER_URL = 'https://guess-the-11-backend.onrender.com';

// Determine backend URL with multi-device support
export const getBackendUrl = (): string => {
  // 1. Check local storage override if user configured it in-app
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('guessthe11_server_url');
    // Automatically migrate away from temporary tunnels, localhost, and local IPs to permanent Render cloud server
    if (
      stored &&
      (stored.includes('trycloudflare.com') ||
       stored.includes('loca.lt') ||
       stored.includes('remains-continent') ||
       stored.includes('trails-compressed') ||
       stored.includes('localhost') ||
       stored.includes('10.92.') ||
       stored.includes('192.168.') ||
       stored.includes('127.0.0.1') ||
       !stored.startsWith('http'))
    ) {
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

  // 3. If running directly on the backend server domain itself (e.g. onrender.com)
  if (
    typeof window !== 'undefined' &&
    window.location.hostname.includes('onrender.com')
  ) {
    return window.location.origin;
  }

  // 4. Default fallback: Live Global 24/7 Render Server (works worldwide on ANY Wi-Fi or 4G/5G)
  return DEFAULT_SERVER_URL;
};

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';
type ConnectionListener = (connected: boolean, url: string, status: ConnectionStatus) => void;

class SocketService {
  public socket: Socket | null = null;
  public currentSecretWord: { word: string; category: string; hint?: string } | null = null;
  private url: string = getBackendUrl();
  private connectionListeners: ConnectionListener[] = [];
  public status: ConnectionStatus = 'connecting';

  constructor() {
    // Automatically connect to backend server on app launch
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.connect();
        this.pingHealth();
      }, 50);
    }
  }

  public getServerUrl(): string {
    return this.url;
  }

  public isConnected(): boolean {
    return Boolean(this.socket && this.socket.connected);
  }

  public getStatus(): ConnectionStatus {
    if (this.isConnected()) return 'connected';
    return this.status;
  }

  public onConnectionChange(listener: ConnectionListener): () => void {
    this.connectionListeners.push(listener);
    // Immediately invoke with current state
    listener(this.isConnected(), this.url, this.getStatus());
    return () => {
      this.connectionListeners = this.connectionListeners.filter((l) => l !== listener);
    };
  }

  private notifyConnection(connected: boolean, forcedStatus?: ConnectionStatus): void {
    this.status = forcedStatus || (connected ? 'connected' : 'connecting');
    this.connectionListeners.forEach((l) => l(connected, this.url, this.status));
  }

  // Ping health endpoint to wake up Render cloud backend immediately on app launch
  public async pingHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45000);
      const res = await fetch(`${this.url}/health`, {
        signal: controller.signal,
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      clearTimeout(timer);
      if (res.ok) {
        if (!this.isConnected()) {
          this.connect();
        }
        return true;
      }
    } catch {
      // Ignored: socket reconnection loop will automatically connect once server finishes waking up
    }
    return false;
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

      this.status = 'connecting';
      this.notifyConnection(false, 'connecting');

      this.socket = io(this.url, {
        transports: ['polling', 'websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 4000,
        timeout: 30000
      });

      this.socket.on('connect', () => {
        console.log(`[Socket] Connected to backend: ${this.url} (${this.socket?.id})`);
        this.status = 'connected';
        this.notifyConnection(true, 'connected');
      });

      this.socket.on('disconnect', (reason) => {
        console.warn(`[Socket] Disconnected: ${reason}`);
        this.status = 'connecting';
        this.notifyConnection(false, 'connecting');
      });

      this.socket.on('connect_error', (err) => {
        console.warn(`[Socket] Connection error to ${this.url}:`, err.message);
        this.status = 'connecting';
        this.notifyConnection(false, 'connecting');
      });

      this.socket.on(SOCKET_EVENTS.SECRET_WORD, (data: any) => {
        this.currentSecretWord = data;
      });

      this.socket.on(SOCKET_EVENTS.ROUND_START, () => {
        this.currentSecretWord = null;
      });

      this.socket.on(SOCKET_EVENTS.ROUND_END, () => {
        this.currentSecretWord = null;
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
      this.status = 'disconnected';
      this.notifyConnection(false, 'disconnected');
    }
  }

  // Safe emit with timeout so promises never hang indefinitely on unreachable servers
  private emitWithTimeout<T>(
    event: string,
    payload: any,
    timeoutMs: number = 35000
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

  // Get secret word for current drawer
  public getSecretWord(
    roomCode: string,
    playerId: string
  ): Promise<{ success: boolean; secretWord?: { word: string; category: string; hint?: string } }> {
    return this.emitWithTimeout(SOCKET_EVENTS.GET_SECRET_WORD, { roomCode, playerId }, 5000);
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
