import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Companions — Terminal Edition Agents',
  description:
    'Hands-on "Terminal Edition" companions that run inside Claude Code via MCP — personal assistants, document visualizers, researchers and more. Download a companion definition or add your own.',
  alternates: { canonical: 'https://agentshive.net/companions' },
};

export default function CompanionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
