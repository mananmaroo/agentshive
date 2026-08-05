'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Download, Search, Star } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { supabaseAnon } from '@/app/lib/supabase-anon';

type Agent = {
  id: string;
  title: string;
  description: string;
  downloads_count: number;
  average_rating: number | null;
  verified: boolean;
  creator: { username: string } | null;
};

export default function RegistryHome() {
  const { user, loading: authLoading } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const loadAgents = async () => {
      const { data, error } = await supabaseAnon
        .from('agents')
        .select('id,title,description,downloads_count,average_rating,verified,creator:users(username)')
        .order('created_at', { ascending: false })
        .limit(9);

      if (!active) return;
      if (error) console.error('Failed to load registry home:', error);
      setAgents((data as unknown as Agent[]) || []);
      setAgentsLoading(false);
    };
    void loadAgents();
    return () => { active = false; };
  }, []);

  const search = (event: FormEvent) => {
    event.preventDefault();
    const query = searchInput.trim();
    router.push(query ? `/agents?q=${encodeURIComponent(query)}` : '/agents');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-300">AgentsHive Registry</p>
            <h1 className="mt-3 text-4xl font-bold">
              {authLoading ? 'Discover useful AI agents' : user ? `Welcome back, @${user.username}` : 'Discover useful AI agents'}
            </h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              Browse community-built agents, prompts, and companions without losing your way back to the main AgentsHive experience.
            </p>
          </div>
        </div>

        <form onSubmit={search} className="mt-10 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-indigo-400" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search agents, prompts, companions..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none transition-colors focus:border-indigo-500"
            />
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Newest Agents</h2>
          <Link href="/agents" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">Browse all →</Link>
        </div>

        {agentsLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading newest agents">
            {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-52 animate-pulse rounded-lg border border-slate-800 bg-slate-900/60" />)}
          </div>
        ) : agents.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <Link key={agent.id} href={`/agents/${agent.id}`} className="group flex flex-col rounded-lg border border-slate-800 bg-slate-900/40 p-6 transition-colors hover:border-indigo-500">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold group-hover:text-indigo-300">{agent.title}</h3>
                    {agent.verified && <span className="rounded bg-indigo-900/50 px-2 py-1 text-xs text-indigo-300">✓</span>}
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-slate-400">{agent.description}</p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 text-indigo-400" />{(agent.average_rating ?? 0).toFixed(1)}</span>
                  <span className="flex items-center gap-1"><Download className="h-4 w-4 text-indigo-400" />{agent.downloads_count}</span>
                  <span className="text-xs">by @{agent.creator?.username || 'community'}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-800 p-10 text-center text-slate-400">No agents are available yet.</div>
        )}
      </section>
    </div>
  );
}
