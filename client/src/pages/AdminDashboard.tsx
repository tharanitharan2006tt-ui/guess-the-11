import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Activity,
  Layers,
  Flame,
  CheckCircle,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  Trophy
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [secretKey, setSecretKey] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL ||
        (window.location.hostname !== 'localhost' ? window.location.origin : 'http://localhost:4000');

      const res = await fetch(`${backendUrl}/api/admin/stats?secret=${encodeURIComponent(key)}`, {
        headers: {
          Authorization: `Bearer ${key}`
        }
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setStats(json.data);
        setIsAuthenticated(true);
      } else {
        setError(json.error || 'Invalid Admin Secret Key');
      }
    } catch {
      setError('Could not connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) return;
    fetchStats(secretKey.trim());
  };

  return (
    <div className="min-h-screen bg-[#0C101D] text-slate-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-slate-800 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-game font-bold text-white">
              ADMIN COMMAND CENTER
            </h1>
            <p className="text-xs text-slate-400">GUESS THE 11 • Realtime Server Metrics</p>
          </div>
        </div>

        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Game</span>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto">
        {!isAuthenticated ? (
          // Admin Authentication Form
          <div className="max-w-md mx-auto p-6 rounded-3xl glass-modal border border-white/10 shadow-2xl text-center">
            <KeyRound className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-white uppercase mb-1">
              Admin Access Required
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Enter the backend administrative key to inspect multiplayer server vitals.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter Admin Secret..."
                className="w-full glass-input border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-400 font-sans"
                required
              />

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/15 text-rose-300 text-xs font-semibold border border-rose-500/30">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-glass-primary w-full py-3.5 rounded-2xl text-xs uppercase tracking-wider cursor-pointer font-semibold text-white disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Unlock Dashboard'}
              </button>
            </form>
          </div>
        ) : (
          // Authenticated Admin Dashboard
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-slate-400">
                Server Synchronized: {stats?.serverTime ? new Date(stats.serverTime).toLocaleTimeString() : 'Live'}
              </span>
              <button
                onClick={() => fetchStats(secretKey)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900 border-2 border-slate-800">
                <div className="flex items-center justify-between text-amber-400 mb-2">
                  <span className="text-xs font-game font-semibold uppercase tracking-wider text-slate-400">Online Players</span>
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-3xl font-game font-bold text-white">
                  {stats?.onlinePlayers ?? 0}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-1">Live connected sockets</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border-2 border-slate-800">
                <div className="flex items-center justify-between text-sky-400 mb-2">
                  <span className="text-xs font-game font-semibold uppercase tracking-wider text-slate-400">Active Rooms</span>
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-3xl font-game font-bold text-white">
                  {stats?.activeRooms ?? 0}
                </span>
                <span className="text-[10px] text-sky-300 block mt-1">Lobbies & Games</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border-2 border-slate-800">
                <div className="flex items-center justify-between text-amber-400 mb-2">
                  <span className="text-xs font-game font-semibold uppercase tracking-wider text-slate-400">Games Running</span>
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-3xl font-game font-bold text-white">
                  {stats?.activeGames ?? 0}
                </span>
                <span className="text-[10px] text-amber-300 block mt-1">Drawing rounds active</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border-2 border-slate-800">
                <div className="flex items-center justify-between text-emerald-400 mb-2">
                  <span className="text-xs font-game font-semibold uppercase tracking-wider text-slate-400">Waiting Lobbies</span>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="text-3xl font-game font-bold text-white">
                  {stats?.waitingRooms ?? 0}
                </span>
                <span className="text-[10px] text-emerald-300 block mt-1">Accepting new players</span>
              </div>
            </div>

            {/* Categories & Top Players */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900 border-2 border-slate-800">
                <div className="flex items-center gap-2 mb-4 text-amber-400 font-game text-sm font-bold uppercase tracking-wider">
                  <Flame className="w-4 h-4" /> Popular Categories
                </div>
                <div className="space-y-2">
                  {(stats?.popularCategories || ['Animals', 'Food', 'Sports', 'Technology', 'Movies']).map(
                    (cat: string, i: number) => (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                      >
                        <span className="font-semibold text-white">{cat}</span>
                        <span className="text-slate-400 font-mono">Rank #{i + 1}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border-2 border-slate-800">
                <div className="flex items-center gap-2 mb-4 text-sky-400 font-game text-sm font-bold uppercase tracking-wider">
                  <Trophy className="w-4 h-4" /> Top Leaderboard
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {(stats?.topLeaderboard || []).length === 0 ? (
                    <div className="text-xs text-slate-500 italic py-4 text-center">
                      No persistent database records yet. Realtime records active.
                    </div>
                  ) : (
                    stats.topLeaderboard.map((item: any, idx: number) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                      >
                        <span className="font-semibold text-white truncate">{item.username}</span>
                        <span className="font-game font-bold text-amber-400">{item.total_score} pts</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
