import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://agentshive.net';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/agents`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/top-agents`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/categories`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/learn`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/learn-videos`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/blog`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/request-agent`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/donate`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    const { data: agents } = await supabase
      .from('agents')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(1000);

    const agentRoutes: MetadataRoute.Sitemap = (agents || []).map((agent) => ({
      url: `${BASE_URL}/agents/${agent.id}`,
      lastModified: agent.created_at,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...agentRoutes];
  } catch {
    return staticRoutes;
  }
}
