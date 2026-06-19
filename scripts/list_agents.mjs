import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n').filter(l => l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const c = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data: users } = await c.from('users').select('id, username');
const byId = Object.fromEntries((users || []).map(u => [u.id, u.username]));

const { data: agents, error } = await c.from('agents')
  .select('id, title, category, tags, creator_id, verified, featured')
  .order('created_at', { ascending: true });
if (error) { console.log('ERR', error.message); process.exit(1); }

for (const a of agents) {
  console.log(`${a.title}  [${byId[a.creator_id] || a.creator_id}]  ${a.verified ? 'verified' : ''}`);
  console.log(`    id=${a.id}`);
  console.log(`    cat=${JSON.stringify(a.category)} tags=${JSON.stringify(a.tags)}`);
}
console.log(`\nTotal: ${agents.length}`);
