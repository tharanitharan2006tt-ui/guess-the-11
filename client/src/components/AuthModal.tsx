import React, { useState } from 'react';
import { X, User, Mail, Lock, Sparkles, Check, ArrowRight } from 'lucide-react';
import { AuthService, UserProfile, AVATARS, isSupabaseConfigured } from '../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onProfileUpdated: (p: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdated
}) => {
  const [tab, setTab] = useState<'profile' | 'login' | 'register' | 'reset'>('profile');
  const [username, setUsername] = useState(currentProfile.username);
  const [selectedAvatar, setSelectedAvatar] = useState(currentProfile.avatar);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setMessage({ type: 'error', text: 'Username cannot be empty' });
      return;
    }
    const updated = AuthService.updateProfile({
      username: username.trim(),
      avatar: selectedAvatar
    });
    onProfileUpdated(updated);
    setMessage({ type: 'success', text: 'Profile updated successfully!' });
    setTimeout(() => {
      onClose();
      setMessage(null);
    }, 1000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await AuthService.login(email, password);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        const p = AuthService.getCurrentProfile();
        onProfileUpdated(p);
        setMessage({ type: 'success', text: 'Welcome back!' });
        setTimeout(() => {
          onClose();
          setMessage(null);
        }, 1000);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setMessage({ type: 'error', text: 'Please enter a username' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await AuthService.register(email, password, username.trim(), selectedAvatar);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        const p = AuthService.getCurrentProfile();
        onProfileUpdated(p);
        setMessage({ type: 'success', text: 'Account registered successfully!' });
        setTimeout(() => {
          onClose();
          setMessage(null);
        }, 1000);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await AuthService.resetPassword(email);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Password reset link sent to your email!' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Reset failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-gaming tracking-wide text-white">
              {tab === 'profile' ? 'PLAYER PROFILE' : tab === 'login' ? 'LOGIN' : tab === 'register' ? 'CREATE ACCOUNT' : 'RESET PASSWORD'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl my-4 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => { setTab('profile'); setMessage(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              tab === 'profile' ? 'bg-indigo-600 text-white shadow-neon-purple' : 'text-slate-400 hover:text-white'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => { setTab('login'); setMessage(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              tab === 'login' ? 'bg-indigo-600 text-white shadow-neon-purple' : 'text-slate-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setTab('register'); setMessage(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              tab === 'register' ? 'bg-indigo-600 text-white shadow-neon-purple' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Feedback message */}
        {message && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold mb-3 ${
              message.type === 'error'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* TAB 1: PROFILE / GUEST CUSTOMIZATION */}
        {tab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Gamer Nickname
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={18}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                  required
                />
                <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Choose Avatar
              </label>
              <div className="grid grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
                {AVATARS.map((av) => (
                  <button
                    type="button"
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${
                      selectedAvatar === av.id
                        ? 'bg-indigo-600/30 border-cyan-400 ring-2 ring-cyan-400 shadow-neon-blue'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl mb-1">{av.icon}</span>
                    <span className="text-[9px] text-slate-300 truncate w-full text-center">
                      {av.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs tracking-wider uppercase hover:from-cyan-400 hover:to-blue-500 transition-all shadow-neon-blue"
            >
              Save Profile
            </button>
          </form>
        )}

        {/* TAB 2: LOGIN */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                  required
                />
                <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-400">Password</label>
                <button
                  type="button"
                  onClick={() => setTab('reset')}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                  required
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-xs tracking-wider uppercase hover:from-purple-400 hover:to-indigo-500 transition-all shadow-neon-purple disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* TAB 3: REGISTER */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-xs tracking-wider uppercase hover:from-emerald-400 hover:to-teal-500 transition-all shadow-neon-blue disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Register'}
            </button>
          </form>
        )}

        {/* TAB 4: RESET PASSWORD */}
        {tab === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs tracking-wider uppercase hover:from-cyan-400 hover:to-blue-500 transition-all shadow-neon-blue disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
