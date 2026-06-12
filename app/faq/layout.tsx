import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about Agentshive — uploading agents, installing agents, accounts, and more.',
  alternates: { canonical: 'https://agentshive.net/faq' },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
