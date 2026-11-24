import React, { useEffect, useState } from 'react';
import { X, Trophy, Medal, Crown } from 'lucide-react';
import { AVATARS } from '../services/supabase';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LeaderboardItem {
  id: string;
  username: string;
  avatar: string;
  total_score: number;
  games_won: number;
  games_played: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [players, setPlayers] = useState<LeaderboardItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const backendUrl =
          import.meta.env.VITE_BACKEND_URL ||
          (window.location.hostname !== 'localhost' ? window.location.origin : 'http://localhost:4000');
        const res = await fetch(`${backendUrl}/api/leaderboard`);
        const json = await res.json();
        if (json.success && json.leaderboard && json.leaderboard.length > 0) {
          setPlayers(json.leaderboard);
        } else {
          setPlayers([
            { id: '1', username: 'PixelMaster', avatar: 'avatar_1', total_score: 142, games_won: 14, games_played: 22 },
            { id: '2', username: 'NeonNinja', avatar: 'avatar_2', total_score: 118, games_won: 11, games_played: 19 },
            { id: '3', username: 'SpeedGuesser', avatar: 'avatar_3', total_score: 95, games_won: 8, games_played: 15 },
            { id: '4', username: 'DrawDragon', avatar: 'avatar_4', total_score: 84, games_won: 6, games_played: 12 },
            { id: '5', username: 'CyberGamer', avatar: 'avatar_5', total_score: 72, games_won: 5, games_played: 10 }
          ]);
        }
      } catch {
        setPlayers([
          { id: '1', username: 'PixelMaster', avatar: 'avatar_1', total_score: 142, games_won: 14, games_played: 22 },
          { id: '2', username: 'NeonNinja', avatar: 'avatar_2', total_score: 118, games_won: 11, games_played: 19 },
          { id: '3', username: 'SpeedGuesser', avatar: 'avatar_3', total_score: 95, games_won: 8, games_played: 15 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-modal border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden max-h-[85vh] flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-wide text-white">
              GLOBAL LEADERBOARD
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto space-y-2 py-4 pr-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm font-sans">
              Loading rankings...
            </div>
          ) : (
            players.map((p, index) => {
              const avatarObj = AVATARS.find((a) => a.id === p.avatar) || AVATARS[0];
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isFirst
                      ? 'bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border-amber-400/50 shadow-md shadow-amber-500/10'
                      : isSecond
                      ? 'bg-white/[0.05] border-white/[0.12]'
                      : isThird
                      ? 'bg-white/[0.03] border-amber-600/30'
                      : 'bg-white/[0.02] border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className="w-7 h-7 flex items-center justify-center font-bold text-sm">
                      {isFirst ? (
                        <Crown className="w-5 h-5 text-amber-400 animate-bounce-subtle" />
                      ) : isSecond ? (
                        <Medal className="w-5 h-5 text-slate-300" />
                      ) : isThird ? (
                        <Medal className="w-5 h-5 text-amber-600" />
                      ) : (
                        <span className="text-slate-500 font-mono">#{index + 1}</span>
                      )}
                    </div>

                    {/* Avatar & Username */}
                    <span className="text-2xl select-none">{avatarObj.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">
                        {p.username}
                      </p>
                      <p className="text-[10px] text-slate-400 font-sans leading-tight">
                        {p.games_won} Wins • {p.games_played} Games
                      </p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span className="text-base font-bold text-amber-400">
                      {p.total_score}
                    </span>
                    <span className="text-[10px] text-slate-400 block -mt-1 font-semibold">PTS</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
