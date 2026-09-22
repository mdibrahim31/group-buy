/**
 * Supabase Client Configuration
 * 
 * GitHub অথবা প্রজেক্টের রুট ডিরেক্টরিতে `.env` ফাইলে নিচের ভেরিয়েবল দুটি বসিয়ে দিন:
 * VITE_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
 * VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
 */

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('https://'));
};
