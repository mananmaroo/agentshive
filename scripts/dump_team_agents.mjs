import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n').filter(l => l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const c = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data: team } = await c.from('users').select('id').eq('username', 'agentshive_team').single();
const TEAM = team.id;

const { data: agents, error } = await c.from('agents')
  .select('id, title, description, category, tags, version, license')
  .eq('creator_id', TEAM)
  .order('created_at', { ascending: true });
if (error) { console.log('ERR agents', error.message); process.exit(1); }

const { data: files } = await c.from('agent_files')
  .select('agent_id, file_name, file_type, file_url, file_content')
  .in('agent_id', agents.map(a => a.id));

const byAgent = {};
for (const f of files || []) (byAgent[f.agent_id] ||= []).push(f);

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const dir = 'AGENTS_CLAUDE_MD/team';
mkdirSync(dir, { recursive: true });

const index = [];
for (const a of agents) {
  const f = (byAgent[a.id] || []).find(x => x.file_type === 'claude_md') || (byAgent[a.id] || [])[0];
  const s = slug(a.title);
  const content = f?.file_content || '';
  writeFileSync(`${dir}/${s}.md`, content, 'utf8');
  index.push({
    id: a.id, slug: s, title: a.title, description: a.description,
    category: a.category, tags: a.tags, version: a.version, license: a.license,
    file_name: f?.file_name || 'claude.md',
    has_content: !!content, content_len: content.length,
    file_url: f?.file_url || null,
  });
}
writeFileSync(`${dir}/index.json`, JSON.stringify(index, null, 2), 'utf8');
console.log(`Dumped ${agents.length} team agents to ${dir}/`);
console.log(`With content: ${index.filter(x => x.has_content).length}, empty: ${index.filter(x => !x.has_content).length}`);
