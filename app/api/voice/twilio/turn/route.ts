import { NextRequest } from 'next/server';
import { allowSimulator, forbidden, formBody, MAX_CALL_SECONDS, serviceSupabase, twiml, UNKNOWN_REPLY, validTwilioSignature, xml } from '@/app/lib/voice/twilio';

export const runtime = 'nodejs';

function humanRequired(value: string) {
  return /(human|person|counsell?or|scholarship|discount|refund|complaint|legal|medical|guarantee|exception|payment|unsafe|emergency)/i.test(value);
}

export async function POST(request: NextRequest) {
  const params = await formBody(request);
  if (!allowSimulator(request) && !validTwilioSignature(request, params)) return forbidden();
  const sessionId = request.nextUrl.searchParams.get('session');
  if (!sessionId || !/^[0-9a-f-]{36}$/i.test(sessionId)) return twiml('<Say>This call session is unavailable.</Say><Hangup/>');

  const speech = (params.SpeechResult || '').trim();
  const supabase = serviceSupabase();
  const { data: contextRows, error: contextError } = await supabase.rpc('business_get_voice_context', { p_session_id: sessionId });
  if (contextError || !contextRows?.length) return twiml('<Say>This call cannot continue safely. Please contact admissions directly.</Say><Hangup/>');
  const context = contextRows[0];

  if ((context.elapsed_seconds || 0) >= MAX_CALL_SECONDS) {
    await supabase.rpc('business_finish_voice_session', { p_session_id: sessionId, p_status: 'time_limit', p_duration_seconds: MAX_CALL_SECONDS });
    return twiml('<Say>We have reached the five minute call limit. An admissions counsellor can follow up. Goodbye.</Say><Hangup/>');
  }

  if (!speech) {
    const action = request.url;
    return twiml(`<Gather input="speech dtmf" action="${xml(action)}" method="POST" speechTimeout="auto" timeout="5" actionOnEmptyResult="true"><Say>I did not hear a question. Please try once more, or say human.</Say></Gather><Say>We will ask admissions to follow up. Goodbye.</Say><Hangup/>`);
  }

  if (humanRequired(speech)) {
    await supabase.rpc('business_record_voice_turn', { p_session_id: sessionId, p_question: speech, p_answer: 'Human transfer requested.', p_needs_human: true, p_source_urls: [] });
    if (context.transfer_phone_e164) return twiml(`<Say>I will transfer you to an admissions counsellor now.</Say><Dial timeout="20">${xml(context.transfer_phone_e164)}</Dial><Say>The counsellor was unavailable. We have marked this for follow-up.</Say><Hangup/>`);
    return twiml('<Say>I have marked this for an admissions counsellor to follow up. Goodbye.</Say><Hangup/>');
  }

  const response = await fetch(`${request.nextUrl.origin}/api/business/aarya/respond`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ widgetKey: context.widget_key, question: speech, conversationId: context.conversation_id }),
  });
  const answerData = response.ok ? await response.json() : null;
  const answer = answerData?.answer || UNKNOWN_REPLY;
  const needsHuman = !response.ok || Boolean(answerData?.needsHuman);
  const sources = Array.isArray(answerData?.citations) ? answerData.citations.map((item: { url?: string }) => item.url).filter(Boolean) : [];
  await supabase.rpc('business_record_voice_turn', { p_session_id: sessionId, p_question: speech, p_answer: answer, p_needs_human: needsHuman, p_source_urls: sources });

  if (needsHuman) return twiml(`<Say>${xml(answer)}</Say><Hangup/>`);
  const action = request.url;
  return twiml(`<Say>${xml(answer)}</Say><Gather input="speech dtmf" action="${xml(action)}" method="POST" speechTimeout="auto" timeout="5" actionOnEmptyResult="true"><Say>What else would you like to know?</Say></Gather><Say>Thank you for calling. Goodbye.</Say><Hangup/>`);
}
