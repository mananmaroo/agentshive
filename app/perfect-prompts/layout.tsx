import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perfect Prompts — Ready-to-Use Expert Prompts',
  description:
    'Curated prompt definitions and expert personas you paste straight into any LLM — no tools or setup required. Tutors, expert templates and text transformers that work in Claude, ChatGPT, Perplexity and beyond.',
  alternates: { canonical: 'https://agentshive.net/perfect-prompts' },
};

export default function PerfectPromptsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
