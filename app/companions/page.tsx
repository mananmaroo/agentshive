'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Star,
  Download,
  Eye,
  Terminal,
  FileText,
  Plus,
  ArrowRight,
  Bot,
} from 'lucide-react';
import { supabaseAnon as supabase } from '@/app/lib/supabase-anon';

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

// The flagship companions, rendered as richer marquee cards.
type MarqueeCompanion = {
  file: string;
  title: string;
  tagline: string;
  does: string[];
  needs: string;
  runtime?: string;
};

const marquee: MarqueeCompanion[] = [
  {
    file: 'personal-assistant-local-terminal.md',
    title: 'Personal Assistant — Local Notes',
    tagline:
      'Email, calendar, news, to-dos and appointments — notes kept in local Markdown you own.',
    does: [
      'Summarizes new email into a local to-do list',
      'Daily briefing of calendar + tasks + news',
      'Draft-first replies you confirm, then optional auto-send',
      'Creates calendar events on confirmation',
    ],
    needs: 'Gmail MCP, Google Calendar connector, built-in web fetch + filesystem',
  },
  {
    file: 'personal-assistant-notion-terminal.md',
    title: 'Personal Assistant — Notion',
    tagline: 'Same assistant, with your to-do list and notes in Notion.',
    does: [
      'Summarizes new email into a Notion database',
      'Inbox and tasks live in Notion instead of local files',
      'Draft-first replies with opt-in automation',
      'Turns notes into replies and calendar events',
    ],
    needs: 'Notion MCP, Gmail MCP, Google Calendar connector',
  },
  {
    file: 'document-visualizer-terminal.md',
    title: 'Document Visualizer',
    tagline:
      'Turn a document into slides — a deck of just your highlights, plus a full McKinsey-style deck.',
    does: [
      'Detects highlighted passages and builds a focused highlights deck',
      'Always builds a full consulting-grade deck with action titles',
      'One clear message per slide, on a consistent master',
    ],
    needs: 'Local only (python-pptx, PyMuPDF) — no MCP',
  },
  {
    file: 'smart-coder.md',
    title: 'Smart Coder',
    tagline:
      'Survives memory loss: reads a handoff doc to resume instantly, writes one at end of day, and keeps every reply terse to save tokens.',
    does: [
      'Reads HANDOFF.md + its own instructions before any work',
      'Reconstructs project state and resumes the next step cold',
      'Writes a complete end-of-day handoff to import next session',
      'Strips filler so responses use fewer tokens',
    ],
    needs: 'Nothing — runtime-agnostic, no MCP',
    runtime: 'Runs anywhere — Claude Code, Codex, Perplexity',
  },
];

// The other 18 companions. Title is the file H1 (minus "# "); the description is the
// first sentence of each file's "## Purpose" section.
const moreCompanions = [
  {
    file: 'academic-paper-summarizer-terminal.md',
    title: 'Academic Paper Summarizer — Terminal Edition',
    description:
      'The hands-on version of the Academic Paper Summarizer agent — it locates the paper, reads the full text, and writes a three-depth summary to a file.',
  },
  {
    file: 'ai-job-application-automation-terminal.md',
    title: 'AI Job Application Automation Agent — Terminal Edition',
    description:
      'The hands-on version of the AI Job Application Automation Agent — it searches job boards, tailors resume and cover-letter files, logs to a tracking CSV, and (only with confirmation) submits applications.',
  },
  {
    file: 'calendar-scheduling-assistant-terminal.md',
    title: 'Calendar Scheduling Assistant — Terminal Edition',
    description:
      'The hands-on version of the Calendar Scheduling Assistant — it reads free/busy across participants, computes the best slots across time zones, and creates the invite.',
  },
  {
    file: 'competitor-analysis-agent-terminal.md',
    title: 'Competitor Analysis Agent — Terminal Edition',
    description:
      'The hands-on version of the Competitor Analysis Agent — it browses competitor sites and reviews, extracts pricing and positioning, and writes a comparison matrix and gaps analysis.',
  },
  {
    file: 'customer-feedback-distributor-terminal.md',
    title: 'Customer Feedback Distributor Agent — Terminal Edition',
    description:
      'The hands-on version of the Customer Feedback Distributor Agent — it categorizes and prioritizes feedback, logs it to a CSV, and posts routed messages to the right Slack channels.',
  },
  {
    file: 'daily-standup-reporter-terminal.md',
    title: 'Daily Standup Reporter — Terminal Edition',
    description:
      'The hands-on version of the Daily Standup Reporter — it reads real git history and PR/ticket state, drafts the standup in the team format, and posts it to Slack on confirmation.',
  },
  {
    file: 'due-diligence-researcher-terminal.md',
    title: 'Due Diligence Researcher — Terminal Edition',
    description:
      'The hands-on version of the Due Diligence Researcher — it searches registries, filings, news, and reputation sources, dates each finding, and writes a sourced diligence memo.',
  },
  {
    file: 'expense-report-categorizer-terminal.md',
    title: 'Expense Report Categorizer — Terminal Edition',
    description:
      'The hands-on version of the Expense Report Categorizer — it reads a transaction export, normalizes merchants, applies category rules, flags anomalies, and writes the categorized ledger.',
  },
  {
    file: 'file-organizer-agent-terminal.md',
    title: 'File Organizer Agent — Terminal Edition',
    description:
      'The hands-on version of the File Organizer Agent — it scans the target folder, produces a dry-run plan, and after approval executes the moves and renames with a reversible log.',
  },
  {
    file: 'grant-finder-terminal.md',
    title: 'Grant Finder — Terminal Edition',
    description:
      'The hands-on version of the Grant Finder — it searches grant portals and funder sites, hard-checks eligibility on each official page, and writes a ranked, deadline-sorted shortlist.',
  },
  {
    file: 'invoice-data-extractor-terminal.md',
    title: 'Invoice Data Extractor — Terminal Edition',
    description:
      'The hands-on version of the Invoice Data Extractor — it opens a folder of invoices and receipts, extracts and validates the fields, and writes clean JSON/CSV.',
  },
  {
    file: 'market-research-analyst-terminal.md',
    title: 'Market Research Analyst — Terminal Edition',
    description:
      'The hands-on version of the Market Research Analyst — it gathers and triangulates market data from authoritative sources, then writes a sourced, decision-ready brief.',
  },
  {
    file: 'newsletter-curator-terminal.md',
    title: 'Newsletter Curator — Terminal Edition',
    description:
      'The hands-on version of the Newsletter Curator — it opens every link you collected, reads each source, and assembles the complete issue in Markdown ready to paste into your sending tool.',
  },
  {
    file: 'patent-prior-art-searcher-terminal.md',
    title: 'Patent Prior-Art Searcher — Terminal Edition',
    description:
      'The hands-on version of the Patent Prior-Art Searcher — it queries the patent offices, opens each close hit, extracts the claim language, and builds the overlap table.',
  },
  {
    file: 'pdf-reader-summarizer-terminal.md',
    title: 'PDF Reader & Summarizer — Terminal Edition',
    description:
      'The hands-on version of the PDF Reader & Summarizer — it opens the PDF, extracts its text (OCR if scanned), and writes a clear, page-cited structured summary.',
  },
  {
    file: 'support-ticket-triage-agent-terminal.md',
    title: 'Support Ticket Triage Agent — Terminal Edition',
    description:
      'The hands-on version of the Support Ticket Triage Agent — it reads tickets from the help-desk UI, classifies and prioritizes them, drafts the first reply, and posts the routing summary.',
  },
  {
    file: 'trend-scout-terminal.md',
    title: 'Trend Scout — Terminal Edition',
    description:
      'The hands-on version of the Trend Scout — it gathers signals across funding, hiring, search interest, regulatory moves, and conference agendas, then writes a ranked watchlist with evidence.',
  },
  {
    file: 'web-scraping-recipe-builder-terminal.md',
    title: 'Web Scraping Recipe Builder — Terminal Edition',
    description:
      'The hands-on version of the Web Scraping Recipe Builder — it inspects the live target page, writes a polite and resilient scraping script, runs its test mode, and saves the script and first rows.',
  },
];

export default function Companions() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <section className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero / intro */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-300 text-xs font-medium px-3 py-1 rounded-full mb-4">
            <Terminal className="w-3.5 h-3.5" />
            Terminal Edition
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Companions</h1>
          <p className="text-lg text-slate-400 max-w-3xl">
            Companions are the hands-on{' '}
            <span className="text-white font-semibold">Terminal Edition</span> agents — they
            run right inside Claude Code (most via MCP) and actually do the work end-to-end,
            instead of just advising. Drop a definition into your terminal, connect any tools it
            needs, and let it go. A few are runtime-agnostic and run anywhere a system prompt
            does.
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

        {/* Marquee flagship companions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {marquee.map((c) => (
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

              <p className="text-slate-300 text-sm mb-4">{c.tagline}</p>

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

              <div className="mb-4">
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Needs:</span> {c.needs}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-700 flex items-center justify-between">
                <a
                  href={`/companions/${c.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm font-semibold"
                >
                  <Download className="w-4 h-4" />
                  View / Download definition
                </a>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Terminal className="w-3.5 h-3.5" />
                  {c.runtime ?? 'Runs in Claude Code'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* More companions */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-2">More companions</h2>
          <p className="text-slate-400 text-sm mb-6">
            Every companion is a Markdown definition you can download and run in Claude Code.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moreCompanions.map((c) => (
              <a
                key={c.file}
                href={`/companions/${c.file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-slate-800 hover:border-slate-600 rounded-lg p-6 transition-colors duration-200 group flex flex-col"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-400 bg-slate-500/10">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-white group-hover:text-indigo-400 transition">
                    {c.title}
                  </h3>
                </div>
                <p className="text-slate-400 text-sm mb-4 flex-1">{c.description}</p>
                <div className="pt-3 border-t border-slate-700 flex items-center gap-1.5 text-indigo-400 group-hover:text-indigo-300 text-sm font-semibold">
                  <Download className="w-4 h-4" />
                  View / Download definition
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Community-submitted companions */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">From the community</h2>
          <p className="text-slate-400 text-sm mb-6">
            Companions submitted by the Agentshive community.
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
