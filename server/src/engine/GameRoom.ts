import {
  Player,
  RoomSettings,
  RoomState,
  DrawStroke,
  ChatMessage,
  WordItem,
  RoundResult,
  FinalGameResult,
  SOCKET_EVENTS,
  GAME_CONSTANTS
} from '@guess-the-11/shared';
import { getRandomWord, generateWordHint } from '../words/database.js';
import { DatabaseService } from '../database.js';
import { Server, Socket } from 'socket.io';

export class GameRoom {
  public code: string;
  public hostId: string;
  public settings: RoomSettings;
  public status: RoomState['status'] = 'waiting';
  public players: Map<string, Player> = new Map(); // key is playerId
  public currentRound: number = 0;
  public totalRounds: number = 11;
  public currentDrawerId: string | null = null;
  public drawerRotationOrder: string[] = [];
  public currentWord: WordItem | null = null;
  public wordHint: string = '';
  public roundTimeRemaining: number = 0;
  public createdAt: number = Date.now();
  public gameId: string = '';

  private io: Server;
  private timerInterval: NodeJS.Timeout | null = null;
  private intermissionTimeout: NodeJS.Timeout | null = null;
  private drawingHistory: DrawStroke[] = [];
  private undoneHistory: DrawStroke[] = [];
  private usedWords: string[] = [];
  private correctGuessersThisRound: Set<string> = new Set();
  private disconnectTimers: Map<string, NodeJS.Timeout> = new Map();
  private lastGuessTime: Map<string, number> = new Map();

  constructor(code: string, host: Player, settings: Partial<RoomSettings>, io: Server) {
    this.code = code;
    this.hostId = host.id;
    this.io = io;
    this.settings = {
      maxPlayers: GAME_CONSTANTS.MAX_PLAYERS,
      minPlayers: GAME_CONSTANTS.MIN_PLAYERS,
      roundDurationSeconds: GAME_CONSTANTS.DEFAULT_ROUND_TIME,
      gameMode: 'standard',
      category: 'all',
      difficulty: 'all',
      isPrivate: false,
      ...settings
    };

    // Add host as player 1
    host.isHost = true;
    this.players.set(host.id, host);
  }

  // Get Room State for clients
  public getState(): RoomState {
    return {
      code: this.code,
      hostId: this.hostId,
      settings: this.settings,
      status: this.status,
      players: Array.from(this.players.values()),
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      currentDrawerId: this.currentDrawerId,
      drawerRotationOrder: this.drawerRotationOrder,
      wordHint: this.wordHint,
      wordCategory: this.currentWord?.category || null,
      roundTimeRemaining: this.roundTimeRemaining,
      createdAt: this.createdAt,
      gameId: this.gameId
    };
  }

  // Broadcast state to all sockets in room
  public broadcastState(): void {
    this.io.to(this.code).emit(SOCKET_EVENTS.ROOM_STATE, this.getState());
  }

  // Add a player
  public addPlayer(player: Player): { success: boolean; error?: string } {
    if (this.status !== 'waiting') {
      return { success: false, error: 'Game has already started' };
    }

    if (this.players.size >= this.settings.maxPlayers) {
      return { success: false, error: 'Room is full (maximum 11 players)' };
    }

    // Check duplicate username
    const existingName = Array.from(this.players.values()).find(
      p => p.username.toLowerCase() === player.username.toLowerCase() && p.id !== player.id
    );
    if (existingName) {
      return { success: false, error: 'A player with this nickname is already in the room' };
    }

    // Clear any disconnect timer if reconnecting
    if (this.disconnectTimers.has(player.id)) {
      clearTimeout(this.disconnectTimers.get(player.id)!);
      this.disconnectTimers.delete(player.id);
    }

    player.isHost = player.id === this.hostId;
    this.players.set(player.id, player);
    return { success: true };
  }

  // Remove player
  public removePlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    this.players.delete(playerId);
    if (this.disconnectTimers.has(playerId)) {
      clearTimeout(this.disconnectTimers.get(playerId)!);
      this.disconnectTimers.delete(playerId);
    }

    // If game in progress and drawer left, end round immediately
    if (this.status === 'in_progress' && this.currentDrawerId === playerId) {
      this.endRound(true);
    }

    // If host left, transfer host to next player
    if (this.hostId === playerId && this.players.size > 0) {
      const nextHost = Array.from(this.players.values())[0];
      this.hostId = nextHost.id;
      nextHost.isHost = true;
      this.io.to(this.code).emit(SOCKET_EVENTS.HOST_CHANGED, { newHostId: nextHost.id });
    }

    this.broadcastState();
  }

  // Handle temporary disconnect
  public handleDisconnect(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    player.isConnected = false;
    this.broadcastState();

    // Set grace period timer
    const timer = setTimeout(() => {
      console.log(`[GameRoom ${this.code}] Player ${player.username} grace period expired, removing`);
      this.removePlayer(playerId);
    }, GAME_CONSTANTS.RECONNECT_GRACE_PERIOD_MS);

    this.disconnectTimers.set(playerId, timer);
  }

  // Handle reconnect
  public handleReconnect(playerId: string, newSocketId: string): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;

    if (this.disconnectTimers.has(playerId)) {
      clearTimeout(this.disconnectTimers.get(playerId)!);
      this.disconnectTimers.delete(playerId);
    }

    player.isConnected = true;
    player.socketId = newSocketId;

    // Send full drawing synchronization to the reconnecting player
    const socket = this.io.sockets.sockets.get(newSocketId);
    if (socket) {
      socket.emit(SOCKET_EVENTS.DRAW_FULL_SYNC, this.drawingHistory);
      // If this player is the current drawer, re-send secret word
      if (this.currentDrawerId === playerId && this.currentWord) {
        socket.emit(SOCKET_EVENTS.SECRET_WORD, {
          word: this.currentWord.word,
          category: this.currentWord.category,
          hint: this.currentWord.hint
        });
      }
    }

    this.broadcastState();
    return true;
  }

  // Start the game
  public startGame(requestingPlayerId: string): { success: boolean; error?: string } {
    if (requestingPlayerId !== this.hostId) {
      return { success: false, error: 'Only the host can start the game' };
    }

    const playerCount = this.players.size;
    if (this.settings.gameMode === 'standard') {
      if (playerCount < 11) {
        return { success: false, error: 'Standard mode requires exactly 11 players. Switch to Practice mode for 2-10 players.' };
      }
    } else {
      if (playerCount < this.settings.minPlayers) {
        return { success: false, error: `At least ${this.settings.minPlayers} players are required to start` };
      }
    }

    this.status = 'in_progress';
    this.totalRounds = playerCount; // Each player draws once
    this.currentRound = 0;
    this.gameId = `game_${Date.now()}_${this.code}`;

    // Establish drawer rotation order
    const playerIds = Array.from(this.players.keys());
    // Shuffle player order for fairness
    this.drawerRotationOrder = [...playerIds].sort(() => Math.random() - 0.5);

    // Reset scores & flags
    this.players.forEach(p => {
      p.score = 0;
      p.hasDrawn = false;
      p.hasGuessedThisRound = false;
    });

    DatabaseService.recordGameStart(this.gameId, this.code, this.totalRounds);

    this.io.to(this.code).emit(SOCKET_EVENTS.GAME_STARTED, {
      totalRounds: this.totalRounds,
      drawerOrder: this.drawerRotationOrder
    });

    // Start round 1
    this.startNextRound();
    return { success: true };
  }

  // Start next round
  private startNextRound(): void {
    if (this.currentRound >= this.totalRounds) {
      this.endGame();
      return;
    }

    this.currentRound += 1;
    this.currentDrawerId = this.drawerRotationOrder[this.currentRound - 1];
    const drawer = this.players.get(this.currentDrawerId);
    if (drawer) {
      drawer.hasDrawn = true;
    }

    // Reset round states
    this.correctGuessersThisRound.clear();
    this.drawingHistory = [];
    this.undoneHistory = [];
    this.players.forEach(p => {
      p.hasGuessedThisRound = false;
    });

    // Select random word
    this.currentWord = getRandomWord(this.settings.category, this.settings.difficulty, this.usedWords);
    this.usedWords.push(this.currentWord.word.toLowerCase());
    this.wordHint = generateWordHint(this.currentWord.word);
    this.roundTimeRemaining = this.settings.roundDurationSeconds;

    this.broadcastState();

    // Send secret word ONLY to the drawer
    if (drawer) {
      const drawerSocket = this.io.sockets.sockets.get(drawer.socketId);
      if (drawerSocket) {
        drawerSocket.emit(SOCKET_EVENTS.SECRET_WORD, {
          word: this.currentWord.word,
          category: this.currentWord.category,
          hint: this.currentWord.hint
        });
      }
    }

    // Announce round start
    this.io.to(this.code).emit(SOCKET_EVENTS.ROUND_START, {
      round: this.currentRound,
      totalRounds: this.totalRounds,
      drawerId: this.currentDrawerId,
      drawerName: drawer?.username || 'Drawer',
      category: this.currentWord.category,
      wordHint: this.wordHint,
      duration: this.roundTimeRemaining
    });

    // Clear canvas for all
    this.io.to(this.code).emit(SOCKET_EVENTS.DRAW_CLEAR_ALL);

    // Start timer
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.roundTimeRemaining -= 1;
      this.io.to(this.code).emit(SOCKET_EVENTS.ROUND_TICK, { timeRemaining: this.roundTimeRemaining });

      if (this.roundTimeRemaining <= 0) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.endRound(false);
      }
    }, 1000);
  }

  // End round & calculate server scores
  private endRound(drawerAborted = false): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const drawer = this.currentDrawerId ? this.players.get(this.currentDrawerId) : null;
    const guesserCount = this.correctGuessersThisRound.size;
    let drawerPoints = 0;
    let nobodyGuessed = false;

    if (drawer) {
      if (guesserCount > 0) {
        // Drawer bonus: +1 point if at least one player guessed correctly
        drawerPoints = GAME_CONSTANTS.DRAWER_BONUS_POINTS;
        drawer.score += drawerPoints;
      } else {
        // Nobody guessed correctly: Drawer gets -5 points
        drawerPoints = GAME_CONSTANTS.NO_GUESS_PENALTY_POINTS;
        drawer.score += drawerPoints;
        nobodyGuessed = true;
      }
    }

    const roundResult: RoundResult = {
      round: this.currentRound,
      word: this.currentWord?.word || '',
      drawerId: this.currentDrawerId || '',
      drawerName: drawer?.username || '',
      correctGuessers: Array.from(this.correctGuessersThisRound).map(id => {
        const p = this.players.get(id);
        return { playerId: id, username: p?.username || '', pointsAwarded: GAME_CONSTANTS.CORRECT_GUESS_POINTS };
      }),
      drawerPointsAwarded: drawerPoints,
      nobodyGuessed,
      scores: Array.from(this.players.values()).map(p => ({
        playerId: p.id,
        username: p.username,
        totalScore: p.score,
        roundScore: p.id === this.currentDrawerId ? drawerPoints : (this.correctGuessersThisRound.has(p.id) ? 1 : 0)
      }))
    };

    // Save round to database
    DatabaseService.recordRound(this.gameId, roundResult);

    // Emit round end to all with revealed word and scores
    this.io.to(this.code).emit(SOCKET_EVENTS.ROUND_END, roundResult);
    this.broadcastState();

    // Intermission before next round
    this.intermissionTimeout = setTimeout(() => {
      if (this.currentRound >= this.totalRounds) {
        this.endGame();
      } else {
        this.startNextRound();
      }
    }, GAME_CONSTANTS.INTERMISSION_TIME * 1000);
  }

  // End complete game
  private endGame(): void {
    this.status = 'game_over';

    const rankedPlayers = Array.from(this.players.values())
      .sort((a, b) => b.score - a.score);

    const winner = rankedPlayers[0] || null;
    const podium = rankedPlayers.slice(0, 3);

    const finalResult: FinalGameResult = {
      gameId: this.gameId,
      roomCode: this.code,
      totalRounds: this.totalRounds,
      winner,
      podium,
      leaderboard: rankedPlayers,
      completedAt: Date.now()
    };

    DatabaseService.recordGameEnd(finalResult);

    this.io.to(this.code).emit(SOCKET_EVENTS.GAME_OVER, finalResult);
    this.broadcastState();
  }

  // Submit guess
  public handleGuess(playerId: string, rawGuess: string): { success: boolean; isCorrect: boolean; error?: string } {
    if (this.status !== 'in_progress') {
      return { success: false, isCorrect: false, error: 'Round is not in progress' };
    }

    const player = this.players.get(playerId);
    if (!player) {
      return { success: false, isCorrect: false, error: 'Player not found in room' };
    }

    if (playerId === this.currentDrawerId) {
      return { success: false, isCorrect: false, error: 'Drawer cannot submit guesses' };
    }

    if (player.hasGuessedThisRound) {
      return { success: false, isCorrect: false, error: 'You have already guessed the word this round' };
    }

    // Rate limiting (max 1 guess per 400ms)
    const now = Date.now();
    const lastTime = this.lastGuessTime.get(playerId) || 0;
    if (now - lastTime < 400) {
      return { success: false, isCorrect: false, error: 'Guessing too fast' };
    }
    this.lastGuessTime.set(playerId, now);

    // Normalize guess: remove excessive whitespace, case-insensitive
    const normalizedGuess = rawGuess.trim().replace(/\s+/g, ' ').toLowerCase();
    const secretWord = this.currentWord?.word.trim().toLowerCase();

    if (!secretWord) {
      return { success: false, isCorrect: false, error: 'Secret word not found' };
    }

    if (normalizedGuess === secretWord) {
      // Correct guess!
      player.hasGuessedThisRound = true;
      player.score += GAME_CONSTANTS.CORRECT_GUESS_POINTS;
      this.correctGuessersThisRound.add(playerId);

      // Emit correct guess notification
      this.io.to(this.code).emit(SOCKET_EVENTS.CORRECT_GUESS, {
        playerId,
        username: player.username,
        points: GAME_CONSTANTS.CORRECT_GUESS_POINTS
      });

      // Emit chat announcement (DO NOT reveal secret word)
      const chatMsg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random()}`,
        senderName: 'SYSTEM',
        text: `🎉 ${player.username} guessed the secret word! (+1 pt)`,
        timestamp: Date.now(),
        type: 'correct'
      };
      this.io.to(this.code).emit(SOCKET_EVENTS.CHAT_MESSAGE, chatMsg);

      this.broadcastState();

      // Check if all non-drawing players have guessed
      const eligibleGuessers = Array.from(this.players.values()).filter(
        p => p.id !== this.currentDrawerId && p.isConnected
      );
      if (this.correctGuessersThisRound.size >= eligibleGuessers.length) {
        // All players guessed correctly! End round early!
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.endRound(false);
      }

      return { success: true, isCorrect: true };
    } else {
      // Normal chat message for incorrect guess
      const chatMsg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random()}`,
        senderId: player.id,
        senderName: player.username,
        avatar: player.avatar,
        text: rawGuess.trim().slice(0, GAME_CONSTANTS.MAX_GUESS_LENGTH),
        timestamp: Date.now(),
        type: 'player'
      };
      this.io.to(this.code).emit(SOCKET_EVENTS.CHAT_MESSAGE, chatMsg);
      return { success: true, isCorrect: false };
    }
  }

  // Drawing event handlers (Drawer-only permissions)
  public handleDrawStroke(playerId: string, stroke: DrawStroke): boolean {
    if (this.status !== 'in_progress' || playerId !== this.currentDrawerId) {
      return false;
    }
    this.drawingHistory.push(stroke);
    this.undoneHistory = []; // clear redo stack on new action
    // Broadcast stroke to other room members
    this.io.to(this.code).emit(SOCKET_EVENTS.DRAW_STROKE_START, stroke);
    return true;
  }

  public handleDrawUndo(playerId: string): boolean {
    if (this.status !== 'in_progress' || playerId !== this.currentDrawerId) {
      return false;
    }
    if (this.drawingHistory.length > 0) {
      const removed = this.drawingHistory.pop();
      if (removed) {
        this.undoneHistory.push(removed);
      }
      this.io.to(this.code).emit(SOCKET_EVENTS.DRAW_UNDO_ALL, { drawingHistory: this.drawingHistory });
      return true;
    }
    return false;
  }

  public handleDrawRedo(playerId: string): boolean {
    if (this.status !== 'in_progress' || playerId !== this.currentDrawerId) {
      return false;
    }
    if (this.undoneHistory.length > 0) {
      const restored = this.undoneHistory.pop();
      if (restored) {
        this.drawingHistory.push(restored);
        this.io.to(this.code).emit(SOCKET_EVENTS.DRAW_REDO_ALL, { stroke: restored });
        return true;
      }
    }
    return false;
  }

  public handleDrawClear(playerId: string): boolean {
    if (this.status !== 'in_progress' || playerId !== this.currentDrawerId) {
      return false;
    }
    this.drawingHistory = [];
    this.undoneHistory = [];
    this.io.to(this.code).emit(SOCKET_EVENTS.DRAW_CLEAR_ALL);
    return true;
  }

  // Reset for Play Again
  public resetGame(requestingPlayerId: string): boolean {
    if (requestingPlayerId !== this.hostId) return false;
    this.status = 'waiting';
    this.currentRound = 0;
    this.currentDrawerId = null;
    this.drawingHistory = [];
    this.undoneHistory = [];
    this.usedWords = [];
    this.players.forEach(p => {
      p.score = 0;
      p.hasDrawn = false;
      p.hasGuessedThisRound = false;
    });
    this.broadcastState();
    return true;
  }

  // Cleanup on destroy
  public destroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.intermissionTimeout) clearTimeout(this.intermissionTimeout);
    this.disconnectTimers.forEach(t => clearTimeout(t));
    this.disconnectTimers.clear();
  }
}
