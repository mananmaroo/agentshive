'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Star,
  Download,
  Eye,
  Terminal,
  Plus,
  ArrowRight,
  Bot,
  Plug,
  RefreshCw,
} from 'lucide-react';
import { supabaseAnon as supabase } from '@/app/lib/supabase-anon';
import { useAuth } from '@/app/lib/auth-context';

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

// Platforms an official companion is verified to run on.
type Platform = 'Claude' | 'OpenAI' | 'Perplexity';

// Every official companion uses the same rich card shape, so they all look
// identical: a one-line plain tagline, four "what it does" bullets, and what
// it needs to run. All are made by the Agentshive team.
type Companion = {
  file: string;
  title: string;
  tagline: string;
  does: string[];
  needs: string;
  platforms: Platform[];
  mcps: string[];       // MCP servers to connect
  loop: string;         // recommended run cadence
};

const companions: Companion[] = [
  {
    file: 'personal-assistant-local-terminal.md',
    title: 'Personal Assistant — Local Notes',
    tagline: 'It handles your email, calendar, and to-dos, with notes kept on your own computer.',
    does: [
      'Turns new email into a to-do list',
      'Gives a daily plan of tasks and news',
      'Writes replies you approve before sending',
      'Adds calendar events when you confirm',
    ],
    needs: 'Gmail + Google Calendar + local files',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Gmail', 'Google Calendar', 'Filesystem'],
    loop: 'Every morning',
  },
  {
    file: 'personal-assistant-notion-terminal.md',
    title: 'Personal Assistant — Notion',
    tagline: 'The same assistant, but it keeps your to-dos and notes in Notion.',
    does: [
      'Saves new email into a Notion list',
      'Keeps your inbox and tasks in Notion',
      'Writes replies you approve first',
      'Turns notes into replies and events',
    ],
    needs: 'Notion + Gmail + Google Calendar',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Gmail', 'Google Calendar', 'Notion'],
    loop: 'Every morning',
  },
  {
    file: 'document-visualizer-terminal.md',
    title: 'Document Visualizer',
    tagline: 'It turns a document into slides — your highlights plus a full, polished deck.',
    does: [
      'Finds the parts you highlighted',
      'Builds a short highlights slide deck',
      'Also builds a full, professional deck',
      'Keeps one clear idea per slide',
    ],
    needs: 'Local files only — no extra tools',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Filesystem', 'Google Drive (optional)'],
    loop: 'Per document / batch nightly',
  },
  {
    file: 'smart-coder.md',
    title: 'Smart Coder',
    tagline: 'A coding helper that remembers where it left off and picks up right away.',
    does: [
      'Reads a handoff note before starting',
      'Figures out the project and next step',
      'Writes an end-of-day handoff note',
      'Keeps replies short to save tokens',
    ],
    needs: 'Nothing extra — runs anywhere',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Filesystem', 'GitHub (optional)', 'Slack (optional)'],
    loop: 'Start & end of every session',
  },
  {
    file: 'academic-paper-summarizer-terminal.md',
    title: 'Academic Paper Summarizer',
    tagline: 'It finds a research paper and writes you an easy summary of what it found.',
    does: [
      'Finds and opens the paper to read',
      'Reads the full text, not just abstract',
      'Writes summaries at three depths',
      'Checks the key citations are real',
    ],
    needs: 'Playwright (browser) to fetch papers',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Playwright', 'Filesystem', 'Notion (optional)'],
    loop: 'Per paper / weekly reading list',
  },
  {
    file: 'ai-job-application-automation-terminal.md',
    title: 'AI Job Application Automation',
    tagline: 'It searches job boards, tailors your resume, and helps you apply.',
    does: [
      'Searches job boards for matches',
      'Reads and filters job descriptions',
      'Tailors resume and cover-letter files',
      'Logs to a sheet, applies with approval',
    ],
    needs: 'Playwright (browser)',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Playwright', 'Filesystem', 'Gmail (optional)'],
    loop: 'Every morning',
  },
  {
    file: 'calendar-scheduling-assistant-terminal.md',
    title: 'Calendar Scheduling Assistant',
    tagline: 'It finds a meeting time that works for everyone and sends the invite.',
    does: [
      'Collects people, time zones, limits',
      "Reads everyone's free and busy times",
      'Ranks the best meeting slots',
      'Creates the invite after you confirm',
    ],
    needs: 'Google Calendar or Playwright (browser)',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Google Calendar', 'Playwright'],
    loop: 'On demand',
  },
  {
    file: 'competitor-analysis-agent-terminal.md',
    title: 'Competitor Analysis Agent',
    tagline: "It studies your rivals' products and finds gaps you can win.",
    does: [
      'Confirms which rivals to study',
      'Reads their prices and features',
      'Mines reviews for praise and gripes',
      'Writes a comparison and gaps report',
    ],
    needs: 'Playwright (browser)',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Playwright', 'Filesystem', 'Notion (optional)'],
    loop: 'Monthly',
  },
  {
    file: 'customer-feedback-distributor-terminal.md',
    title: 'Customer Feedback Distributor',
    tagline: 'It sorts customer feedback and sends each note to the right team.',
    does: [
      'Reads incoming feedback',
      'Sorts by type, urgency, and mood',
      'Drafts a Slack message per item',
      'Posts to the right channel on approval',
    ],
    needs: 'Slack (Playwright optional)',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Slack', 'Gmail (optional)', 'Playwright (optional)'],
    loop: 'Every hour',
  },
  {
    file: 'daily-standup-reporter-terminal.md',
    title: 'Daily Standup Reporter',
    tagline: 'It reads your code activity and writes your daily standup update.',
    does: [
      'Reads git commits and changes',
      'Pulls your pull requests and tickets',
      'Drafts yesterday, today, and blockers',
      'Posts to Slack after you confirm',
    ],
    needs: 'GitHub + Slack + local git',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['GitHub', 'Slack', 'Linear / Jira (optional)'],
    loop: 'Every weekday morning',
  },
  {
    file: 'due-diligence-researcher-terminal.md',
    title: 'Due Diligence Researcher',
    tagline: 'It investigates a company and writes a sourced report before you decide.',
    does: [
      "Confirms the company's real identity",
      'Researches team, traction, red flags',
      'Reads the financials carefully',
      'Writes a sourced memo with confidence',
    ],
    needs: 'Playwright (browser)',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Playwright', 'Filesystem', 'Gmail (optional)'],
    loop: 'Per company / weekly watchlist',
  },
  {
    file: 'expense-report-categorizer-terminal.md',
    title: 'Expense Report Categorizer',
    tagline: 'It sorts your transactions into categories and spots odd charges.',
    does: [
      'Reads your transaction export',
      'Cleans up messy merchant names',
      'Applies categories and flags oddities',
      'Writes a tidy ledger and summary',
    ],
    needs: 'Local files only — no extra tools',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Filesystem', 'Gmail (optional)', 'Google Sheets (optional)'],
    loop: 'Monthly',
  },
  {
    file: 'file-organizer-agent-terminal.md',
    title: 'File Organizer Agent',
    tagline: 'It tidies a messy folder and renames files in a neat, sortable way.',
    does: [
      'Scans the folder and finds duplicates',
      'Suggests folders and naming',
      'Shows a plan for you to approve',
      'Moves and renames, with an undo log',
    ],
    needs: 'Local files only — no extra tools',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Filesystem', 'Google Drive (optional)'],
    loop: 'Weekly',
  },
  {
    file: 'grant-finder-terminal.md',
    title: 'Grant Finder',
    tagline: 'It hunts for grants you qualify for and ranks them by deadline.',
    does: [
      'Collects your eligibility facts',
      'Searches grant and funder sites',
      'Checks the rules on each official page',
      'Writes a ranked, deadline-sorted list',
    ],
    needs: 'Playwright (browser)',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Playwright', 'Filesystem', 'Gmail (optional)'],
    loop: 'Weekly deadline watch',
  },
  {
    file: 'invoice-data-extractor-terminal.md',
    title: 'Invoice Data Extractor',
    tagline: 'It reads a pile of invoices and pulls the details into a clean file.',
    does: [
      'Reads each invoice (OCR if scanned)',
      'Pulls vendor, dates, totals, items',
      'Checks the math adds up',
      'Writes clean JSON or CSV',
    ],
    needs: 'Local files (Playwright optional)',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Filesystem', 'Gmail (optional)', 'Google Sheets (optional)'],
    loop: 'Daily / on new invoices',
  },
  {
    file: 'market-research-analyst-terminal.md',
    title: 'Market Research Analyst',
    tagline: 'It gathers market data and writes a clear brief to guide your decision.',
    does: [
      'Confirms your question and scope',
      'Gathers data from trusted sources',
      'Sizes the market two ways and checks',
      'Writes a clear, sourced brief',
    ],
    needs: 'Playwright (browser)',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Playwright', 'Filesystem', 'Notion (optional)'],
    loop: 'Monthly / quarterly',
  },
  {
    file: 'newsletter-curator-terminal.md',
    title: 'Newsletter Curator',
    tagline: 'It reads your collected links and builds a ready-to-send newsletter.',
    does: [
      'Opens and reads each link',
      'Writes a short summary per item',
      'Cuts weak items, groups the rest',
      'Assembles the full issue in Markdown',
    ],
    needs: 'Playwright (browser)',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Playwright', 'Filesystem', 'Gmail (optional)'],
    loop: 'Weekly issue',
  },
  {
    file: 'patent-prior-art-searcher-terminal.md',
    title: 'Patent Prior-Art Searcher',
    tagline: 'It searches patents for inventions like yours and flags the overlaps.',
    does: [
      'Breaks your invention into key parts',
      'Searches several patent offices',
      'Quotes overlapping patent wording',
      'Builds an overlap table and risk read',
    ],
    needs: 'Playwright (browser)',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Playwright', 'Filesystem', 'Gmail (optional)'],
    loop: 'Once at filing, then quarterly',
  },
  {
    file: 'pdf-reader-summarizer-terminal.md',
    title: 'PDF Reader & Summarizer',
    tagline: 'It reads a PDF and writes a clear summary with page references.',
    does: [
      'Opens the PDF and pulls the text',
      'Detects the kind of document',
      'Builds a page-cited summary',
      'Writes the summary to a file',
    ],
    needs: 'Local files (Playwright optional)',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Filesystem', 'Gmail (optional)', 'Google Drive (optional)'],
    loop: 'Per file / batch daily',
  },
  {
    file: 'support-ticket-triage-agent-terminal.md',
    title: 'Support Ticket Triage Agent',
    tagline: 'It sorts support tickets, ranks urgency, and drafts the first reply.',
    does: [
      'Reads tickets from the help desk',
      'Scores urgency and spots unhappy users',
      'Picks the queue and help docs',
      'Drafts a reply, posts after approval',
    ],
    needs: 'Playwright + Slack',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Playwright', 'Slack', 'Linear / Jira (optional)'],
    loop: 'Every 30 min (business hours)',
  },
  {
    file: 'trend-scout-terminal.md',
    title: 'Trend Scout',
    tagline: 'It spots new trends in your field and ranks which ones are real.',
    does: [
      'Confirms your field and time frame',
      'Collects signals from many sources',
      'Scores trends backed by real signals',
      'Writes a ranked watchlist with proof',
    ],
    needs: 'Playwright (browser)',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Playwright', 'Filesystem', 'Slack (optional)', 'Notion (optional)'],
    loop: 'Every Monday',
  },
  {
    file: 'web-scraping-recipe-builder-terminal.md',
    title: 'Web Scraping Recipe Builder',
    tagline: 'It builds a polite script that pulls the data you want from a website.',
    does: [
      'Checks the site rules first',
      'Looks at the page and picks the data',
      'Writes a gentle, slow scraping script',
      'Runs a test and saves sample rows',
    ],
    needs: 'Playwright (browser)',
    platforms: ['Claude', 'OpenAI', 'Perplexity'],
    mcps: ['Playwright', 'Filesystem', 'GitHub (optional)'],
    loop: 'Build once, run on schedule',
  },
];

export default function Companions() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [creators, setCreators] = useState<Map<string, Creator>>(new Map());
  const [loading, setLoading] = useState(true);

  // Monotonic id so a slow earlier response can't overwrite a newer one
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const fetchCompanions = async () => {
      const fetchId = ++fetchIdRef.current;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .contains('category', ['Companion'])
          .order('downloads_count', { ascending: false });

        if (error) throw error;
        if (fetchId !== fetchIdRef.current) return; // stale response

        setAgents(data || []);

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
      } catch (err) {
        console.error('Failed to fetch companions:', err);
      } finally {
        if (fetchId === fetchIdRef.current) setLoading(false);
      }
    };

    fetchCompanions();
  }, []);

  const getCreatorName = (creatorId: string) => {
    return creators.get(creatorId)?.username || 'Unknown';
  };

  // Downloads require a free account, mirroring the agent download gate.
  // Fetch + blob so the .md saves to the user's Downloads folder (not opened in a tab).
  const handleDownload = async (file: string) => {
    if (!user) {
      window.location.href = `/auth/signup?redirect=${encodeURIComponent('/companions')}`;
      return;
    }
    try {
      const res = await fetch(`/companions/${file}`);
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(`/companions/${file}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <section className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero / intro */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-300 text-xs font-medium px-3 py-1 rounded-full mb-4">
            <Terminal className="w-3.5 h-3.5" />
            MCP · Works in Claude, OpenAI &amp; Perplexity
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Companions</h1>
          <p className="text-lg text-slate-400 max-w-3xl">
            A companion is a helper that does the whole job for you — not just give
            advice. Each one is a simple text file you can drop into{' '}
            <span className="text-white font-semibold">
              Claude Code, Codex, Cursor, Perplexity, n8n, or LangChain
            </span>{' '}
            — or any other AI chat. Add the tools it needs, and let it run.
          </p>
          <div className="mt-6">
            <Link
              href="/companions/add"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Add Companion
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="border border-slate-700 bg-slate-800/40 rounded-lg p-6 mb-12">
          <h2 className="text-lg font-semibold text-white mb-2">How companions work</h2>
          <p className="text-slate-400 text-sm mb-3">
            Every companion is just a plain text file — it is not tied to one company.
            Use it in Claude Code, OpenAI Codex, Cursor, Perplexity, n8n, LangChain, or
            any AI that takes instructions. Some can use tools to act for you; all of
            them run anywhere a prompt runs. Need MCP? Open it in <strong className="text-slate-300">Claude Desktop, ChatGPT Desktop, or Perplexity</strong> and
            connect the servers listed in the file. No MCP needed? Paste the text into a
            Claude.ai Project, a Perplexity Space, or a custom GPT.
          </p>
          <p className="text-slate-500 text-xs">
            Downloads are free —{' '}
            <Link href="/auth/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              make an account
            </Link>{' '}
            to download any file.
          </p>
        </div>

        {/* All official companions — one consistent set */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {companions.map((c) => (
            <div
              key={c.file}
              className="border border-indigo-500/30 bg-indigo-500/5 rounded-lg p-6 flex flex-col"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-indigo-300 bg-indigo-500/10">
                  <Terminal className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">{c.title}</h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 uppercase tracking-wide">
                  Official
                </span>
                <span className="text-xs text-slate-400">
                  By <span className="text-white font-semibold">Agentshive Team</span>
                </span>
              </div>

              <p className="text-slate-300 text-sm mb-4 mt-3">{c.tagline}</p>

              <div className="mb-4">
                <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wide mb-2">
                  What it does
                </p>
                <ul className="space-y-1.5">
                  {c.does.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-slate-400">
                      <ArrowRight className="w-3.5 h-3.5 mt-1 text-indigo-400 flex-shrink-0" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What you need */}
              <div className="mb-3 bg-slate-800/50 rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-slate-300 mb-0.5">What you need</p>
                <p className="text-xs text-slate-400">{c.needs}</p>
              </div>

              {/* MCP connectors */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Plug className="w-3 h-3" /> MCP Connectors
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {c.mcps.map((m) => (
                    <span key={m} className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${m.includes('optional') ? 'bg-slate-700/60 text-slate-400' : 'bg-indigo-900/50 text-indigo-300'}`}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Loop cadence */}
              <div className="mb-4 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-emerald-400">Loop:</span> {c.loop}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-700">
                <button
                  onClick={() => handleDownload(c.file)}
                  className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm font-semibold"
                >
                  <Download className="w-4 h-4" />
                  {user ? 'Download file' : 'Sign up to download'}
                </button>
                <span className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <Terminal className="w-3.5 h-3.5" />
                  Works in: {c.platforms.join(', ')} · and any other AI chat
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Community-submitted companions */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">From the community</h2>
          <p className="text-slate-400 text-sm mb-6">
            Companions shared by other people who use Agentshive.
          </p>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-slate-400">Loading companions...</div>
            </div>
          ) : agents.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No community companions yet.{' '}
              <Link
                href="/companions/add"
                className="text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Be the first to add one →
              </Link>
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {agents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  className="border border-slate-800 hover:border-slate-600 rounded-lg p-6 transition-colors duration-200 group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-400 bg-slate-500/10">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-white group-hover:text-indigo-400 transition mb-1">
                        {agent.title}
                      </h3>
                      {agent.verified && (
                        <span className="inline-block bg-slate-800/60 text-slate-400 text-xs px-2 py-0.5 rounded">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {agent.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {agent.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {agent.tags.length > 3 && (
                      <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded">
                        +{agent.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="border-t border-slate-700 pt-3 mb-3">
                    <p className="text-xs text-slate-400">
                      By{' '}
                      <span className="text-white font-semibold">
                        {getCreatorName(agent.creator_id)}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-700">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span>
                        {agent.average_rating.toFixed(1)} ({agent.rating_count})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4 text-indigo-400" />
                      <span>{agent.downloads_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span>{agent.views_count}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
