'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Star, Download, Eye, Sparkles, GraduationCap, Code, FileText } from 'lucide-react';
import { supabaseAnon as supabase } from '@/app/lib/supabase-anon';

// Perfect Prompts are pure prompt/persona definitions — they advise, tutor or
// transform text with no tools or external actions. They share the `agents`
// table but carry the "Perfect Prompt" category, so this page queries on that.
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Education': GraduationCap,
  'Code Generation': Code,
  'Content Creation': FileText,
};

const getIcon = (categories: string[]) => {
  // category[0] is always "Perfect Prompt"; use the secondary tag for flavor.
  const sub = categories?.[1];
  return (sub && categoryIcons[sub]) || Sparkles;
};

interface Agent {
  id: string;
  title: string;
  description: string;
  category: string[];
  tags: string[];
  creator_id: string;
  downloads_count: number;
  views_count: number;
  average_rating: number;
  rating_count: number;
  verified: boolean;
  created_at: string;
}

interface Creator {
  id: string;
  username: string;
  avatar_url: string | null;
}

export default function PerfectPrompts() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [creators, setCreators] = useState<Map<string, Creator>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchIdRef = useRef(0);

  useEffect(() => {
    const fetchPrompts = async () => {
      const fetchId = ++fetchIdRef.current;
      setLoading(true);
      try {
        let query = supabase
          .from('agents')
          .select('*')
          .contains('category', ['Perfect Prompt']);

        if (searchQuery) {
          const term = searchQuery.replace(/[,()"{}*:\\]/g, ' ').trim();
          if (term) {
            query = query.or(
              `title.ilike.%${term}%,description.ilike.%${term}%,tags.cs.{"${term}"}`
            );
          }
        }

        query = query.order('downloads_count', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;
        if (fetchId !== fetchIdRef.current) return; // stale response

        setAgents(data || []);

        const creatorIds = [...new Set((data || []).map((a) => a.creator_id))];
        if (creatorIds.length > 0) {
          const { data: creatorData } = await supabase
            .from('users')
            .select('id, username, avatar_url')
            .in('id', creatorIds);

          const creatorMap = new Map();
          (creatorData || []).forEach((creator) => {
            creatorMap.set(creator.id, creator);
          });
          setCreators(creatorMap);
        }
      } catch (err) {
        console.error('Failed to fetch perfect prompts:', err);
      } finally {
        if (fetchId === fetchIdRef.current) setLoading(false);
      }
    };

    fetchPrompts();
  }, [searchQuery]);

  const getCreatorName = (creatorId: string) =>
    creators.get(creatorId)?.username || 'Unknown';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <section className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero / intro */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-fuchsia-500/10 text-fuchsia-300 text-xs font-medium px-3 py-1 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Prompt Library
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Perfect Prompts</h1>
          <p className="text-lg text-slate-400 max-w-3xl">
            Ready-to-use prompts and expert personas you paste straight into any LLM —
            no tools, MCP or setup. They tutor, advise, or transform text. For prompts
            that actually take actions on your behalf, see{' '}
            <Link href="/agents" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Browse Agents
            </Link>{' '}
            and{' '}
            <Link href="/companions" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Companions
            </Link>
            .
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-3 text-fuchsia-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search prompts by name, tags, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-slate-400">Loading prompts...</div>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No prompts found matching your criteria</p>
            <Link
              href="/agents/upload"
              className="text-fuchsia-400 hover:text-slate-400 mt-4 inline-block font-semibold"
            >
              Upload a prompt →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {agents.map((agent) => {
              const Icon = getIcon(agent.category);
              return (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  className="border border-slate-800 hover:border-slate-600 rounded-lg p-6 transition-colors duration-200 group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-fuchsia-300 bg-fuchsia-500/10">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-white group-hover:text-fuchsia-400 transition mb-1">
                        {agent.title}
                      </h3>
                      {agent.verified && (
                        <span className="inline-block bg-slate-800/60 text-slate-400 text-xs px-2 py-0.5 rounded">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {agent.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {agent.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                    {agent.tags.length > 3 && (
                      <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded">
                        +{agent.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="inline-block bg-fuchsia-500/15 text-fuchsia-300 text-xs px-2 py-1 rounded font-medium">
                      Perfect Prompt
                    </span>
                  </div>

                  <div className="border-t border-slate-700 pt-3 mb-3">
                    <p className="text-xs text-slate-400">
                      By <span className="text-white font-semibold">{getCreatorName(agent.creator_id)}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-700">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span>{agent.average_rating.toFixed(1)} ({agent.rating_count})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4 text-fuchsia-400" />
                      <span>{agent.downloads_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span>{agent.views_count}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
