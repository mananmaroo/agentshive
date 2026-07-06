// Re-export the single shared browser client so the whole app uses ONE
// Supabase instance. Two separate createClient() instances have independent
// in-memory auth event buses, so onAuthStateChange in AuthProvider never heard
// the SIGNED_IN fired by the callback's exchangeCodeForSession — leaving the UI
// stuck as "not signed in" until a full reload.
export { supabase as supabaseAnon } from './supabase-client';
