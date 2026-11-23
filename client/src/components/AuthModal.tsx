import React, { useState } from 'react';
import { X, User, Mail, Lock } from 'lucide-react';
import { AuthService, UserProfile, AVATARS } from '../services/supabase';

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
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-game tracking-wide text-white">
              {tab === 'profile'
                ? 'PLAYER PROFILE'
                : tab === 'login'
                ? 'LOGIN'
                : tab === 'register'
                ? 'CREATE ACCOUNT'
                : 'RESET PASSWORD'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl my-4 border border-slate-800 text-xs font-game font-semibold">
          <button
            onClick={() => {
              setTab('profile');
              setMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              tab === 'profile'
                ? 'bg-amber-400 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => {
              setTab('login');
              setMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-amber-400 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setTab('register');
              setMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-amber-400 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
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
              <label className="block text-xs font-game font-semibold text-slate-300 mb-1.5 uppercase">
                Gamer Nickname
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={18}
                  className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 font-sans"
                  required
                />
                <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-game font-semibold text-slate-300 mb-2 uppercase">
                Choose Avatar
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                {AVATARS.map((av) => (
                  <button
                    type="button"
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedAvatar === av.id
                        ? 'bg-amber-400/15 border-amber-400 shadow-md scale-105'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl mb-1 select-none">{av.icon}</span>
                    <span className="text-[10px] font-sans text-slate-300 truncate w-full text-center">
                      {av.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl btn-3d-amber text-sm uppercase tracking-wide cursor-pointer"
            >
              Save Profile
            </button>
          </form>
        )}

        {/* TAB 2: LOGIN */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-game font-semibold text-slate-300 mb-1.5 uppercase">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 font-sans"
                  required
                />
                <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-game font-semibold text-slate-300 uppercase">Password</label>
                <button
                  type="button"
                  onClick={() => setTab('reset')}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 font-sans"
                  required
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl btn-3d-indigo text-sm uppercase tracking-wide cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* TAB 3: REGISTER */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-game font-semibold text-slate-300 mb-1.5 uppercase">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-game font-semibold text-slate-300 mb-1.5 uppercase">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-game font-semibold text-slate-300 mb-1.5 uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 font-sans"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl btn-3d-mint text-sm uppercase tracking-wide cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Register'}
            </button>
          </form>
        )}

        {/* TAB 4: RESET PASSWORD */}
        {tab === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-game font-semibold text-slate-300 mb-1.5 uppercase">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 font-sans"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl btn-3d-amber text-sm uppercase tracking-wide cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
