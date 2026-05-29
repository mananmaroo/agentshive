'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Upload, TrendingUp, Users, BookOpen, Zap, LogOut } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading, signOut } = useAuth();

  const handleLogOut = async () => {
    await signOut();
    window.location.reload();
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
            <h1 className="text-xl font-bold text-white">Agentshive</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/learn" className="text-slate-300 hover:text-white transition text-sm">
              Learn
            </Link>
            <Link href="/agents" className="text-slate-300 hover:text-white transition text-sm">
              Browse
            </Link>
            {loading ? (
              <div className="text-slate-400 text-sm">Loading...</div>
            ) : user ? (
              <>
                <Link href="/profile" className="text-slate-300 hover:text-white transition text-sm">
                  @{user.username}
                </Link>
                <Link href="/agents/upload" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm">
                  Upload Agent
                </Link>
                <button
                  onClick={handleLogOut}
                  className="text-slate-300 hover:text-white transition text-sm flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signup" className="text-slate-300 hover:text-white transition text-sm">
                  Sign Up
                </Link>
                <Link href="/auth/login" className="text-slate-300 hover:text-white transition text-sm">
                  Log In
                </Link>
                <Link href="/agents/upload" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm">
                  Upload Agent
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Token Saving Banner */}
      <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-700/50 mx-4 mt-4 rounded-lg p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-amber-200 font-semibold">
            💰 <span className="text-amber-100">Save Tokens!</span> Download agent instruction files from AgentStack instead of rebuilding from scratch
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
            Discover & Share Claude Agents
          </h2>
          <p className="text-xl text-slate-400 mb-2">
            The open registry for AI automation. Claude, n8n, Codex, and beyond.
          </p>
          <p className="text-lg text-slate-500 mb-8">
            Upload, learn, and download agent templates • Save tokens • Build faster
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-3 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search agents by name, tags, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/agents" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">
              Browse Agents
            </Link>
            <Link href="/agents/upload" className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition">
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
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:border-blue-500 transition">
                <Icon className="w-6 h-6 text-blue-500 mb-3" />
                <h3 className="text-base font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Supported Formats Section */}
        <div className="mt-16 bg-slate-800/30 border border-slate-700 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Supported Agent Formats</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { name: 'Claude.md', icon: '🤖', color: 'blue' },
              { name: 'n8n Templates', icon: '⚙️', color: 'orange' },
              { name: 'Codex Agents', icon: '💻', color: 'purple' },
              { name: 'Tutorial Videos', icon: '🎥', color: 'red' },
              { name: 'Code Snippets', icon: '📝', color: 'green' },
            ].map((format, i) => (
              <div key={i} className="bg-slate-700/50 rounded-lg p-4 text-center hover:bg-slate-700 transition">
                <div className="text-3xl mb-2">{format.icon}</div>
                <p className="text-white font-semibold text-sm">{format.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 text-center">
          {[
            { number: '50+', label: 'Agents' },
            { number: '100+', label: 'Active Users' },
            { number: '1K+', label: 'Downloads' },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-4xl font-bold text-blue-500 mb-2">{stat.number}</p>
              <p className="text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
          <p>AgentStack — Open Registry for Claude Agents</p>
          <p className="text-sm mt-2">Built with Next.js, Supabase, and Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
