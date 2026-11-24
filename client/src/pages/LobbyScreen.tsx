import React, { useState } from 'react';
import { RoomState } from '@guess-the-11/shared';
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
  AlertCircle,
  Lock
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

  const hasPassword = Boolean(roomState.settings.password && roomState.settings.password.trim() !== '');
  const inviteUrl = `${window.location.origin}/join?room=${roomState.code}${
    hasPassword ? `&pass=${encodeURIComponent(roomState.settings.password!)}` : ''
  }`;
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
      `🎮 Join my squad on GUESS THE 11!\nRoom ID: ${roomState.code}${
        hasPassword ? `\nPassword: ${roomState.settings.password}` : ''
      }\nJoin link: ${inviteUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Native Mobile / Web Share
  const handleNativeShare = async () => {
    try {
      await Share.share({
        title: 'GUESS THE 11 - Join My Squad!',
        text: `Play with me in room ${roomState.code}!${
          hasPassword ? ` Password: ${roomState.settings.password}` : ''
        } Can you guess the 11?`,
        url: inviteUrl,
        dialogTitle: 'Invite Players to Room'
      });
    } catch {
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
    <div className="min-h-screen flex flex-col bg-[#080C16] text-slate-100 p-4 md:p-6 relative overflow-hidden">
      {/* Soft Ambient Glass Glows */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[360px] h-[260px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between pb-4 border-b border-white/[0.08] relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-md" />
            <img src="/logo.svg" alt="Guess The 11" className="w-9 h-9 relative z-10" />
          </div>
          <div>
            <h1 className="font-game font-extrabold text-lg sm:text-xl text-white tracking-tight">
              SQUAD LOBBY
            </h1>
            <p className="text-[11px] text-indigo-300 font-sans font-medium tracking-wider uppercase">
              {roomState.settings.gameMode} Mode • {roomState.settings.category}
            </p>
          </div>
        </div>

        <button
          onClick={onLeave}
          className="btn-glass-danger px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs cursor-pointer shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Leave Room</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col items-center justify-center py-6 relative z-10">
        {/* Room Code & Invite Card */}
        <div className="w-full max-w-lg glass-card p-6 md:p-8 rounded-3xl text-center mb-6 relative overflow-hidden">
          <span className="text-[11px] font-game font-semibold uppercase tracking-wider text-slate-400">
            Room Invitation Code
          </span>
          <div className="flex items-center justify-center gap-3 my-2.5">
            <span className="font-mono text-4xl sm:text-5xl font-extrabold tracking-widest text-white select-all drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)]">
              {roomState.code}
            </span>
            <button
              onClick={handleCopyLink}
              className="p-2.5 rounded-2xl glass-pill hover:bg-white/[0.1] text-slate-200 transition-all cursor-pointer shadow-sm"
              title="Copy Room Link"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          {/* Optional Room Password Display */}
          {hasPassword && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-mono text-amber-300 mb-3 border border-amber-500/30">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>PIN: <strong className="text-white font-bold">{roomState.settings.password}</strong></span>
            </div>
          )}

          {/* Waiting Status Badge */}
          <div className="block mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-game font-semibold text-white">
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-400">WAITING FOR SQUAD:</span>
              <span className="text-indigo-300 font-bold text-sm">{playerCount} / {maxPlayers}</span>
            </div>
          </div>

          {/* Share Actions */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <button
              onClick={handleWhatsAppShare}
              className="py-2.5 px-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all text-xs font-game font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              WhatsApp
            </button>

            <button
              onClick={handleNativeShare}
              className="py-2.5 px-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 transition-all text-xs font-game font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Share Link
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
                    className={`p-4 rounded-3xl flex flex-col items-center justify-center text-center relative transition-all duration-300 ${
                      isMe
                        ? 'glass-card border-indigo-400/50 shadow-[0_0_24px_rgba(99,102,241,0.2)]'
                        : isThisPlayerHost
                        ? 'glass-card border-amber-400/40'
                        : 'glass-card border-white/[0.08]'
                    }`}
                  >
                    {/* Host crown badge */}
                    {isThisPlayerHost && (
                      <div className="absolute top-2.5 right-2.5 p-1 rounded-full bg-amber-400 text-slate-950 shadow-sm" title="Room Host">
                        <Crown className="w-3 h-3 fill-current" />
                      </div>
                    )}

                    {/* Slot number badge */}
                    <div className="absolute top-2.5 left-2.5 text-[10px] font-mono font-bold text-slate-500">
                      #{String(slotNumber).padStart(2, '0')}
                    </div>

                    {/* Avatar */}
                    <span className="text-3xl sm:text-4xl my-2 select-none filter drop-shadow-md">
                      {avatarObj.icon}
                    </span>

                    {/* Username */}
                    <p className="text-xs font-game font-bold text-white truncate max-w-full leading-tight">
                      {player.username}
                    </p>

                    {/* Subtext */}
                    <span className={`text-[10px] font-sans font-semibold mt-1 px-2.5 py-0.5 rounded-full ${
                      isMe
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : isThisPlayerHost
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {isMe ? 'You' : isThisPlayerHost ? 'Host' : 'Ready'}
                    </span>
                  </div>
                );
              }

              // Empty slot
              return (
                <div
                  key={`empty_${slotNumber}`}
                  className="p-4 rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.02] flex flex-col items-center justify-center text-center relative opacity-40 hover:opacity-60 transition-opacity"
                >
                  <div className="absolute top-2.5 left-2.5 text-[10px] font-mono text-slate-600">
                    #{String(slotNumber).padStart(2, '0')}
                  </div>
                  <div className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center my-2 text-slate-500 text-xs font-bold">
                    ?
                  </div>
                  <span className="text-[10px] font-sans text-slate-500 uppercase tracking-wider">Open Slot</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Game Action Area */}
        <div className="w-full max-w-md text-center">
          {startError && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 text-rose-300 text-xs font-semibold border border-rose-500/30 flex items-center justify-center gap-2 shadow-md">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{startError}</span>
            </div>
          )}

          {isHost ? (
            <div>
              <button
                onClick={handleStartGame}
                disabled={!canStart}
                className={`w-full py-4 rounded-2xl font-game font-bold text-base tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                  canStart
                    ? 'btn-glass-emerald text-white cursor-pointer'
                    : 'bg-white/[0.04] text-slate-500 cursor-not-allowed border border-white/[0.08] opacity-60'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                Start Game ({playerCount}/{minPlayers})
              </button>
              {!canStart && (
                <p className="text-xs text-slate-400 font-sans mt-2.5 font-medium">
                  {roomState.settings.gameMode === 'standard'
                    ? 'Standard mode requires all 11 players to start.'
                    : `Need at least ${minPlayers} players to start practice mode.`}
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl glass-card flex items-center justify-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
              <span className="text-xs font-game font-semibold text-slate-300">
                Waiting for host to start the game...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
