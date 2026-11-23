import React, { useState } from 'react';
import { RoomState, Player } from '@guess-the-11/shared';
import { AVATARS } from '../services/supabase';
import { socketService } from '../services/socket';
import {
  Copy,
  Check,
  Share2,
  MessageCircle,
  Crown,
  Play,
  LogOut,
  Users,
  Shield,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Share } from '@capacitor/share';

interface LobbyScreenProps {
  roomState: RoomState;
  currentUserId: string;
  onLeave: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  roomState,
  currentUserId,
  onLeave
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [startError, setStartError] = useState<string | null>(null);

  const inviteUrl = `${window.location.origin}/join?room=${roomState.code}`;
  const isHost = roomState.hostId === currentUserId;
  const playerCount = roomState.players.length;
  const maxPlayers = roomState.settings.maxPlayers || 11;
  const minPlayers = roomState.settings.gameMode === 'standard' ? 11 : roomState.settings.minPlayers || 2;
  const canStart = playerCount >= minPlayers;

  // Copy invitation link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // WhatsApp Share
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🎮 Join my squad on GUESS THE 11!\nRoom Code: ${roomState.code}\nJoin link: ${inviteUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Native Mobile / Web Share
  const handleNativeShare = async () => {
    try {
      await Share.share({
        title: 'GUESS THE 11 - Join My Squad!',
        text: `Play with me in room ${roomState.code}! Can you guess the 11?`,
        url: inviteUrl,
        dialogTitle: 'Invite Players to Room'
      });
    } catch {
      // Fallback to clipboard
      handleCopyLink();
    }
  };

  // Host starts game
  const handleStartGame = async () => {
    setStartError(null);
    const res = await socketService.startGame(roomState.code, currentUserId);
    if (!res.success && res.error) {
      setStartError(res.error);
    }
  };

  // Generate 11 slots array
  const slots = Array.from({ length: maxPlayers }).map((_, idx) => {
    const player = roomState.players[idx] || null;
    return { slotNumber: idx + 1, player };
  });

  return (
    <div className="min-h-screen flex flex-col bg-game-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-game-dark p-4 md:p-8">
      {/* Top Bar */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Guess The 11" className="w-10 h-10 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
          <div>
            <h1 className="font-gaming font-extrabold text-lg text-white">
              ROOM LOBBY
            </h1>
            <p className="text-xs text-cyan-400 font-semibold tracking-wider uppercase">
              {roomState.settings.gameMode.toUpperCase()} MODE • {roomState.settings.category.toUpperCase()}
            </p>
          </div>
        </div>

        <button
          onClick={onLeave}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-all text-xs font-semibold"
        >
          <LogOut className="w-4 h-4" />
          <span>Leave</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col items-center justify-center py-6">
        {/* Room Code Card & Sharing Header */}
        <div className="w-full max-w-xl glass-card rounded-3xl p-6 border border-indigo-500/30 shadow-glass text-center relative overflow-hidden mb-6">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

          <span className="text-xs font-gaming font-bold uppercase tracking-widest text-slate-400">
            Room Code
          </span>
          <div className="flex items-center justify-center gap-3 my-2">
            <span className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-transparent bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 bg-clip-text select-all">
              {roomState.code}
            </span>
            <button
              onClick={handleCopyLink}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 transition-all border border-slate-700 shadow-sm"
              title="Copy Room Link"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          {/* Player Count Display */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-indigo-500/30 text-xs font-bold text-white mb-4">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="tracking-wider uppercase text-slate-300">WAITING FOR PLAYERS:</span>
            <span className="text-cyan-400 text-sm font-gaming">{playerCount} / {maxPlayers}</span>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-2.5 max-w-sm mx-auto">
            <button
              onClick={handleWhatsAppShare}
              className="py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-current text-emerald-400" />
              WhatsApp
            </button>

            <button
              onClick={handleNativeShare}
              className="py-2.5 px-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              Invite Friends
            </button>
          </div>
        </div>

        {/* 11-Player Squad Roster Grid */}
        <div className="w-full max-w-4xl mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {slots.map(({ slotNumber, player }) => {
              if (player) {
                const avatarObj = AVATARS.find((a) => a.id === player.avatar) || AVATARS[0];
                const isThisPlayerHost = player.id === roomState.hostId;
                const isMe = player.id === currentUserId;

                return (
                  <div
                    key={player.id}
                    className={`p-3.5 rounded-2xl glass-card flex flex-col items-center justify-center text-center relative border transition-all animate-in zoom-in-95 duration-200 ${
                      isMe
                        ? 'border-cyan-400 bg-cyan-950/20 shadow-neon-blue'
                        : isThisPlayerHost
                        ? 'border-amber-400/50 bg-amber-950/10'
                        : 'border-indigo-500/30 bg-slate-900/60'
                    }`}
                  >
                    {/* Host crown badge */}
                    {isThisPlayerHost && (
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-neon-gold">
                        <Crown className="w-3.5 h-3.5 fill-current" />
                      </div>
                    )}

                    {/* Slot badge */}
                    <div className="absolute top-2 left-2 text-[10px] font-mono font-bold text-slate-500">
                      #{slotNumber}
                    </div>

                    {/* Avatar */}
                    <span className="text-4xl my-2 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                      {avatarObj.icon}
                    </span>

                    {/* Name */}
                    <p className="text-xs font-bold text-white truncate max-w-full leading-tight">
                      {player.username}
                    </p>

                    {/* Subtext */}
                    <span className="text-[10px] text-cyan-400 font-medium mt-0.5">
                      {isMe ? '(You)' : isThisPlayerHost ? 'Host' : 'Ready'}
                    </span>
                  </div>
                );
              }

              // Empty slot
              return (
                <div
                  key={`empty_${slotNumber}`}
                  className="p-3.5 rounded-2xl border-2 border-dashed border-slate-800/80 bg-slate-950/30 flex flex-col items-center justify-center text-center relative opacity-60"
                >
                  <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-600">
                    #{slotNumber}
                  </div>
                  <div className="w-10 h-10 rounded-full border border-slate-700/60 flex items-center justify-center my-2 text-slate-600 text-xs font-semibold">
                    ?
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Empty Slot</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Game Action Area */}
        <div className="w-full max-w-md text-center">
          {startError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{startError}</span>
            </div>
          )}

          {isHost ? (
            <div>
              <button
                onClick={handleStartGame}
                disabled={!canStart}
                className={`w-full py-4 rounded-2xl font-gaming font-extrabold text-base tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                  canStart
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white hover:scale-105 active:scale-95 shadow-neon-blue'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Play className="w-5 h-5 fill-current" />
                Start Game ({playerCount}/{minPlayers})
              </button>
              {!canStart && (
                <p className="text-xs text-slate-400 mt-2">
                  {roomState.settings.gameMode === 'standard'
                    ? 'Standard mode requires all 11 players before the game can begin.'
                    : `Need at least ${minPlayers} players to begin practice game.`}
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl glass-card border border-indigo-500/30 flex items-center justify-center gap-3">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-semibold text-slate-300">
                Waiting for host to start the game...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
