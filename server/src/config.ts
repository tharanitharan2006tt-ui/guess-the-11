import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  CLIENT_URL: process.env.CLIENT_URL || '*',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://mock-supabase.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  ADMIN_SECRET: process.env.ADMIN_SECRET || 'guessthe11_admin_secret_2026',
  NODE_ENV: process.env.NODE_ENV || 'development',
  ROUND_TIME_SECONDS: process.env.ROUND_TIME_SECONDS ? parseInt(process.env.ROUND_TIME_SECONDS, 10) : 75,
  INTERMISSION_SECONDS: 6,
  RECONNECT_GRACE_PERIOD_MS: 45000,
};
