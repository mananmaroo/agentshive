import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Agentshive is the open, community-driven registry for AI agents — like GitHub for agent templates. Learn about the mission and the team.',
  alternates: { canonical: 'https://agentshive.net/about' },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
