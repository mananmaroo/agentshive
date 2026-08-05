import { NextRequest } from 'next/server';
import { allowSimulator, forbidden, formBody, MAX_CALL_SECONDS, serviceSupabase, twiml, UNKNOWN_REPLY, transferEnabled, validTwilioSignature, xml } from '@/app/lib/voice/twilio';

export const runtime = 'nodejs';

const STOP_WORDS = new Set(['about','after','also','and','are','can','for','from','have','how','into','is','me','of','please','tell','the','this','to','what','when','where','with','you']);
type KnowledgeRow = { source_url: string; title: string; content: string };

function humanRequired(value: string) {
  return /(human|person|counsell?or|scholarship|discount|refund|complaint|legal|medical|guarantee|exception|payment|unsafe|emergency)/i.test(value);
}

function answerFromKnowledge(question: string, rows: KnowledgeRow[]) {
  const terms = [...new Set(question.toLowerCase().match(/[a-z0-9\u0900-\u097f]{3,}/g) || [])].filter((term) => !STOP_WORDS.has(term)).slice(0, 12);
  const best = rows.map((row) => ({
    row,
    score: terms.reduce((score, term) => score + (row.title.toLowerCase().includes(term) ? 4 : 0) + (row.content.toLowerCase().includes(term) ? 1 : 0), 0),
  })).sort((a, b) => b.score - a.score)[0];
  if (!best || best.score < 1) return null;
  const sentences = best.row.content.split(/(?<=[.!?])\s+/).filter(Boolean);
  const answer = sentences.filter((sentence) => terms.some((term) => sentence.toLowerCase().includes(term))).slice(0, 2).join(' ');
  return answer ? { answer, sources: [best.row.source_url] } : null;
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
    if (transferEnabled() && context.transfer_phone_e164) return twiml(`<Say>I will transfer you to an admissions counsellor now.</Say><Dial timeout="20">${xml(context.transfer_phone_e164)}</Dial><Say>The counsellor was unavailable. We have marked this for follow-up.</Say><Hangup/>`);
    return twiml('<Say>I have marked this for an admissions counsellor to follow up. Goodbye.</Say><Hangup/>');
  }

  const { data: knowledgeRows, error: knowledgeError } = await supabase.rpc('aarya_get_approved_knowledge', { p_widget_key: context.widget_key });
  const matched = knowledgeError ? null : answerFromKnowledge(speech, (knowledgeRows || []) as KnowledgeRow[]);
  const answer = matched?.answer || UNKNOWN_REPLY;
  const needsHuman = !matched;
  await supabase.rpc('business_record_voice_turn', {
    p_session_id: sessionId,
    p_question: speech,
    p_answer: answer,
    p_needs_human: needsHuman,
    p_source_urls: matched?.sources || [],
  });

  if (needsHuman) return twiml(`<Say>${xml(answer)}</Say><Hangup/>`);
  const action = request.url;
  return twiml(`<Say>${xml(answer)}</Say><Gather input="speech dtmf" action="${xml(action)}" method="POST" speechTimeout="auto" timeout="5" actionOnEmptyResult="true"><Say>What else would you like to know?</Say></Gather><Say>Thank you for calling. Goodbye.</Say><Hangup/>`);
}
