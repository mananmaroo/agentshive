import { createHmac, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

export const MAX_CALL_SECONDS = Math.min(Number(process.env.VOICE_MAX_CALL_SECONDS || 300), 300);
export const UNKNOWN_REPLY = "I don't know from the university's approved information. I'll ask an admissions counsellor to follow up instead of guessing.";
export const DISCLOSURE = process.env.VOICE_AI_DISCLOSURE || 'Hello. You are speaking with Aarya, an AI admissions assistant. This call is not recorded. You can ask for a human counsellor at any time.';

export type VoiceOrganization = {
  organization_id: string;
  organization_name: string;
  widget_key: string;
  transfer_phone_e164: string | null;
  daily_call_limit: number;
  voice_enabled: boolean;
};

export function serviceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Voice database configuration is incomplete.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function formBody(request: NextRequest) {
  const text = await request.text();
  return Object.fromEntries(new URLSearchParams(text));
}

export function publicWebhookUrl(request: NextRequest) {
  const base = process.env.VOICE_WEBHOOK_BASE_URL?.replace(/\/$/, '');
  return base ? `${base}${request.nextUrl.pathname}${request.nextUrl.search}` : request.url;
}

export function validTwilioSignature(request: NextRequest, params: Record<string, string>) {
  const token = process.env.TWILIO_AUTH_TOKEN;
  const provided = request.headers.get('x-twilio-signature');
  if (!token || !provided) return false;
  const payload = publicWebhookUrl(request) + Object.keys(params).sort().map((key) => key + params[key]).join('');
  const expected = createHmac('sha1', token).update(payload).digest('base64');
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function allowSimulator(request: NextRequest) {
  return process.env.VOICE_SIMULATOR_ENABLED === 'true' && request.headers.get('x-agentshive-voice-simulator') === process.env.VOICE_SIMULATOR_SECRET;
}

export function xml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] || character);
}

export function twiml(body: string) {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, {
    status: 200,
    headers: { 'content-type': 'text/xml; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export function forbidden() {
  return new Response('Invalid Twilio signature.', { status: 403 });
}

export function voiceGloballyEnabled() {
  return process.env.VOICE_GLOBAL_ENABLED === 'true' && process.env.VOICE_OUTBOUND_ENABLED !== 'true';
}

export function e164(value: string | undefined) {
  const normalized = (value || '').replace(/[\s()-]/g, '');
  return /^\+[1-9]\d{7,14}$/.test(normalized) ? normalized : null;
}
