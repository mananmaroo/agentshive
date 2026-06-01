import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'https://agentstack-nu.vercel.app';
const MAX_PAGES = 40;

const visited = new Set();
const queue = ['/'];
const internalLinks = new Map();
const externalLinks = new Map();
const pageResults = [];

const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: 'agentshive-linkcheck/playwright' });

while (queue.length && visited.size < MAX_PAGES) {
  const path = queue.shift();
  const url = new URL(path, BASE).toString();
  if (visited.has(url)) continue;
  visited.add(url);

  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  let status = 0;
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 });
    status = resp?.status() ?? 0;
    await page.waitForTimeout(500);
  } catch (err) {
    pageResults.push({ url, status, error: String(err.message ?? err), consoleErrors });
    await page.close();
    continue;
  }

  const hrefs = await page.$$eval('a[href]', (els) => els.map((el) => el.getAttribute('href')));
  const title = await page.title();

  pageResults.push({ url, status, title, linkCount: hrefs.length, consoleErrors });

  for (const href of hrefs) {
    if (!href) continue;
    let abs;
    try { abs = new URL(href, url).toString(); } catch { continue; }
    const u = new URL(abs);
    u.hash = '';
    const finalUrl = u.toString();
    const isInternal = u.hostname === new URL(BASE).hostname;
    const map = isInternal ? internalLinks : externalLinks;
    if (!map.has(finalUrl)) map.set(finalUrl, { sources: new Set() });
    map.get(finalUrl).sources.add(url);
    if (isInternal && !visited.has(finalUrl) && !queue.includes(u.pathname + u.search)) {
      if (!/\.(png|jpg|jpeg|gif|svg|webp|ico|pdf|zip|mp4)$/i.test(u.pathname)) {
        queue.push(u.pathname + u.search);
      }
    }
  }
  await page.close();
}

await browser.close();

// Probe every collected link with HEAD/GET
async function probe(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'agentshive-linkcheck/1.0' } });
    return { status: res.status, finalUrl: res.url };
  } catch (e) {
    return { status: 0, error: String(e.message ?? e) };
  }
}

async function probeAll(map) {
  const entries = [...map.entries()];
  for (let i = 0; i < entries.length; i += 8) {
    const batch = entries.slice(i, i + 8);
    await Promise.all(batch.map(async ([url, info]) => {
      const r = await probe(url);
      info.status = r.status;
      info.finalUrl = r.finalUrl;
      info.error = r.error;
    }));
  }
}
await probeAll(internalLinks);
await probeAll(externalLinks);

const brokenPages = pageResults.filter((p) => p.status === 0 || p.status >= 400);
const brokenInternal = [...internalLinks.entries()].filter(([_, v]) => v.status === 0 || v.status >= 400);
const brokenExternal = [...externalLinks.entries()].filter(([_, v]) => v.status === 0 || v.status >= 400);
const pagesWithErrors = pageResults.filter((p) => p.consoleErrors?.length);

console.log('=== CRAWL ===');
console.log(`Base:           ${BASE}`);
console.log(`Pages crawled:  ${pageResults.length}`);
console.log(`Internal links: ${internalLinks.size}`);
console.log(`External links: ${externalLinks.size}`);
console.log(`Broken pages:   ${brokenPages.length}`);
console.log(`Broken intl:    ${brokenInternal.length}`);
console.log(`Broken extl:    ${brokenExternal.length}`);
console.log(`Pages w/ JS err: ${pagesWithErrors.length}`);

console.log('\n=== ALL PAGES ===');
for (const p of pageResults) {
  console.log(`  [${p.status}] ${p.url}  links=${p.linkCount ?? 0}  title="${p.title ?? ''}"`);
}

if (brokenPages.length) {
  console.log('\n=== BROKEN PAGES ===');
  brokenPages.forEach((p) => console.log(`  [${p.status || 'ERR'}] ${p.url} ${p.error ?? ''}`));
}
if (brokenInternal.length) {
  console.log('\n=== BROKEN INTERNAL LINKS ===');
  brokenInternal.forEach(([u, v]) => console.log(`  [${v.status || 'ERR'}] ${u}\n     from: ${[...v.sources].slice(0,3).join(', ')}`));
}
if (brokenExternal.length) {
  console.log('\n=== BROKEN EXTERNAL LINKS ===');
  brokenExternal.forEach(([u, v]) => console.log(`  [${v.status || 'ERR'}] ${u}\n     from: ${[...v.sources].slice(0,3).join(', ')}`));
}
if (pagesWithErrors.length) {
  console.log('\n=== PAGES WITH JS CONSOLE ERRORS ===');
  pagesWithErrors.forEach((p) => {
    console.log(`  ${p.url}`);
    p.consoleErrors.slice(0, 3).forEach((e) => console.log(`     ! ${String(e).slice(0,200)}`));
  });
}

console.log('\n=== ALL EXTERNAL LINKS ===');
for (const [url, info] of externalLinks) {
  console.log(`  [${info.status}] ${url}`);
}
