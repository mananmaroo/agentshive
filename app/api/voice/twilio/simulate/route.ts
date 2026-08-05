import { NextRequest, NextResponse } from 'next/server';
import { DISCLOSURE, MAX_CALL_SECONDS, UNKNOWN_REPLY } from '@/app/lib/voice/twilio';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (process.env.VOICE_SIMULATOR_ENABLED !== 'true' || request.headers.get('x-agentshive-voice-simulator') !== process.env.VOICE_SIMULATOR_SECRET) {
    return NextResponse.json({ error: 'Simulator unavailable.' }, { status: 404 });
  }
  const body = (await request.json()) as { event?: string; question?: string; approvedAnswer?: string; elapsedSeconds?: number };
  if (body.event === 'inbound') return NextResponse.json({ disclosure: DISCLOSURE, next: 'listen', recording: false, maxCallSeconds: MAX_CALL_SECONDS });
  if ((body.elapsedSeconds || 0) >= MAX_CALL_SECONDS) return NextResponse.json({ reply: 'We have reached the five minute call limit. An admissions counsellor can follow up. Goodbye.', next: 'hangup', attention: true });
  if (/(human|person|counsell?or|scholarship|discount|refund|complaint|legal|medical|guarantee|exception|payment|unsafe|emergency)/i.test(body.question || '')) {
    return NextResponse.json({ reply: 'I will connect you with an admissions counsellor.', next: 'transfer', attention: true });
  }
  if (!body.approvedAnswer) return NextResponse.json({ reply: UNKNOWN_REPLY, next: 'hangup', attention: true });
  return NextResponse.json({ reply: body.approvedAnswer, next: 'listen', attention: false });
}
