// Zeros the starter downloads/views on the 50 agents added by seed_50_agents.mjs
// so homepage stats reflect only organic activity. Targets exact titles owned by
// agentshive_team; does not touch the original demo agents or any user uploads.
//
//   node scripts/reset_seed_stats.mjs
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n').filter(l => l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const TITLES = [
  'Code Review Companion', 'Unit Test Generator', 'SQL Query Builder', 'Regex Builder & Explainer',
  'Legacy Code Refactorer', 'Git Commit Message Writer', 'Dockerfile Optimizer', 'API Client Generator',
  'CSV Data Profiler', 'A/B Test Analyzer', 'KPI Dashboard Designer', 'Excel Formula Wizard',
  'Data Cleaning Pipeline Builder', 'Survey Response Analyzer', 'Financial Statement Analyzer',
  'SEO Blog Post Writer', 'LinkedIn Post Ghostwriter', 'Newsletter Curator', 'YouTube Script Writer',
  'Product Description Writer', 'Press Release Drafter', 'Social Media Calendar Planner',
  'Technical Documentation Writer', 'Market Research Analyst', 'Competitor Analysis Agent',
  'Academic Paper Summarizer', 'Due Diligence Researcher', 'Trend Scout', 'Grant Finder',
  'Patent Prior-Art Searcher', 'Support Ticket Triage Agent', 'FAQ Generator from Docs',
  'Customer Churn Signal Detector', 'Refund Request Handler', 'Onboarding Email Sequence Writer',
  'Meeting Notes & Action Items Agent', 'Email Inbox Zero Assistant', 'Invoice Data Extractor',
  'Calendar Scheduling Assistant', 'Web Scraping Recipe Builder', 'File Organizer Agent',
  'Expense Report Categorizer', 'Daily Standup Reporter', 'Tech Interview Prep Coach',
  'Language Learning Tutor', 'Flashcard Generator', 'Code Concept Explainer',
  'Course Outline Designer', 'Resume Reviewer & Optimizer', 'Math Word Problem Solver',
];

const { data: teamUser, error: ue } = await admin
  .from('users').select('id').eq('username', 'agentshive_team').single();
if (ue || !teamUser) { console.error('agentshive_team user not found:', ue?.message); process.exit(1); }

const { data, error } = await admin
  .from('agents')
  .update({ downloads_count: 0, views_count: 0 })
  .eq('creator_id', teamUser.id)
  .in('title', TITLES)
  .select('title');

if (error) { console.error('update failed:', error.message); process.exit(1); }
console.log(`Reset downloads/views to 0 on ${data.length} agents.`);

const { data: all } = await admin.from('agents').select('downloads_count');
const total = (all || []).reduce((s, a) => s + (a.downloads_count || 0), 0);
console.log(`Total downloads across all agents is now: ${total}`);
