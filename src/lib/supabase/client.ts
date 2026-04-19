import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getCookieName(name: string) {
  const projectRef = 'fprtklhpngvtpuozypdj';
  return `sb-${projectRef}-${name}`;
}

function cookieStorage() {
  if (typeof window === 'undefined') {
    return {
      getItem: async (_key: string) => null,
      setItem: async (_key: string, _value: string) => {},
      removeItem: async (_key: string) => {},
    };
  }
  
  return {
    getItem: async (key: string) => {
      const cookieName = getCookieName(key);
      const docCookies = document.cookie.split('; ');
      for (const cookie of docCookies) {
        const [name, value] = cookie.split('=');
        if (name === cookieName) {
          return decodeURIComponent(value);
        }
      }
      return null;
    },
    setItem: async (key: string, value: string) => {
      const cookieName = getCookieName(key);
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      document.cookie = `${cookieName}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    },
    removeItem: async (key: string) => {
      const cookieName = getCookieName(key);
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    },
  };
}

export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: cookieStorage(),
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type SupabaseClient = typeof supabase;
