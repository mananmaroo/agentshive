import { NextRequest } from 'next/server';
import { createClient, User } from '@supabase/supabase-js';

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export function createBusinessAdminClient() {
  return createClient(required('NEXT_PUBLIC_SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function requirePlatformAdmin(request: NextRequest): Promise<User> {
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) throw new Error('UNAUTHORIZED');

  const admin = createBusinessAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new Error('UNAUTHORIZED');

  const appMetadata = data.user.app_metadata || {};
  const allowedByMetadata = appMetadata.platform_role === 'admin' || appMetadata.is_platform_admin === true;
  const allowedEmails = (process.env.AGENTSHIVE_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const allowedByServer = Boolean(data.user.email && allowedEmails.includes(data.user.email.toLowerCase()));

  if (!allowedByMetadata && !allowedByServer) throw new Error('FORBIDDEN');
  return data.user;
}
