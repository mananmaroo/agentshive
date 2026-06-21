'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase-client';
import { useAuth } from '@/app/lib/auth-context';
import {
  Download,
  Star,
  Eye,
  Code,
  Globe,
  Send,
  Heart,
  ChevronLeft,
  Share2,
  Flag,
  Terminal,
  Lock,
} from 'lucide-react';

interface Agent {
  id: string;
  title: string;
  description: string;
  category: string[];
  tags: string[];
  creator_id: string;
  claude_md_file: string | null;
  repository_url: string | null;
  homepage_url: string | null;
  license: string;
  version: string;
  downloads_count: number;
  views_count: number;
  average_rating: number;
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

interface UserRating {
  rating: number;
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

  useEffect(() => {
    fetchAgentDetails();
  }, [agentId]);

  const fetchAgentDetails = async () => {
    try {
      // Fetch agent
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (agentError) throw agentError;
      setAgent(agentData);

      // Fetch creator
      const { data: creatorData } = await supabase
        .from('users')
        .select('*')
        .eq('id', agentData.creator_id)
        .single();

      setCreator(creatorData);

      // Fetch comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (commentsData) {
        // Fetch usernames for comments
        const userIds = [...new Set(commentsData.map((c) => c.user_id))];
        const { data: usersData } = await supabase
          .from('users')
          .select('id, username')
          .in('id', userIds);

        const userMap = new Map(usersData?.map((u) => [u.id, u.username]) || []);
        const enrichedComments = commentsData.map((c) => ({
          ...c,
          username: userMap.get(c.user_id) || 'Anonymous',
        }));

        setComments(enrichedComments);
      }

      // Fetch user rating if logged in
      if (user) {
        const { data: ratingData } = await supabase
          .from('ratings')
          .select('rating')
          .eq('agent_id', agentId)
          .eq('user_id', user.id)
          .single();

        if (ratingData) {
          setUserRating(ratingData.rating);
        }
      }

      // Increment view count
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

  const handleRating = async (rating: number) => {
    if (!user) {
      alert('Please log in to rate this agent');
      return;
    }

    setSubmittingRating(true);

    try {
      if (userRating) {
        // Update existing rating
        await supabase
          .from('ratings')
          .update({ rating })
          .eq('agent_id', agentId)
          .eq('user_id', user.id);
      } else {
        // Insert new rating
        await supabase.from('ratings').insert({
          agent_id: agentId,
          user_id: user.id,
          rating,
        });
      }

      setUserRating(rating);

      // Recalculate average rating
      const { data: allRatings } = await supabase
        .from('ratings')
        .select('rating')
        .eq('agent_id', agentId);

      if (allRatings && agent) {
        const avgRating =
          allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
        setAgent({
          ...agent,
          average_rating: avgRating,
          rating_count: allRatings.length,
        });
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please log in to comment');
      return;
    }

    if (!newComment.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    setSubmittingComment(true);

    try {
      const { data: commentData, error } = await supabase
        .from('comments')
        .insert({
          agent_id: agentId,
          user_id: user.id,
          content: newComment,
        })
        .select()
        .single();

      if (error) throw error;

      setComments([
        { ...commentData, username: user.username },
        ...comments,
      ]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
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
    const slug = (agent.title || 'agent').toLowerCase().replace(/[^a-z0-9-_]+/g, '-');
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
      // Fallback: open the raw file if the blob download fails.
      window.location.href = `/api/agents/${agent.id}/raw`;
    }
  };

  const [copied, setCopied] = useState(false);
  const [pasteCopied, setPasteCopied] = useState(false);
  const installUrl = typeof window !== 'undefined' && agent
    ? `${window.location.origin}/api/agents/${agent.id}/raw`
    : '';
  const fileSlug = (agent?.title || 'agent').toLowerCase().replace(/[^a-z0-9-_]+/g, '-');
  const curlCommand = `curl -fsSL ${installUrl} -o .claude/agents/${fileSlug}.md`;
  // No-curl: points the AI tool straight at the raw-markdown endpoint (a server route, not the SPA),
  // so it gets the real definition instead of an empty shell.
  const pasteCommand = `Fetch ${installUrl} — it returns the "${agent?.title || 'this'}" agent's Markdown. Save it as ${fileSlug}.md (in .claude/agents/ if that folder exists) and use it as an agent.`;

  const copyPaste = async () => {
    await navigator.clipboard.writeText(pasteCommand);
    setPasteCopied(true);
    setTimeout(() => setPasteCopied(false), 2000);
  };

  const copyInstall = async () => {
    await navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
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

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Link href="/agents" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
          <ChevronLeft className="w-5 h-5" />
          Back to Agents
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6 mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-2xl sm:text-4xl font-bold text-white break-words">{agent.title}</h1>
                {agent.verified && (
                  <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                    ✓ Verified
                  </span>
                )}
                {agent.featured && (
                  <span className="bg-yellow-600 text-white text-xs px-3 py-1 rounded-full">
                    ⭐ Featured
                  </span>
                )}
              </div>

              <p className="text-lg text-slate-400 mb-4">{agent.description}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-white font-semibold">{agent.average_rating.toFixed(1)}</p>
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

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {agent.tags.map((tag) => (
                  <span key={tag} className="bg-slate-700/50 text-slate-300 text-sm px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition h-fit whitespace-nowrap"
            >
              {user ? (
                <>
                  <Download className="w-5 h-5" />
                  Download
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Sign up to Download
                </>
              )}
            </button>
          </div>

          <p className="text-sm text-slate-500 mt-4">
            Portable definition — works with Claude Code, Codex, Cursor, Perplexity, n8n,
            LangChain &amp; any other LLM.
          </p>

          {/* Category & License */}
          <div className="flex gap-4 text-sm text-slate-400 border-t border-slate-700 pt-6">
            {agent.category.length > 0 && (
              <div>
                <p className="text-slate-500 text-xs uppercase">Category</p>
                <p className="text-white">{agent.category.join(', ')}</p>
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

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Links */}
            {(agent.repository_url || agent.homepage_url) && (
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Links</h2>
              <div className="space-y-3">
                {agent.repository_url && (
                  <a
                    href={agent.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-blue-500 hover:text-blue-400 p-3 bg-slate-900/50 rounded-lg transition"
                  >
                    <Code className="w-5 h-5" />
                    <span>View Repository</span>
                  </a>
                )}
                {agent.homepage_url && (
                  <a
                    href={agent.homepage_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-blue-500 hover:text-blue-400 p-3 bg-slate-900/50 rounded-lg transition"
                  >
                    <Globe className="w-5 h-5" />
                    <span>Homepage</span>
                  </a>
                )}
              </div>
            </div>
            )}

            {/* 1) Use it anywhere — no terminal needed */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-2">Use this agent — no terminal needed</h2>
              <p className="text-slate-400 text-sm mb-4">
                Copy this and paste it into your AI tool — Claude.ai / Cowork, Claude Code, Codex,
                ChatGPT, or Perplexity. It fetches the agent file and runs it for you.
              </p>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-start gap-3">
                <pre className="text-sm text-slate-200 flex-1 overflow-x-auto whitespace-pre-wrap break-words">{pasteCommand}</pre>
                <button
                  onClick={copyPaste}
                  className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-semibold transition"
                >
                  {pasteCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <details className="mt-4">
                <summary className="text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer">
                  Or paste the full definition manually
                </summary>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-300 mt-3">
                  <li>
                    <span className="font-semibold text-white">Get the definition:</span> click{' '}
                    <span className="text-indigo-300">Download</span> at the top, or open the{' '}
                    <a href={installUrl} className="text-indigo-400 hover:text-indigo-300 underline">raw file</a>{' '}
                    and copy all of it.
                  </li>
                  <li>
                    <span className="font-semibold text-white">Paste it as the instructions / system prompt</span> in your tool:
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-400">
                      <li><span className="text-slate-300">Claude.ai (incl. Cowork):</span> New Project → &quot;Project instructions&quot;.</li>
                      <li><span className="text-slate-300">Perplexity:</span> Space → &quot;AI instructions&quot;.</li>
                      <li><span className="text-slate-300">ChatGPT:</span> custom GPT → &quot;Instructions&quot; (or first message).</li>
                      <li><span className="text-slate-300">n8n / LangChain:</span> system prompt of your AI node.</li>
                    </ul>
                  </li>
                  <li><span className="font-semibold text-white">Then just ask</span> in plain English.</li>
                </ol>
              </details>
            </div>

            {/* 2) In a terminal */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-2">In a terminal (Claude Code, Codex, Cursor)</h2>
              <p className="text-slate-400 text-sm mb-4">
                Prefer the command line? This saves the agent to{' '}
                <code className="text-indigo-300">.claude/agents/</code> so your tool loads it every session.
              </p>
              {user ? (
                <>
                  <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-start gap-3">
                    <pre className="text-xs text-slate-300 flex-1 overflow-x-auto whitespace-pre-wrap break-all">{curlCommand}</pre>
                    <button
                      onClick={copyInstall}
                      className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-semibold transition"
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    Raw file URL: <a href={installUrl} className="text-indigo-400 hover:text-indigo-300 underline break-all">{installUrl}</a>
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

            {/* How to install & run (beginner-friendly) */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-1">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-semibold text-white">How to install &amp; run this agent</h2>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                New to this? Here&apos;s the whole thing in three steps — no experience needed.
              </p>

              {/* Pro account requirement */}
              <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-200/90">
                  <span className="font-semibold text-amber-300">A Pro account is required to run agents.</span>{' '}
                  Downloading the file here is free, but actually running it needs a paid plan on your AI tool —
                  a <span className="font-medium">Claude Pro or Max</span> plan for Claude Code, or a{' '}
                  <span className="font-medium">ChatGPT Plus</span> plan for Codex.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    n: 1,
                    title: 'Install Claude Code (or Codex) and sign in',
                    desc: 'Install the tool once, then sign in with your Pro/Max account.',
                    img: '/install/step1.png',
                    alt: 'Terminal installing Claude Code and signing in',
                  },
                  {
                    n: 2,
                    title: 'Add this agent',
                    desc: 'Copy the install command above and paste it into your terminal. It saves the agent into your .claude/agents/ folder.',
                    img: '/install/step2.png',
                    alt: 'Terminal downloading the agent file with curl',
                  },
                  {
                    n: 3,
                    title: 'Run it',
                    desc: 'Start your tool and just ask it to use the agent in plain English. That\'s it.',
                    img: '/install/step3.png',
                    alt: 'Terminal running the agent and showing the result',
                  },
                ].map((step) => (
                  <div key={step.n} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">
                      {step.n}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                      <p className="text-slate-400 text-sm mb-3">{step.desc}</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={step.img}
                        alt={step.alt}
                        loading="lazy"
                        className="w-full rounded-lg border border-slate-700"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-500 mt-5">
                Don&apos;t have a tool yet? Get{' '}
                <a href="https://claude.com/claude-code" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">Claude Code</a>{' '}
                or{' '}
                <a href="https://openai.com/codex" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">Codex</a>.
              </p>
            </div>

            {/* Rating Section */}
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
                        fill={
                          (hoverRating || userRating || 0) >= rating ? '#eab308' : 'none'
                        }
                        color={
                          (hoverRating || userRating || 0) >= rating ? '#eab308' : '#64748b'
                        }
                      />
                    </button>
                  ))}
                </div>
                {userRating && (
                  <p className="text-slate-400">
                    You rated: <span className="text-white font-semibold">{userRating}/5</span>
                  </p>
                )}
              </div>

              {!user && (
                <p className="text-sm text-slate-400">
                  <Link href="/auth/login" className="text-blue-500 hover:text-blue-400">
                    Log in
                  </Link>
                  {' '}to rate this agent
                </p>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Comments</h2>

              {/* Add Comment */}
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
                    <Link href="/auth/login" className="text-blue-500 hover:text-blue-400">
                      Log in
                    </Link>
                    {' '}to comment on this agent
                  </p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-white">{comment.username}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
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

          {/* Right Column - Creator Info */}
          <div className="lg:col-span-1">
            {creator && (
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-white mb-4">Creator</h3>

                <div className="flex items-center gap-3 mb-4">
                  {creator.avatar_url ? (
                    <img
                      src={creator.avatar_url}
                      alt={creator.username}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {creator.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-white">{creator.username}</p>
                    <p className="text-xs text-slate-400">
                      Joined {new Date(creator.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {creator.bio && (
                  <p className="text-slate-300 text-sm mb-4">{creator.bio}</p>
                )}

                <Link
                  href={`/creators/${creator.id}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-center transition block"
                >
                  View Creator
                </Link>

                {/* Agent Info */}
                <div className="mt-6 pt-6 border-t border-slate-700 space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Created</p>
                    <p className="text-white text-sm">
                      {new Date(agent.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Last Updated</p>
                    <p className="text-white text-sm">
                      {new Date(agent.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Report Button */}
                <button className="w-full mt-6 flex items-center justify-center gap-2 text-red-400 hover:text-red-300 py-2 border border-red-600/30 rounded-lg transition">
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
          <p>Agentshive — Discover and Share AI Agents</p>
        </div>
      </footer>
    </div>
  );
}
