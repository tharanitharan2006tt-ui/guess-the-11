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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-[#A78BFA] text-xs font-semibold tracking-wider uppercase mb-5 border border-[#7655F7]/30 shadow-[0_0_15px_rgba(118,85,247,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-[#28C7E8]" />
            11 PLAYERS • 11 ROUNDS • REAL-TIME DRAWING
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#F4F5FF]">
            GUESS THE{' '}
            <span className="bg-gradient-to-r from-[#7655F7] via-[#A78BFA] to-[#28C7E8] bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(118,85,247,0.4)]">
              11
            </span>
          </h1>

          <p className="mt-3.5 text-sm md:text-base text-[#929BB3] max-w-lg mx-auto leading-relaxed">
            The premier competitive real-time drawing and guessing arena. 11 players enter, 11 fast-paced rounds, 1 victorious champion.
          </p>
        </div>

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="w-full max-w-md mb-6 p-3.5 rounded-2xl bg-[#FF647C]/10 border border-[#FF647C]/30 text-[#FF647C] text-xs font-semibold flex items-center justify-between gap-2.5 shadow-md">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-[#FF647C]" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setIsServerSettingsOpen(true)}
              className="text-[11px] underline font-bold uppercase flex-shrink-0 text-[#28C7E8] cursor-pointer"
            >
              Settings
            </button>
          </div>
        )}

        {/* Action Center Grid */}
        <div className="w-full max-w-md mx-auto flex flex-col gap-3.5 relative z-10">
          {/* Quick Play CTA - Primary Action */}
          <button
            onClick={handleQuickPlay}
            disabled={quickPlayLoading}
            className="w-full p-4.5 rounded-2xl bg-gradient-to-r from-[#7655F7] to-[#5838DF] hover:from-[#8B6BFF] hover:to-[#6A4BEF] border border-white/20 flex items-center justify-between group disabled:opacity-50 select-none cursor-pointer relative overflow-hidden transition-all duration-300 shadow-[0_8px_30px_rgba(118,85,247,0.35)] active:scale-[0.98]"
          >
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="p-3 rounded-xl bg-white/10 text-[#F4F5FF] shadow-inner group-hover:scale-105 transition-transform duration-300">
                {quickPlayLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Zap className="w-5 h-5 fill-current text-[#28C7E8]" />
                )}
              </div>
              <div className="text-left">
                <span className="block text-base font-bold tracking-tight text-[#F4F5FF]">
                  {quickPlayLoading ? 'Finding Players...' : 'Play Now (Quick Match)'}
                </span>
                <span className="block text-xs text-[#F4F5FF]/80 font-medium">
                  Tap to play instantly with other players
                </span>
              </div>
            </div>

            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#F4F5FF] group-hover:translate-x-1 transition-transform relative z-10">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </button>

          {/* Friendly 3-Step Quick Guide Pill */}
          <div className="w-full p-3 rounded-2xl bg-[#0D1221] border border-white/[0.08] flex items-center justify-around text-center shadow-inner">
            <div className="flex flex-col items-center">
              <span className="text-base select-none">✏️</span>
              <span className="font-bold text-[#F4F5FF] text-xs mt-0.5">1. Draw</span>
              <span className="text-[10px] text-[#929BB3]">Secret word</span>
            </div>
            <span className="text-[#929BB3]/40 text-xs font-bold">➔</span>
            <div className="flex flex-col items-center">
              <span className="text-base select-none">💬</span>
              <span className="font-bold text-[#F4F5FF] text-xs mt-0.5">2. Guess</span>
              <span className="text-[10px] text-[#929BB3]">Type in chat</span>
            </div>
            <span className="text-[#929BB3]/40 text-xs font-bold">➔</span>
            <div className="flex flex-col items-center">
              <span className="text-base select-none">🏆</span>
              <span className="font-bold text-[#F4F5FF] text-xs mt-0.5">3. Win!</span>
              <span className="text-[10px] text-[#929BB3]">Score points</span>
            </div>
          </div>

          {/* Create Room & Join Room row - Interactive Surface Cards */}
          <div className="grid grid-cols-2 gap-3.5">
            <button
              onClick={() => setIsCreateOpen(true)}
              disabled={isCreatingRoom}
              className="p-4 rounded-2xl glass-card hover:border-[#7655F7]/50 text-left flex flex-col justify-between group select-none cursor-pointer disabled:opacity-50 min-h-[140px] transition-all duration-300 active:scale-[0.98]"
            >
              <div className="p-2.5 rounded-xl bg-[#7655F7]/15 border border-[#7655F7]/30 text-[#A78BFA] w-fit mb-3 group-hover:scale-110 transition-transform">
                {isCreatingRoom ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-base text-[#F4F5FF] group-hover:text-[#A78BFA] transition-colors">
                  {isCreatingRoom ? 'Creating...' : 'Create Room'}
                </h3>
                <p className="text-[11px] text-[#929BB3] mt-0.5">
                  Play privately with friends
                </p>
              </div>
            </button>

            <button
              onClick={() => setIsJoinOpen(true)}
              className="p-4 rounded-2xl glass-card hover:border-[#28C7E8]/50 text-left flex flex-col justify-between group select-none cursor-pointer min-h-[140px] transition-all duration-300 active:scale-[0.98]"
            >
              <div className="p-2.5 rounded-xl bg-[#28C7E8]/15 border border-[#28C7E8]/30 text-[#28C7E8] w-fit mb-3 group-hover:scale-110 transition-transform">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#F4F5FF] group-hover:text-[#28C7E8] transition-colors">
                  Join Room
                </h3>
                <p className="text-[11px] text-[#929BB3] mt-0.5">
                  Enter friend's code or link
                </p>
              </div>
            </button>
          </div>

          {/* How to Play & Leaderboard row */}
          <div className="grid grid-cols-2 gap-3.5">
            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="p-3.5 rounded-2xl btn-glass-secondary flex items-center justify-center gap-2 select-none cursor-pointer hover:border-[#28C7E8]/40"
            >
              <HelpCircle className="w-4 h-4 text-[#28C7E8]" />
              <span className="text-xs font-semibold text-[#F4F5FF]">How to Play</span>
            </button>

            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="p-3.5 rounded-2xl btn-glass-secondary flex items-center justify-center gap-2 select-none cursor-pointer hover:border-[#FFC857]/40"
            >
              <Trophy className="w-4 h-4 text-[#FFC857]" />
              <span className="text-xs font-semibold text-[#F4F5FF]">Leaderboard</span>
            </button>
          </div>
        </div>

        {/* Feature Sections (4 Cards: 11 Player Arena, Real-Time Drawing, Competitive Leaderboard, Play With Friends) */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full">
          <div className="p-5 rounded-2xl glass-card text-center group hover:border-[#7655F7]/40 transition-all">
            <div className="w-11 h-11 rounded-xl bg-[#7655F7]/15 border border-[#7655F7]/30 text-[#A78BFA] mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-[#F4F5FF] text-sm">
              11 Player Arena
            </h4>
            <p className="text-xs text-[#929BB3] mt-1.5 leading-relaxed">
              Full 11-player lobby. 11 rounds. Every player rotates to sketch on the canvas.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card text-center group hover:border-[#28C7E8]/40 transition-all">
            <div className="w-11 h-11 rounded-xl bg-[#28C7E8]/15 border border-[#28C7E8]/30 text-[#28C7E8] mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Palette className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-[#F4F5FF] text-sm">
              Real-Time Drawing
            </h4>
            <p className="text-xs text-[#929BB3] mt-1.5 leading-relaxed">
              Sub-millisecond canvas with 12 studio colors, sizes, eraser, undo, and live cloud sync.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card text-center group hover:border-[#FFC857]/40 transition-all">
            <div className="w-11 h-11 rounded-xl bg-[#FFC857]/15 border border-[#FFC857]/30 text-[#FFC857] mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-[#F4F5FF] text-sm">
              Competitive Ranks
            </h4>
            <p className="text-xs text-[#929BB3] mt-1.5 leading-relaxed">
              Climb global leaderboards, earn victory points, and claim the champion's gold podium.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card text-center group hover:border-[#28DFA5]/40 transition-all">
            <div className="w-11 h-11 rounded-xl bg-[#28DFA5]/15 border border-[#28DFA5]/30 text-[#28DFA5] mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-[#F4F5FF] text-sm">
              Play With Friends
            </h4>
            <p className="text-xs text-[#929BB3] mt-1.5 leading-relaxed">
              Private rooms with custom PINs, instant WhatsApp invites, and cross-platform play.
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
