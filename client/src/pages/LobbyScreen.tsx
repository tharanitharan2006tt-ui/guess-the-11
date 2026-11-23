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
    <div className="min-h-screen flex flex-col bg-[#0C101D] text-slate-100 p-4 md:p-6">
      {/* Top Header Bar */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between pb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Guess The 11" className="w-10 h-10 drop-shadow-md" />
          <div>
            <h1 className="font-game font-bold text-xl text-white">
              ROOM LOBBY
            </h1>
            <p className="text-xs text-amber-400 font-sans font-semibold tracking-wider uppercase">
              {roomState.settings.gameMode} Mode • {roomState.settings.category}
            </p>
          </div>
        </div>

        <button
          onClick={onLeave}
          className="btn-3d-slate px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs text-rose-300 hover:text-white"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Leave Room</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col items-center justify-center py-6">
        {/* Room Code & Invite Card */}
        <div className="w-full max-w-lg game-card-tactile p-6 text-center mb-6 relative overflow-hidden">
          <span className="text-xs font-game font-semibold uppercase tracking-wider text-slate-400">
            Room Code
          </span>
          <div className="flex items-center justify-center gap-3 my-2">
            <span className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-white select-all">
              {roomState.code}
            </span>
            <button
              onClick={handleCopyLink}
              className="p-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 hover:border-amber-400/60 text-slate-200 transition-all shadow-sm"
              title="Copy Room Link"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          {/* Waiting Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs font-game font-semibold text-white mb-4">
            <Users className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">WAITING FOR PLAYERS:</span>
            <span className="text-amber-400 text-sm font-bold">{playerCount} / {maxPlayers}</span>
          </div>

          {/* Share Actions */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <button
              onClick={handleWhatsAppShare}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all text-xs font-game font-semibold flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              WhatsApp
            </button>

            <button
              onClick={handleNativeShare}
              className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white border-b-4 border-sky-800 active:border-b-0 active:translate-y-1 transition-all text-xs font-game font-semibold flex items-center justify-center gap-2 shadow-sm"
            >
              <Share2 className="w-4 h-4" />
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
                    className={`p-3.5 rounded-2xl flex flex-col items-center justify-center text-center relative border-2 transition-all duration-200 ${
                      isMe
                        ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-950/20'
                        : isThisPlayerHost
                        ? 'border-amber-500/50 bg-slate-800/80'
                        : 'border-slate-700/70 bg-slate-800/60'
                    }`}
                  >
                    {/* Host crown badge */}
                    {isThisPlayerHost && (
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-amber-400 text-slate-900 shadow-sm" title="Room Host">
                        <Crown className="w-3.5 h-3.5 fill-current" />
                      </div>
                    )}

                    {/* Slot number badge */}
                    <div className="absolute top-2 left-2 text-[10px] font-mono font-bold text-slate-400">
                      #{String(slotNumber).padStart(2, '0')}
                    </div>

                    {/* Avatar */}
                    <span className="text-4xl my-2 select-none filter drop-shadow-sm">
                      {avatarObj.icon}
                    </span>

                    {/* Username */}
                    <p className="text-xs font-game font-bold text-white truncate max-w-full leading-tight">
                      {player.username}
                    </p>

                    {/* Subtext */}
                    <span className={`text-[10px] font-sans font-semibold mt-1 px-2 py-0.5 rounded-full ${
                      isMe
                        ? 'bg-amber-400/20 text-amber-300'
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
                  className="p-3.5 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center text-center relative opacity-50"
                >
                  <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-600">
                    #{String(slotNumber).padStart(2, '0')}
                  </div>
                  <div className="w-10 h-10 rounded-full border border-slate-700/60 flex items-center justify-center my-2 text-slate-500 text-xs font-bold">
                    ?
                  </div>
                  <span className="text-[11px] font-sans text-slate-500">Empty Slot</span>
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
                className={`w-full py-4 rounded-2xl font-game font-bold text-base tracking-wide flex items-center justify-center gap-2 cursor-pointer ${
                  canStart
                    ? 'btn-3d-mint text-slate-950'
                    : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border-2 border-slate-700/60 opacity-60'
                }`}
              >
                <Play className="w-5 h-5 fill-current" />
                Start Game ({playerCount}/{minPlayers})
              </button>
              {!canStart && (
                <p className="text-xs text-slate-400 font-sans mt-2">
                  {roomState.settings.gameMode === 'standard'
                    ? 'Standard mode requires all 11 players to start.'
                    : `Need at least ${minPlayers} players to start practice mode.`}
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl game-card-tactile flex items-center justify-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-game font-semibold text-slate-200">
                Waiting for host to start the game...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
