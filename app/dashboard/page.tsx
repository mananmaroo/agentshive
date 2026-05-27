'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/auth-context';
import { supabase } from '@/app/lib/supabase-client';
import {
  Download,
  Eye,
  Star,
  TrendingUp,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  ChevronLeft,
  Share2,
  Settings,
} from 'lucide-react';

interface Agent {
  id: string;
  title: string;
  description: string;
  category: string[];
  tags: string[];
  downloads_count: number;
  views_count: number;
  average_rating: number;
  rating_count: number;
  verified: boolean;
  created_at: string;
}

interface Stats {
  totalAgents: number;
  totalDownloads: number;
  totalViews: number;
  totalRatings: number;
  averageRating: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalAgents: 0,
    totalDownloads: 0,
    totalViews: 0,
    totalRatings: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login');
      } else {
        fetchCreatorData();
      }
    }
  }, [user, authLoading, router]);

  const fetchCreatorData = async () => {
    try {
      if (!user?.id) return;

      // Fetch user's agents
      const { data: userAgents, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (agentsError) throw agentsError;

      setAgents(userAgents || []);

      // Calculate statistics
      const totalDownloads = (userAgents || []).reduce(
        (sum, a) => sum + (a.downloads_count || 0),
        0
      );
      const totalViews = (userAgents || []).reduce(
        (sum, a) => sum + (a.views_count || 0),
        0
      );
      const totalRatings = (userAgents || []).reduce(
        (sum, a) => sum + (a.rating_count || 0),
        0
      );
      const averageRating =
        (userAgents || []).length > 0
          ? (userAgents || []).reduce((sum, a) => sum + (a.average_rating || 0), 0) /
            (userAgents || []).length
          : 0;

      setStats({
        totalAgents: userAgents?.length || 0,
        totalDownloads,
        totalViews,
        totalRatings,
        averageRating: parseFloat(averageRating.toFixed(1)),
      });
    } catch (error) {
      console.error('Error fetching creator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId);

      if (error) throw error;

      setAgents(agents.filter((a) => a.id !== agentId));
      alert('Agent deleted successfully');
    } catch (error: any) {
      alert(`Error deleting agent: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navbar */}
      <nav className="bg-slate-900/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-blue-500 hover:text-blue-400">
            <ChevronLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-xl font-bold text-white">Creator Dashboard</h1>
          <Link
            href="/profile"
            className="flex items-center gap-2 text-slate-300 hover:text-white"
          >
            <Settings className="w-5 h-5" />
            Profile
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back, @{user?.username}!</h2>
            <p className="text-slate-400">Here's an overview of your agent performance</p>
          </div>
          <Link
            href="/agents/upload"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            Upload New Agent
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-sm font-medium">Total Agents</p>
              <Plus className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalAgents}</p>
            <p className="text-xs text-slate-500 mt-2">Agent count</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-sm font-medium">Total Downloads</p>
              <Download className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalDownloads}</p>
            <p className="text-xs text-slate-500 mt-2">Across all agents</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-sm font-medium">Total Views</p>
              <Eye className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalViews}</p>
            <p className="text-xs text-slate-500 mt-2">Page views</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-sm font-medium">Avg Rating</p>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.averageRating}</p>
            <p className="text-xs text-slate-500 mt-2">
              {stats.totalRatings} ratings total
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 mb-12">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/agents/upload"
              className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg hover:border-blue-500 transition text-slate-300 hover:text-blue-400"
            >
              <Plus className="w-6 h-6 mb-2" />
              <p className="font-semibold">Upload New Agent</p>
              <p className="text-xs text-slate-500">Share your creation</p>
            </Link>
            <Link
              href="/agents"
              className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg hover:border-blue-500 transition text-slate-300 hover:text-blue-400"
            >
              <Eye className="w-6 h-6 mb-2" />
              <p className="font-semibold">View Your Agents</p>
              <p className="text-xs text-slate-500">See them live</p>
            </Link>
            <Link
              href="/learn"
              className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg hover:border-blue-500 transition text-slate-300 hover:text-blue-400"
            >
              <TrendingUp className="w-6 h-6 mb-2" />
              <p className="font-semibold">Learning Resources</p>
              <p className="text-xs text-slate-500">Improve your agents</p>
            </Link>
          </div>
        </div>

        {/* Agents Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h3 className="text-xl font-semibold text-white">Your Agents</h3>
          </div>

          {agents.length === 0 ? (
            <div className="p-12 text-center">
              <Plus className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-4">You haven't uploaded any agents yet</p>
              <Link
                href="/agents/upload"
                className="text-blue-500 hover:text-blue-400 font-semibold"
              >
                Upload your first agent →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr className="text-slate-300 text-sm font-medium">
                    <th className="px-6 py-3 text-left">Agent Name</th>
                    <th className="px-6 py-3 text-center">Downloads</th>
                    <th className="px-6 py-3 text-center">Views</th>
                    <th className="px-6 py-3 text-center">Rating</th>
                    <th className="px-6 py-3 text-center">Verified</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent, index) => (
                    <tr
                      key={agent.id}
                      className={`text-slate-300 border-t border-slate-700 hover:bg-slate-900/30 transition ${
                        index === agents.length - 1 ? '' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/agents/${agent.id}`}
                          className="text-white hover:text-blue-400 transition font-semibold block mb-1"
                        >
                          {agent.title}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {agent.category.join(', ')}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Download className="w-4 h-4 text-green-500" />
                          <span>{agent.downloads_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="w-4 h-4 text-purple-500" />
                          <span>{agent.views_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>
                            {agent.average_rating > 0
                              ? agent.average_rating.toFixed(1)
                              : '-'}
                          </span>
                          {agent.rating_count > 0 && (
                            <span className="text-xs text-slate-500">
                              ({agent.rating_count})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {agent.verified ? (
                          <span className="inline-flex items-center gap-1 bg-blue-600/20 text-blue-300 text-xs px-2 py-1 rounded">
                            <span>✓</span> Verified
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button
                          onClick={() =>
                            setActiveMenu(activeMenu === agent.id ? null : agent.id)
                          }
                          className="text-slate-400 hover:text-white transition"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenu === agent.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-lg z-50">
                            <Link
                              href={`/agents/${agent.id}`}
                              className="flex items-center gap-2 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 transition text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Agent
                            </Link>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `http://localhost:3000/agents/${agent.id}`
                                );
                                alert('Link copied!');
                              }}
                              className="w-full text-left flex items-center gap-2 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 transition text-sm"
                            >
                              <Share2 className="w-4 h-4" />
                              Copy Link
                            </button>
                            <button
                              onClick={() => handleDeleteAgent(agent.id)}
                              className="w-full text-left flex items-center gap-2 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-slate-800 transition text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Agent
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Breakdown */}
        {agents.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {/* Top Performing Agents */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top Downloads</h3>
              <div className="space-y-3">
                {[...agents]
                  .sort((a, b) => b.downloads_count - a.downloads_count)
                  .slice(0, 5)
                  .map((agent, index) => (
                    <div key={agent.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-blue-500 font-bold text-lg">#{index + 1}</span>
                        <p className="text-slate-300 truncate">{agent.title}</p>
                      </div>
                      <span className="text-green-400 font-semibold">
                        {agent.downloads_count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Highest Rated */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Highest Rated</h3>
              <div className="space-y-3">
                {[...agents]
                  .filter((a) => a.rating_count > 0)
                  .sort((a, b) => b.average_rating - a.average_rating)
                  .slice(0, 5)
                  .map((agent, index) => (
                    <div key={agent.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-yellow-500 font-bold text-lg">★</span>
                        <p className="text-slate-300 truncate">{agent.title}</p>
                      </div>
                      <span className="text-yellow-400 font-semibold">
                        {agent.average_rating.toFixed(1)} ({agent.rating_count})
                      </span>
                    </div>
                  ))}
                {agents.filter((a) => a.rating_count > 0).length === 0 && (
                  <p className="text-slate-500 text-sm">No ratings yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
          <p>AgentStack — Creator Dashboard</p>
        </div>
      </footer>
    </div>
  );
}
