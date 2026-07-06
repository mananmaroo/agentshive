import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Passthrough lock: supabase-js defaults to the browser's navigator.locks API
// to serialize token refreshes across tabs. That lock can deadlock (a stuck
// refresh makes every subsequent call — getSession, inserts, signOut — hang
// forever). We don't need cross-tab locking here, so run the callback directly.
const passthroughLock = async <R>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>
): Promise<R> => fn();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
    lock: passthroughLock,
  },
});
