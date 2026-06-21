import { supabaseAdmin } from './supabase-admin';
import type { User } from '@supabase/supabase-js';

/**
 * Validates the Bearer access token (Supabase JWT) on an incoming request and
 * returns the authenticated user, or null if no valid token is present.
 *
 * Use this in any mutating route handler to verify the caller's identity.
 * Never trust an id/user_id/creator_id from the request body or query for
 * identity — always use the returned user's id.
 */
export async function getAuthedUser(request: Request): Promise<User | null> {
  const h = request.headers.get('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user; // data.user.id is the authenticated user id
}
