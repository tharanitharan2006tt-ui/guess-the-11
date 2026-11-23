import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, AVATARS } from '../services/supabase';
import { socketService } from '../services/socket';
import {
  Play,
  PlusCircle,
  LogIn,
  Zap,
  HelpCircle,
  Trophy,
  Users,
  Palette,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { CreateRoomModal } from '../components/CreateRoomModal';
import { JoinRoomModal } from '../components/JoinRoomModal';
import { HowToPlayModal } from '../components/HowToPlayModal';
import { LeaderboardModal } from '../components/LeaderboardModal';
import { AuthModal } from '../components/AuthModal';
import { Navbar } from '../components/Navbar';

interface HomeScreenProps {
  profile: UserProfile;
  onProfileUpdated: (p: UserProfile) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ profile, onProfileUpdated }) => {
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [quickPlayLoading, setQuickPlayLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentAvatar = AVATARS.find((a) => a.id === profile.avatar) || AVATARS[0];

  // Handle Quick Play
  const handleQuickPlay = async () => {
    setQuickPlayLoading(true);
    setErrorMessage(null);
    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL ||
        (window.location.hostname !== 'localhost' ? window.location.origin : 'http://localhost:4000');
      const res = await fetch(`${backendUrl}/api/rooms/quick-play`);
      const data = await res.json();

      if (data.success && data.roomCode) {
        // Found open room, join it!
        navigate(`/room/${data.roomCode}`);
      } else {
        // No open room found, automatically create a public standard room!
        const createRes = await socketService.createRoom(
          { id: profile.id, username: profile.username, avatar: profile.avatar },
          { gameMode: 'standard', isPrivate: false }
        );
        if (createRes.success && createRes.roomCode) {
          navigate(`/room/${createRes.roomCode}`);
        } else {
          setErrorMessage(createRes.error || 'Failed to matchmake');
        }
      }
    } catch (err: any) {
      setErrorMessage('Could not connect to matchmaking server');
    } finally {
      setQuickPlayLoading(false);
    }
  };

  // Handle Create Room
  const handleCreateRoom = async (settings: any) => {
    setIsCreateOpen(false);
    setErrorMessage(null);
    const res = await socketService.createRoom(
      { id: profile.id, username: profile.username, avatar: profile.avatar },
      settings
    );
    if (res.success && res.roomCode) {
      navigate(`/room/${res.roomCode}`);
    } else {
      setErrorMessage(res.error || 'Failed to create room');
    }
  };

  // Handle Join Room
  const handleJoinRoom = (roomCode: string) => {
    setIsJoinOpen(false);
    navigate(`/room/${roomCode}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-game-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-game-dark">
      <Navbar
        profile={profile}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
      />

      {/* Main Hero Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:py-14 flex flex-col items-center justify-center">
        {/* Glow ambient circle */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Brand Banner */}
        <div className="text-center relative z-10 max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4 shadow-neon-blue">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            11 Players • 11 Rounds • Real-Time Multiplayer
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-gaming font-extrabold tracking-tight text-white uppercase drop-shadow-[0_0_35px_rgba(139,92,246,0.5)]">
            GUESS THE <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">11</span>
          </h1>

          <p className="mt-3 text-sm md:text-base text-slate-300 font-medium max-w-lg mx-auto">
            The ultimate online competitive drawing and guessing arena. Form an 11-player squad, sketch secret words, outsmart opponents, and climb the leaderboard!
          </p>
        </div>

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="w-full max-w-md mb-6 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2 shadow-lg">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Center Grid */}
        <div className="w-full max-w-md mx-auto grid grid-cols-1 gap-3.5 relative z-10">
          {/* Quick Play CTA */}
          <button
            onClick={handleQuickPlay}
            disabled={quickPlayLoading}
            className="group relative p-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-gaming font-bold text-base tracking-wider uppercase transition-all duration-300 hover:shadow-neon-blue hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between shadow-lg overflow-hidden disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
                <Zap className="w-6 h-6 fill-current text-white animate-pulse" />
              </div>
              <div className="text-left">
                <span className="block text-base leading-tight">Quick Play</span>
                <span className="block text-[11px] font-sans font-normal text-cyan-200">
                  Instant Matchmaking
                </span>
              </div>
            </div>
            <Play className="w-5 h-5 fill-current opacity-80 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Create Room & Join Room row */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="p-4 rounded-2xl glass-card hover:bg-slate-800/80 border border-indigo-500/30 hover:border-indigo-500/60 transition-all hover:scale-[1.02] active:scale-[0.98] text-left flex flex-col justify-between group shadow-glass"
            >
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 w-fit mb-3 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-gaming font-bold text-sm text-white uppercase">
                  Create Room
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Host 11-player squad</p>
              </div>
            </button>

            <button
              onClick={() => setIsJoinOpen(true)}
              className="p-4 rounded-2xl glass-card hover:bg-slate-800/80 border border-indigo-500/30 hover:border-indigo-500/60 transition-all hover:scale-[1.02] active:scale-[0.98] text-left flex flex-col justify-between group shadow-glass"
            >
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 w-fit mb-3 group-hover:scale-110 transition-transform">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-gaming font-bold text-sm text-white uppercase">
                  Join Room
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Enter code or invite link</p>
              </div>
            </button>
          </div>

          {/* How to Play & Leaderboard row */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2.5 text-slate-300 hover:text-white"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold">How to Play</span>
            </button>

            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2.5 text-slate-300 hover:text-amber-400"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold">Leaderboard</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Row */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl w-full">
          <div className="p-4 rounded-2xl glass-card border border-indigo-500/20 text-center">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center mb-2">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">
              11 Player Formation
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Engineered specifically for full 11-player rooms where every competitor takes the canvas.
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-indigo-500/20 text-center">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center mb-2">
              <Palette className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">
              HTML5 Realtime Canvas
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Sub-millisecond touch and mouse drawing sync with custom colors, brush sizes, and undo.
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-indigo-500/20 text-center">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">
              High-Stakes Scoring
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              +1 point for correct guesses, +1 drawer bonus, and a harsh -5 penalty if nobody guesses!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 border-t border-slate-900 text-center text-xs text-slate-500">
        GUESS THE 11 © 2026 • Commercial-Grade Realtime Gaming Application
      </footer>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateRoom}
      />
      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onJoin={handleJoinRoom}
      />
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentProfile={profile}
        onProfileUpdated={onProfileUpdated}
      />
    </div>
  );
};
