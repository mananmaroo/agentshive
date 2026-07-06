'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Star, Download, Eye, Code, Globe } from 'lucide-react';

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}
import { supabaseAnon } from '@/app/lib/supabase-anon';
import { sortBadges, BadgeChip } from '@/app/lib/badges';

interface Creator {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  github_username: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  badges: string[] | null;
  created_at: string;
}

interface Agent {
  id: string;
  title: string;
  description: string;
  category: string[];
  average_rating: number;
  rating_count: number;
  downloads_count: number;
  views_count: number;
  verified: boolean;
}

// Look up a creator by their uuid (/creators/[id]) or by username (/@handle).
export function CreatorProfile({ by, value }: { by: 'id' | 'username'; value: string }) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: user, error: userError } = await supabaseAnon
          .from('users')
          .select('*')
          .eq(by, value)
          .single();

        if (userError || !user) {
          setNotFound(true);
          return;
        }
        setCreator(user as Creator);

        const { data: agentList } = await supabaseAnon
          .from('agents')
          .select('id, title, description, category, average_rating, rating_count, downloads_count, views_count, verified')
          .eq('creator_id', user.id)
          .order('downloads_count', { ascending: false });

        setAgents((agentList ?? []) as Agent[]);
      } catch (e) {
        console.error(e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    if (value) load();
  }, [by, value]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Loading creator…
      </div>
    );
  }

  if (notFound || !creator) {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 py-20">
          <Link href="/agents" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-8">
            <ChevronLeft className="w-4 h-4" />
            Back to Agents
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Creator not found</h1>
          <p className="text-slate-400">This profile may have been deleted or never existed.</p>
        </div>
      </div>
    );
  }

  const totalDownloads = agents.reduce((sum, a) => sum + (a.downloads_count || 0), 0);
  const totalViews = agents.reduce((sum, a) => sum + (a.views_count || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/agents" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm mb-8">
          <ChevronLeft className="w-4 h-4" />
          Back to Agents
        </Link>

        {/* Header */}
        <div className="flex items-start gap-6 mb-10 pb-10 border-b border-slate-800">
          {creator.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={creator.avatar_url} alt={creator.username} className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {creator.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-3xl font-bold text-white">@{creator.username}</h1>
              {sortBadges(creator.badges || []).map((b) => (
                <BadgeChip key={b} id={b} />
              ))}
            </div>
            <p className="text-sm text-slate-500 mb-3">
              Joined{' '}
              <time dateTime={creator.created_at} suppressHydrationWarning>
                {new Date(creator.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                })}
              </time>
            </p>
            {creator.bio && <p className="text-slate-300 mb-4">{creator.bio}</p>}
            <div className="flex items-center gap-4">
              {creator.github_username && (
                <a
                  href={`https://github.com/${creator.github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-300 text-sm"
                >
                  <Code className="w-4 h-4" />
                  github.com/{creator.github_username}
                </a>
              )}
              {creator.linkedin_url && (
                <a
                  href={creator.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-300 text-sm"
                >
                  <LinkedinIcon className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
              {creator.website_url && (
                <a
                  href={creator.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-300 text-sm"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="border border-slate-800 rounded-lg p-6">
            <p className="text-xs text-slate-500 uppercase mb-1">Agents</p>
            <p className="text-2xl font-bold text-white">{agents.length}</p>
          </div>
          <div className="border border-slate-800 rounded-lg p-6">
            <p className="text-xs text-slate-500 uppercase mb-1">Total Downloads</p>
            <p className="text-2xl font-bold text-white">{totalDownloads.toLocaleString()}</p>
          </div>
          <div className="border border-slate-800 rounded-lg p-6">
            <p className="text-xs text-slate-500 uppercase mb-1">Total Views</p>
            <p className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</p>
          </div>
        </div>

        {/* Agents */}
        <h2 className="text-xl font-semibold text-white mb-4">Agents by @{creator.username}</h2>
        {agents.length === 0 ? (
          <p className="text-slate-400 py-8 text-center border border-dashed border-slate-800 rounded-lg">
            No agents published yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="border border-slate-800 hover:border-slate-600 rounded-lg p-5 transition-colors duration-200 group"
              >
                <h3 className="text-base font-semibold text-white group-hover:text-indigo-400 transition mb-1">
                  {agent.title}
                </h3>
                {agent.verified && (
                  <span className="inline-block bg-slate-800/60 text-slate-400 text-xs px-2 py-0.5 rounded mb-2">
                    ✓ Verified
                  </span>
                )}
                <p className="text-sm text-slate-400 line-clamp-2 mb-3">{agent.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    {agent.average_rating.toFixed(1)} ({agent.rating_count})
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    {agent.downloads_count.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {agent.views_count.toLocaleString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
