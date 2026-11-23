import React, { useState } from 'react';
import { X, LogIn, KeyRound } from 'lucide-react';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roomCode: string) => void;
  initialCode?: string;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  initialCode = ''
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let cleaned = code.trim().toUpperCase();

    // Check if user pasted a full URL (e.g., https://site.com/join?room=ABC123)
    if (cleaned.includes('ROOM=')) {
      const match = cleaned.match(/ROOM=([A-Z0-9]{4,8})/);
      if (match) cleaned = match[1];
    } else if (cleaned.includes('/ROOM/')) {
      const parts = cleaned.split('/ROOM/');
      if (parts[1]) cleaned = parts[1].slice(0, 6);
    }

    if (cleaned.length < 4 || cleaned.length > 8) {
      setError('Please enter a valid 6-character room code');
      return;
    }

    onJoin(cleaned);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col">
        {/* Glow */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-neon-purple">
              <LogIn className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-gaming tracking-wide text-white">
              JOIN ROOM
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Enter 6-Character Room Code or Paste Link
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="e.g. AB12CD"
                maxLength={40}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-center tracking-widest text-lg font-bold uppercase focus:outline-none focus:border-cyan-400"
                autoFocus
                required
              />
              <KeyRound className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 text-white font-gaming font-bold text-sm tracking-wider uppercase hover:opacity-95 transition-all shadow-neon-purple flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Enter Lobby
          </button>
        </form>
      </div>
    </div>
  );
};
