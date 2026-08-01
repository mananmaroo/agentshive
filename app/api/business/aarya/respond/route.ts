import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const STOP_WORDS = new Set(['about', 'after', 'also', 'and', 'are', 'can', 'for', 'from', 'have', 'how', 'into', 'is', 'me', 'of', 'please', 'tell', 'the', 'this', 'to', 'what', 'when', 'where', 'with', 'you']);

type KnowledgeRow = {
  organization_id: string;
  organization_name: string;
  source_url: string;
  title: string;
  content: string;
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase is not configured.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function tokens(value: string) {
  return [...new Set(value.toLowerCase().match(/[a-z0-9\u0900-\u097f]{3,}/g) || [])]
    .filter((token) => !STOP_WORDS.has(token))
    .slice(0, 12);
}

function answerFromKnowledge(question: string, rows: KnowledgeRow[]) {
  const terms = tokens(question);
  const scored = rows.map((row) => {
    const title = row.title.toLowerCase();
    const content = row.content.toLowerCase();
    const score = terms.reduce((total, term) => total + (title.includes(term) ? 4 : 0) + (content.includes(term) ? 1 : 0), 0);
    return { row, score };
  }).sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score < 1) return null;

  const sentences = best.row.content.split(/(?<=[.!?])\s+/).filter(Boolean);
  const matching = sentences.filter((sentence) => terms.some((term) => sentence.toLowerCase().includes(term))).slice(0, 2);
  if (!matching.length) return null;
  return { answer: matching.join(' '), citations: [{ title: best.row.title || 'Approved institute page', url: best.row.source_url }] };
}

function humanRequired(question: string) {
  return /(scholarship|discount|refund|complaint|legal|medical|guarantee|exception|deadline today|talk to|human|counsell?or)/i.test(question);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { widgetKey?: string; question?: string; conversationId?: string | null };
    const question = body.question?.trim() || '';
    if (!/^[0-9a-f-]{36}$/i.test(body.widgetKey || '')) return NextResponse.json({ error: 'Unknown widget.' }, { status: 404 });
    if (!question || question.length > 2000) return NextResponse.json({ error: 'Ask a question of 2,000 characters or fewer.' }, { status: 400 });

    const supabase = getSupabase();
    const { data, error } = await supabase.rpc('aarya_get_approved_knowledge', { p_widget_key: body.widgetKey });
    if (error) throw error;
    const rows = (data || []) as KnowledgeRow[];
    if (!rows.length) return NextResponse.json({ error: 'This employee has no approved knowledge yet.' }, { status: 409 });

    const matched = answerFromKnowledge(question, rows);
    const needsHuman = humanRequired(question) || !matched;
    const answer = matched?.answer || "I don't know from the institute's approved information. I’ve marked this for a human admissions counsellor instead of guessing.";
    const citations = matched?.citations || [];

    const email = question.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || null;
    const phone = question.match(/(?:\+?\d[\d\s-]{8,}\d)/)?.[0] || null;
    const { data: conversationId, error: recordError } = await supabase.rpc('aarya_record_exchange', {
      p_widget_key: body.widgetKey,
      p_conversation_id: body.conversationId || null,
      p_question: question,
      p_answer: answer,
      p_needs_human: needsHuman,
      p_source_urls: citations.map((citation) => citation.url),
      p_visitor_name: null,
      p_visitor_email: email,
      p_visitor_phone: phone,
      p_course_interest: null,
    });
    if (recordError) throw recordError;

    return NextResponse.json({ answer, citations, needsHuman, conversationId, organizationName: rows[0].organization_name });
  } catch (error) {
    console.error('Aarya response error', error);
    return NextResponse.json({ error: 'Aarya could not process that safely. Please ask a human admissions counsellor.' }, { status: 500 });
  }
}
