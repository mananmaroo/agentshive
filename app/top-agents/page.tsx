'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, TrendingUp, Download } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-8 h-8 text-amber-600" />
            <h1 className="text-4xl font-bold text-amber-900">
              Trending Agents
            </h1>
          </div>
          <p className="text-xl text-amber-700">
            Discover the most popular and highly-rated agents
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="text-amber-700 font-medium">Sort by:</span>
          {(['rating', 'downloads', 'views'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-4 py-2 rounded-lg transition ${
                sortBy === option
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-amber-700">Loading trending agents...</div>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-amber-700">No agents found</div>
          </div>
        ) : (
          <div className="space-y-4">
            {agents.map((agent, index) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="bg-white border border-amber-300 rounded-lg p-6 hover:border-amber-500 hover:bg-amber-50 transition block group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-amber-600 min-w-8">
                        #{index + 1}
                      </span>
                      <h3 className="text-xl font-bold text-amber-900 group-hover:text-amber-700 transition">
                        {agent.title}
                      </h3>
                      {agent.verified && (
                        <span className="bg-amber-200 text-amber-900 px-2 py-1 rounded text-xs font-semibold">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <p className="text-amber-700 text-sm mt-2">
                      by @{agent.creator.username}
                    </p>
                  </div>
                </div>

                <p className="text-amber-800 line-clamp-2 mb-4">
                  {agent.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-amber-900 font-semibold">
                        {agent.average_rating.toFixed(1)}
                      </span>
                      <span className="text-amber-700 text-sm">
                        ({agent.rating_count})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-800 text-sm">
                        {agent.downloads_count.toLocaleString()} downloads
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-800 text-sm">
                        {agent.views_count.toLocaleString()} views
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {agent.category.slice(0, 2).map((cat) => (
                      <span
                        key={cat}
                        className="bg-amber-100 text-amber-900 px-2 py-1 rounded text-xs font-medium"
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
    </div>
  );
}
