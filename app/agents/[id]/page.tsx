'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase-client';
import { useAuth } from '@/app/lib/auth-context';
import { sortBadges, BadgeChip } from '@/app/lib/badges';
import {
  Download,
  Star,
  Eye,
  Code,
  Globe,
  Send,
  Heart,
  ChevronLeft,
  Flag,
  Terminal,
  Lock,
} from 'lucide-react';

interface Agent {
  id: string;
  title: string;
  description: string;
  category: string[] | null;
  tags: string[] | null;
  creator_id: string;
  repository_url: string | null;
  homepage_url: string | null;
  license: string;
  version: string;
  downloads_count: number;
  views_count: number;
  average_rating: number | null;
  rating_count: number;
  verified: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

interface Creator {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  badges: string[] | null;
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  upvotes: number;
  username?: string;
}

export default function AgentDetail() {
  const params = useParams();
  const agentId = params.id as string;
  const { user } = useAuth();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pasteCopied, setPasteCopied] = useState(false);
  const [rawMd, setRawMd] = useState('');

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        const { data: agentData, error: agentError } = await supabase
          .from('agents')
          .select('*')
          .eq('id', agentId)
          .single();

        if (agentError) throw agentError;
        setAgent(agentData);

        fetch(`/api/agents/${agentId}/raw`)
          .then((r) => (r.ok ? r.text() : null))
          .then((t) => setRawMd(t || agentData.description || agentData.title))
          .catch(() => setRawMd(agentData.description || agentData.title));

        const { data: creatorData } = await supabase
          .from('users')
          .select('*')
          .eq('id', agentData.creator_id)
          .single();
        setCreator(creatorData);

        const { data: commentsData } = await supabase
          .from('comments')
          .select('*')
          .eq('agent_id', agentId)
          .order('created_at', { ascending: false });

        if (commentsData?.length) {
          const userIds = [...new Set(commentsData.map((c) => c.user_id))];
          const { data: usersData } = await supabase
            .from('users')
            .select('id, username')
            .in('id', userIds);
          const userMap = new Map(usersData?.map((u) => [u.id, u.username]));
          setComments(commentsData.map((c) => ({
            ...c,
            username: userMap.get(c.user_id) || 'Anonymous',
          })));
        }

        if (user) {
          const { data: ratingData } = await supabase
            .from('ratings')
            .select('rating')
            .eq('agent_id', agentId)
            .eq('user_id', user.id)
            .single();
          if (ratingData) setUserRating(ratingData.rating);
        }

        await supabase
          .from('agents')
          .update({ views_count: (agentData.views_count || 0) + 1 })
          .eq('id', agentId);
      } catch (error) {
        console.error('Failed to fetch agent details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentDetails();
  }, [agentId, user]);

  const handleRating = async (rating: number) => {
    if (!user) { alert('Please log in to rate this agent'); return; }
    setSubmittingRating(true);
    try {
      if (userRating) {
        await supabase.from('ratings').update({ rating }).eq('agent_id', agentId).eq('user_id', user.id);
      } else {
        await supabase.from('ratings').insert({ agent_id: agentId, user_id: user.id, rating });
      }
      setUserRating(rating);
      const { data: allRatings } = await supabase.from('ratings').select('rating').eq('agent_id', agentId);
      if (allRatings && agent) {
        const avg = allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length;
        setAgent({ ...agent, average_rating: avg, rating_count: allRatings.length });
      }
    } catch {
      alert('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { alert('Please log in to comment'); return; }
    setSubmittingComment(true);
    try {
      const { data: commentData, error } = await supabase
        .from('comments')
        .insert({ agent_id: agentId, user_id: user.id, content: newComment })
        .select()
        .single();
      if (error) throw error;
      setComments([{ ...commentData, username: (user as any).username }, ...comments]);
      setNewComment('');
    } catch {
      alert('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDownload = async () => {
    if (!agent) return;
    if (!user) {
      window.location.href = `/auth/signup?redirect=${encodeURIComponent(`/agents/${agent.id}`)}`;
      return;
    }
    const slug = agent.title.toLowerCase().replace(/[^a-z0-9-_]+/g, '-');
    try {
      const res = await fetch(`/api/agents/${agent.id}/raw`);
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.location.href = `/api/agents/${agent.id}/raw`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading agent details...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <nav className="bg-slate-900/50 border-b border-slate-700 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/agents" className="flex items-center gap-2 text-blue-500 hover:text-blue-400">
              <ChevronLeft className="w-5 h-5" />
              Back to Agents
            </Link>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-slate-400 text-lg">Agent not found</p>
        </div>
      </div>
    );
  }

  const fileSlug = agent.title.toLowerCase().replace(/[^a-z0-9-_]+/g, '-');
  const installUrl = `${window.location.origin}/api/agents/${agent.id}/raw`;
  const curlCommand = `curl -fsSL ${installUrl} -o .claude/agents/${fileSlug}.md`;
  // Show the full-markdown command once loaded; fall back to the fetch-URL
  // command immediately (robots.txt now allows /api/agents/ so AI tools can fetch it).
  const pasteCommand = rawMd
    ? `Create a file named ${fileSlug}.md (in .claude/agents/ if that folder exists) with exactly the content below, then act as this agent:\n\n${rawMd}`
    : null;

  const tags = agent.tags ?? [];
  const categories = agent.category ?? [];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Link href="/agents" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
          <ChevronLeft className="w-5 h-5" />
          Back to Agents
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6 mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-2xl sm:text-4xl font-bold text-white break-words">{agent.title}</h1>
                {agent.verified && (
                  <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">✓ Verified</span>
                )}
                {agent.featured && (
                  <span className="bg-yellow-600 text-white text-xs px-3 py-1 rounded-full">⭐ Featured</span>
                )}
              </div>

              <p className="text-lg text-slate-400 mb-4">{agent.description}</p>

              <div className="flex flex-wrap gap-8 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-white font-semibold">{(agent.average_rating ?? 0).toFixed(1)}</p>
                    <p className="text-sm text-slate-400">({agent.rating_count} ratings)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-white font-semibold">{agent.downloads_count}</p>
                    <p className="text-sm text-slate-400">Downloads</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-white font-semibold">{agent.views_count}</p>
                    <p className="text-sm text-slate-400">Views</p>
                  </div>
                </div>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map((tag) => (
                    <span key={tag} className="bg-slate-700/50 text-slate-300 text-sm px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleDownload}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition h-fit whitespace-nowrap"
            >
              {user ? (
                <><Download className="w-5 h-5" /> Download</>
              ) : (
                <><Lock className="w-5 h-5" /> Sign up to Download</>
              )}
            </button>
          </div>

          <p className="text-sm text-slate-500 mt-4">
            Works with ChatGPT, Claude, Perplexity, and any other AI tool — no coding required.
          </p>

          <div className="flex gap-4 text-sm text-slate-400 border-t border-slate-700 pt-6">
            {categories.length > 0 && (
              <div>
                <p className="text-slate-500 text-xs uppercase">Category</p>
                <p className="text-white">{categories.join(', ')}</p>
              </div>
            )}
            <div>
              <p className="text-slate-500 text-xs uppercase">License</p>
              <p className="text-white">{agent.license}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase">Version</p>
              <p className="text-white">{agent.version}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">

            {/* ── STEP 1: Paste into ChatGPT / Claude (easiest, shown first) ── */}
            <div className="bg-indigo-950/40 border border-indigo-700/50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded">Easiest way</span>
              </div>
              <h2 className="text-xl font-semibold text-white mt-2 mb-1">Copy and paste into any AI chat</h2>
              <p className="text-slate-400 text-sm mb-4">
                Works with <strong className="text-white">ChatGPT, Claude.ai, Perplexity</strong> — no downloads, no setup.
                Just copy this, open your AI chat, and paste it in as your first message.
              </p>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-start gap-3">
                <pre className="text-xs text-slate-200 flex-1 overflow-auto max-h-60 whitespace-pre-wrap break-words">
                  {pasteCommand ?? 'Fetching instructions…'}
                </pre>
                <button
                  disabled={!pasteCommand}
                  onClick={async () => {
                    if (!pasteCommand) return;
                    await navigator.clipboard.writeText(pasteCommand);
                    setPasteCopied(true);
                    setTimeout(() => setPasteCopied(false), 2000);
                  }}
                  className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-bold transition"
                >
                  {pasteCopied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                After pasting, just talk to the AI normally — it will follow this agent&apos;s instructions.
              </p>
            </div>

            {/* ── Where to paste it ── */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-1">Where to paste it</h2>
              <p className="text-slate-400 text-sm mb-4">
                Paste the copied text into one of these AI tools and it becomes your personal assistant for this task.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    app: '💬 ChatGPT',
                    steps: 'Open ChatGPT → start a new chat → paste as your first message. Or go to "Explore GPTs" → "Create" → paste into Instructions.',
                  },
                  {
                    app: '🤖 Claude.ai',
                    steps: 'Open Claude → click "New Project" → find "Project instructions" → paste it there. Then chat normally in that project.',
                  },
                  {
                    app: '🔍 Perplexity',
                    steps: 'Open Perplexity → click "Spaces" → create a Space → paste into "AI instructions". Works great for research agents.',
                  },
                ].map((d) => (
                  <div key={d.app} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <p className="text-white font-semibold text-sm mb-2">{d.app}</p>
                    <p className="text-slate-400 text-xs leading-relaxed">{d.steps}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            {(agent.repository_url || agent.homepage_url) && (
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Links</h2>
                <div className="space-y-3">
                  {agent.repository_url && (
                    <a href={agent.repository_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-blue-500 hover:text-blue-400 p-3 bg-slate-900/50 rounded-lg transition">
                      <Code className="w-5 h-5" />
                      <span>View Repository</span>
                    </a>
                  )}
                  {agent.homepage_url && (
                    <a href={agent.homepage_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-blue-500 hover:text-blue-400 p-3 bg-slate-900/50 rounded-lg transition">
                      <Globe className="w-5 h-5" />
                      <span>Homepage</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* ── For power users: terminal install ── */}
            <details className="bg-slate-800/30 border border-slate-700 rounded-lg">
              <summary className="p-6 cursor-pointer text-slate-400 hover:text-white text-sm font-semibold select-none">
                <Terminal className="w-4 h-4 inline mr-2 text-indigo-400" />
                For developers — install via terminal (Claude Code, Cursor, Codex)
              </summary>
              <div className="px-6 pb-6">
                <p className="text-slate-400 text-sm mb-4">
                  This saves the agent permanently into your AI coding tool so it&apos;s always available.
                </p>
                {user ? (
                  <>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-start gap-3">
                      <pre className="text-xs text-slate-300 flex-1 overflow-x-auto whitespace-pre-wrap break-all">{curlCommand}</pre>
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(curlCommand);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-semibold transition"
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                      Raw file: <a href={installUrl} className="text-indigo-400 hover:text-indigo-300 underline break-all">{installUrl}</a>
                    </p>
                  </>
                ) : (
                  <div className="relative bg-slate-900 border border-slate-700 rounded-lg p-3 overflow-hidden">
                    <pre className="text-xs text-slate-500 blur-sm select-none whitespace-pre-wrap break-all" aria-hidden="true">
                      curl -fsSL https://agentshive.net/api/agents/••••••••/raw -o .claude/agents/agent.md
                    </pre>
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60">
                      <Link
                        href={`/auth/signup?redirect=${encodeURIComponent(`/agents/${agent.id}`)}`}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        <Lock className="w-4 h-4" />
                        Sign up free to get the install command
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </details>

            {/* Rating */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Rate This Agent</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRating(rating)}
                      onMouseEnter={() => setHoverRating(rating)}
                      onMouseLeave={() => setHoverRating(0)}
                      disabled={submittingRating}
                      className="transition disabled:opacity-50"
                    >
                      <Star
                        className="w-8 h-8"
                        fill={(hoverRating || userRating || 0) >= rating ? '#eab308' : 'none'}
                        color={(hoverRating || userRating || 0) >= rating ? '#eab308' : '#64748b'}
                      />
                    </button>
                  ))}
                </div>
                {userRating && (
                  <p className="text-slate-400">You rated: <span className="text-white font-semibold">{userRating}/5</span></p>
                )}
              </div>
              {!user && (
                <p className="text-sm text-slate-400">
                  <Link href="/auth/login" className="text-blue-500 hover:text-blue-400">Log in</Link>{' '}
                  to rate this agent
                </p>
              )}
            </div>

            {/* Comments */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Comments</h2>
              {user ? (
                <form onSubmit={handleAddComment} className="mb-8">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts about this agent..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none mb-3"
                    rows={3}
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Post Comment
                  </button>
                </form>
              ) : (
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-8 text-center">
                  <p className="text-slate-400">
                    <Link href="/auth/login" className="text-blue-500 hover:text-blue-400">Log in</Link>{' '}
                    to comment on this agent
                  </p>
                </div>
              )}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-white">{comment.username}</p>
                        <p className="text-xs text-slate-400">{new Date(comment.created_at).toLocaleDateString()}</p>
                      </div>
                      <p className="text-slate-300 mb-3">{comment.content}</p>
                      <button className="flex items-center gap-1 text-slate-400 hover:text-slate-300 transition text-sm">
                        <Heart className="w-4 h-4" />
                        {comment.upvotes}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar — Creator */}
          <div className="lg:col-span-1">
            {creator && (
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-white mb-4">Creator</h3>
                <div className="flex items-center gap-3 mb-4">
                  {creator.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={creator.avatar_url} alt={creator.username} className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {creator.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white">{creator.username}</p>
                      {sortBadges(creator.badges || []).map((b) => (
                        <BadgeChip key={b} id={b} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">Joined {new Date(creator.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {creator.bio && <p className="text-slate-300 text-sm mb-4">{creator.bio}</p>}
                <Link
                  href={`/@${creator.username}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-center transition block"
                >
                  View Creator
                </Link>
                <div className="mt-6 pt-6 border-t border-slate-700 space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Created</p>
                    <p className="text-white text-sm">{new Date(agent.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Last Updated</p>
                    <p className="text-white text-sm">{new Date(agent.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="w-full mt-6 flex items-center justify-center gap-2 text-red-400 hover:text-red-300 py-2 border border-red-600/30 rounded-lg transition">
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-700 bg-slate-900/50 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
          <p>Agentshive — Discover and Share AI Agents</p>
        </div>
      </footer>
    </div>
  );
}
