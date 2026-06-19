'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Star, Download, TrendingUp, Clock, Eye, Filter, X, Code, Database, FileText, MessageSquare, Cog, GraduationCap, FlaskConical, Bot } from 'lucide-react';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Research': FlaskConical,
  'Data Analysis': Database,
  'Content Creation': FileText,
  'Code Generation': Code,
  'Customer Support': MessageSquare,
  'Automation': Cog,
  'Education': GraduationCap,
};

const getCategoryIcon = (categories: string[]) => {
  const first = categories?.[0];
  return (first && categoryIcons[first]) || Bot;
};

const categoryColors: Record<string, string> = {
  'Research': 'text-fuchsia-400 bg-fuchsia-500/10',
  'Data Analysis': 'text-emerald-400 bg-emerald-500/10',
  'Content Creation': 'text-amber-400 bg-amber-500/10',
  'Code Generation': 'text-indigo-400 bg-indigo-500/10',
  'Customer Support': 'text-sky-400 bg-sky-500/10',
  'Automation': 'text-rose-400 bg-rose-500/10',
  'Education': 'text-teal-400 bg-teal-500/10',
};

const getCategoryColor = (categories: string[]) =>
  categoryColors[categories?.[0]] || 'text-slate-400 bg-slate-500/10';
import { supabaseAnon as supabase } from '@/app/lib/supabase-anon';

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

type SortBy = 'trending' | 'newest' | 'rating' | 'downloads';

export default function BrowseAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [creators, setCreators] = useState<Map<string, Creator>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState<SortBy>('trending');
  const [selectedTemplate, setSelectedTemplate] = useState<'all' | 'official' | 'Claude' | 'OpenAI'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 12;
  const categories = [
    'Research',
    'Data Analysis',
    'Content Creation',
    'Code Generation',
    'Customer Support',
    'Automation',
    'Education',
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) setSearchQuery(q);
    const cat = params.get('category');
    if (cat && categories.includes(cat)) setSelectedCategory(cat);
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [selectedCategory, selectedSort, searchQuery]);

  // Monotonic id so a slow earlier response can't overwrite a newer one
  const fetchIdRef = useRef(0);

  const fetchAgents = async () => {
    const fetchId = ++fetchIdRef.current;
    setLoading(true);
    try {
      let query = supabase.from('agents').select('*');

      // Filter by search
      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{"${searchQuery}"}`
        );
      }

      // Filter by category
      if (selectedCategory) {
        query = query.contains('category', [selectedCategory]);
      }

      // Sort
      switch (selectedSort) {
        case 'trending':
          query = query.order('downloads_count', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'rating':
          query = query.order('average_rating', { ascending: false });
          break;
        case 'downloads':
          query = query.order('downloads_count', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      if (fetchId !== fetchIdRef.current) return; // stale response — a newer fetch is in flight

      setAgents(data || []);

      // Fetch creator info for all agents
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
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      if (fetchId === fetchIdRef.current) setLoading(false);
    }
  };

  const matchesTemplate = (agent: Agent) => {
    if (selectedTemplate === 'all') return true;
    if (selectedTemplate === 'official') return agent.verified;
    // Platform match against tags/categories (case-insensitive).
    const hay = [...agent.tags, ...agent.category].map((t) => t.toLowerCase());
    return hay.includes(selectedTemplate.toLowerCase());
  };

  const filteredAgents = agents.filter((agent) => {
    if (!matchesTemplate(agent)) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      agent.title.toLowerCase().includes(query) ||
      agent.description.toLowerCase().includes(query) ||
      agent.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);

  const getCreatorName = (creatorId: string) => {
    return creators.get(creatorId)?.username || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">Browse Agents</h1>
          <p className="text-lg text-slate-400">
            Discover {agents.length}+ AI agents created by the community
          </p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3 text-indigo-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search agents by name, tags, or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(selectedCategory || selectedSort !== 'trending') && (
                <span className="ml-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                  {selectedCategory ? 1 : 0 + (selectedSort !== 'trending' ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1 rounded-lg text-sm transition ${
                      selectedCategory === ''
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1 rounded-lg text-sm transition ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Filter */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Template</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'official', label: 'Official templates' },
                    { value: 'Claude', label: 'Claude' },
                    { value: 'OpenAI', label: 'OpenAI' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedTemplate(option.value as 'all' | 'official' | 'Claude' | 'OpenAI');
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1 rounded-lg text-sm transition ${
                        selectedTemplate === option.value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Filter */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Sort By</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'trending', label: 'Trending' },
                    { value: 'newest', label: 'Newest' },
                    { value: 'rating', label: 'Top Rated' },
                    { value: 'downloads', label: 'Most Downloads' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedSort(option.value as SortBy);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1 rounded-lg text-sm transition ${
                        selectedSort === option.value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedCategory || selectedSort !== 'trending') && (
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedSort('trending');
                    setSelectedTemplate('all');
                    setCurrentPage(1);
                  }}
                  className="text-slate-400 hover:text-slate-300 text-sm flex items-center gap-1 font-semibold"
                >
                  <X className="w-4 h-4" />
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="text-slate-400 text-sm mb-6">
          {filteredAgents.length === 0 ? (
            'No agents found'
          ) : (
            <>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredAgents.length)} of{' '}
              {filteredAgents.length} agents
            </>
          )}
        </div>

        {/* Agents Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-slate-400">Loading agents...</div>
          </div>
        ) : paginatedAgents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No agents found matching your criteria</p>
            <Link
              href="/agents/upload"
              className="text-indigo-400 hover:text-slate-400 mt-4 inline-block font-semibold"
            >
              Be the first to upload an agent →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {paginatedAgents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="border border-slate-800 hover:border-slate-600 rounded-lg p-6 transition-colors duration-200 group"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  {(() => {
                    const Icon = getCategoryIcon(agent.category);
                    return (
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getCategoryColor(agent.category)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    );
                  })()}
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white group-hover:text-indigo-400 transition mb-1">
                      {agent.title}
                    </h3>
                    {agent.verified && (
                      <span className="inline-block bg-slate-800/60 text-slate-400 text-xs px-2 py-0.5 rounded">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {agent.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {agent.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {agent.tags.length > 3 && (
                    <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded">
                      +{agent.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Category Badge */}
                <div className="mb-4">
                  {agent.category.length > 0 && (
                    <span className="inline-block bg-slate-700 text-white text-xs px-2 py-1 rounded font-medium">
                      {agent.category[0]}
                    </span>
                  )}
                </div>

                {/* Creator */}
                <div className="border-t border-slate-700 pt-3 mb-3">
                  <p className="text-xs text-slate-400">
                    By <span className="text-white font-semibold">{getCreatorName(agent.creator_id)}</span>
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-700">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>
                      {agent.average_rating.toFixed(1)} ({agent.rating_count})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4 text-indigo-400" />
                    <span>{agent.downloads_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <span>{agent.views_count}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-12">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700 transition"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg transition ${
                  page === currentPage
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700 transition"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
