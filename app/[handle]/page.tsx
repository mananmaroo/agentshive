'use client';

import { useParams, notFound } from 'next/navigation';
import { CreatorProfile } from '@/app/components/creator-profile';

// Vanity profile route: agentshive.net/@username
// This is a root-level dynamic segment, so static routes (/agents, /faq, …)
// always take precedence. We only treat a path as a handle when it starts with
// '@'; anything else falls through to a normal 404.
export default function HandlePage() {
  const params = useParams();
  const raw = decodeURIComponent((params.handle as string) || '');

  if (!raw.startsWith('@') || raw.length < 2) {
    notFound();
  }

  const username = raw.slice(1);
  return <CreatorProfile by="username" value={username} />;
}
