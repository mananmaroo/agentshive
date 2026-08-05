import { NextRequest } from 'next/server';
import { allowSimulator, DISCLOSURE, forbidden, formBody, MAX_CALL_SECONDS, serviceSupabase, twiml, validTwilioSignature, voiceGloballyEnabled, xml } from '@/app/lib/voice/twilio';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const params = await formBody(request);
  if (!allowSimulator(request) && !validTwilioSignature(request, params)) return forbidden();
  if (!voiceGloballyEnabled() && !allowSimulator(request)) return twiml('<Say>Voice service is not active. Please contact admissions directly.</Say><Hangup/>');

  const to = params.To || '';
  const callSid = params.CallSid || '';
  const from = params.From || '';
  const supabase = serviceSupabase();
  const { data: rows, error } = await supabase.rpc('business_resolve_inbound_voice', { p_provider_number: to, p_call_sid: callSid, p_from_number: from });
  if (error || !rows?.length) return twiml('<Say>This admissions line is not configured. Please contact the university directly.</Say><Hangup/>');

  const organization = rows[0];
  if (!organization.allowed) return twiml('<Say>This admissions line has reached its daily limit. Please contact the university during business hours.</Say><Hangup/>');

  const action = `${process.env.VOICE_WEBHOOK_BASE_URL?.replace(/\/$/, '') || request.nextUrl.origin}/api/voice/twilio/turn?session=${encodeURIComponent(organization.session_id)}`;
  return twiml(
    `<Say>${xml(organization.disclosure || DISCLOSURE)}</Say>` +
    `<Gather input="speech dtmf" action="${xml(action)}" method="POST" speechTimeout="auto" timeout="5" actionOnEmptyResult="true">` +
    '<Say>How can I help with admissions today?</Say></Gather>' +
    `<Redirect method="POST">${xml(action)}</Redirect>`
  );
}
