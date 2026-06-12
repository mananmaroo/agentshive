import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — AI Agent Guides & Tutorials',
  description:
    'Guides, tutorials, and best practices for building and using AI agents — from CLAUDE.md patterns to n8n automations.',
  alternates: { canonical: 'https://agentshive.net/blog' },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
