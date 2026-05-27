'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Star, Download, TrendingUp, Clock, Eye, Filter, X } from 'lucide-react';
import { supabase } from '@/app/lib/supabase-client';

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
    fetchAgents();
  }, [selectedCategory, selectedSort, searchQuery]);

  const fetchAgents = async () => {
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
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter((agent) => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navbar */}
      <nav className="bg-slate-900/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
              AS
            </div>
            <h1 className="text-xl font-bold text-white">AgentStack</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/learn" className="text-slate-300 hover:text-white transition text-sm">
              Learn
            </Link>
            <Link href="/agents" className="text-white transition text-sm font-semibold">
              Browse
            </Link>
            <Link href="/auth/signup" className="text-slate-300 hover:text-white transition text-sm">
              Sign Up
            </Link>
            <Link href="/agents/upload" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm">
              Upload Agent
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
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
            <Search className="absolute left-4 top-3 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search agents by name, tags, or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
                <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
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
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {cat}
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
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                    setCurrentPage(1);
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
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
              className="text-blue-500 hover:text-blue-400 mt-4 inline-block"
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
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition mb-1">
                      {agent.title}
                    </h3>
                    {agent.verified && (
                      <span className="inline-block bg-blue-600/20 text-blue-300 text-xs px-2 py-1 rounded mb-2">
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
                      className="bg-slate-700/50 text-slate-300 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {agent.tags.length > 3 && (
                    <span className="bg-slate-700/50 text-slate-300 text-xs px-2 py-1 rounded">
                      +{agent.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Category Badge */}
                <div className="mb-4">
                  {agent.category.length > 0 && (
                    <span className="inline-block bg-blue-600/20 text-blue-300 text-xs px-2 py-1 rounded">
                      {agent.category[0]}
                    </span>
                  )}
                </div>

                {/* Creator */}
                <div className="border-t border-slate-700 pt-3 mb-3">
                  <p className="text-xs text-slate-400">
                    By <span className="text-slate-300 font-semibold">{getCreatorName(agent.creator_id)}</span>
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-700">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>
                      {agent.average_rating.toFixed(1)} ({agent.rating_count})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4 text-blue-500" />
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
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-50 hover:bg-slate-700 transition"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg transition ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-50 hover:bg-slate-700 transition"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
          <p>AgentStack — Discover and Share AI Agents</p>
        </div>
      </footer>
    </div>
  );
}
