export type GameMode = 'standard' | 'practice';

export type GameStatus = 'waiting' | 'starting' | 'in_progress' | 'round_end' | 'game_over';

export interface Player {
  id: string; // Supabase user ID or guest UUID
  socketId: string;
  username: string;
  avatar: string;
  isHost: boolean;
  score: number;
  hasDrawn: boolean;
  hasGuessedThisRound: boolean;
  isConnected: boolean;
  joinedAt: number;
}

export interface DrawPoint {
  x: number;
  y: number;
}

export type DrawTool = 'brush' | 'eraser';

export interface DrawStroke {
  id: string;
  tool: DrawTool;
  color: string;
  size: number;
  points: DrawPoint[];
}

export interface RoomSettings {
  maxPlayers: number; // Max 11
  minPlayers: number; // Min 2
  roundDurationSeconds: number; // e.g., 60-80s
  gameMode: GameMode;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'all';
  isPrivate: boolean;
  password?: string; // Optional Room Password / PIN for private games
}

export interface RoomState {
  code: string;
  hostId: string;
  settings: RoomSettings;
  status: GameStatus;
  players: Player[];
  currentRound: number;
  totalRounds: number;
  currentDrawerId: string | null;
  drawerRotationOrder: string[];
  wordHint: string; // e.g. "_ _ _ _ _"
  wordCategory: string | null;
  roundTimeRemaining: number;
  createdAt: number;
  gameId?: string;
}

export interface ChatMessage {
  id: string;
  senderId?: string;
  senderName: string;
  avatar?: string;
  text: string;
  timestamp: number;
  type: 'player' | 'system' | 'correct' | 'join' | 'leave';
}

export interface WordItem {
  id: string;
  word: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

export interface RoundResult {
  round: number;
  word: string;
  drawerId: string;
  drawerName: string;
  correctGuessers: { playerId: string; username: string; pointsAwarded: number }[];
  drawerPointsAwarded: number;
  nobodyGuessed: boolean;
  scores: { playerId: string; username: string; totalScore: number; roundScore: number }[];
}

export interface FinalGameResult {
  gameId: string;
  roomCode: string;
  totalRounds: number;
  winner: Player;
  podium: Player[]; // top 3
  leaderboard: Player[];
  completedAt: number;
}

// Socket Events Definition
export const SOCKET_EVENTS = {
  // Client -> Server
  JOIN_ROOM: 'room:join',
  LEAVE_ROOM: 'room:leave',
  CREATE_ROOM: 'room:create',
  START_GAME: 'game:start',
  DRAW_START: 'draw:start',
  DRAW_MOVE: 'draw:move',
  DRAW_END: 'draw:end',
  DRAW_UNDO: 'draw:undo',
  DRAW_REDO: 'draw:redo',
  DRAW_CLEAR: 'draw:clear',
  SUBMIT_GUESS: 'game:guess',
  SEND_CHAT: 'chat:send',
  RECONNECT: 'user:reconnect',
  GET_SECRET_WORD: 'game:get_secret_word',

  // Server -> Client
  ROOM_STATE: 'room:state',
  PLAYER_JOINED: 'player:joined',
  PLAYER_LEFT: 'player:left',
  HOST_CHANGED: 'room:host_changed',
  GAME_STARTED: 'game:started',
  ROUND_START: 'game:round_start',
  ROUND_TICK: 'game:round_tick',
  ROUND_END: 'game:round_end',
  GAME_OVER: 'game:over',
  SECRET_WORD: 'game:secret_word', // sent ONLY to current drawer
  DRAW_STROKE_START: 'draw:stroke_start',
  DRAW_STROKE_MOVE: 'draw:stroke_move',
  DRAW_STROKE_END: 'draw:stroke_end',
  DRAW_UNDO_ALL: 'draw:undo_broadcast',
  DRAW_REDO_ALL: 'draw:redo_broadcast',
  DRAW_CLEAR_ALL: 'draw:clear_broadcast',
  DRAW_FULL_SYNC: 'draw:full_sync',
  CHAT_MESSAGE: 'chat:message',
  CORRECT_GUESS: 'game:correct_guess',
  SCORE_UPDATE: 'game:score_update',
  ERROR: 'system:error'
} as const;

export const GAME_CONSTANTS = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 11,
  DEFAULT_ROUND_TIME: 75,
  INTERMISSION_TIME: 6,
  RECONNECT_GRACE_PERIOD_MS: 45000,
  CORRECT_GUESS_POINTS: 1,
  DRAWER_BONUS_POINTS: 1,
  NO_GUESS_PENALTY_POINTS: -5,
  ROOM_CODE_LENGTH: 6,
  MAX_CHAT_LENGTH: 100,
  MAX_GUESS_LENGTH: 50
};
