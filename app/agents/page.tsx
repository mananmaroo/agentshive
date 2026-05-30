'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Star, Download, TrendingUp, Clock, Eye, Filter, X } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">Browse Agents</h1>
          <p className="text-lg text-amber-700">
            Discover {agents.length}+ AI agents created by the community
          </p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3 text-amber-600 w-5 h-5" />
            <input
              type="text"
              placeholder="Search agents by name, tags, or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-amber-300 rounded-lg pl-12 pr-4 py-3 text-amber-900 placeholder-amber-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 px-4 py-2 rounded-lg transition"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(selectedCategory || selectedSort !== 'trending') && (
                <span className="ml-2 bg-amber-600 text-white text-xs px-2 py-1 rounded">
                  {selectedCategory ? 1 : 0 + (selectedSort !== 'trending' ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-amber-100/50 border border-amber-300 rounded-lg p-6 space-y-4">
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-semibold text-amber-900 mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1 rounded-lg text-sm transition ${
                      selectedCategory === ''
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
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
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Filter */}
              <div>
                <h3 className="text-sm font-semibold text-amber-900 mb-3">Sort By</h3>
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
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
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
                  className="text-amber-700 hover:text-amber-800 text-sm flex items-center gap-1 font-semibold"
                >
                  <X className="w-4 h-4" />
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="text-amber-700 text-sm mb-6">
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
            <div className="text-amber-700">Loading agents...</div>
          </div>
        ) : paginatedAgents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-amber-700 text-lg">No agents found matching your criteria</p>
            <Link
              href="/agents/upload"
              className="text-amber-600 hover:text-amber-700 mt-4 inline-block font-semibold"
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
                className="bg-white border border-amber-200 rounded-lg p-6 hover:border-amber-400 shadow-sm hover:shadow-md transition group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-amber-900 group-hover:text-amber-600 transition mb-1">
                      {agent.title}
                    </h3>
                    {agent.verified && (
                      <span className="inline-block bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded mb-2">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-amber-700 text-sm mb-4 line-clamp-2">
                  {agent.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {agent.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {agent.tags.length > 3 && (
                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded">
                      +{agent.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Category Badge */}
                <div className="mb-4">
                  {agent.category.length > 0 && (
                    <span className="inline-block bg-amber-200 text-amber-900 text-xs px-2 py-1 rounded font-medium">
                      {agent.category[0]}
                    </span>
                  )}
                </div>

                {/* Creator */}
                <div className="border-t border-amber-200 pt-3 mb-3">
                  <p className="text-xs text-amber-700">
                    By <span className="text-amber-900 font-semibold">{getCreatorName(agent.creator_id)}</span>
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-amber-700 pt-3 border-t border-amber-200">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>
                      {agent.average_rating.toFixed(1)} ({agent.rating_count})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4 text-amber-600" />
                    <span>{agent.downloads_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-amber-700" />
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
              className="px-3 py-2 rounded-lg bg-amber-100 text-amber-900 disabled:opacity-50 hover:bg-amber-200 transition"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg transition ${
                  page === currentPage
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg bg-amber-100 text-amber-900 disabled:opacity-50 hover:bg-amber-200 transition"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
