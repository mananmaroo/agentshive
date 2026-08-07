import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const DEMO_SOURCE = {
  title: 'Aarohan University Demo — approved admissions guide',
  url: 'https://aarohan-university-demo.vercel.app/',
};

const DEMO_KNOWLEDGE = [
  {
    terms: ['bba', 'business', 'management', 'बीबीए', 'व्यवसाय', 'प्रबंधन'],
    answer:
      'The fictional Aarohan University BBA is a three-year undergraduate programme focused on business fundamentals, communication, entrepreneurship and practical projects.',
    answerHi:
      'काल्पनिक आरोहण यूनिवर्सिटी का बीबीए तीन साल का स्नातक कार्यक्रम है। इसमें व्यवसाय की बुनियादी समझ, संचार, उद्यमिता और व्यावहारिक परियोजनाओं पर ध्यान दिया जाता है।',
  },
  {
    terms: ['btech', 'b.tech', 'engineering', 'technology', 'बीटेक', 'इंजीनियरिंग', 'तकनीक'],
    answer:
      'The fictional Aarohan University B.Tech is a four-year undergraduate programme with technology foundations, project-based learning and industry-oriented coursework.',
    answerHi:
      'काल्पनिक आरोहण यूनिवर्सिटी का बीटेक चार साल का स्नातक कार्यक्रम है। इसमें तकनीकी आधार, परियोजना-आधारित सीखने और उद्योग-केंद्रित पाठ्यक्रम शामिल हैं।',
  },
  {
    terms: ['admission', 'apply', 'application', 'eligibility', 'प्रवेश', 'आवेदन', 'योग्यता'],
    answer:
      'For this fictional demo, applicants complete an online enquiry, submit academic details and speak with an admissions counsellor. Final eligibility must always be confirmed by a person.',
    answerHi:
      'इस काल्पनिक डेमो में आवेदक ऑनलाइन पूछताछ भरते हैं, शैक्षणिक जानकारी जमा करते हैं और प्रवेश सलाहकार से बात करते हैं। अंतिम योग्यता की पुष्टि हमेशा किसी व्यक्ति द्वारा की जानी चाहिए।',
  },
  {
    terms: ['scholarship', 'financial', 'discount', 'fee', 'छात्रवृत्ति', 'फीस', 'रियायत'],
    answer:
      'The fictional university lists merit-based scholarship review, but amounts and eligibility require a human admissions counsellor. The demo does not promise a scholarship or discount.',
    answerHi:
      'काल्पनिक यूनिवर्सिटी में योग्यता-आधारित छात्रवृत्ति की समीक्षा होती है, लेकिन राशि और पात्रता की पुष्टि मानव प्रवेश सलाहकार करेगा। यह डेमो छात्रवृत्ति या छूट का वादा नहीं करता।',
    needsHuman: true,
  },
  {
    terms: ['counsellor', 'counselor', 'human', 'call', 'contact', 'सलाहकार', 'इंसान', 'संपर्क', 'कॉल'],
    answer:
      'I can hand this enquiry to a human admissions counsellor. Use the “Continue with a human” link below; this public demo does not send or place a real call.',
    answerHi:
      'मैं यह पूछताछ मानव प्रवेश सलाहकार को सौंप सकती हूँ। नीचे “Continue with a human” लिंक का उपयोग करें; यह सार्वजनिक डेमो वास्तविक कॉल नहीं करता।',
    needsHuman: true,
  },
] as const;

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9.\s\u0900-\u097F]/g, ' ');
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { question?: string; language?: 'en' | 'hi' };
    const question = body.question?.trim() || '';
    const language = body.language === 'hi' ? 'hi' : 'en';

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
        answer: language === 'hi'
          ? 'मुझे स्वीकृत काल्पनिक यूनिवर्सिटी जानकारी में इसका उत्तर नहीं मिला। अनुमान लगाने के बजाय मैं यह सवाल मानव प्रवेश सलाहकार को भेजूँगी।'
          : "I don't know that from the fictional university's approved demo information. I would send this question to a human admissions counsellor instead of guessing.",
        citations: [],
        needsHuman: true,
        conversationId: 'public-demo',
        organizationName: 'Aarohan University Demo',
        demo: true,
      });
    }

    return NextResponse.json({
      answer: language === 'hi' ? matched.answerHi : matched.answer,
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
