'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Bot, Sparkles, Terminal, Star, Download } from 'lucide-react';
import { supabaseAnon as supabase } from '@/app/lib/supabase-anon';

interface Agent {
  id: string;
  title: string;
  description: string;
  category: string[];
  tags: string[];
  creator_id: string;
  downloads_count: number;
  average_rating: number | null;
  rating_count: number;
  verified: boolean;
}

interface Creator {
  id: string;
  username: string;
}

type Tab = 'agents' | 'perfect-prompts' | 'companions';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [inputValue, setInputValue] = useState(initialQ);
  const [activeTab, setActiveTab] = useState<Tab>('agents');

  const [agents, setAgents] = useState<Agent[]>([]);
  const [prompts, setPrompts] = useState<Agent[]>([]);
  const [companions, setCompanions] = useState<Agent[]>([]);
  const [creators, setCreators] = useState<Map<string, Creator>>(new Map());
  const [loading, setLoading] = useState(false);

  const fetchIdRef = useRef(0);

  useEffect(() => {
    if (!query) return;

    const fetchAll = async () => {
      const fetchId = ++fetchIdRef.current;
      setLoading(true);

      const term = query.replace(/[,()"{}*:\\]/g, ' ').trim();
      if (!term) { setLoading(false); return; }

      const filter = `title.ilike.%${term}%,description.ilike.%${term}%,tags.cs.{"${term}"}`;

      const [agentsRes, promptsRes, companionsRes] = await Promise.all([
        supabase.from('agents').select('*')
          .not('category', 'cs', '{"Perfect Prompt"}')
          .not('category', 'cs', '{"Companion"}')
          .or(filter)
          .order('downloads_count', { ascending: false })
          .limit(30),
        supabase.from('agents').select('*')
          .contains('category', ['Perfect Prompt'])
          .or(filter)
          .order('downloads_count', { ascending: false })
          .limit(30),
        supabase.from('agents').select('*')
          .contains('category', ['Companion'])
          .or(filter)
          .order('downloads_count', { ascending: false })
          .limit(30),
      ]);

      if (fetchId !== fetchIdRef.current) return;

      const allItems = [
        ...(agentsRes.data || []),
        ...(promptsRes.data || []),
        ...(companionsRes.data || []),
      ];
      const creatorIds = [...new Set(allItems.map((a) => a.creator_id))];
      let creatorMap = new Map<string, Creator>();
      if (creatorIds.length > 0) {
        const { data: creatorData } = await supabase
          .from('users').select('id, username').in('id', creatorIds);
        (creatorData || []).forEach((c) => creatorMap.set(c.id, c));
      }

      if (fetchId !== fetchIdRef.current) return;
      setAgents(agentsRes.data || []);
      setPrompts(promptsRes.data || []);
      setCompanions(companionsRes.data || []);
      setCreators(creatorMap);
      setLoading(false);
    };

    fetchAll();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputValue.trim();
    if (!q) return;
    setQuery(q);
    router.replace(`/search?q=${encodeURIComponent(q)}`);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'agents', label: 'Agents', icon: <Bot className="w-4 h-4" />, count: agents.length },
    { key: 'perfect-prompts', label: 'Perfect Prompts', icon: <Sparkles className="w-4 h-4" />, count: prompts.length },
    { key: 'companions', label: 'Companions', icon: <Terminal className="w-4 h-4" />, count: companions.length },
  ];

  const currentItems = activeTab === 'agents' ? agents : activeTab === 'perfect-prompts' ? prompts : companions;
  const getHref = (item: Agent) =>
    activeTab === 'companions' ? `/companions` : `/agents/${item.id}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-6">Search</h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-indigo-400 w-5 h-5" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search agents, prompts, companions..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              autoFocus
            />
          </div>
        </form>

        {query && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-800 pb-3">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === tab.key
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {!loading && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-16 text-slate-400">Searching...</div>
            ) : currentItems.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                No {tabs.find(t => t.key === activeTab)?.label.toLowerCase()} found for &ldquo;{query}&rdquo;
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentItems.map((item) => (
                  <Link
                    key={item.id}
                    href={getHref(item)}
                    className="border border-slate-800 hover:border-indigo-500 rounded-lg p-5 transition group flex flex-col"
                  >
                    <h3 className="text-base font-semibold text-white group-hover:text-indigo-400 transition mb-1">
                      {item.title}
                    </h3>
                    {item.verified && (
                      <span className="inline-block bg-slate-800/60 text-slate-400 text-xs px-2 py-0.5 rounded mb-2 w-fit">
                        ✓ Verified
                      </span>
                    )}
                    <p className="text-slate-400 text-sm line-clamp-2 mb-3 flex-1">{item.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-800">
                      <span>by @{creators.get(item.creator_id)?.username || 'unknown'}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500" />
                          {(item.average_rating ?? 0).toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3.5 h-3.5 text-indigo-400" />
                          {item.downloads_count}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {!query && (
          <p className="text-slate-400 text-center py-16">Enter a search term to find agents, prompts, and companions.</p>
        )}
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
