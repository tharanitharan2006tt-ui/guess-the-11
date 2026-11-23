import React from 'react';
import { X, Trophy, Palette, Users, ShieldCheck, HelpCircle } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950 shadow-sm">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-game tracking-wide text-white">
              HOW TO PLAY
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-3.5 py-4 pr-1 text-slate-300 text-sm">
          {/* Rule 1 */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex gap-3">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 h-fit">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-game font-bold text-white text-sm">11 Players & 11 Rounds</h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
                Standard mode requires 11 players. Each round, one player is chosen as the drawer, and the remaining 10 players guess. Every player draws exactly once!
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex gap-3">
            <div className="p-2 rounded-xl bg-sky-400/10 text-sky-400 h-fit">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-game font-bold text-white text-sm">Real-Time Drawing & Hints</h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
                The drawer receives a secret word. Guessers see word blanks (e.g. <span className="font-mono font-bold text-amber-400">_ _ _ _ _</span>) and category hints.
              </p>
            </div>
          </div>

          {/* Scoring rules */}
          <div className="p-4 rounded-2xl bg-slate-800/90 border-2 border-slate-700 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-game text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4" /> Scoring Rules
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-center">
                <span className="text-emerald-400 font-game font-bold text-sm block">+1 POINT</span>
                <p className="text-[11px] text-slate-400 mt-0.5">For each player who guesses correctly</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 text-center">
                <span className="text-amber-400 font-game font-bold text-sm block">+1 BONUS</span>
                <p className="text-[11px] text-slate-400 mt-0.5">To Drawer if at least 1 player guesses</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-rose-500/40 text-center">
                <span className="text-rose-400 font-game font-bold text-sm block">-5 PENALTY</span>
                <p className="text-[11px] text-slate-400 mt-0.5">To Drawer if NOBODY guesses the word!</p>
              </div>
            </div>
          </div>

          {/* Practice mode */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex gap-3">
            <div className="p-2 rounded-xl bg-emerald-400/10 text-emerald-400 h-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-game font-bold text-white text-sm">Practice Mode (2–10 Players)</h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
                Want a casual warmup or have fewer players? Practice mode allows games with 2 to 10 players, rotating every player once through the drawing seat.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="btn-3d-amber px-6 py-2.5 rounded-xl text-xs uppercase tracking-wide cursor-pointer"
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
