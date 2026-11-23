import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// Safe environment variable retrieval
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-supabase.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

export const isSupabaseConfigured =
  supabaseUrl !== 'https://mock-supabase.supabase.co' &&
  supabaseAnonKey !== 'mock-anon-key' &&
  Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  email?: string;
  isGuest: boolean;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
}

export const AVATARS = [
  { id: 'avatar_1', label: 'Cyber Ninja', icon: '🥷', color: '#8B5CF6' },
  { id: 'avatar_2', label: 'Neon Robot', icon: '🤖', color: '#06B6D4' },
  { id: 'avatar_3', label: 'Cosmic Wizard', icon: '🧙‍♂️', color: '#EC4899' },
  { id: 'avatar_4', label: 'Dragon Slayer', icon: '🐲', color: '#10B981' },
  { id: 'avatar_5', label: 'Space Pilot', icon: '🚀', color: '#F59E0B' },
  { id: 'avatar_6', label: 'Pixel Knight', icon: '🛡️', color: '#3B82F6' },
  { id: 'avatar_7', label: 'Cyber Fox', icon: '🦊', color: '#F97316' },
  { id: 'avatar_8', label: 'Ghost Runner', icon: '👻', color: '#A855F7' },
  { id: 'avatar_9', label: 'Electric Tiger', icon: '🐯', color: '#EAB308' },
  { id: 'avatar_10', label: 'Mecha Samurai', icon: '⚔️', color: '#EF4444' },
  { id: 'avatar_11', label: 'Crown Champion', icon: '👑', color: '#FDE047' }
];

export class AuthService {
  private static STORAGE_KEY = 'g11_user_profile';
  private static memoryStorage: Record<string, string> = {};

  private static getItem(key: string): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return this.memoryStorage[key] || null;
  }

  private static setItem(key: string, val: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val);
    } else {
      this.memoryStorage[key] = val;
    }
  }

  private static removeItem(key: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    } else {
      delete this.memoryStorage[key];
    }
  }

  // Get current active profile (Guest or Auth)
  static getCurrentProfile(): UserProfile {
    const stored = this.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored profile:', e);
      }
    }

    // Default guest profile
    const defaultProfile: UserProfile = {
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      username: 'Player_' + Math.floor(1000 + Math.random() * 9000),
      avatar: 'avatar_1',
      isGuest: true,
      totalScore: 0,
      gamesPlayed: 0,
      gamesWon: 0
    };
    this.saveProfile(defaultProfile);
    return defaultProfile;
  }

  static saveProfile(profile: UserProfile): void {
    this.setItem(this.STORAGE_KEY, JSON.stringify(profile));
  }

  static updateProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getCurrentProfile();
    const updated = { ...current, ...updates };
    this.saveProfile(updated);
    return updated;
  }

  // Register with Supabase Email/Password
  static async register(email: string, password: string, username: string, avatar: string) {
    if (!isSupabaseConfigured) {
      // Local simulated registration
      const newProfile: UserProfile = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        username,
        avatar,
        email,
        isGuest: false,
        totalScore: 0,
        gamesPlayed: 0,
        gamesWon: 0
      };
      this.saveProfile(newProfile);
      return { data: { user: { id: newProfile.id, email } }, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, avatar }
      }
    });

    if (data.user && !error) {
      const profile: UserProfile = {
        id: data.user.id,
        username,
        avatar,
        email,
        isGuest: false,
        totalScore: 0,
        gamesPlayed: 0,
        gamesWon: 0
      };
      this.saveProfile(profile);
    }

    return { data, error };
  }

  // Login with Supabase Email/Password
  static async login(email: string, password: string) {
    if (!isSupabaseConfigured) {
      // Local fallback login
      const profile: UserProfile = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        username: email.split('@')[0],
        avatar: 'avatar_1',
        email,
        isGuest: false,
        totalScore: 0,
        gamesPlayed: 0,
        gamesWon: 0
      };
      this.saveProfile(profile);
      return { data: { user: { id: profile.id, email } }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (data.user && !error) {
      // Fetch user profile from DB
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const profile: UserProfile = {
        id: data.user.id,
        username: dbProfile?.username || data.user.user_metadata?.username || email.split('@')[0],
        avatar: dbProfile?.avatar || data.user.user_metadata?.avatar || 'avatar_1',
        email,
        isGuest: false,
        totalScore: dbProfile?.total_score || 0,
        gamesPlayed: dbProfile?.games_played || 0,
        gamesWon: dbProfile?.games_won || 0
      };
      this.saveProfile(profile);
    }

    return { data, error };
  }

  // Password reset
  static async resetPassword(email: string) {
    if (!isSupabaseConfigured) {
      return { data: {}, error: null };
    }
    return await supabase.auth.resetPasswordForEmail(email);
  }

  // Logout
  static async logout() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => {});
    }
    this.removeItem(this.STORAGE_KEY);
  }
}
