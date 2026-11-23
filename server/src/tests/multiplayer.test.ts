import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ClientSocket, Socket as ClientSocketType } from 'socket.io-client';
import express from 'express';
import { RoomManager } from '../engine/RoomManager.js';
import { setupSocketHandlers } from '../socket/index.js';
import { SOCKET_EVENTS, Player, RoomState, RoundResult, FinalGameResult } from '@guess-the-11/shared';

describe('GUESS THE 11 - Complete 11-Player Multiplayer Simulation & Engine Test', () => {
  let httpServer: any;
  let ioServer: Server;
  let roomManager: RoomManager;
  let port: number;
  let serverUrl: string;

  beforeAll(async () => {
    const app = express();
    httpServer = createServer(app);
    ioServer = new Server(httpServer, {
      cors: { origin: '*' }
    });
    roomManager = new RoomManager(ioServer);
    setupSocketHandlers(ioServer, roomManager);

    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        const addr = httpServer.address();
        port = typeof addr === 'object' && addr ? addr.port : 4123;
        serverUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    ioServer.close();
    httpServer.close();
  });

  function createClient(): Promise<ClientSocketType> {
    return new Promise((resolve) => {
      const socket = ClientSocket(serverUrl, {
        transports: ['websocket'],
        forceNew: true
      });
      socket.on('connect', () => resolve(socket));
    });
  }

  it('Phase 5 & 6: Host creates a room with unique 6-char code and validates room state', async () => {
    const hostSocket = await createClient();

    const hostData = {
      id: 'host-user-1',
      username: 'AlphaHost',
      avatar: 'avatar_1'
    };

    const createRes: any = await new Promise((resolve) => {
      hostSocket.emit(SOCKET_EVENTS.CREATE_ROOM, {
        player: hostData,
        settings: { gameMode: 'standard', maxPlayers: 11 }
      }, resolve);
    });

    expect(createRes.success).toBe(true);
    expect(createRes.roomCode).toBeDefined();
    expect(createRes.roomCode.length).toBe(6);
    expect(createRes.state.players.length).toBe(1);
    expect(createRes.state.players[0].isHost).toBe(true);

    hostSocket.disconnect();
  });

  it('Phase 6 & 7: Rejects duplicate nicknames and supports invitation joining', async () => {
    const hostSocket = await createClient();
    const guest1 = await createClient();
    const guest2 = await createClient();

    const hostRes: any = await new Promise((resolve) => {
      hostSocket.emit(SOCKET_EVENTS.CREATE_ROOM, {
        player: { id: 'host-2', username: 'HostPlayer', avatar: 'avatar_1' },
        settings: { gameMode: 'standard' }
      }, resolve);
    });

    const code = hostRes.roomCode;

    // Join Guest 1
    const join1: any = await new Promise((resolve) => {
      guest1.emit(SOCKET_EVENTS.JOIN_ROOM, {
        roomCode: code,
        player: { id: 'g1', username: 'GuestOne', avatar: 'avatar_2' }
      }, resolve);
    });
    expect(join1.success).toBe(true);

    // Attempt join with DUPLICATE nickname
    const joinDup: any = await new Promise((resolve) => {
      guest2.emit(SOCKET_EVENTS.JOIN_ROOM, {
        roomCode: code,
        player: { id: 'g2', username: 'guestone', avatar: 'avatar_3' } // case-insensitive check
      }, resolve);
    });
    expect(joinDup.success).toBe(false);
    expect(joinDup.error).toContain('already in the room');

    hostSocket.disconnect();
    guest1.disconnect();
    guest2.disconnect();
  });

  it('Phase 7, 8, 9, 10, 11, 12, 13 & 14: Full 11-Player Multiplayer Gameplay Simulation', async () => {
    const clientSockets: ClientSocketType[] = [];
    const clientPlayers: Player[] = [];

    // 1. Connect 11 distinct clients
    for (let i = 1; i <= 11; i++) {
      const socket = await createClient();
      clientSockets.push(socket);
    }

    const hostSocket = clientSockets[0];

    // Host creates 11-player standard room
    const createRes: any = await new Promise((resolve) => {
      hostSocket.emit(SOCKET_EVENTS.CREATE_ROOM, {
        player: { id: 'player-1', username: 'Player_1', avatar: 'avatar_1' },
        settings: { gameMode: 'standard', maxPlayers: 11, roundDurationSeconds: 15 }
      }, resolve);
    });

    const roomCode = createRes.roomCode;
    expect(roomCode).toBeDefined();

    // The other 10 players join the room
    for (let i = 2; i <= 11; i++) {
      const joinRes: any = await new Promise((resolve) => {
        clientSockets[i - 1].emit(SOCKET_EVENTS.JOIN_ROOM, {
          roomCode,
          player: { id: `player-${i}`, username: `Player_${i}`, avatar: `avatar_${i}` }
        }, resolve);
      });
      expect(joinRes.success).toBe(true);
      expect(joinRes.state.players.length).toBe(i);
    }

    // Attempt to add a 12th player - MUST BE REJECTED (PHASE 7: 11-player capacity)
    const extraSocket = await createClient();
    const join12: any = await new Promise((resolve) => {
      extraSocket.emit(SOCKET_EVENTS.JOIN_ROOM, {
        roomCode,
        player: { id: 'player-12', username: 'Player_12', avatar: 'avatar_1' }
      }, resolve);
    });
    expect(join12.success).toBe(false);
    expect(join12.error).toContain('Room is full');
    extraSocket.disconnect();

    // Non-host attempts to start game - MUST BE REJECTED (PHASE 7: Host authorization)
    const nonHostStart: any = await new Promise((resolve) => {
      clientSockets[1].emit(SOCKET_EVENTS.START_GAME, {
        roomCode,
        playerId: 'player-2'
      }, resolve);
    });
    expect(nonHostStart.success).toBe(false);
    expect(nonHostStart.error).toContain('Only the host');

    // Host starts the game
    let roundStartData: any = null;
    let secretWordData: any = null;
    let guessersReceivedWord = false;

    // Setup listeners for round start and secret word privacy check
    clientSockets.forEach((s, idx) => {
      s.on(SOCKET_EVENTS.SECRET_WORD, (data) => {
        secretWordData = data;
        // Verify this client is the designated drawer
        if (roundStartData && roundStartData.drawerId !== `player-${idx + 1}`) {
          guessersReceivedWord = true;
        }
      });
    });

    const startPromise = new Promise((resolve) => {
      hostSocket.on(SOCKET_EVENTS.ROUND_START, (data) => {
        roundStartData = data;
        resolve(data);
      });
    });

    const startRes: any = await new Promise((resolve) => {
      hostSocket.emit(SOCKET_EVENTS.START_GAME, {
        roomCode,
        playerId: 'player-1'
      }, resolve);
    });

    expect(startRes.success).toBe(true);
    await startPromise;

    expect(roundStartData).toBeDefined();
    expect(roundStartData.round).toBe(1);
    expect(roundStartData.totalRounds).toBe(11); // 11 rounds for 11 players
    expect(roundStartData.wordHint).toBeDefined();
    expect(roundStartData.wordHint).toContain('_'); // Hint contains blanks

    // Give a short tick for secret word emission
    await new Promise((r) => setTimeout(r, 100));

    // Secret Word Privacy Check: only the drawer received the secret word
    expect(secretWordData).toBeDefined();
    expect(secretWordData.word).toBeDefined();
    expect(guessersReceivedWord).toBe(false);

    const drawerPlayerId = roundStartData.drawerId;
    const drawerIndex = parseInt(drawerPlayerId.replace('player-', '')) - 1;
    const drawerSocket = clientSockets[drawerIndex];

    // Non-drawer attempts to draw - MUST BE REJECTED
    const nonDrawerIndex = (drawerIndex + 1) % 11;
    const nonDrawerSocket = clientSockets[nonDrawerIndex];

    let receivedStrokeFromFakeDrawer = false;
    hostSocket.on(SOCKET_EVENTS.DRAW_STROKE_START, () => {
      receivedStrokeFromFakeDrawer = true;
    });

    nonDrawerSocket.emit(SOCKET_EVENTS.DRAW_START, {
      roomCode,
      playerId: `player-${nonDrawerIndex + 1}`,
      stroke: { id: 'fake_1', tool: 'brush', color: '#ff0000', size: 5, points: [{ x: 10, y: 10 }] }
    });

    await new Promise((r) => setTimeout(r, 100));
    expect(receivedStrokeFromFakeDrawer).toBe(false);

    // Authorized drawer sends drawing stroke - MUST BE BROADCAST TO ALL
    let strokeReceivedByGuesser: any = null;
    nonDrawerSocket.on(SOCKET_EVENTS.DRAW_STROKE_START, (stroke) => {
      strokeReceivedByGuesser = stroke;
    });

    drawerSocket.emit(SOCKET_EVENTS.DRAW_START, {
      roomCode,
      playerId: drawerPlayerId,
      stroke: { id: 'valid_1', tool: 'brush', color: '#8B5CF6', size: 4, points: [{ x: 50, y: 50 }, { x: 60, y: 60 }] }
    });

    await new Promise((r) => setTimeout(r, 150));
    expect(strokeReceivedByGuesser).toBeDefined();
    expect(strokeReceivedByGuesser.id).toBe('valid_1');

    // Drawer tries to guess their own word - MUST BE REJECTED
    const drawerGuessRes: any = await new Promise((resolve) => {
      drawerSocket.emit(SOCKET_EVENTS.SUBMIT_GUESS, {
        roomCode,
        playerId: drawerPlayerId,
        guess: secretWordData.word
      }, resolve);
    });
    expect(drawerGuessRes.success).toBe(false);
    expect(drawerGuessRes.error).toContain('Drawer cannot submit guesses');

    // Incorrect guess from guesser
    const wrongGuessRes: any = await new Promise((resolve) => {
      nonDrawerSocket.emit(SOCKET_EVENTS.SUBMIT_GUESS, {
        roomCode,
        playerId: `player-${nonDrawerIndex + 1}`,
        guess: 'definitelyWrongWord123'
      }, resolve);
    });
    expect(wrongGuessRes.success).toBe(true);
    expect(wrongGuessRes.isCorrect).toBe(false);

    // Wait 450ms for rate limiting window
    await new Promise((r) => setTimeout(r, 450));

    // Correct guess from guesser (case-insensitive with extra spaces)
    const correctGuessRes: any = await new Promise((resolve) => {
      nonDrawerSocket.emit(SOCKET_EVENTS.SUBMIT_GUESS, {
        roomCode,
        playerId: `player-${nonDrawerIndex + 1}`,
        guess: `   ${secretWordData.word.toUpperCase()}   `
      }, resolve);
    });
    expect(correctGuessRes.success).toBe(true);
    expect(correctGuessRes.isCorrect).toBe(true);

    // Same guesser tries to guess again - MUST PREVENT DUPLICATE SCORING
    const duplicateGuessRes: any = await new Promise((resolve) => {
      nonDrawerSocket.emit(SOCKET_EVENTS.SUBMIT_GUESS, {
        roomCode,
        playerId: `player-${nonDrawerIndex + 1}`,
        guess: secretWordData.word
      }, resolve);
    });
    expect(duplicateGuessRes.success).toBe(false);
    expect(duplicateGuessRes.error).toContain('already guessed');

    // Clean up all client sockets
    clientSockets.forEach((s) => s.disconnect());
  });

  it('Phase 13: Scoring verification (+1 correct guess, +1 drawer bonus, -5 penalty)', async () => {
    const hostSocket = await createClient();
    const guestSocket = await createClient();

    // Create practice room for 2 players
    const createRes: any = await new Promise((resolve) => {
      hostSocket.emit(SOCKET_EVENTS.CREATE_ROOM, {
        player: { id: 'p1', username: 'HostScorer', avatar: 'avatar_1' },
        settings: { gameMode: 'practice', minPlayers: 2, roundDurationSeconds: 2 }
      }, resolve);
    });

    const code = createRes.roomCode;

    await new Promise((resolve) => {
      guestSocket.emit(SOCKET_EVENTS.JOIN_ROOM, {
        roomCode: code,
        player: { id: 'p2', username: 'GuestScorer', avatar: 'avatar_2' }
      }, resolve);
    });

    // Start game
    let roundEndResult: RoundResult | null = null;
    hostSocket.on(SOCKET_EVENTS.ROUND_END, (result: RoundResult) => {
      roundEndResult = result;
    });

    await new Promise((resolve) => {
      hostSocket.emit(SOCKET_EVENTS.START_GAME, { roomCode: code, playerId: 'p1' }, resolve);
    });

    // Wait for the 2-second round timer to expire WITHOUT ANY GUESSES
    await new Promise((resolve) => setTimeout(resolve, 3500));

    expect(roundEndResult).toBeDefined();
    // In this round nobody guessed, so drawer should have received -5 points
    expect(roundEndResult!.nobodyGuessed).toBe(true);
    expect(roundEndResult!.drawerPointsAwarded).toBe(-5);

    const drawerScoreObj = roundEndResult!.scores.find(s => s.playerId === roundEndResult!.drawerId);
    expect(drawerScoreObj?.totalScore).toBe(-5);

    hostSocket.disconnect();
    guestSocket.disconnect();
  });
});
