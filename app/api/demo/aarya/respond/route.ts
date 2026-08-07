import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const DEMO_SOURCE = {
  title: 'Aarohan University Demo — approved admissions guide',
  url: 'https://aarohan-university-demo.vercel.app/',
};

const DEMO_KNOWLEDGE = [
  {
    terms: ['bba', 'business', 'management'],
    answer:
      'The fictional Aarohan University BBA is a three-year undergraduate programme focused on business fundamentals, communication, entrepreneurship and practical projects.',
  },
  {
    terms: ['btech', 'b.tech', 'engineering', 'technology'],
    answer:
      'The fictional Aarohan University B.Tech is a four-year undergraduate programme with technology foundations, project-based learning and industry-oriented coursework.',
  },
  {
    terms: ['admission', 'apply', 'application', 'eligibility'],
    answer:
      'For this fictional demo, applicants complete an online enquiry, submit academic details and speak with an admissions counsellor. Final eligibility must always be confirmed by a person.',
  },
  {
    terms: ['scholarship', 'financial', 'discount', 'fee'],
    answer:
      'The fictional university lists merit-based scholarship review, but amounts and eligibility require a human admissions counsellor. The demo does not promise a scholarship or discount.',
    needsHuman: true,
  },
  {
    terms: ['counsellor', 'counselor', 'human', 'call', 'contact'],
    answer:
      'I can hand this enquiry to a human admissions counsellor. Use the “Continue with a human” link below; this public demo does not send or place a real call.',
    needsHuman: true,
  },
] as const;

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9.\s]/g, ' ');
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { question?: string };
    const question = body.question?.trim() || '';

    if (!question || question.length > 500) {
      return NextResponse.json(
        { error: 'Ask a demo question of 500 characters or fewer.' },
        { status: 400 },
      );
    }

    const normalized = normalize(question);
    const matched = DEMO_KNOWLEDGE.find((item) =>
      item.terms.some((term) => normalized.includes(term)),
    );

    if (!matched) {
      return NextResponse.json({
        answer:
          "I don't know that from the fictional university's approved demo information. I would send this question to a human admissions counsellor instead of guessing.",
        citations: [],
        needsHuman: true,
        conversationId: 'public-demo',
        organizationName: 'Aarohan University Demo',
        demo: true,
      });
    }

    return NextResponse.json({
      answer: matched.answer,
      citations: [DEMO_SOURCE],
      needsHuman: 'needsHuman' in matched ? matched.needsHuman : false,
      conversationId: 'public-demo',
      organizationName: 'Aarohan University Demo',
      demo: true,
    });
  } catch (error) {
    console.error('Public Aarya demo error', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'The guided demo could not respond safely. Please try again.' },
      { status: 500 },
    );
  }
}
