import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

const u = await (await fetch(`${URL_}/rest/v1/users?username=eq.agentshive_team&select=id`, { headers: H })).json();
if (!u[0]) { console.error('agentshive_team user not found'); process.exit(1); }
const uid = u[0].id;

const agents = await (await fetch(`${URL_}/rest/v1/agents?creator_id=eq.${uid}&select=id,title,tags&limit=1000`, { headers: H })).json();
console.log(`agentshive_team agents: ${agents.length}`);

let updated = 0;
for (const a of agents) {
  const have = new Set((a.tags || []).map((t) => t.toLowerCase()));
  const next = [...(a.tags || [])];
  for (const t of ['claude-code', 'codex']) if (!have.has(t)) next.push(t);
  if (next.length === (a.tags || []).length) continue;
  const r = await fetch(`${URL_}/rest/v1/agents?id=eq.${a.id}`, {
    method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify({ tags: next }),
  });
  if (r.ok) updated++; else console.error(`fail ${a.title}: ${r.status} ${await r.text()}`);
}
console.log(`tagged claude-code + codex on ${updated} agents`);
