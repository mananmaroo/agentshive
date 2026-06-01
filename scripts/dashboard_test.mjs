// Tests the creator dashboard: does the user's agent show up, and does the
// Delete action work (RLS) + clean up the agent_files row? Cleans up after.
//   node scripts/dashboard_test.mjs
import { readFileSync } from 'fs';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split('\n')
  .filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const URL = env.NEXT_PUBLIC_SUPABASE_URL, ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY, SVC = env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(URL, SVC, { auth: { persistSession: false } });
const BASE = 'https://www.agentshive.net';
const log = (...a) => console.log(...a);

const ts = Date.now();
const email = `dash-${ts}@mailinator.com`, pass = 'TestPass!2026', username = `dash_${ts}`;
let uid = null, agentId = null;

try {
  // ---- setup: confirmed user (trigger makes the profile) + an owned agent ----
  const { data: cu, error: ce } = await admin.auth.admin.createUser({ email, password: pass, email_confirm: true, user_metadata: { username } });
  if (ce) throw new Error('createUser: ' + ce.message);
  uid = cu.user.id;
  await new Promise(r => setTimeout(r, 800)); // let the trigger create the profile
  const { data: prof } = await admin.from('users').select('username').eq('id', uid).maybeSingle();
  log('profile auto-created by trigger:', !!prof, prof ? `(@${prof.username})` : '');

  const title = `Dash Test Agent ${ts}`;
  const userClient = createClient(URL, ANON, { auth: { persistSession: false } });
  await userClient.auth.signInWithPassword({ email, password: pass });
  const { data: ag, error: ae } = await userClient.from('agents').insert({
    title, description: 'dashboard delete test', category: ['Automation'], tags: ['t'],
    creator_id: uid, license: 'MIT', version: '1.0.0',
    downloads_count: 0, views_count: 0, average_rating: 0, rating_count: 0,
  }).select().single();
  if (ae) throw new Error('agent insert: ' + ae.message);
  agentId = ag.id;
  await userClient.from('agent_files').insert({ agent_id: agentId, file_url: `agent-${agentId}-claude.md`, file_type: 'claude_md', file_name: 'claude.md', file_content: '# test' });
  log('test agent created:', agentId);

  // ---- browser: log in, open dashboard ----
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const dialogs = [];
  page.on('dialog', d => { dialogs.push(d.message()); d.accept().catch(() => {}); });

  await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', pass);
  await page.click('button:has-text("Log In"), button:has-text("Log in")');
  await page.waitForTimeout(3500);

  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  log('\n=== DASHBOARD LOAD ===');
  log('  URL                 :', page.url());
  const agentVisible = await page.locator(`text=${title}`).count() > 0;
  log('  Test agent listed   :', agentVisible);
  const totalAgentsText = await page.locator('text=Total Agents').locator('..').locator('p.text-3xl').textContent().catch(() => '?');
  log('  "Total Agents" stat :', totalAgentsText);

  // ---- delete ----
  log('\n=== DELETE FLOW ===');
  // open the row's action menu (last cell button), then click Delete Agent
  const menuBtn = page.locator('table tbody tr', { hasText: title }).locator('button').last();
  await menuBtn.click().catch(e => log('  (menu click issue:', e.message + ')'));
  await page.waitForTimeout(500);
  const delBtn = page.locator('button:has-text("Delete Agent")');
  await delBtn.click().catch(e => log('  (delete click issue:', e.message + ')'));
  await page.waitForTimeout(3000);
  log('  Dialogs shown       :', JSON.stringify(dialogs));

  // ---- verify in DB ----
  const { data: stillThere } = await admin.from('agents').select('id').eq('id', agentId).maybeSingle();
  const { data: orphanFiles } = await admin.from('agent_files').select('id').eq('agent_id', agentId);
  log('\n=== RESULT ===');
  log('  Agent deleted from DB        :', !stillThere);
  log('  agent_files cleaned (cascade):', (orphanFiles?.length || 0) === 0, `(${orphanFiles?.length || 0} leftover)`);
  log('  VERDICT delete works         :', !stillThere ? 'YES' : 'NO');
  if (!stillThere && (orphanFiles?.length || 0) > 0) log('  NOTE: agent row gone but agent_files ORPHANED (no cascade) — needs fixing');

  await browser.close();
} catch (e) {
  log('TEST ERROR:', e.message);
} finally {
  log('\n=== CLEANUP ===');
  if (agentId) { await admin.from('agent_files').delete().eq('agent_id', agentId); await admin.from('agents').delete().eq('id', agentId); }
  if (uid) { await admin.from('users').delete().eq('id', uid); await admin.auth.admin.deleteUser(uid).catch(() => {}); }
  log('  done');
}
