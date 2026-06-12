import { createClient } from '@supabase/supabase-js';

// Server-only client. Uses the service role key when available (API routes on
// Vercel) and falls back to the anon key so local builds never crash.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);
