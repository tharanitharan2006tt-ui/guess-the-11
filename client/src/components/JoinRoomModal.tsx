import React, { useState } from 'react';
import { X, LogIn, KeyRound, Lock } from 'lucide-react';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roomCode: string, password?: string) => void;
  initialCode?: string;
  initialPassword?: string;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  initialCode = '',
  initialPassword = ''
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [password, setPassword] = useState<string>(initialPassword);
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

    onJoin(cleaned, password.trim() ? password.trim() : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-md glass-modal border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <LogIn className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-wide text-white">
              JOIN ROOM
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
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
                className="w-full glass-input border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-center tracking-widest text-xl font-black uppercase focus:outline-none focus:border-indigo-400"
                autoFocus
                required
              />
              <KeyRound className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
              Room Password / PIN (If private)
            </label>
            <div className="relative">
              <input
                type="text"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Leave blank if public room"
                maxLength={30}
                className="w-full glass-input border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-center text-sm focus:outline-none focus:border-indigo-400"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 text-rose-300 text-xs font-semibold border border-rose-500/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-glass-primary w-full py-3.5 rounded-2xl text-white flex items-center justify-center gap-2 text-sm uppercase tracking-wide cursor-pointer font-semibold"
          >
            <LogIn className="w-4 h-4" />
            Enter Room
          </button>
        </form>
      </div>
    </div>
  );
};
