// Imports Claude Code subagents + Codex AGENTS.md templates as agents.
// Attributes them to dedicated accounts, puts "(Template)" in every title,
// links the source repo, and serves the file via /raw. Idempotent: skips
// titles that already exist. Run from the agentstack dir:
//   node scripts/import_templates.mjs
import { readFileSync, readdirSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split('\n')
  .filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const BASE = 'C:/Users/maroo/Downloads/_tpl_import';
const CLAUDE_DIR = `${BASE}/claude-sub/agents`;
const CODEX_FILES = [
  ['Home Assistant Dashboard', 'project-type/ha-dashboard'],
  ['Resource List Project', 'project-type/resource-list'],
  ['Data Science (Python)', 'purpose-outline/data-science-python'],
  ['Python (General)', 'purpose-outline/python-general'],
  ['Astro Site', 'stack-context/astro'],
  ['Astro + Netlify', 'stack-context/astro-and-netlify'],
  ['OPNsense Sysadmin', 'sysadmin/opnsense'],
  ['Ubuntu Desktop Sysadmin', 'sysadmin/ubuntu-desktop'],
  ['Ubuntu VM Sysadmin', 'sysadmin/ubuntu-vm'],
];
const CLAUDE_SRC = 'https://github.com/0xfurai/claude-code-subagents';
const CODEX_SRC = 'https://github.com/danielrosehill/Agents.md-Templates';

const titleCase = s => s.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const automation = /ansible|terraform|docker|kubernetes|k8s|aws|gcp|azure|devops|nginx|linux|bash|sysadmin|ubuntu|opnsense|ci|cd|helm|vault|consul/i;
const data = /pandas|numpy|spark|data|ml|pytorch|tensorflow|scikit|jupyter|airflow|dbt|sql|analytics/i;
const catFor = (name) => automation.test(name) ? ['Automation'] : data.test(name) ? ['Data Analysis'] : ['Code Generation'];

function parseFrontmatter(raw, fallbackName) {
  const m = raw.match(/^---\s*([\s\S]*?)\s*---/);
  let name = fallbackName, description = '';
  if (m) {
    const nm = m[1].match(/^name:\s*(.+)$/m); if (nm) name = nm[1].trim();
    const dm = m[1].match(/^description:\s*(.+)$/m); if (dm) description = dm[1].trim();
  }
  if (!description) description = `Subagent template: ${titleCase(name)}.`;
  return { name, description };
}

// --- ensure a creator account exists (auth user -> trigger makes profile) ---
async function ensureCreator(username, email, bio) {
  const { data: existing } = await admin.from('users').select('id').eq('username', username).maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await admin.auth.admin.createUser({
    email, password: `Tmpl!${Math.abs(hash(username))}aZ9`, email_confirm: true,
    user_metadata: { username },
  });
  if (error) throw new Error(`createUser ${username}: ${error.message}`);
  await new Promise(r => setTimeout(r, 600)); // let trigger create profile
  if (bio) await admin.from('users').update({ bio }).eq('id', data.user.id);
  return data.user.id;
}
function hash(s){let h=0;for(let i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))|0;}return h;}

const claudeCreator = await ensureCreator('claude-code-templates', 'claude-code-templates@agentshive.net',
  `Curated Claude Code subagent templates. Source: ${CLAUDE_SRC} (MIT).`);
const codexCreator = await ensureCreator('codex-templates', 'codex-templates@agentshive.net',
  `Curated OpenAI Codex AGENTS.md templates. Source: ${CODEX_SRC}.`);
console.log('creators ready:', claudeCreator.slice(0, 8), codexCreator.slice(0, 8));

// --- build the agent list ---
const rows = []; // { title, description, category, tags, creator_id, license, repository_url, content, file_name }

// Claude subagents
for (const file of readdirSync(CLAUDE_DIR).filter(f => f.endsWith('.md') && !/readme/i.test(f))) {
  const raw = readFileSync(`${CLAUDE_DIR}/${file}`, 'utf8');
  const base = file.replace(/\.md$/, '');
  const { name, description } = parseFrontmatter(raw, base);
  rows.push({
    title: `${titleCase(name)} (Template)`,
    description: `${description}\n\nClaude Code subagent template — source: ${CLAUDE_SRC} (MIT).`.slice(0, 1000),
    category: catFor(name),
    tags: [...new Set([...base.split(/[-_]/), 'template', 'claude-code'])].filter(Boolean).slice(0, 8),
    creator_id: claudeCreator, license: 'MIT', repository_url: CLAUDE_SRC,
    content: raw, file_name: `${base}.md`,
  });
}

// Codex AGENTS.md templates
for (const [label, rel] of CODEX_FILES) {
  const p = `${BASE}/codex-tpl/${rel}/AGENTS.md`;
  if (!existsSync(p)) continue;
  const raw = readFileSync(p, 'utf8');
  const firstLine = (raw.split('\n').find(l => l.trim() && !l.startsWith('#')) || '').trim();
  rows.push({
    title: `${label} — AGENTS.md (Template)`,
    description: `${firstLine || ('Codex AGENTS.md template for ' + label + '.')}\n\nOpenAI Codex AGENTS.md template — source: ${CODEX_SRC}.`.slice(0, 1000),
    category: /data/i.test(rel) ? ['Data Analysis'] : ['Automation', 'Code Generation'],
    tags: [...new Set([...rel.split(/[\/-]/), 'template', 'codex', 'agents-md'])].filter(Boolean).slice(0, 8),
    creator_id: codexCreator, license: 'MIT', repository_url: CODEX_SRC,
    content: raw, file_name: 'AGENTS.md',
  });
}
console.log('prepared rows:', rows.length);

// --- dedupe against existing titles ---
const { data: existing } = await admin.from('agents').select('title');
const have = new Set((existing || []).map(a => a.title));
const fresh = rows.filter(r => !have.has(r.title));
console.log('after dedupe (new to insert):', fresh.length);

// --- insert in chunks; get ids back; then insert files ---
let inserted = 0;
const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
for (const group of chunk(fresh, 40)) {
  const agentRows = group.map(r => ({
    title: r.title, description: r.description, category: r.category, tags: r.tags,
    creator_id: r.creator_id, license: r.license, version: '1.0.0',
    repository_url: r.repository_url, downloads_count: 0, views_count: 0,
    average_rating: 0, rating_count: 0, verified: false, featured: false,
  }));
  const { data: created, error } = await admin.from('agents').insert(agentRows).select('id,title');
  if (error) { console.log('agent insert error:', error.message); continue; }
  const byTitle = new Map(created.map(c => [c.title, c.id]));
  const fileRows = group.map(r => ({
    agent_id: byTitle.get(r.title), file_url: `agent-${byTitle.get(r.title)}-claude.md`,
    file_type: 'claude_md', file_name: r.file_name, file_content: r.content,
  })).filter(f => f.agent_id);
  const { error: fe } = await admin.from('agent_files').insert(fileRows);
  if (fe) { console.log('file insert error:', fe.message); continue; }
  inserted += created.length;
  console.log(`  inserted ${inserted}/${fresh.length}`);
}

const { count } = await admin.from('agents').select('*', { count: 'exact', head: true });
console.log(`\nDone. ${inserted} new agents imported. Total agents now: ${count}`);
