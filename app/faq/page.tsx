'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What is AgentStack?',
    answer:
      'AgentStack is an open registry for Claude agents. It allows developers to discover, share, and download AI agents built with Claude, n8n templates, Codex, and other formats.',
  },
  {
    question: 'How do I upload my agent?',
    answer:
      'Click "Upload Agent" in the navigation bar. You can upload claude.md files, n8n JSON templates, Python/JavaScript code, or provide a YouTube video URL showing your agent in action.',
  },
  {
    question: 'Is uploading agents free?',
    answer:
      'Yes! Uploading and sharing agents on AgentStack is completely free. We believe in open-source collaboration.',
  },
  {
    question: 'Can I edit or delete my agent?',
    answer:
      'Yes! You can edit agent details and delete agents from your creator dashboard. All changes are reflected immediately.',
  },
  {
    question: 'What are ratings and comments for?',
    answer:
      'Ratings (1-5 stars) help other users know the quality of agents. Comments let the community share feedback, tips, and improvements.',
  },
  {
    question: 'How are agents ranked?',
    answer:
      'Agents can be sorted by newest, trending (most views), highest rating, or most downloaded. Featured agents appear at the top.',
  },
  {
    question: 'Can I request a custom agent?',
    answer:
      'Yes! Go to the "Request Agent" page. Fill out what you need, set a budget, and our team will review custom development opportunities.',
  },
  {
    question: 'How much does the service cost?',
    answer:
      'AgentStack is free to use. We run on donations and support from the community. Server costs are $250/month — consider supporting us if you find value.',
  },
  {
    question: 'Can I use agents commercially?',
    answer:
      'It depends on the agent\'s license. Always check the license type (MIT, Apache, etc.) before using commercially. Contact the creator if unclear.',
  },
  {
    question: 'How do I contact the creator?',
    answer:
      'Visit an agent\'s detail page and click the creator\'s profile. You can view their GitHub, website, or email if they\'ve shared it.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-slate-400">
            Find answers to common questions about Agentshive
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-slate-800 hover:border-slate-600 rounded-lg overflow-hidden transition-colors duration-200"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800 transition"
              >
                <span className="font-semibold text-white text-lg">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-indigo-400 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 py-4 border-t border-slate-700 bg-slate-800">
                  <p className="text-slate-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-indigo-900/50 to-indigo-800/50 border border-slate-700 rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            Still have questions?
          </h3>
          <p className="text-slate-300 mb-4">
            Can't find the answer you're looking for? Please reach out to our community.
          </p>
          <a
            href="mailto:support@agentshive.net"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
          >
            Contact Support
          </a>
        </div>
      </main>
    </div>
  );
}
