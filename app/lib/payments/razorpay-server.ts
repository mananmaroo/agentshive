/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 18: /bin/ps: Operation not permitted
import Razorpay from 'razorpay';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { sameOrigin } from './razorpay-core.mjs';

export function requirePaymentEnvironment() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!url || !anon || !service || !keyId || !keySecret) throw new Error('Payment preview is not configured.');
  return { url, anon, service, keyId, keySecret };
}

export async function requirePaymentUser(request: NextRequest) {
  if (!sameOrigin(request.url, request.headers.get('origin')) || request.headers.get('x-agentshive-csrf') !== '1') {
    throw Object.assign(new Error('Request origin was rejected.'), { status: 403 });
  }
  const env = requirePaymentEnvironment();
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) throw Object.assign(new Error('Business login required.'), { status: 401 });
  const authClient = createClient(env.url, env.anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) throw Object.assign(new Error('Business login required.'), { status: 401 });
  const admin = createClient(env.url, env.service, { auth: { persistSession: false, autoRefreshToken: false } });
  return { user: data.user as User, admin, env };
}

export function razorpayClient() {
  const env = requirePaymentEnvironment();
  return new Razorpay({ key_id: env.keyId, key_secret: env.keySecret });
}

export async function requireProposal(admin: SupabaseClient, user: User, proposalId: string) {
  const { data: proposal, error } = await admin.from('business_payment_proposals')
    .select('id,organization_id,price_book_id,billing_country,status,expires_at,customer_email')
    .eq('id', proposalId).single();
  if (error || !proposal) throw Object.assign(new Error('Approved proposal was not found.'), { status: 404 });
  const { data: membership } = await admin.from('business_organization_members')
    .select('organization_id').eq('organization_id', proposal.organization_id).eq('user_id', user.id).maybeSingle();
  if (!membership) throw Object.assign(new Error('Proposal access denied.'), { status: 403 });
  const { data: organization } = await admin.from('business_organizations')
    .select('id,name,billing_country,payment_status,pilot_access_status').eq('id', proposal.organization_id).single();
  if (!organization || proposal.status !== 'approved' || new Date(proposal.expires_at).getTime() <= Date.now()) {
    throw Object.assign(new Error('This proposal is not payable.'), { status: 409 });
  }
  if (String(organization.billing_country).toUpperCase() !== String(proposal.billing_country).toUpperCase()) {
    throw Object.assign(new Error('Proposal billing country does not match the verified business country.'), { status: 409 });
  }
  if (proposal.customer_email && proposal.customer_email.toLowerCase() !== (user.email || '').toLowerCase()) {
    throw Object.assign(new Error('Proposal customer does not match the signed-in account.'), { status: 403 });
  }
  return { proposal, organization };
}

export function routeError(error: unknown) {
  const status = typeof error === 'object' && error && 'status' in error ? Number((error as { status: unknown }).status) : 500;
  const message = error instanceof Error && status < 500 ? error.message : 'Payment request could not be completed.';
  return Response.json({ error: message }, { status: Number.isInteger(status) ? status : 500, headers: { 'cache-control': 'no-store' } });
}
