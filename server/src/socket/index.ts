import { Server, Socket } from 'socket.io';
import { RoomManager } from '../engine/RoomManager.js';
import {
  SOCKET_EVENTS,
  Player,
  RoomSettings,
  DrawStroke,
  ChatMessage
} from '@guess-the-11/shared';

export function setupSocketHandlers(io: Server, roomManager: RoomManager) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] New connection: ${socket.id}`);

    // CREATE ROOM
    socket.on(SOCKET_EVENTS.CREATE_ROOM, (data: { player: Omit<Player, 'socketId' | 'isHost' | 'score' | 'hasDrawn' | 'hasGuessedThisRound' | 'isConnected' | 'joinedAt'>; settings?: Partial<RoomSettings> }, callback) => {
      try {
        const host: Player = {
          ...data.player,
          socketId: socket.id,
          isHost: true,
          score: 0,
          hasDrawn: false,
          hasGuessedThisRound: false,
          isConnected: true,
          joinedAt: Date.now()
        };

        const room = roomManager.createRoom(host, data.settings || {});
        socket.join(room.code);
        roomManager.registerSocket(socket.id, room.code, host.id);

        if (typeof callback === 'function') {
          callback({ success: true, roomCode: room.code, state: room.getState() });
        }
        room.broadcastState();
      } catch (err: any) {
        console.error('[Socket] create_room error:', err);
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // JOIN ROOM
    socket.on(SOCKET_EVENTS.JOIN_ROOM, (data: { roomCode: string; player: Omit<Player, 'socketId' | 'isHost' | 'score' | 'hasDrawn' | 'hasGuessedThisRound' | 'isConnected' | 'joinedAt'>; password?: string }, callback) => {
      try {
        const code = data.roomCode?.toUpperCase()?.trim();
        const room = roomManager.getRoom(code);

        if (!room) {
          if (typeof callback === 'function') callback({ success: false, error: 'Room does not exist' });
          return;
        }

        // Validate password if room is password protected
        if (room.settings.password && room.settings.password.trim() !== '') {
          const provided = (data.password || '').trim();
          if (provided !== room.settings.password.trim()) {
            if (typeof callback === 'function') {
              callback({ success: false, error: 'Incorrect room password. Please enter the password shared by the host.', requiresPassword: true });
            }
            return;
          }
        }

        const newPlayer: Player = {
          ...data.player,
          socketId: socket.id,
          isHost: false,
          score: 0,
          hasDrawn: false,
          hasGuessedThisRound: false,
          isConnected: true,
          joinedAt: Date.now()
        };

        const result = room.addPlayer(newPlayer);
        if (!result.success) {
          if (typeof callback === 'function') callback({ success: false, error: result.error });
          return;
        }

        socket.join(room.code);
        roomManager.registerSocket(socket.id, room.code, newPlayer.id);

        // Notify chat
        const joinMsg: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random()}`,
          senderName: 'SYSTEM',
          text: `👋 ${newPlayer.username} joined the lobby (${room.players.size}/${room.settings.maxPlayers})`,
          timestamp: Date.now(),
          type: 'join'
        };
        io.to(room.code).emit(SOCKET_EVENTS.CHAT_MESSAGE, joinMsg);

        if (typeof callback === 'function') {
          callback({ success: true, roomCode: room.code, state: room.getState() });
        }
        room.broadcastState();
      } catch (err: any) {
        console.error('[Socket] join_room error:', err);
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // LEAVE ROOM
    socket.on(SOCKET_EVENTS.LEAVE_ROOM, (data: { roomCode: string; playerId: string }) => {
      const room = roomManager.getRoom(data.roomCode);
      if (room) {
        const player = room.players.get(data.playerId);
        const name = player?.username || 'Player';
        room.removePlayer(data.playerId);
        socket.leave(data.roomCode);

        const leaveMsg: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random()}`,
          senderName: 'SYSTEM',
          text: `🚪 ${name} left the room`,
          timestamp: Date.now(),
          type: 'leave'
        };
        io.to(data.roomCode).emit(SOCKET_EVENTS.CHAT_MESSAGE, leaveMsg);
      }
    });

    // RECONNECT
    socket.on(SOCKET_EVENTS.RECONNECT, (data: { roomCode: string; playerId: string }, callback) => {
      const room = roomManager.getRoom(data.roomCode);
      if (!room) {
        if (typeof callback === 'function') callback({ success: false, error: 'Room no longer exists' });
        return;
      }

      const reconnected = room.handleReconnect(data.playerId, socket.id);
      if (reconnected) {
        socket.join(room.code);
        roomManager.registerSocket(socket.id, room.code, data.playerId);
        if (typeof callback === 'function') {
          callback({ success: true, state: room.getState() });
        }
      } else {
        if (typeof callback === 'function') callback({ success: false, error: 'Could not restore session' });
      }
    });

    // START GAME
    socket.on(SOCKET_EVENTS.START_GAME, (data: { roomCode: string; playerId: string }, callback) => {
      const room = roomManager.getRoom(data.roomCode);
      if (!room) {
        if (typeof callback === 'function') callback({ success: false, error: 'Room not found' });
        return;
      }

      const result = room.startGame(data.playerId);
      if (typeof callback === 'function') callback(result);
    });

    // GET SECRET WORD (Safe recovery if client mounted after initial emit)
    socket.on(SOCKET_EVENTS.GET_SECRET_WORD, (data: { roomCode: string; playerId: string }, callback) => {
      const code = (data?.roomCode || '').trim().toUpperCase();
      const playerId = data?.playerId;
      const room = roomManager.getRoom(code);
      if (room && room.currentDrawerId === playerId && room.currentWord) {
        // Ensure drawer player socket mapping is fresh
        const drawerPlayer = room.players.get(playerId);
        if (drawerPlayer) {
          drawerPlayer.socketId = socket.id;
          drawerPlayer.isConnected = true;
        }
        roomManager.registerSocket(socket.id, code, playerId);

        const wordPayload = {
          word: room.currentWord.word,
          category: room.currentWord.category,
          hint: room.currentWord.hint
        };
        socket.emit(SOCKET_EVENTS.SECRET_WORD, wordPayload);
        if (typeof callback === 'function') {
          callback({ success: true, secretWord: wordPayload });
        }
      } else {
        if (typeof callback === 'function') callback({ success: false });
      }
    });

    // DRAW STROKE
    socket.on(SOCKET_EVENTS.DRAW_START, (data: { roomCode: string; playerId: string; stroke: DrawStroke }) => {
      const room = roomManager.getRoom(data.roomCode);
      if (room) {
        room.handleDrawStroke(data.playerId, data.stroke);
      }
    });

    // DRAW UNDO
    socket.on(SOCKET_EVENTS.DRAW_UNDO, (data: { roomCode: string; playerId: string }) => {
      const room = roomManager.getRoom(data.roomCode);
      if (room) {
        room.handleDrawUndo(data.playerId);
      }
    });

    // DRAW REDO
    socket.on(SOCKET_EVENTS.DRAW_REDO, (data: { roomCode: string; playerId: string }) => {
      const room = roomManager.getRoom(data.roomCode);
      if (room) {
        room.handleDrawRedo(data.playerId);
      }
    });

    // DRAW CLEAR
    socket.on(SOCKET_EVENTS.DRAW_CLEAR, (data: { roomCode: string; playerId: string }) => {
      const room = roomManager.getRoom(data.roomCode);
      if (room) {
        room.handleDrawClear(data.playerId);
      }
    });

    // SUBMIT GUESS
    socket.on(SOCKET_EVENTS.SUBMIT_GUESS, (data: { roomCode: string; playerId: string; guess: string }, callback) => {
      const room = roomManager.getRoom(data.roomCode);
      if (!room) {
        if (typeof callback === 'function') callback({ success: false, error: 'Room not found' });
        return;
      }

      const result = room.handleGuess(data.playerId, data.guess);
      if (typeof callback === 'function') callback(result);
    });

    // SEND CHAT
    socket.on(SOCKET_EVENTS.SEND_CHAT, (data: { roomCode: string; playerId: string; text: string }) => {
      const room = roomManager.getRoom(data.roomCode);
      if (!room) return;

      const player = room.players.get(data.playerId);
      if (!player) return;

      const chatMsg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random()}`,
        senderId: player.id,
        senderName: player.username,
        avatar: player.avatar,
        text: data.text.trim().slice(0, 100),
        timestamp: Date.now(),
        type: 'player'
      };

      io.to(room.code).emit(SOCKET_EVENTS.CHAT_MESSAGE, chatMsg);
    });

    // DISCONNECT
    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
      roomManager.handleSocketDisconnect(socket.id);
    });
  });
}
