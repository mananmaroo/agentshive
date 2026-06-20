import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

const ts = Date.now();
const email = `agentshive26+qa${ts}@gmail.com`; // deliverable (plus-addressed to project inbox)
const username = `qa_${ts}`;
const password = `QaTest!${ts}`;
console.log('test account:', email, '/', username);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('https://agentshive.net/auth/signup', { waitUntil: 'networkidle', timeout: 60000 });

await page.fill('input[placeholder="your_username"]', username);
await page.fill('input[type="email"]', email);
await page.fill('input[type="password"]', password);
await page.click('button[type="submit"]');

let outcome = 'unknown';
try {
  // Wait until the submit resolves: URL changes, OR the button leaves its loading state
  // and a notice/error appears.
  await page.waitForFunction(
    () => !location.pathname.includes('/auth/signup') ||
      (!/creating account/i.test(document.body.innerText) &&
        /confirmation link|almost there|check your|error|already|invalid|wrong|unable/i.test(document.body.innerText)),
    { timeout: 30000 }
  );
} catch { outcome = 'timeout (still processing after 30s)'; }
await page.waitForTimeout(1500);

const url = page.url();
const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 400);
if (!url.includes('/auth/signup')) outcome = `redirected to ${new URL(url).pathname} (signed in — email confirmation OFF)`;
else if (/confirmation link|almost there/i.test(bodyText)) outcome = 'confirmation email required (confirmation ON)';
else if (/error|already|invalid/i.test(bodyText)) outcome = 'error shown';
await page.screenshot({ path: 'reel-shots/signup-result.png' });
console.log('OUTCOME:', outcome);
console.log('url:', url);
await browser.close();

// Verify the public.users row was created by the DB trigger, then clean up.
await new Promise((r) => setTimeout(r, 2500));
const rows = await (await fetch(`${URL_}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=id,username`, { headers: H })).json();
console.log('public.users row created:', rows.length ? `YES (${rows[0].username})` : 'NO');

// Cleanup: find the auth user by email and delete it.
const list = await (await fetch(`${URL_}/auth/v1/admin/users?per_page=200`, { headers: H })).json();
const authUser = (list.users || list).find?.((u) => u.email === email);
if (authUser) {
  const del = await fetch(`${URL_}/auth/v1/admin/users/${authUser.id}`, { method: 'DELETE', headers: H });
  console.log('cleanup: deleted test auth user:', del.ok ? 'OK' : `FAILED ${del.status}`);
} else {
  console.log('cleanup: auth user not found in first page (may need manual removal)');
}
