import React from 'react';
import { UserProfile, AVATARS } from '../services/supabase';
import { sounds } from '../utils/sound';
import { Volume2, VolumeX, Shield, Trophy, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  const handleToggleSound = () => {
    const next = sounds.toggleSound();
    setSoundEnabled(next);
  };

  const currentAvatar = AVATARS.find((a) => a.id === profile.avatar) || AVATARS[0];

  return (
    <header className="w-full bg-[#0C101D]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <img
              src="/logo.svg"
              alt="GUESS THE 11"
              className="w-10 h-10 transition-transform duration-200 group-hover:scale-110 drop-shadow-md"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-game font-bold text-xl md:text-2xl tracking-tight text-white flex items-center gap-1.5">
              GUESS THE{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                11
              </span>
            </span>
            <span className="text-[11px] font-sans font-semibold text-slate-400 -mt-1 hidden sm:block">
              Multiplayer Drawing Arena
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-semibold font-game">
          <button
            onClick={onOpenHowToPlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>How to Play</span>
          </button>
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Leaderboard</span>
          </button>
          <Link
            to="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-purple-300 hover:bg-slate-800/60 transition-all text-xs"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Admin</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-500 transition-all"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>

          {/* User Profile Pill Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-800/90 border-2 border-slate-700/70 hover:border-amber-400/60 hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            <span className="text-xl leading-none select-none" role="img" aria-label={currentAvatar.label}>
              {currentAvatar.icon}
            </span>
            <div className="text-left hidden xs:block">
              <p className="text-xs font-game font-semibold text-white max-w-[100px] truncate leading-tight">
                {profile.username}
              </p>
              <p className="text-[10px] font-sans font-medium text-amber-400 leading-tight">
                {profile.isGuest ? 'Guest Player' : `${profile.totalScore} pts`}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
