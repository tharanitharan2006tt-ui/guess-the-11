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
  ShieldAlert,
  ArrowRight
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
    } catch {
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
    <div className="min-h-screen flex flex-col bg-[#0C101D] text-slate-100">
      <Navbar
        profile={profile}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
      />

      {/* Main Hero Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col items-center justify-center relative">
        {/* Subtle warm ambient glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[350px] h-[250px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Brand Banner */}
        <div className="text-center relative z-10 max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-game font-semibold tracking-wide uppercase mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            11 Players • 11 Rounds • Real-Time Drawing Game
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-game font-bold tracking-tight text-white drop-shadow-sm">
            GUESS THE{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              11
            </span>
          </h1>

          <p className="mt-3 text-sm md:text-base text-slate-300 font-sans font-medium max-w-lg mx-auto leading-relaxed">
            The fun, high-stakes party game where players take turns drawing secret words and guessing in real-time. Form your 11-player squad and see who emerges as champion!
          </p>
        </div>

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="w-full max-w-md mb-6 p-3.5 rounded-2xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2.5 shadow-md">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Center Grid */}
        <div className="w-full max-w-md mx-auto flex flex-col gap-3.5 relative z-10">
          {/* Quick Play CTA - Tactile 3D Amber Button */}
          <button
            onClick={handleQuickPlay}
            disabled={quickPlayLoading}
            className="w-full p-4 rounded-2xl btn-3d-amber flex items-center justify-between group disabled:opacity-50 select-none cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-900/15 text-slate-900">
                <Zap className="w-6 h-6 fill-current animate-bounce-subtle" />
              </div>
              <div className="text-left">
                <span className="block text-lg font-game font-bold tracking-tight text-slate-900">
                  Quick Play
                </span>
                <span className="block text-xs font-sans font-semibold text-slate-800/80">
                  Instant Matchmaking
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-900/15 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <Play className="w-5 h-5 fill-current text-slate-900" />
            </div>
          </button>

          {/* Create Room & Join Room row - Tactile 3D Coral & Indigo Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="p-4 rounded-2xl btn-3d-coral text-left flex flex-col justify-between group select-none cursor-pointer"
            >
              <div className="p-2 rounded-xl bg-black/15 text-white w-fit mb-3 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-game font-bold text-base text-white">
                  Create Room
                </h3>
                <p className="text-[11px] font-sans font-medium text-orange-100/90 mt-0.5">
                  Host 11-player squad
                </p>
              </div>
            </button>

            <button
              onClick={() => setIsJoinOpen(true)}
              className="p-4 rounded-2xl btn-3d-indigo text-left flex flex-col justify-between group select-none cursor-pointer"
            >
              <div className="p-2 rounded-xl bg-black/15 text-white w-fit mb-3 group-hover:scale-110 transition-transform">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-game font-bold text-base text-white">
                  Join Room
                </h3>
                <p className="text-[11px] font-sans font-medium text-indigo-100/90 mt-0.5">
                  Enter 6-digit code
                </p>
              </div>
            </button>
          </div>

          {/* How to Play & Leaderboard row - Tactile Slate Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="p-3.5 rounded-2xl btn-3d-slate flex items-center justify-center gap-2 select-none cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-game font-semibold">How to Play</span>
            </button>

            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="p-3.5 rounded-2xl btn-3d-slate flex items-center justify-center gap-2 select-none cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-game font-semibold">Leaderboard</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Row */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
          <div className="p-4 rounded-2xl game-card-tactile text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 mx-auto flex items-center justify-center mb-2.5">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-game font-bold text-white text-sm">
              11 Player Arena
            </h4>
            <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">
              Designed for full 11-player rooms where every competitor gets their turn to sketch on the canvas.
            </p>
          </div>

          <div className="p-4 rounded-2xl game-card-tactile text-center">
            <div className="w-10 h-10 rounded-xl bg-sky-400/10 text-sky-400 mx-auto flex items-center justify-center mb-2.5">
              <Palette className="w-5 h-5" />
            </div>
            <h4 className="font-game font-bold text-white text-sm">
              Real-Time Drawing
            </h4>
            <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">
              Silky smooth canvas with complete artist colors, brush sizes, eraser, undo, and instant live sync.
            </p>
          </div>

          <div className="p-4 rounded-2xl game-card-tactile text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 text-emerald-400 mx-auto flex items-center justify-center mb-2.5">
              <Trophy className="w-5 h-5" />
            </div>
            <h4 className="font-game font-bold text-white text-sm">
              High-Stakes Rules
            </h4>
            <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">
              +1 point for fast correct guesses, +1 drawer bonus, and a dramatic -5 penalty if nobody guesses!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 border-t border-slate-800/80 text-center text-xs text-slate-500 font-sans">
        GUESS THE 11 © 2026 • Crafted with passion for online party gaming
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
