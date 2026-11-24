import React from 'react';
import { X, Trophy, Palette, Users, ShieldCheck, HelpCircle } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-xl glass-modal border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-wide text-white">
              HOW TO PLAY
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-3.5 py-4 pr-1 text-slate-300 text-sm">
          {/* Rule 1 */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 h-fit">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">11 Players & 11 Rounds</h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
                Standard mode requires 11 players. Each round, one player is chosen as the drawer, and the remaining 10 players guess. Every player draws exactly once!
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex gap-3">
            <div className="p-2 rounded-xl bg-cyan-400/10 text-cyan-400 h-fit">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Real-Time Drawing & Hints</h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
                The drawer receives a secret word. Guessers see word blanks (e.g. <span className="font-mono font-bold text-indigo-400">_ _ _ _ _</span>) and category hints.
              </p>
            </div>
          </div>

          {/* Scoring rules */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4" /> Scoring Rules
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-emerald-500/30 text-center">
                <span className="text-emerald-400 font-bold text-sm block">+1 POINT</span>
                <p className="text-[11px] text-slate-400 mt-0.5">For each player who guesses correctly</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-indigo-500/30 text-center">
                <span className="text-indigo-400 font-bold text-sm block">+1 BONUS</span>
                <p className="text-[11px] text-slate-400 mt-0.5">To Drawer if at least 1 player guesses</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-rose-500/30 text-center">
                <span className="text-rose-400 font-bold text-sm block">-5 PENALTY</span>
                <p className="text-[11px] text-slate-400 mt-0.5">To Drawer if NOBODY guesses the word!</p>
              </div>
            </div>
          </div>

          {/* Practice mode */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex gap-3">
            <div className="p-2 rounded-xl bg-emerald-400/10 text-emerald-400 h-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Practice Mode (2–10 Players)</h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
                Want a casual warmup or have fewer players? Practice mode allows games with 2 to 10 players, rotating every player once through the drawing seat.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="btn-glass-primary px-6 py-2.5 rounded-xl text-xs uppercase tracking-wide cursor-pointer font-semibold text-white"
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
