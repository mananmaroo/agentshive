import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connect the Agentshive MCP',
  description:
    'Connect Agentshive to Claude Code, Codex, or Cursor once — then just say "install the X agent and run it". Search and install AI agents by name.',
  alternates: { canonical: 'https://agentshive.net/mcp' },
};

export default function McpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
