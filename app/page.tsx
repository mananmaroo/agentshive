'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Upload, TrendingUp, Users, BookOpen, Zap, LogOut } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ agents: 0, users: 0, downloads: 0 });
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/agents?limit=1000');
        if (res.ok) {
          const data = await res.json();
          const totalDownloads = data.agents?.reduce((sum: number, a: any) => sum + (a.downloads_count || 0), 0) || 0;
          setStats({
            agents: data.total || 0,
            users: 1000, // placeholder
            downloads: totalDownloads
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  const handleLogOut = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-amber-50 to-orange-50">
      {/* Navbar */}
      <nav className="bg-amber-50/95 border-b border-amber-200 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-800 to-amber-600 bg-clip-text text-transparent">Agentshive</h1>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-amber-900 hover:text-amber-700 transition text-sm font-medium">
              Home
            </Link>
            <Link href="/learn-videos" className="text-amber-900 hover:text-amber-700 transition text-sm">
              Videos
            </Link>
            <Link href="/agents" className="text-amber-900 hover:text-amber-700 transition text-sm">
              Browse
            </Link>
            {loading ? (
              <div className="text-amber-700 text-sm">Loading...</div>
            ) : user ? (
              <>
                <Link href="/profile" className="text-amber-900 hover:text-amber-700 transition text-sm">
                  @{user.username}
                </Link>
                <Link href="/agents/upload" className="bg-amber-600 hover:bg-amber-700 text-amber-900 px-4 py-2 rounded-lg transition text-sm">
                  Upload
                </Link>
                <button
                  onClick={handleLogOut}
                  className="text-amber-900 hover:text-amber-700 transition text-sm flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signup" className="text-amber-900 hover:text-amber-700 transition text-sm">
                  Sign Up
                </Link>
                <Link href="/auth/login" className="text-amber-900 hover:text-amber-700 transition text-sm">
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Token Saving Banner */}
      <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 mx-4 mt-4 rounded-lg p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-700 flex-shrink-0" />
          <p className="text-amber-900 font-semibold">
            💰 <span className="text-amber-800">Save Tokens!</span> Download agent instruction files from Agentshive instead of rebuilding from scratch
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-amber-900 mb-4">
            Discover & Share Claude Agents
          </h2>
          <p className="text-xl text-amber-700 mb-2">
            The open registry for AI automation. Claude, n8n, Codex, and beyond.
          </p>
          <p className="text-lg text-amber-600 mb-8">
            Upload, learn, and download agent templates • Save tokens • Build faster
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-3 text-amber-600 w-5 h-5" />
              <input
                type="text"
                placeholder="Search agents by name, tags, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-amber-300 rounded-lg pl-12 pr-4 py-3 text-amber-900 placeholder-amber-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/agents" className="bg-amber-600 hover:bg-amber-700 text-amber-900 px-6 py-3 rounded-lg font-semibold transition">
              Browse Agents
            </Link>
            <Link href="/agents/upload" className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-6 py-3 rounded-lg font-semibold transition">
              Upload Your Agent
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-20">
          {[
            {
              icon: TrendingUp,
              title: 'Trending Agents',
              description: 'Most downloaded & highest-rated agents',
            },
            {
              icon: BookOpen,
              title: 'Learn to Build',
              description: 'Step-by-step guides on creating agents',
            },
            {
              icon: Upload,
              title: 'Multi-Format Upload',
              description: 'Claude.md, n8n templates, videos, code',
            },
            {
              icon: Users,
              title: 'Community Driven',
              description: 'Share, feedback, and collaborate',
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="bg-amber-100/50 border border-amber-300 rounded-lg p-5 hover:border-amber-500 transition">
                <Icon className="w-6 h-6 text-amber-600 mb-3" />
                <h3 className="text-base font-semibold text-amber-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-amber-700">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Supported Formats Section */}
        <div className="mt-16 bg-amber-100/30 border border-amber-300 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-amber-900 mb-6 text-center">Supported Agent Formats</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { name: 'Claude.md', icon: '🤖', color: 'blue' },
              { name: 'n8n Templates', icon: '⚙️', color: 'orange' },
              { name: 'Codex Agents', icon: '💻', color: 'purple' },
              { name: 'Tutorial Videos', icon: '🎥', color: 'red' },
              { name: 'Code Snippets', icon: '📝', color: 'green' },
            ].map((format, i) => (
              <div key={i} className="bg-amber-200/50 rounded-lg p-4 text-center hover:bg-amber-300 transition">
                <div className="text-3xl mb-2">{format.icon}</div>
                <p className="text-amber-900 font-semibold text-sm">{format.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 text-center">
          <div>
            <p className="text-4xl font-bold text-amber-600 mb-2">{stats.agents}</p>
            <p className="text-amber-700">Agents</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-amber-600 mb-2">1000+</p>
            <p className="text-amber-700">Active Users</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-amber-600 mb-2">{stats.downloads.toLocaleString()}</p>
            <p className="text-amber-700">Downloads</p>
          </div>
        </div>
      </section>

      {/* Trending Agents Section */}
      <section className="max-w-7xl mx-auto px-4 mt-20 mb-20">
        <h2 className="text-3xl font-bold text-amber-900 mb-8 text-center">Trending Agents</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Placeholder for trending agents - fetched from API */}
          <p className="text-center text-amber-700 col-span-full">Browse our collection of trending agents →</p>
          <Link href="/top-agents" className="bg-amber-100 border border-amber-300 rounded-lg p-6 hover:border-amber-500 transition text-center">
            <p className="text-amber-900 font-semibold">View All Trending Agents</p>
          </Link>
        </div>
      </section>

      {/* Support Section */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-amber-900 mb-4 text-center">Support Agentshive</h2>
          <p className="text-amber-800 text-center mb-6">Our servers cost $250/month to run. Help us keep the platform alive!</p>
          <div className="flex justify-center gap-4">
            <Link href="/support" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition">
              Learn More
            </Link>
            <a href="https://buymeacoffee.com" target="_blank" rel="noopener noreferrer" className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-6 py-2 rounded-lg transition border border-amber-300">
              Buy Me a Coffee
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-300 bg-amber-50 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-amber-800">
          <p className="font-semibold">Agentshive — Open Registry for Claude Agents</p>
          <p className="text-sm mt-2">Built with Next.js, Supabase, and Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
