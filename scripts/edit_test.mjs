// Tests the agent edit flow live: load existing values, save changes,
// verify DB + /raw reflect them, and that non-owners are blocked. Cleans up.
//   node scripts/edit_test.mjs
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
const email = `edit-${ts}@mailinator.com`, pass = 'TestPass!2026', username = `edit_${ts}`;
let uid = null, agentId = null;

try {
  const { data: cu, error: ce } = await admin.auth.admin.createUser({ email, password: pass, email_confirm: true, user_metadata: { username } });
  if (ce) throw new Error('createUser: ' + ce.message);
  uid = cu.user.id;
  const uc = createClient(URL, ANON, { auth: { persistSession: false } });
  await uc.auth.signInWithPassword({ email, password: pass });
  const { data: ag } = await uc.from('agents').insert({
    title: `Edit Test ${ts}`, description: 'original description', category: ['Automation'], tags: ['old'],
    creator_id: uid, license: 'MIT', version: '1.0.0', downloads_count: 0, views_count: 0, average_rating: 0, rating_count: 0,
  }).select().single();
  agentId = ag.id;
  await uc.from('agent_files').insert({ agent_id: agentId, file_url: `agent-${agentId}-claude.md`, file_type: 'claude_md', file_name: 'claude.md', file_content: '# original content' });
  log('test agent created:', agentId);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const page = await ctx.newPage();
  page.on('dialog', d => d.accept().catch(() => {}));

  // login
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', pass);
  await page.click('button:has-text("Log In"), button:has-text("Log in")');
  await page.waitForTimeout(3500);

  // wait for the edit route to be deployed (form shows current title in the input)
  log('\n=== EDIT PAGE ===');
  let ready = false;
  for (let i = 0; i < 20; i++) {
    await page.goto(`${BASE}/agents/${agentId}/edit`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const v = await page.inputValue('input[type="text"]').catch(() => '');
    if (v.includes(`Edit Test ${ts}`)) { ready = true; break; }
    await page.waitForTimeout(8000);
  }
  log('  edit page deployed + prefilled:', ready);

  // verify fields prefilled
  const descVal = await page.inputValue('textarea').catch(() => '');
  log('  description prefilled:', descVal === 'original description');

  // edit fields
  await page.fill('input[type="text"]', `Edited Title ${ts}`);
  await page.fill('textarea:nth-of-type(1), textarea >> nth=0', 'updated description').catch(() => {});
  const contentBox = page.locator('textarea.font-mono');
  log('  content textarea found:', await contentBox.count());
  await contentBox.fill('# updated content\n\nNew instructions.');
  log('  content textarea value set to:', (await contentBox.inputValue()).slice(0, 30));
  await page.fill('input[placeholder="comma-separated"]', 'new, edited');
  await page.click('button:has-text("Save Changes")');
  await page.waitForTimeout(4000);
  log('  URL after save  :', page.url());
  log('  redirected to detail:', page.url().includes(`/agents/${agentId}`) && !page.url().includes('/edit'));

  // verify DB
  const { data: after } = await admin.from('agents').select('title,description,tags').eq('id', agentId).maybeSingle();
  const { data: files } = await admin.from('agent_files').select('id,file_type,file_content').eq('agent_id', agentId);
  const raw = await (await fetch(`${BASE}/api/agents/${agentId}/raw`, { cache: 'no-store' })).text();
  log('\n=== RESULT ===');
  log('  title updated   :', after?.title === `Edited Title ${ts}`, `("${after?.title}")`);
  log('  desc updated    :', after?.description === 'updated description');
  log('  tags updated    :', JSON.stringify(after?.tags));
  log('  agent_files rows:', files?.length, '->', JSON.stringify((files || []).map(f => ({ t: f.file_type, c: (f.file_content || '').slice(0, 20) }))));
  log('  content updated :', files?.some(f => f.file_content?.includes('updated content')));
  log('  /raw reflects it:', raw.includes('updated content'));

  // ownership gate: a different user must not be able to edit this agent
  log('\n=== OWNERSHIP GATE ===');
  const email2 = `edit2-${ts}@mailinator.com`;
  const { data: cu2 } = await admin.auth.admin.createUser({ email: email2, password: pass, email_confirm: true, user_metadata: { username: 'edit2_' + ts } });
  const page2 = await ctx.newPage();
  await page2.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' });
  await page2.fill('input[type="email"]', email2);
  await page2.fill('input[type="password"]', pass);
  await page2.click('button:has-text("Log In"), button:has-text("Log in")');
  await page2.waitForTimeout(3500);
  await page2.goto(`${BASE}/agents/${agentId}/edit`, { waitUntil: 'networkidle' });
  await page2.waitForTimeout(2500);
  const blocked = await page2.locator('text=only edit agents').count() > 0;
  log('  non-owner blocked from editing:', blocked);
  // also confirm a non-owner update is rejected at the DB layer (RLS)
  const uc2 = createClient(URL, ANON, { auth: { persistSession: false } });
  await uc2.auth.signInWithPassword({ email: email2, password: pass });
  const { error: hackErr } = await uc2.from('agents').update({ title: 'HACKED' }).eq('id', agentId);
  const { data: check } = await admin.from('agents').select('title').eq('id', agentId).maybeSingle();
  log('  RLS blocks non-owner update   :', check?.title !== 'HACKED', hackErr ? '(error returned)' : '(silently no-op)');
  await admin.from('users').delete().eq('id', cu2.user.id); await admin.auth.admin.deleteUser(cu2.user.id);

  await browser.close();
} catch (e) {
  log('TEST ERROR:', e.message);
} finally {
  log('\n=== CLEANUP ===');
  if (agentId) { await admin.from('agent_files').delete().eq('agent_id', agentId); await admin.from('agents').delete().eq('id', agentId); }
  if (uid) { await admin.from('users').delete().eq('id', uid); await admin.auth.admin.deleteUser(uid).catch(() => {}); }
  log('  done');
}
