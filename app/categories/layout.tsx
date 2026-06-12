import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agent Categories',
  description:
    'Explore AI agents by category — research, data analysis, content creation, code generation, customer support, automation, and education.',
  alternates: { canonical: 'https://agentshive.net/categories' },
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
