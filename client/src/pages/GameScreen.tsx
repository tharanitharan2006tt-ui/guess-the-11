import React, { useState, useEffect } from 'react';
import {
  RoomState,
  RoundResult,
  FinalGameResult,
  SOCKET_EVENTS
} from '@guess-the-11/shared';
import { socketService } from '../services/socket';
import { DrawingCanvas } from '../components/DrawingCanvas';
import { ChatBox } from '../components/ChatBox';
import { AVATARS } from '../services/supabase';
import { sounds } from '../utils/sound';
import confetti from 'canvas-confetti';
import {
  Clock,
  Trophy,
  Crown,
  Medal,
  RotateCcw,
  RefreshCw,
  Home
} from 'lucide-react';

interface GameScreenProps {
  roomState: RoomState;
  currentUserId: string;
  onReturnHome: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  roomState,
  currentUserId,
  onReturnHome
}) => {
  const [secretWord, setSecretWord] = useState<{ word: string; category: string; hint?: string } | null>(
    socketService.currentSecretWord
  );
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [gameOverResult, setGameOverResult] = useState<FinalGameResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(roomState.roundTimeRemaining || 75);

  const isDrawer = roomState.currentDrawerId === currentUserId;
  const currentDrawer = roomState.players.find((p) => p.id === roomState.currentDrawerId);
  const me = roomState.players.find((p) => p.id === currentUserId);
  const hasGuessedThisRound = me?.hasGuessedThisRound || false;

  const fetchSecretWord = () => {
    if (socketService.currentSecretWord) {
      setSecretWord(socketService.currentSecretWord);
      return;
    }
    socketService.getSecretWord(roomState.code, currentUserId).then((res) => {
      if (res?.success && res.secretWord) {
        setSecretWord(res.secretWord);
      }
    });
  };

  useEffect(() => {
    const socket = socketService.getSocket();
    let retryTimer: any = null;

    // If drawer and secret word not yet in state, fetch immediately and start auto-retry
    if (isDrawer) {
      if (socketService.currentSecretWord) {
        setSecretWord(socketService.currentSecretWord);
      } else {
        fetchSecretWord();
      }

      // Auto-retry polling loop every 1s until secret word is loaded
      retryTimer = setInterval(() => {
        setSecretWord((prev) => {
          if (prev) {
            if (retryTimer) clearInterval(retryTimer);
            return prev;
          }
          if (socketService.currentSecretWord) {
            if (retryTimer) clearInterval(retryTimer);
            return socketService.currentSecretWord;
          }
          socketService.getSecretWord(roomState.code, currentUserId).then((res) => {
            if (res?.success && res.secretWord) {
              setSecretWord(res.secretWord);
              if (retryTimer) clearInterval(retryTimer);
            }
          });
          return prev;
        });
      }, 1000);
    } else {
      setSecretWord(null);
    }

    const handleSecretWord = (data: { word: string; category: string; hint?: string }) => {
      if (data && data.word) {
        setSecretWord(data);
        if (retryTimer) clearInterval(retryTimer);
      }
    };

    const handleRoundTick = (data: { timeRemaining: number }) => {
      setTimeRemaining(data.timeRemaining);
      if (data.timeRemaining <= 5 && data.timeRemaining > 0) {
        sounds.playTick();
      }
    };

    const handleRoundStart = (data?: { drawerId?: string }) => {
      setRoundResult(null);
      const isMeDrawer = data?.drawerId ? data.drawerId === currentUserId : isDrawer;
      if (!isMeDrawer) {
        setSecretWord(null);
      } else {
        setSecretWord(null);
        fetchSecretWord();
      }
    };

    const handleRoundEnd = (result: RoundResult) => {
      setRoundResult(result);
      if (result.nobodyGuessed) {
        sounds.playWrong();
      } else {
        sounds.playCorrect();
      }
    };

    const handleGameOver = (finalResult: FinalGameResult) => {
      setGameOverResult(finalResult);
      sounds.playVictory();
      try {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.error('Confetti error:', e);
      }
    };

    socket.on(SOCKET_EVENTS.SECRET_WORD, handleSecretWord);
    socket.on(SOCKET_EVENTS.ROUND_TICK, handleRoundTick);
    socket.on(SOCKET_EVENTS.ROUND_START, handleRoundStart);
    socket.on(SOCKET_EVENTS.ROUND_END, handleRoundEnd);
    socket.on(SOCKET_EVENTS.GAME_OVER, handleGameOver);

    return () => {
      if (retryTimer) clearInterval(retryTimer);
      socket.off(SOCKET_EVENTS.SECRET_WORD, handleSecretWord);
      socket.off(SOCKET_EVENTS.ROUND_TICK, handleRoundTick);
      socket.off(SOCKET_EVENTS.ROUND_START, handleRoundStart);
      socket.off(SOCKET_EVENTS.ROUND_END, handleRoundEnd);
      socket.off(SOCKET_EVENTS.GAME_OVER, handleGameOver);
    };
  }, [isDrawer, roomState.code, currentUserId, roomState.currentRound]);

  // Host resets game to play again
  const handlePlayAgain = () => {
    const socket = socketService.getSocket();
    socket.emit(SOCKET_EVENTS.START_GAME, { roomCode: roomState.code, playerId: currentUserId });
    setGameOverResult(null);
    setRoundResult(null);
  };

  // Timer color
  const timerColor =
    timeRemaining > 20
      ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
      : timeRemaining > 10
      ? 'text-amber-300 border-amber-500/30 bg-amber-500/10'
      : 'text-rose-300 border-rose-500/40 bg-rose-500/15 animate-pulse';

  return (
    <div className="min-h-screen flex flex-col bg-[#080C16] text-slate-100 p-2 md:p-5 select-none relative overflow-x-hidden">
      {/* Soft Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Game Bar - Clean Glass HUD */}
      <header className="max-w-7xl mx-auto w-full mb-3.5 p-3.5 rounded-3xl glass-card border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shadow-xl relative z-10">
        {/* Round Counter */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl glass-pill text-indigo-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-game font-semibold text-slate-400 tracking-wider block">
              Round
            </span>
            <span className="font-game font-extrabold text-sm md:text-base text-white">
              {roomState.currentRound} / {roomState.totalRounds}
            </span>
          </div>
        </div>

        {/* Center: Secret Word (if Drawer) OR Word Blanks (if Guesser) */}
        <div className="flex-1 max-w-md text-center px-2">
          {isDrawer ? (
            <div className="inline-flex flex-col items-center">
              <span className="text-[11px] uppercase font-bold text-[#A78BFA] tracking-wider flex items-center gap-1.5">
                <span>🎨</span> YOUR SECRET WORD TO DRAW:
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                {secretWord ? (
                  <span className="text-xl md:text-2xl font-black text-white tracking-wide bg-gradient-to-r from-white via-indigo-100 to-[#28C7E8] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(255,255,255,0.3)]">
                    {secretWord.word}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => fetchSecretWord()}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition-all cursor-pointer animate-pulse"
                    title="Tap to fetch word immediately"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading word... (Tap to retry)</span>
                  </button>
                )}
                {secretWord?.hint && (
                  <span className="text-xs text-[#929BB3] hidden sm:inline" title={secretWord.hint}>
                    ({secretWord.hint})
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="inline-flex flex-col items-center">
              <span className="text-[11px] uppercase font-medium text-[#929BB3] tracking-wider flex items-center gap-1.5">
                <span>🤔</span> {currentDrawer?.username} is drawing ({roomState.wordCategory || 'General'}):
              </span>
              <span className="font-mono text-xl md:text-2xl font-black tracking-[0.3em] text-[#28C7E8] mt-0.5 drop-shadow-[0_2px_10px_rgba(40,199,232,0.35)]">
                {roomState.wordHint || '_ _ _ _ _'}
              </span>
            </div>
          )}
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border glass-pill ${timerColor}`}>
          <Clock className="w-4 h-4" />
          <span className="font-game font-bold text-sm md:text-base">
            {timeRemaining}s
          </span>
        </div>
      </header>

      {/* Main Game Layout: Canvas (Center) + Mini Leaderboard (Left) + Chat/Guess (Right) */}
      <main className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start relative z-10">
        {/* Left: Live Scores Roster */}
        <aside className="lg:col-span-2 hidden lg:flex flex-col gap-2 glass-card p-3.5 rounded-3xl border border-white/[0.08] max-h-[74vh] overflow-y-auto shadow-xl">
          <span className="text-[11px] font-game font-bold uppercase tracking-wider text-slate-400 mb-1">
            Live Standings
          </span>
          {roomState.players
            .slice()
            .sort((a, b) => b.score - a.score)
            .map((p, idx) => {
              const avatarObj = AVATARS.find((a) => a.id === p.avatar) || AVATARS[0];
              const isThisDrawer = p.id === roomState.currentDrawerId;
              const hasGuessed = p.hasGuessedThisRound;

              return (
                <div
                  key={p.id}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                    p.id === currentUserId
                      ? 'border-indigo-400/40 bg-indigo-500/15 shadow-sm'
                      : isThisDrawer
                      ? 'border-purple-400/30 bg-purple-950/20'
                      : 'border-white/[0.06] bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base select-none">{avatarObj.icon}</span>
                    <div className="truncate">
                      <p className="font-game font-bold text-white truncate leading-tight">
                        {p.username}
                      </p>
                      <span className="text-[10px] font-sans text-slate-400 block -mt-0.5">
                        {isThisDrawer ? '🎨 Drawing' : hasGuessed ? '✅ Guessed' : 'Thinking...'}
                      </span>
                    </div>
                  </div>
                  <span className="font-game font-extrabold text-indigo-300 ml-1">
                    {p.score}
                  </span>
                </div>
              );
            })}
        </aside>

        {/* Center: Realtime Drawing Canvas (7 cols on large screens) */}
        <section className="lg:col-span-7 flex flex-col items-center justify-center w-full">
          <DrawingCanvas
            roomCode={roomState.code}
            playerId={currentUserId}
            isDrawer={isDrawer}
          />
        </section>

        {/* Right: Live Chat & Guess Input (3 cols on large screens) */}
        <section className="lg:col-span-3 flex flex-col h-full w-full">
          <ChatBox
            roomCode={roomState.code}
            playerId={currentUserId}
            isDrawer={isDrawer}
            hasGuessedThisRound={hasGuessedThisRound}
          />
        </section>
      </main>

      {/* OVERLAY 1: ROUND RESULT (Intermission between rounds) */}
      {roundResult && !gameOverResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-md glass-modal rounded-3xl p-6 text-center relative overflow-hidden border border-white/10 shadow-2xl">
            <span className="text-xs font-semibold tracking-wider text-[#929BB3] uppercase">
              Round {roundResult.round} Finished
            </span>

            <h3 className="text-xl sm:text-2xl font-bold text-[#F4F5FF] uppercase mt-2">
              The Word Was:
            </h3>

            <div className="my-3 py-2.5 px-6 rounded-2xl bg-[#FFC857]/15 border border-[#FFC857]/40 inline-block shadow-inner">
              <span className="text-2xl sm:text-3xl font-bold text-[#FFC857] tracking-wider">
                {roundResult.word}
              </span>
            </div>

            {/* Score Delta Breakdown */}
            <div className="my-4 p-3.5 rounded-2xl bg-[#111629] border border-white/[0.08] space-y-2 text-xs">
              {/* Drawer Outcome */}
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <span className="text-[#F4F5FF] font-medium">
                  Drawer: {roundResult.drawerName}
                </span>
                <span
                  className={`font-semibold text-sm tabular-nums ${
                    roundResult.drawerPointsAwarded > 0 ? 'text-[#28DFA5]' : 'text-[#FF647C]'
                  }`}
                >
                  {roundResult.drawerPointsAwarded > 0
                    ? `+${roundResult.drawerPointsAwarded} (Bonus)`
                    : `${roundResult.drawerPointsAwarded} (No guesses penalty)`}
                </span>
              </div>

              {/* Correct Guessers */}
              <div className="text-left">
                <span className="text-[11px] font-semibold text-[#929BB3] uppercase">
                  Correct Guessers ({roundResult.correctGuessers.length}):
                </span>
                {roundResult.correctGuessers.length === 0 ? (
                  <p className="text-[#929BB3] italic mt-0.5">Nobody guessed correctly this round!</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {roundResult.correctGuessers.map((g) => (
                      <span
                        key={g.playerId}
                        className="px-2.5 py-1 rounded-xl bg-[#28DFA5]/15 text-[#28DFA5] border border-[#28DFA5]/30 text-[11px] font-semibold tabular-nums"
                      >
                        {g.username} (+1 pt)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-[#28C7E8] font-semibold animate-pulse">
              Starting next round shortly...
            </p>
          </div>
        </div>
      )}

      {/* OVERLAY 2: FINAL GAME OVER & WINNER SCREEN */}
      {gameOverResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in zoom-in-95 duration-300">
          <div className="w-full max-w-lg glass-modal border border-[#FFC857]/40 rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden max-h-[92vh] flex flex-col">
            {/* Title */}
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFC857] mb-1">
              🏆 MATCH RESULTS 🏆
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F4F5FF] uppercase drop-shadow-sm">
              {gameOverResult.winner?.username} WINS!
            </h2>

            {/* Podium (Top 3) */}
            <div className="my-5 grid grid-cols-3 gap-2.5 items-end max-w-md mx-auto w-full pt-4">
              {/* 2nd Place - Silver */}
              {gameOverResult.podium[1] && (
                <div className="p-3 rounded-2xl bg-[#111629] border border-slate-400/40 backdrop-blur-md flex flex-col items-center shadow-md">
                  <Medal className="w-6 h-6 text-slate-300 mb-1" />
                  <span className="text-2xl select-none">
                    {AVATARS.find((a) => a.id === gameOverResult.podium[1].avatar)?.icon || '🥈'}
                  </span>
                  <p className="text-xs font-bold text-white truncate max-w-full mt-1">
                    {gameOverResult.podium[1].username}
                  </p>
                  <span className="text-sm font-semibold text-slate-300 tabular-nums">
                    {gameOverResult.podium[1].score} pts
                  </span>
                  <span className="text-[10px] text-[#929BB3] font-medium">2nd Place</span>
                </div>
              )}

              {/* 1st Place (Champion) - Gold */}
              {gameOverResult.winner && (
                <div className="p-4 rounded-2xl bg-gradient-to-b from-[#FFC857]/20 to-[#FFC857]/5 border-2 border-[#FFC857] flex flex-col items-center shadow-[0_0_25px_rgba(255,200,87,0.25)] scale-105">
                  <Crown className="w-8 h-8 text-[#FFC857] mb-1 animate-bounce" />
                  <span className="text-3xl select-none">
                    {AVATARS.find((a) => a.id === gameOverResult.winner.avatar)?.icon || '👑'}
                  </span>
                  <p className="text-sm font-bold text-white truncate max-w-full mt-1">
                    {gameOverResult.winner.username}
                  </p>
                  <span className="text-lg font-bold text-[#FFC857] tabular-nums">
                    {gameOverResult.winner.score} pts
                  </span>
                  <span className="text-[10px] text-[#FFC857] font-bold uppercase tracking-wider">
                    Champion
                  </span>
                </div>
              )}

              {/* 3rd Place - Bronze */}
              {gameOverResult.podium[2] && (
                <div className="p-3 rounded-2xl bg-[#111629] border border-amber-700/50 backdrop-blur-md flex flex-col items-center shadow-md">
                  <Medal className="w-6 h-6 text-[#F97316] mb-1" />
                  <span className="text-2xl select-none">
                    {AVATARS.find((a) => a.id === gameOverResult.podium[2].avatar)?.icon || '🥉'}
                  </span>
                  <p className="text-xs font-bold text-white truncate max-w-full mt-1">
                    {gameOverResult.podium[2].username}
                  </p>
                  <span className="text-sm font-semibold text-[#F97316] tabular-nums">
                    {gameOverResult.podium[2].score} pts
                  </span>
                  <span className="text-[10px] text-[#929BB3] font-medium">3rd Place</span>
                </div>
              )}
            </div>

            {/* Complete Leaderboard Scroll */}
            <div className="flex-1 overflow-y-auto space-y-1.5 my-3 pr-1 text-xs max-h-40">
              {gameOverResult.leaderboard.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#111629] border border-white/[0.06]"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#929BB3] font-bold w-5">#{idx + 1}</span>
                    <span className="font-semibold text-white">{p.username}</span>
                  </div>
                  <span className="font-bold text-[#FFC857] tabular-nums">{p.score} pts</span>
                </div>
              ))}
            </div>

            {/* Actions: Play Again (Host) or Home */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.08]">
              {roomState.hostId === currentUserId ? (
                <button
                  onClick={handlePlayAgain}
                  className="btn-glass-emerald py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wide cursor-pointer font-semibold"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
              ) : (
                <div className="py-3 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[#929BB3] text-xs font-medium flex items-center justify-center">
                  Waiting for host...
                </div>
              )}

              <button
                onClick={onReturnHome}
                className="btn-glass-secondary py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wide cursor-pointer font-semibold text-[#F4F5FF]"
              >
                <Home className="w-4 h-4" />
                Return Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
