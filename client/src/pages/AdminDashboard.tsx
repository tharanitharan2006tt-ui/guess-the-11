import React, { useState, useEffect } from 'react';
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
    } catch (err: any) {
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
    <div className="min-h-screen bg-game-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-game-dark p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-indigo-500/20 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-gaming font-extrabold text-white">
              ADMIN COMMAND CENTER
            </h1>
            <p className="text-xs text-slate-400">GUESS THE 11 • Realtime Server Metrics</p>
          </div>
        </div>

        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Game</span>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto">
        {!isAuthenticated ? (
          // Admin Authentication Form
          <div className="max-w-md mx-auto p-6 rounded-3xl glass-card border border-indigo-500/30 shadow-glass text-center">
            <KeyRound className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
            <h2 className="text-lg font-gaming font-bold text-white uppercase mb-1">
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400"
                required
              />

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-gaming font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-neon-purple disabled:opacity-50"
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-cyan-400 text-xs font-semibold transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl glass-card border border-indigo-500/30">
                <div className="flex items-center justify-between text-cyan-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Online Players</span>
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-3xl font-gaming font-black text-white">
                  {stats?.onlinePlayers ?? 0}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-1">Live connected sockets</span>
              </div>

              <div className="p-5 rounded-3xl glass-card border border-indigo-500/30">
                <div className="flex items-center justify-between text-purple-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Rooms</span>
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-3xl font-gaming font-black text-white">
                  {stats?.activeRooms ?? 0}
                </span>
                <span className="text-[10px] text-purple-300 block mt-1">Lobbies & Games</span>
              </div>

              <div className="p-5 rounded-3xl glass-card border border-indigo-500/30">
                <div className="flex items-center justify-between text-amber-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Games In Progress</span>
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-3xl font-gaming font-black text-white">
                  {stats?.activeGames ?? 0}
                </span>
                <span className="text-[10px] text-amber-300 block mt-1">Drawing rounds running</span>
              </div>

              <div className="p-5 rounded-3xl glass-card border border-indigo-500/30">
                <div className="flex items-center justify-between text-emerald-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Waiting Lobbies</span>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="text-3xl font-gaming font-black text-white">
                  {stats?.waitingRooms ?? 0}
                </span>
                <span className="text-[10px] text-cyan-300 block mt-1">Accepting new players</span>
              </div>
            </div>

            {/* Categories & Top Players */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl glass-card border border-indigo-500/30">
                <div className="flex items-center gap-2 mb-4 text-amber-400 font-gaming text-sm font-bold uppercase tracking-wider">
                  <Flame className="w-4 h-4" /> Popular Categories
                </div>
                <div className="space-y-2">
                  {(stats?.popularCategories || ['Animals', 'Food', 'Sports', 'Technology', 'Movies']).map(
                    (cat: string, i: number) => (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                      >
                        <span className="font-semibold text-white">{cat}</span>
                        <span className="text-slate-400 font-mono">Rank #{i + 1}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="p-5 rounded-3xl glass-card border border-indigo-500/30">
                <div className="flex items-center gap-2 mb-4 text-cyan-400 font-gaming text-sm font-bold uppercase tracking-wider">
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
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                      >
                        <span className="font-semibold text-white truncate">{item.username}</span>
                        <span className="font-gaming font-bold text-cyan-400">{item.total_score} pts</span>
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
