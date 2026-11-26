import React, { useState } from 'react';
import { X, Play, Settings2, Users, Flame, Lock, Loader2 } from 'lucide-react';
import { GameMode } from '@guess-the-11/shared';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  onCreate: (settings: {
    gameMode: GameMode;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'all';
    roundDurationSeconds: number;
    isPrivate: boolean;
    password?: string;
  }) => void;
}

const CATEGORIES = [
  'all',
  'Animals',
  'Food',
  'Sports',
  'Movies',
  'Objects',
  'Places',
  'Nature',
  'Technology',
  'General Knowledge'
];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  isLoading = false,
  onCreate
}) => {
  const [gameMode, setGameMode] = useState<GameMode>('standard');
  const [category, setCategory] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'all'>('all');
  const [roundDuration, setRoundDuration] = useState<number>(75);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [roomPassword, setRoomPassword] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      gameMode,
      category,
      difficulty,
      roundDurationSeconds: roundDuration,
      isPrivate,
      password: isPrivate && roomPassword.trim() ? roomPassword.trim() : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-modal border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Settings2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-wide text-white">
              CREATE ROOM
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 py-4 pr-1">
          {/* Game Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
              Game Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGameMode('standard')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  gameMode === 'standard'
                    ? 'bg-indigo-500/15 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                    : 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Standard 11</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Full 11-player lobby. 11 rounds. Each player draws once.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('practice')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  gameMode === 'practice'
                    ? 'bg-indigo-500/15 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                    : 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Practice / Casual</span>
                  <Flame className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Flexible lobby (2–10 players). 11 rounds compulsory.
                </p>
              </button>
            </div>
          </div>

          {/* Word Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
              Word Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full glass-input border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-400 font-sans"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0C1220] text-white">
                  {cat === 'all' ? 'All Categories (Random Mix)' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty & Timer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full glass-input border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-400 font-sans"
              >
                <option value="all" className="bg-[#0C1220] text-white">Any Difficulty</option>
                <option value="easy" className="bg-[#0C1220] text-white">Easy (Beginners)</option>
                <option value="medium" className="bg-[#0C1220] text-white">Medium (Standard)</option>
                <option value="hard" className="bg-[#0C1220] text-white">Hard (Masters)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                Round Duration
              </label>
              <select
                value={roundDuration}
                onChange={(e) => setRoundDuration(parseInt(e.target.value, 10))}
                className="w-full glass-input border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-400 font-sans"
              >
                <option value={60} className="bg-[#0C1220] text-white">60 Seconds</option>
                <option value={75} className="bg-[#0C1220] text-white">75 Seconds (Recommended)</option>
                <option value={90} className="bg-[#0C1220] text-white">90 Seconds</option>
              </select>
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs font-bold text-white">Private Room</p>
                <p className="text-[10px] text-slate-400">Only players with code/link can join</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
            />
          </div>

          {/* Optional Room Password */}
          {isPrivate && (
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-indigo-500/30 animate-in fade-in">
              <label className="block text-xs font-semibold text-indigo-300 mb-1.5 uppercase">
                Room Password / PIN (Optional)
              </label>
              <input
                type="text"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
                placeholder="e.g. 1234 or secret"
                maxLength={20}
                className="w-full glass-input border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Share this password with friends so only they can enter.
              </p>
            </div>
          )}

          {/* Create Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-glass-primary w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm uppercase tracking-wide cursor-pointer font-semibold text-white disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Room...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Create Room
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
