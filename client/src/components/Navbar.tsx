import React from 'react';
import { UserProfile, AVATARS } from '../services/supabase';
import { sounds } from '../utils/sound';
import { Volume2, VolumeX, Shield, Trophy, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  profile: UserProfile;
  onOpenAuth: () => void;
  onOpenLeaderboard: () => void;
  onOpenHowToPlay: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  onOpenAuth,
  onOpenLeaderboard,
  onOpenHowToPlay
}) => {
  const [soundEnabled, setSoundEnabled] = React.useState(sounds.enabled);
  const navigate = useNavigate();

  const handleToggleSound = () => {
    const next = sounds.toggleSound();
    setSoundEnabled(next);
  };

  const currentAvatar = AVATARS.find(a => a.id === profile.avatar) || AVATARS[0];

  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-indigo-500/20 sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.svg"
            alt="GUESS THE 11"
            className="w-10 h-10 transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]"
          />
          <div className="flex flex-col">
            <span className="font-gaming font-extrabold text-lg md:text-xl tracking-wider bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
              GUESS THE 11
            </span>
            <span className="text-[10px] uppercase font-semibold text-cyan-400 tracking-widest -mt-1 hidden sm:block">
              Multiplayer Arena
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={onOpenHowToPlay}
            className="hover:text-cyan-400 transition-colors"
          >
            How to Play
          </button>
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Leaderboard</span>
          </button>
          <Link
            to="/admin"
            className="flex items-center gap-1 hover:text-purple-400 transition-colors text-xs text-slate-400"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Admin</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          {/* User Profile Pill */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 transition-all shadow-glass"
          >
            <span className="text-xl" role="img" aria-label={currentAvatar.label}>
              {currentAvatar.icon}
            </span>
            <div className="text-left hidden xs:block">
              <p className="text-xs font-semibold text-white max-w-[100px] truncate leading-tight">
                {profile.username}
              </p>
              <p className="text-[10px] text-cyan-400 font-medium leading-tight">
                {profile.isGuest ? 'Guest' : `${profile.totalScore} pts`}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
