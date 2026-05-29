'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, TrendingUp, Download } from 'lucide-react';
import { SharedNavbar } from '@/app/components/shared-navbar';
import { SharedFooter } from '@/app/components/shared-footer';

interface Agent {
  id: string;
  title: string;
  description: string;
  creator: { username: string };
  average_rating: number;
  rating_count: number;
  downloads_count: number;
  views_count: number;
  category: string[];
  verified: boolean;
}

export default function TopAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'rating' | 'downloads' | 'views'>('rating');

  useEffect(() => {
    const fetchTopAgents = async () => {
      try {
        const response = await fetch(`/api/agents?sortBy=${sortBy}&limit=20`);
        if (response.ok) {
          const data = await response.json();
          setAgents(data.agents);
        }
      } catch (error) {
        console.error('Failed to fetch top agents:', error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchTopAgents();
  }, [sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <SharedNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">
              Trending Agents
            </h1>
          </div>
          <p className="text-xl text-slate-400">
            Discover the most popular and highly-rated agents
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="text-slate-400">Sort by:</span>
          {(['rating', 'downloads', 'views'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-4 py-2 rounded-lg transition ${
                sortBy === option
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-slate-400">Loading trending agents...</div>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400">No agents found</div>
          </div>
        ) : (
          <div className="space-y-4">
            {agents.map((agent, index) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 hover:bg-slate-800/80 transition block group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-yellow-400 min-w-8">
                        #{index + 1}
                      </span>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">
                        {agent.title}
                      </h3>
                      {agent.verified && (
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mt-2">
                      by @{agent.creator.username}
                    </p>
                  </div>
                </div>

                <p className="text-slate-300 line-clamp-2 mb-4">
                  {agent.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-semibold">
                        {agent.average_rating.toFixed(1)}
                      </span>
                      <span className="text-slate-400 text-sm">
                        ({agent.rating_count})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300 text-sm">
                        {agent.downloads_count.toLocaleString()} downloads
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-300 text-sm">
                        {agent.views_count.toLocaleString()} views
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {agent.category.slice(0, 2).map((cat) => (
                      <span
                        key={cat}
                        className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded text-xs"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <SharedFooter />
    </div>
  );
}
