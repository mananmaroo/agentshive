// End-to-end test of signup + upload against the LIVE site.
// Creates a throwaway user, drives the real UI, inspects the DB, then cleans up.
//   node scripts/e2e_test.mjs
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split('\n')
  .filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const BASE = 'https://www.agentshive.net';
const ts = Date.now();
const EMAIL = `agentshive-e2e-${ts}@mailinator.com`;
const PASS = 'TestPass!2026';
const USERNAME = `e2e_tester_${ts}`;
const AGENT_TITLE = `E2E Test Agent ${ts}`;
const log = (...a) => console.log(...a);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const uploadCalls = [];
page.on('request', r => { if (r.url().includes('/api/agents/upload')) uploadCalls.push(r.method() + ' ' + r.url()); });

let createdUserId = null, createdAgentId = null;
try {
  // ---------- SIGNUP ----------
  log('\n=== 1. SIGNUP ===');
  await page.goto(`${BASE}/auth/signup`, { waitUntil: 'networkidle' });
  await page.fill('input[placeholder="your_username"]', USERNAME);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button:has-text("Create Account")');
  await page.waitForTimeout(4000);
  const afterSignupUrl = page.url();
  const signupErr = await page.$eval('.bg-red-500\\/20', el => el.textContent.trim()).catch(() => null);
  log('  URL after submit :', afterSignupUrl);
  log('  Error shown      :', signupErr || '(none)');

  // Inspect auth + profile via admin
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const authUser = list?.users?.find(u => u.email === EMAIL);
  createdUserId = authUser?.id || null;
  log('  Auth user created:', !!authUser, authUser ? `(confirmed=${!!authUser.email_confirmed_at})` : '');
  let profile = null;
  if (authUser) {
    const { data } = await admin.from('users').select('*').eq('id', authUser.id).maybeSingle();
    profile = data;
  }
  log('  users row created:', !!profile, profile ? `(username=${profile.username})` : '');

  // Confirm email so we can log in (simulates the user clicking the email link)
  if (authUser && !authUser.email_confirmed_at) {
    await admin.auth.admin.updateUserById(authUser.id, { email_confirm: true });
    log('  -> admin-confirmed email so login can proceed');
  }
  // If the profile insert failed at signup, create it so we can still test upload
  if (authUser && !profile) {
    await admin.from('users').insert({ id: authUser.id, username: USERNAME, email: EMAIL });
    log('  -> admin-created missing users row so upload test can proceed');
  }

  // ---------- LOGIN ----------
  log('\n=== 2. LOGIN ===');
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button:has-text("Log In"), button:has-text("Log in")');
  await page.waitForTimeout(4000);
  log('  URL after login  :', page.url());
  const loginErr = await page.$eval('.bg-red-500\\/20', el => el.textContent.trim()).catch(() => null);
  log('  Error shown      :', loginErr || '(none)');
  const hasSession = await page.evaluate(() =>
    Object.keys(localStorage).some(k => k.includes('auth-token') && localStorage.getItem(k)?.includes('access_token')));
  log('  Browser session  :', hasSession ? 'present (logged in)' : 'ABSENT (not logged in)');

  // ---------- UPLOAD ----------
  log('\n=== 3. UPLOAD ===');
  // wait until the new (wired-up) upload page is deployed: it has id="agent-file"
  let deployed = false;
  for (let i = 0; i < 20; i++) {
    await page.goto(`${BASE}/agents/upload`, { waitUntil: 'networkidle' });
    if (await page.$('#agent-file')) { deployed = true; break; }
    await page.waitForTimeout(8000);
  }
  log('  upload page deployed (wired form):', deployed);
  await page.fill('input[placeholder*="Research Assistant"]', AGENT_TITLE);
  await page.fill('textarea', 'An end-to-end test agent. Safe to delete.');
  await page.selectOption('select', 'Automation').catch(() => {});
  await page.fill('input[placeholder*="comma-separated"]', 'test,e2e');
  const tmp = `e2e-${ts}.md`;
  writeFileSync(tmp, `# ${AGENT_TITLE}\n\nTest agent content.\n`);
  await page.setInputFiles('input[type="file"]', tmp).catch(e => log('  (file input issue:', e.message + ')'));
  await page.check('input[type="checkbox"]').catch(() => {});
  await page.click('button:has-text("Upload Agent")');
  await page.waitForTimeout(4000);
  unlinkSync(tmp);
  log('  URL after submit :', page.url());
  log('  Calls to /api/agents/upload:', uploadCalls.length ? uploadCalls : 'NONE — form never hit the API');
  const { data: createdAgent } = await admin.from('agents').select('id').eq('title', AGENT_TITLE).maybeSingle();
  createdAgentId = createdAgent?.id || null;
  log('  Agent row in DB  :', createdAgentId ? `YES (${createdAgentId})` : 'NO — nothing was created');

  // ---------- VERDICT ----------
  log('\n=== VERDICT ===');
  log('  Signup works end-to-end:', (createdUserId && !signupErr) ? 'YES' : `PARTIAL/NO ${signupErr ? '(' + signupErr + ')' : ''}`);
  log('  Login works end-to-end :', hasSession ? 'YES' : 'NO');
  log('  Upload works end-to-end:', createdAgentId ? 'YES' : 'NO (form is a stub — no API call, no DB write)');
} catch (e) {
  log('TEST ERROR:', e.message);
} finally {
  // ---------- CLEANUP ----------
  log('\n=== CLEANUP ===');
  if (createdAgentId) { await admin.from('agent_files').delete().eq('agent_id', createdAgentId); await admin.from('agents').delete().eq('id', createdAgentId); log('  deleted test agent'); }
  if (createdUserId) { await admin.from('users').delete().eq('id', createdUserId); await admin.auth.admin.deleteUser(createdUserId).catch(() => {}); log('  deleted test user + profile'); }
  await browser.close();
  log('  done');
}
