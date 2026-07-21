'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Upload, TrendingUp, Users, BookOpen, Zap, LogOut, ArrowRight, Star, Download, Terminal, Code, BarChart3, PenTool, FlaskConical, Headphones, GraduationCap, Briefcase } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { supabaseAnon } from '@/app/lib/supabase-anon';

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
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="grid min-h-[82vh] lg:grid-cols-2">
        <Link
          href="/agents"
          className="group flex min-h-[420px] flex-col justify-between border-b border-slate-800 bg-[radial-gradient(circle_at_top_left,#312e81_0%,#020617_56%)] p-8 transition hover:bg-slate-900 sm:p-14 lg:border-b-0 lg:border-r"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-200">
              <Zap className="h-4 w-4" />
              Free community library
            </div>
            <h1 className="mt-8 max-w-xl text-4xl font-bold leading-tight sm:text-6xl">
              Explore AI Agents
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Discover ready-made agents for ChatGPT, Claude, and other AI tools. Copy one,
              customise it, and put it to work.
            </p>
          </div>
          <span className="mt-10 inline-flex items-center gap-2 text-lg font-semibold text-indigo-300">
            Enter the agent library
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          href="/employees"
          className="group flex min-h-[420px] flex-col justify-between bg-[radial-gradient(circle_at_top_right,#064e3b_0%,#020617_56%)] p-8 transition hover:bg-slate-900 sm:p-14"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
              <Briefcase className="h-4 w-4" />
              Built for Indian businesses
            </div>
            <h2 className="mt-8 max-w-xl text-4xl font-bold leading-tight sm:text-6xl">
              Hire AI Employees
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Meet AI employees for coaching admissions and everyday lead follow-up—designed
              for English, Hindi, Hinglish, and local language preferences.
            </p>
          </div>
          <span className="mt-10 inline-flex items-center gap-2 text-lg font-semibold text-emerald-300">
            Explore business employees
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </span>
        </Link>
      </section>

      <section className="border-t border-slate-800 bg-slate-900/40 px-4 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-semibold">One AgentsHive, two ways to work with AI.</p>
            <p className="mt-1 text-sm text-slate-400">
              Community agents remain free. Business employees are being introduced through a controlled pilot.
            </p>
          </div>
          <div className="flex gap-5 text-sm font-semibold">
            <Link href="/agents" className="text-indigo-300 hover:text-indigo-200">
              AI Agents
            </Link>
            <Link href="/employees" className="text-emerald-300 hover:text-emerald-200">
              AI Employees
            </Link>
          </div>
        </div>
      </section>
    </main>
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
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/agents');
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
              placeholder="Search agents, prompts, companions..."
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
