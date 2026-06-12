import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Learn — AI Agent Video Tutorials',
  description:
    'Video tutorials on building, installing, and running AI agents with Claude Code, Codex, and n8n.',
  alternates: { canonical: 'https://agentshive.net/learn-videos' },
};

export default function LearnVideosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
