import React, { useState, useEffect } from 'react';
import { UserProfile, AVATARS } from '../services/supabase';
import { sounds } from '../utils/sound';
import { socketService } from '../services/socket';
import { Volume2, VolumeX, Shield, Trophy, HelpCircle, Server, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConnectionStatus } from '../services/socket';

interface NavbarProps {
  profile: UserProfile;
  onOpenAuth: () => void;
  onOpenLeaderboard: () => void;
  onOpenHowToPlay: () => void;
  onOpenServerSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  onOpenAuth,
  onOpenLeaderboard,
  onOpenHowToPlay,
  onOpenServerSettings
}) => {
  const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);
  const [isServerConnected, setIsServerConnected] = useState(socketService.isConnected());
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(socketService.getStatus());

  useEffect(() => {
    const unsub = socketService.onConnectionChange((connected, _url, status) => {
      setIsServerConnected(connected);
      setConnectionStatus(status);
    });
    return unsub;
  }, []);

  const handleToggleSound = () => {
    const next = sounds.toggleSound();
    setSoundEnabled(next);
  };

  const currentAvatar = AVATARS.find((a) => a.id === profile.avatar) || AVATARS[0];

  return (
    <header className="w-full bg-[#080C16]/75 backdrop-blur-2xl border-b border-white/[0.08] sticky top-0 z-40 px-4 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-md group-hover:bg-indigo-500/40 transition-all duration-300" />
            <img
              src="/logo.svg"
              alt="GUESS THE 11"
              className="w-10 h-10 relative z-10 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-game font-extrabold text-xl md:text-2xl tracking-tight text-white flex items-center gap-1.5">
              GUESS THE{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-sm">
                11
              </span>
            </span>
            <span className="text-[10px] font-sans font-medium text-slate-400 -mt-1 hidden sm:block tracking-wider uppercase">
              Real-Time Multiplayer
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold font-game">
          <button
            onClick={onOpenHowToPlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-300 hover:text-white glass-pill hover:bg-white/[0.08] transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>How to Play</span>
          </button>
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-300 hover:text-indigo-300 glass-pill hover:bg-white/[0.08] transition-all cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Leaderboard</span>
          </button>
          <Link
            to="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-400 hover:text-purple-300 glass-pill hover:bg-white/[0.08] transition-all text-[11px]"
          >
            <Shield className="w-3 h-3 text-purple-400" />
            <span>Admin</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Server Connection Status Pill */}
          {onOpenServerSettings && (
            <button
              onClick={onOpenServerSettings}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md transition-all cursor-pointer ${
                isServerConnected
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20'
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20 animate-pulse'
              }`}
              title={
                isServerConnected
                  ? 'Connected to 24/7 Cloud Server'
                  : connectionStatus === 'connecting'
                  ? 'Connecting to server... Please wait a few moments'
                  : 'Server Offline. Click to configure'
              }
            >
              {isServerConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  <span className="hidden sm:inline text-[11px] font-bold">24/7 Cloud</span>
                </>
              ) : connectionStatus === 'connecting' ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                  <span className="hidden sm:inline text-[11px] font-bold">Connecting...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_#f87171]" />
                  <span className="hidden sm:inline text-[11px] font-bold">Offline</span>
                </>
              )}
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-full glass-pill text-slate-300 hover:text-white hover:bg-white/[0.1] transition-all cursor-pointer"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-indigo-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* User Profile Pill Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card hover:border-white/20 transition-all cursor-pointer group"
          >
            <span className="text-lg leading-none select-none group-hover:scale-110 transition-transform" role="img" aria-label={currentAvatar.label}>
              {currentAvatar.icon}
            </span>
            <div className="text-left hidden xs:block">
              <p className="text-xs font-game font-bold text-white max-w-[90px] truncate leading-tight">
                {profile.username}
              </p>
              <p className="text-[10px] font-sans font-medium text-indigo-300/80 leading-tight">
                {profile.isGuest ? 'Guest' : `${profile.totalScore} pts`}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
