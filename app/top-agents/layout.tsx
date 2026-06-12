import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trending AI Agents',
  description:
    'The most downloaded and highest-rated AI agents on Agentshive right now.',
  alternates: { canonical: 'https://agentshive.net/top-agents' },
};

export default function TopAgentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
