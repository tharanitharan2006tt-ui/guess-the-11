import React from 'react';
import { X, Sparkles, AlertTriangle, ShieldCheck, Trophy, Palette, Users } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow corner */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-neon-purple">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-gaming tracking-wide text-white">
              HOW TO PLAY
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-4 py-4 pr-1 text-slate-300 text-sm">
          {/* Rule 1 */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex gap-3">
            <Users className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white">11 Players & 11 Rounds</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Standard mode requires 11 players. Each round, one player is chosen as the drawer, and the remaining 10 players guess. Every player draws exactly once!
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex gap-3">
            <Palette className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white">Real-Time Drawing & Hints</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                The drawer receives a secret word. Guessers see word blanks (e.g. <span className="font-mono text-cyan-400">_ _ _ _ _</span>) and category hints.
              </p>
            </div>
          </div>

          {/* Scoring rules */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/30 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-gaming text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4" /> Scoring Rules
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-center">
                <span className="text-emerald-400 font-extrabold text-base">+1 POINT</span>
                <p className="text-[11px] text-slate-400 mt-0.5">For each player who guesses correctly</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-center">
                <span className="text-cyan-400 font-extrabold text-base">+1 BONUS</span>
                <p className="text-[11px] text-slate-400 mt-0.5">To Drawer if at least 1 player guesses</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-rose-500/40 text-center">
                <span className="text-rose-400 font-extrabold text-base">-5 PENALTY</span>
                <p className="text-[11px] text-slate-400 mt-0.5">To Drawer if NOBODY guesses the word!</p>
              </div>
            </div>
          </div>

          {/* Practice mode */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white">Practice Mode (2–10 Players)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Don't have 11 friends online right now? Practice mode allows games with 2 to 10 players, rotating every player once through the drawing seat.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs tracking-wider uppercase hover:from-cyan-400 hover:to-blue-500 transition-all shadow-neon-blue"
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
