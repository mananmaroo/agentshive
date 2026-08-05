import { NextRequest } from 'next/server';
import { allowSimulator, forbidden, formBody, serviceSupabase, validTwilioSignature } from '@/app/lib/voice/twilio';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const params = await formBody(request);
  if (!allowSimulator(request) && !validTwilioSignature(request, params)) return forbidden();
  const duration = Math.max(0, Math.min(Number(params.CallDuration || 0), 300));
  const supabase = serviceSupabase();
  const { error } = await supabase.rpc('business_finish_voice_session_by_call', {
    p_call_sid: params.CallSid || '',
    p_status: params.CallStatus || 'completed',
    p_duration_seconds: duration,
    p_price: params.Price || null,
    p_price_unit: params.PriceUnit || null,
  });
  return new Response(error ? 'Not recorded' : 'OK', { status: error ? 400 : 200 });
}
