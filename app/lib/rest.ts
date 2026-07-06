import { supabase } from './supabase-client';

// Direct PostgREST access that bypasses the supabase-js query builder, which
// has been hanging on its internal token handling. Raw REST responds in <1s.
// Every call attaches the signed-in user's access token so RLS still applies.

const REST_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Your session expired. Please log out and back in.');
  return {
    apikey: ANON_KEY,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function parse(res: Response) {
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try { msg = JSON.parse(text).message || text; } catch {}
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return text ? JSON.parse(text) : null;
}

// Insert one or more rows. Returns the created rows when returnRows is true.
export async function restInsert<T = unknown>(
  table: string,
  body: unknown,
  returnRows = false
): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${REST_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: returnRows ? { ...headers, Prefer: 'return=representation' } : headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  return parse(res) as Promise<T>;
}

// Update rows matched by the PostgREST filter query string, e.g.
//   restUpdate('agents', 'id=eq.' + id, { title })
export async function restUpdate<T = unknown>(
  table: string,
  filter: string,
  body: unknown,
  returnRows = false
): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${REST_URL}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: returnRows ? { ...headers, Prefer: 'return=representation' } : headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  return parse(res) as Promise<T>;
}

// Delete rows matched by the PostgREST filter query string.
export async function restDelete(table: string, filter: string): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${REST_URL}/rest/v1/${table}?${filter}`, {
    method: 'DELETE',
    headers,
    signal: AbortSignal.timeout(20000),
  });
  await parse(res);
}
