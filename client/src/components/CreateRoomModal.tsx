import React, { useState } from 'react';
import { X, Play, Settings2, Users, Flame, Lock } from 'lucide-react';
import { GameMode } from '@guess-the-11/shared';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (settings: {
    gameMode: GameMode;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'all';
    roundDurationSeconds: number;
    isPrivate: boolean;
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
  onCreate
}) => {
  const [gameMode, setGameMode] = useState<GameMode>('standard');
  const [category, setCategory] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'all'>('all');
  const [roundDuration, setRoundDuration] = useState<number>(75);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      gameMode,
      category,
      difficulty,
      roundDurationSeconds: roundDuration,
      isPrivate
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-neon-blue">
              <Settings2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-gaming tracking-wide text-white">
              CREATE ROOM
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 py-4 pr-1">
          {/* Game Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Game Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGameMode('standard')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  gameMode === 'standard'
                    ? 'bg-indigo-600/30 border-cyan-400 ring-2 ring-cyan-400 shadow-neon-blue'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Standard 11</span>
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Full 11-player lobby. 11 rounds. Each player draws once.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('practice')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  gameMode === 'practice'
                    ? 'bg-indigo-600/30 border-purple-400 ring-2 ring-purple-400 shadow-neon-purple'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Practice</span>
                  <Flame className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  2 to 10 players. Fast game start for smaller groups.
                </p>
              </button>
            </div>
          </div>

          {/* Word Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Word Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories (Random Mix)' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty & Timer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
              >
                <option value="all">Any Difficulty</option>
                <option value="easy">Easy (Beginners)</option>
                <option value="medium">Medium (Standard)</option>
                <option value="hard">Hard (Masters)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Round Duration
              </label>
              <select
                value={roundDuration}
                onChange={(e) => setRoundDuration(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
              >
                <option value={60}>60 Seconds</option>
                <option value={75}>75 Seconds (Recommended)</option>
                <option value={90}>90 Seconds</option>
              </select>
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs font-semibold text-white">Private Room</p>
                <p className="text-[10px] text-slate-400">Only players with code/link can join</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* Create Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-gaming font-bold text-sm tracking-wider uppercase hover:opacity-95 transition-all shadow-neon-blue flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
