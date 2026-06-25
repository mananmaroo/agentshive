'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Upload, TrendingUp, Users, BookOpen, Zap, LogOut, ArrowRight, Star, Download, Terminal, Code, BarChart3, PenTool, FlaskConical, Headphones, GraduationCap, Briefcase } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { createClient } from '@supabase/supabase-js';

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface Agent {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  downloads_count: number;
  views_count: number;
  average_rating: number | null;
  rating_count: number;
  verified: boolean;
  created_at: string;
  category: string[];
}

interface Creator {
  id: string;
  username: string;
  avatar_url?: string;
}

// Landing Page Component (for logged-out users)
function LandingPage() {
  const [demoAgents, setDemoAgents] = useState<(Agent & { creator: Creator })[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ agents: number; downloads: number } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [agentsRes, downloadsRes] = await Promise.all([
          supabaseAnon.from('agents').select('id', { count: 'exact', head: true }),
          supabaseAnon.from('agents').select('downloads_count'),
        ]);
        const totalDownloads = (downloadsRes.data || []).reduce(
          (sum: number, a: { downloads_count: number }) => sum + (a.downloads_count || 0),
          0
        );
        setStats({
          agents: agentsRes.count || 0,
          downloads: totalDownloads,
        });
      } catch {
        // stats strip simply doesn't render if the fetch fails
      }
    };
    fetchStats();

    const fetchDemoAgents = async () => {
      try {
        // Fetch the 2 demo agents: Customer Feedback Distributor and AI Job Application Automation
        const { data: agents } = await supabaseAnon
          .from('agents')
          .select('*, creator:users(id, username, avatar_url)')
          .in('title', ['Customer Feedback Distributor', 'AI Job Application Automation'])
          .limit(2);

        if (agents && agents.length > 0) {
          setDemoAgents(agents as (Agent & { creator: Creator })[]);
        }
      } catch (error) {
        console.error('Failed to fetch demo agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDemoAgents();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section with Stars */}
      <section className="stars-bg min-h-screen flex flex-col items-center justify-center px-4 py-20 relative">
        <div className="max-w-4xl mx-auto text-center z-10 w-full">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight text-balance">
            The Free Library of <span className="bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">AI Agents</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-6 max-w-3xl mx-auto">
            Think of agents like apps for your AI. Each one gives ChatGPT or Claude a specific job —
            writing emails, doing research, organising files — and it just does it.
          </p>

          <p className="text-base text-slate-400 mb-10 max-w-2xl mx-auto">
            Browse free, ready-made agents. Copy one. Paste it into your AI. Done.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center flex-wrap mb-12">
            <Link
              href="/agents"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold transition inline-flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Browse Agents
            </Link>
            <Link
              href="/auth/signup"
              className="bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 px-8 py-4 rounded-lg font-semibold transition"
            >
              Sign Up Free
            </Link>
          </div>

          {/* Live stats */}
          {stats && stats.agents > 0 && (
            <div className="flex gap-8 md:gap-14 justify-center flex-wrap text-center">
              <div>
                <p className="text-3xl font-bold text-white">{stats.agents.toLocaleString()}+</p>
                <p className="text-sm text-slate-400">Agents</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.downloads.toLocaleString()}+</p>
                <p className="text-sm text-slate-400">Downloads</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">7</p>
                <p className="text-sm text-slate-400">Categories</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">100%</p>
                <p className="text-sm text-slate-400">Free & Open</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Demo Agents Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Popular Agent Automations</h2>

        {loading ? (
          <div className="text-center text-slate-400">Loading agents...</div>
        ) : demoAgents.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {demoAgents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="bg-slate-900 border border-slate-700 rounded-lg p-6 hover:border-indigo-500 transition group"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition mb-2">
                    {agent.title}
                  </h3>
                  {agent.verified && (
                    <span className="inline-block bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded text-xs font-semibold">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <p className="text-slate-400 mb-4 line-clamp-2">
                  {agent.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-indigo-400 fill-indigo-400" />
                      <span className="text-white font-semibold">{(agent.average_rating ?? 0).toFixed(1)}</span>
                      <span>({agent.rating_count})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4 text-indigo-400" />
                      <span>{agent.downloads_count.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="text-indigo-400">→</span>
                </div>

                <p className="text-xs text-slate-500 mt-4">
                  by @{agent.creator.username}
                </p>
              </Link>
            ))}
          </div>
        ) : null}

        {/* Feature Strip */}
        <div className="grid md:grid-cols-3 gap-6 my-20">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 text-center">
            <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Upload Any Format</h3>
            <p className="text-slate-400 text-sm">Markdown, n8n, code, or videos — works with any AI tool</p>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 text-center">
            <Star className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Star & Rate</h3>
            <p className="text-slate-400 text-sm">Help the community find the best agents</p>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 text-center">
            <BookOpen className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Learn & Improve</h3>
            <p className="text-slate-400 text-sm">Discover new techniques and best practices</p>
          </div>
        </div>
      </section>

      {/* Browse by Role */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white mb-3 text-center">What can agents do for you?</h2>
        <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
          Whatever your role, there&apos;s an agent that takes work off your plate. Pick yours.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Code,
              role: 'Developers',
              desc: 'Review code, generate tests, write commit messages, optimize Dockerfiles.',
              category: 'Code Generation',
            },
            {
              icon: BarChart3,
              role: 'Data Analysts',
              desc: 'Profile CSVs, analyze A/B tests, build cleaning pipelines, design dashboards.',
              category: 'Data Analysis',
            },
            {
              icon: PenTool,
              role: 'Marketers & Creators',
              desc: 'SEO blog posts, LinkedIn ghostwriting, YouTube scripts, content calendars.',
              category: 'Content Creation',
            },
            {
              icon: FlaskConical,
              role: 'Founders & Researchers',
              desc: 'Market sizing, competitor teardowns, due diligence, trend scouting.',
              category: 'Research',
            },
            {
              icon: Headphones,
              role: 'Support Teams',
              desc: 'Triage tickets, generate FAQs, detect churn risk, handle refunds consistently.',
              category: 'Customer Support',
            },
            {
              icon: Briefcase,
              role: 'Busy Professionals',
              desc: 'Meeting notes, inbox zero, expense reports, daily standups — on autopilot.',
              category: 'Automation',
            },
            {
              icon: GraduationCap,
              role: 'Students & Job Seekers',
              desc: 'Interview prep, flashcards, resume reviews, step-by-step tutoring.',
              category: 'Education',
            },
          ].map(({ icon: Icon, role, desc, category }) => (
            <Link
              key={role}
              href={`/agents?category=${encodeURIComponent(category)}`}
              className="bg-slate-900 border border-slate-700 rounded-lg p-6 hover:border-indigo-500 transition group"
            >
              <Icon className="w-8 h-8 text-indigo-400 mb-3" />
              <h3 className="text-white font-semibold mb-2 group-hover:text-indigo-400 transition">{role}</h3>
              <p className="text-slate-400 text-sm mb-4">{desc}</p>
              <span className="text-indigo-400 text-sm font-semibold inline-flex items-center gap-1">
                Browse agents <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Blog/Video Teaser */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Learn from the Community</h2>
        <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden hover:border-indigo-500 transition">
          <div className="grid md:grid-cols-2">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 h-48 md:h-auto flex items-center justify-center">
              <BookOpen className="w-20 h-20 text-indigo-300" />
            </div>
            <div className="p-8 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-white mb-3">
                Getting Started with AI Agents
              </h3>
              <p className="text-slate-400 mb-6">
                Learn how to build your own AI agents, step by step — from first setup to going live. Pick up handy tips along the way.
              </p>
              <Link
                href="/learn-videos"
                className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold transition w-fit"
              >
                Explore Tutorials <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-lg p-12 text-center border border-indigo-700">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join the community sharing agents
          </h2>
          <p className="text-indigo-200 mb-8 max-w-2xl mx-auto">
            Start uploading your agents, discovering new tools, and building with the community today.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/auth/signup"
              className="bg-white hover:bg-slate-100 text-indigo-900 px-8 py-3 rounded-lg font-semibold transition"
            >
              Create Account
            </Link>
            <Link
              href="/auth/login"
              className="bg-indigo-700 hover:bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Already a member? Log In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Home Page Component (for logged-in users)
function HomePage({ user }: { user: any }) {
  const [newestAgents, setNewestAgents] = useState<(Agent & { creator: Creator })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    router.push(q ? `/agents?q=${encodeURIComponent(q)}` : '/agents');
  };

  useEffect(() => {
    const fetchNewestAgents = async () => {
      try {
        const { data: agents } = await supabaseAnon
          .from('agents')
          .select('*, creator:users(id, username, avatar_url)')
          .order('created_at', { ascending: false })
          .limit(9);

        if (agents) {
          setNewestAgents(agents as (Agent & { creator: Creator })[]);
        }
      } catch (error) {
        console.error('Failed to fetch newest agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewestAgents();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Welcome Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="text-indigo-400">@{user.username}</span>
          </h1>
          <p className="text-slate-400">
            Discover the latest agents added to Agentshive
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-indigo-400 w-5 h-5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search agents..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </form>
      </section>

      {/* Newest Agents Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Newest Agents</h2>
          <Link href="/agents" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading agents...</div>
        ) : newestAgents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newestAgents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="bg-slate-900 border border-slate-700 rounded-lg p-6 hover:border-indigo-500 transition group flex flex-col"
              >
                <div className="flex-1">
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition pr-2">
                      {agent.title}
                    </h3>
                    {agent.verified && (
                      <span className="bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded text-xs font-semibold flex-shrink-0">
                        ✓
                      </span>
                    )}
                  </div>

                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {agent.description}
                  </p>
                </div>

                <div className="border-t border-slate-700 pt-4">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-indigo-400 fill-indigo-400" />
                        <span className="text-white font-semibold">{(agent.average_rating ?? 0).toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4 text-indigo-400" />
                        <span>{agent.downloads_count}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    by @{agent.creator.username}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-12">
            No agents found yet
          </div>
        )}
      </section>
    </div>
  );
}

// Main Component with Conditional Rendering
export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return user ? <HomePage user={user} /> : <LandingPage />;
}
