// Seeds agent_files.file_content for every agent so /api/agents/:id/raw works.
// - Real agents (with a local AGENTS_CLAUDE_MD/*.md behind their file_url): uses that file's content.
// - Beta agents (no content): generates a clean claude.md from the agent's metadata.
// Idempotent: updates the existing claude_md row in place, or inserts one if missing.
// Requires the agent_files.file_content column to exist (run the ALTER first).
//
//   node scripts/seed_content.mjs
import { readFileSync, existsSync } from 'fs';
import { basename } from 'path';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n').filter(l => l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const arr = v => Array.isArray(v) ? v : (v ? [v] : []);

function generateContent(a) {
  const cats = arr(a.category).join(', ') || 'General';
  const tags = arr(a.tags).join(', ') || 'agent';
  return `# ${a.title}

## Purpose

${a.description}

## Categories

${cats}

## Tags

${tags}

## Instructions

1. Read the user's request carefully and restate the goal in one sentence.
2. Identify the inputs you need (documents, data, URLs, parameters); ask one clarifying question only if the request is genuinely ambiguous.
3. Plan the steps before acting — outline the tool calls or actions you intend to take.
4. Execute the plan, surfacing intermediate results so the user can follow along.
5. Validate the output against the original request before concluding.

## Capabilities

- Domain reasoning relevant to: ${cats}.
- Structured output (JSON or Markdown) on request.
- Multi-step tool use where the runtime supports it.

## Output Format

Return a concise, well-structured response. Use Markdown headings and bullet points for readability. When returning data, prefer a clearly labeled table or JSON block.

## Notes

This agent is runtime-agnostic — it works with Claude Code, Codex, n8n, LangChain, and any system that can consume a Markdown instruction file. Install it with one call from agentshive.net.
`;
}

const { data: agents, error: ae } = await admin.from('agents').select('*').order('title');
if (ae) { console.error('agents fetch failed:', ae.message); process.exit(1); }

const { data: files, error: fe } = await admin
  .from('agent_files').select('id, agent_id, file_url, file_name').eq('file_type', 'claude_md');
if (fe) { console.error('agent_files fetch failed:', fe.message); process.exit(1); }
const byAgent = new Map(files.map(f => [f.agent_id, f]));

let updated = 0, inserted = 0;
for (const a of agents) {
  const existing = byAgent.get(a.id);
  let content = null, source = 'generated';

  // Try to use the rich local md file if this agent's row points at one we have on disk.
  if (existing?.file_url) {
    const local = `AGENTS_CLAUDE_MD/${basename(existing.file_url)}`;
    if (existsSync(local)) { content = readFileSync(local, 'utf8'); source = local; }
  }
  if (!content) content = generateContent(a);

  if (existing) {
    const { error } = await admin.from('agent_files')
      .update({ file_content: content }).eq('id', existing.id);
    if (error) { console.error(`UPDATE ${a.title} failed:`, error.message); continue; }
    updated++;
    console.log(`✓ updated  ${a.title}  (${source}, ${content.length} chars)`);
  } else {
    const { error } = await admin.from('agent_files').insert({
      agent_id: a.id,
      file_url: `agent-${a.id}-claude.md`,
      file_type: 'claude_md',
      file_name: 'claude.md',
      file_content: content,
    });
    if (error) { console.error(`INSERT ${a.title} failed:`, error.message); continue; }
    inserted++;
    console.log(`✓ inserted ${a.title}  (${source}, ${content.length} chars)`);
  }
}
console.log(`\nDone. ${updated} updated, ${inserted} inserted, ${agents.length} agents total.`);
