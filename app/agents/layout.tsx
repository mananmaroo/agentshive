import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse AI Agents',
  description:
    'Browse hundreds of ready-made AI agents for Claude Code, Codex, n8n, and LangChain. Filter by category, rating, and downloads — install any agent in seconds.',
  alternates: { canonical: 'https://agentshive.net/agents' },
};

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
