import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../services/supabase';
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
  Server,
  Loader2
} from 'lucide-react';
import { CreateRoomModal } from '../components/CreateRoomModal';
import { JoinRoomModal } from '../components/JoinRoomModal';
import { HowToPlayModal } from '../components/HowToPlayModal';
import { LeaderboardModal } from '../components/LeaderboardModal';
import { AuthModal } from '../components/AuthModal';
import { ServerSettingsModal } from '../components/ServerSettingsModal';
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
  const [isServerSettingsOpen, setIsServerSettingsOpen] = useState(false);
  const [isServerConnected, setIsServerConnected] = useState(socketService.isConnected());
  const [currentServerUrl, setCurrentServerUrl] = useState(socketService.getServerUrl());

  const [quickPlayLoading, setQuickPlayLoading] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = socketService.onConnectionChange((connected, url) => {
      setIsServerConnected(connected);
      setCurrentServerUrl(url);
    });
    return unsub;
  }, []);

  // Handle Quick Play
  const handleQuickPlay = async () => {
    setQuickPlayLoading(true);
    setErrorMessage(null);
    try {
      const backendUrl = socketService.getServerUrl();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${backendUrl}/api/rooms/quick-play`, {
        signal: controller.signal,
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      clearTimeout(timer);
      const data = await res.json();

      if (data.success && data.roomCode) {
        navigate(`/room/${data.roomCode}`);
      } else {
        const createRes = await socketService.createRoom(
          { id: profile.id, username: profile.username, avatar: profile.avatar },
          { gameMode: 'standard', isPrivate: false }
        );
        if (createRes.success && createRes.roomCode) {
          navigate(`/room/${createRes.roomCode}`);
        } else {
          setErrorMessage(createRes.error || 'Failed to matchmake. Ensure server is online.');
        }
      }
    } catch {
      setErrorMessage(`Cannot reach server at ${currentServerUrl}. Please configure Server Address.`);
    } finally {
      setQuickPlayLoading(false);
    }
  };

  // Handle Create Room
  const handleCreateRoom = async (settings: any) => {
    setIsCreatingRoom(true);
    setErrorMessage(null);
    try {
      const res = await socketService.createRoom(
        { id: profile.id, username: profile.username, avatar: profile.avatar },
        settings
      );
      if (res.success && res.roomCode) {
        setIsCreateOpen(false);
        navigate(`/room/${res.roomCode}`);
      } else {
        setErrorMessage(res.error || 'Failed to create room. Ensure server is running.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Server did not respond');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // Handle Join Room
  const handleJoinRoom = (roomCode: string, password?: string) => {
    setIsJoinOpen(false);
    navigate(`/room/${roomCode}${password ? `?pass=${encodeURIComponent(password)}` : ''}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080C16] text-slate-100 relative overflow-hidden">
      <Navbar
        profile={profile}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onOpenServerSettings={() => setIsServerSettingsOpen(true)}
      />

      {/* Main Hero Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14 flex flex-col items-center justify-center relative z-10">
        {/* Soft, Luxury Ambient Glass Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[580px] h-[340px] bg-indigo-600/12 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-48 left-1/4 w-[380px] h-[280px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-36 right-1/4 w-[320px] h-[240px] bg-cyan-500/10 rounded-full blur-[110px] pointer-events-none" />

        {/* Server Disconnected Banner */}
        {!isServerConnected && (
          <div
            onClick={() => setIsServerSettingsOpen(true)}
            className="w-full max-w-md mb-6 p-3.5 rounded-2xl glass-card border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-between shadow-lg cursor-pointer hover:bg-amber-500/10 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
              <span className="truncate">Server disconnected ({currentServerUrl})</span>
            </div>
            <span className="text-[11px] underline font-bold uppercase tracking-wide flex-shrink-0 ml-2">
              Configure ⚙️
            </span>
          </div>
        )}

        {/* Brand Banner */}
        <div className="text-center relative z-10 max-w-2xl mx-auto mb-9">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-indigo-300 text-xs font-game font-semibold tracking-wider uppercase mb-5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            11 Players • 11 Rounds • Real-Time Drawing
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-game font-extrabold tracking-tight text-white drop-shadow-sm">
            GUESS THE{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(99,102,241,0.35)]">
              11
            </span>
          </h1>

          <p className="mt-3.5 text-sm md:text-base text-slate-300 font-sans font-normal max-w-lg mx-auto leading-relaxed">
            The modern party game where players sketch secret words and guess in real-time. Gather your 11-player squad and battle for the crown!
          </p>
        </div>

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="w-full max-w-md mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-between gap-2.5 shadow-md">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setIsServerSettingsOpen(true)}
              className="text-[11px] underline font-game font-bold uppercase flex-shrink-0 text-indigo-300 cursor-pointer"
            >
              Settings
            </button>
          </div>
        )}

        {/* Action Center Grid */}
        <div className="w-full max-w-md mx-auto flex flex-col gap-3.5 relative z-10">
          {/* Quick Play CTA - Clean Hero Glass Card */}
          <button
            onClick={handleQuickPlay}
            disabled={quickPlayLoading}
            className="w-full p-4.5 rounded-3xl glass-card border border-white/10 hover:border-indigo-400/40 flex items-center justify-between group disabled:opacity-50 select-none cursor-pointer relative overflow-hidden transition-all duration-300"
          >
            {/* Subtle inner highlight */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex items-center gap-3.5 relative z-10">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform duration-300">
                {quickPlayLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Zap className="w-5 h-5 fill-current" />
                )}
              </div>
              <div className="text-left">
                <span className="block text-base font-game font-bold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                  {quickPlayLoading ? 'Searching Match...' : 'Quick Play'}
                </span>
                <span className="block text-xs font-sans text-slate-400 font-medium">
                  Instant Matchmaking
                </span>
              </div>
            </div>

            <div className="w-10 h-10 rounded-2xl glass-pill flex items-center justify-center text-slate-300 group-hover:text-white group-hover:border-indigo-400/50 group-hover:translate-x-1 transition-all relative z-10">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </button>

          {/* Create Room & Join Room row - Frosted Glass Cards */}
          <div className="grid grid-cols-2 gap-3.5">
            <button
              onClick={() => setIsCreateOpen(true)}
              disabled={isCreatingRoom}
              className="p-4.5 rounded-3xl glass-card border border-white/10 hover:border-rose-400/40 text-left flex flex-col justify-between group select-none cursor-pointer disabled:opacity-50 min-h-[145px] transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/25 text-rose-300 w-fit mb-3 group-hover:scale-110 transition-transform relative z-10">
                {isCreatingRoom ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
              </div>
              <div className="relative z-10">
                <h3 className="font-game font-bold text-base text-white group-hover:text-rose-200 transition-colors">
                  {isCreatingRoom ? 'Creating...' : 'Create Room'}
                </h3>
                <p className="text-[11px] font-sans text-slate-400 mt-0.5 font-medium">
                  Host 11-player squad
                </p>
              </div>
            </button>

            <button
              onClick={() => setIsJoinOpen(true)}
              className="p-4.5 rounded-3xl glass-card border border-white/10 hover:border-cyan-400/40 text-left flex flex-col justify-between group select-none cursor-pointer min-h-[145px] transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 w-fit mb-3 group-hover:scale-110 transition-transform relative z-10">
                <LogIn className="w-5 h-5" />
              </div>
              <div className="relative z-10">
                <h3 className="font-game font-bold text-base text-white group-hover:text-cyan-200 transition-colors">
                  Join Room
                </h3>
                <p className="text-[11px] font-sans text-slate-400 mt-0.5 font-medium">
                  Enter 6-digit code
                </p>
              </div>
            </button>
          </div>

          {/* How to Play & Leaderboard row - Clean Glass Pill Buttons */}
          <div className="grid grid-cols-2 gap-3.5">
            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="p-3.5 rounded-2xl btn-glass-secondary flex items-center justify-center gap-2 select-none cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-game font-semibold">How to Play</span>
            </button>

            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="p-3.5 rounded-2xl btn-glass-secondary flex items-center justify-center gap-2 select-none cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-game font-semibold">Leaderboard</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Row - Sleek Glass Cards */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
          <div className="p-5 rounded-3xl glass-card text-center group hover:border-indigo-400/30 transition-all">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-game font-bold text-white text-sm">
              11 Player Arena
            </h4>
            <p className="text-xs text-slate-400 font-sans mt-1.5 leading-relaxed">
              Designed for full 11-player matches where every squad member rotates to sketch on the canvas.
            </p>
          </div>

          <div className="p-5 rounded-3xl glass-card text-center group hover:border-cyan-400/30 transition-all">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Palette className="w-5 h-5" />
            </div>
            <h4 className="font-game font-bold text-white text-sm">
              Real-Time Drawing
            </h4>
            <p className="text-xs text-slate-400 font-sans mt-1.5 leading-relaxed">
              Ultra-responsive canvas with artist color palette, variable sizes, eraser, undo, and live cloud sync.
            </p>
          </div>

          <div className="p-5 rounded-3xl glass-card text-center group hover:border-purple-400/30 transition-all">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <h4 className="font-game font-bold text-white text-sm">
              Fair Scoring Rules
            </h4>
            <p className="text-xs text-slate-400 font-sans mt-1.5 leading-relaxed">
              +1 point for fast correct guesses, +1 drawer bonus, and a -5 penalty if nobody guesses correctly!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 border-t border-white/[0.06] text-center text-xs text-slate-500 font-sans flex items-center justify-center gap-2 relative z-10">
        <span>GUESS THE 11 • Realtime Multiplayer Gaming</span>
        <span>•</span>
        <button
          onClick={() => setIsServerSettingsOpen(true)}
          className="text-indigo-400/80 hover:text-indigo-300 font-mono text-[11px] underline cursor-pointer"
        >
          Server Settings
        </button>
      </footer>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        isLoading={isCreatingRoom}
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
      <ServerSettingsModal
        isOpen={isServerSettingsOpen}
        onClose={() => setIsServerSettingsOpen(false)}
      />
    </div>
  );
};
