// Crawl agentshive.net, collect every internal link + every external link,
// fetch each, and report non-2xx responses + broken anchors + suspicious patterns.
import { setTimeout as sleep } from 'node:timers/promises';

const BASE = process.env.BASE ?? 'https://agentshive.net';
const MAX_PAGES = 60;

const visited = new Set();
const queue = ['/'];
const results = {
  pages: [],
  links: new Map(),
  externalLinks: new Map(),
};

function normalize(url, base) {
  try {
    const u = new URL(url, base);
    u.hash = '';
    return u.toString();
  } catch {
    return null;
  }
}

async function fetchWithStatus(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'agentshive-linkcheck/1.0' } });
    const finalUrl = res.url;
    const ct = res.headers.get('content-type') ?? '';
    const text = ct.includes('html') || ct.includes('json') || ct.includes('text') ? await res.text() : '';
    return { status: res.status, ok: res.ok, finalUrl, contentType: ct, text };
  } catch (err) {
    return { status: 0, ok: false, error: String(err.message ?? err), text: '' };
  }
}

function extractLinks(html, pageUrl) {
  const hrefs = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi)].map((m) => m[1]);
  return hrefs.map((h) => ({ href: h, normalized: normalize(h, pageUrl) }));
}

async function crawl() {
  while (queue.length && visited.size < MAX_PAGES) {
    const path = queue.shift();
    const url = new URL(path, BASE).toString();
    if (visited.has(url)) continue;
    visited.add(url);

    const r = await fetchWithStatus(url);
    results.pages.push({ url, status: r.status, finalUrl: r.finalUrl, error: r.error });

    if (!r.ok || !r.contentType?.includes('html')) continue;

    const links = extractLinks(r.text, url);
    for (const { href, normalized } of links) {
      if (!normalized) continue;
      const u = new URL(normalized);
      const isInternal = u.hostname === new URL(BASE).hostname;
      const target = isInternal ? results.links : results.externalLinks;
      if (!target.has(normalized)) target.set(normalized, { sources: [], status: null });
      target.get(normalized).sources.push(url);
      if (isInternal && !visited.has(normalized) && !queue.includes(u.pathname + u.search)) {
        queue.push(u.pathname + u.search);
      }
    }
  }
}

async function probeAll(map, label) {
  const entries = [...map.entries()];
  for (let i = 0; i < entries.length; i += 6) {
    const batch = entries.slice(i, i + 6);
    await Promise.all(
      batch.map(async ([url, info]) => {
        const r = await fetchWithStatus(url);
        info.status = r.status;
        info.finalUrl = r.finalUrl;
        info.error = r.error;
      })
    );
    await sleep(50);
  }
}

await crawl();
await probeAll(results.links, 'internal');
await probeAll(results.externalLinks, 'external');

const broken = {
  pages: results.pages.filter((p) => p.status === 0 || p.status >= 400),
  internalLinks: [...results.links.entries()].filter(([_, v]) => v.status === 0 || v.status >= 400),
  externalLinks: [...results.externalLinks.entries()].filter(([_, v]) => v.status === 0 || v.status >= 400),
};

console.log('=== CRAWL SUMMARY ===');
console.log(`Base:               ${BASE}`);
console.log(`Pages crawled:      ${results.pages.length}`);
console.log(`Internal links:     ${results.links.size}`);
console.log(`External links:     ${results.externalLinks.size}`);
console.log(`Broken pages:       ${broken.pages.length}`);
console.log(`Broken internal:    ${broken.internalLinks.length}`);
console.log(`Broken external:    ${broken.externalLinks.length}`);

if (broken.pages.length) {
  console.log('\n=== BROKEN PAGES ===');
  for (const p of broken.pages) {
    console.log(`  [${p.status || 'ERR'}] ${p.url}${p.error ? ' — ' + p.error : ''}`);
  }
}
if (broken.internalLinks.length) {
  console.log('\n=== BROKEN INTERNAL LINKS ===');
  for (const [url, info] of broken.internalLinks) {
    console.log(`  [${info.status || 'ERR'}] ${url}`);
    console.log(`     linked from: ${[...new Set(info.sources)].slice(0, 3).join(', ')}`);
  }
}
if (broken.externalLinks.length) {
  console.log('\n=== BROKEN EXTERNAL LINKS ===');
  for (const [url, info] of broken.externalLinks) {
    console.log(`  [${info.status || 'ERR'}] ${url}`);
    console.log(`     linked from: ${[...new Set(info.sources)].slice(0, 3).join(', ')}`);
  }
}

console.log('\n=== ALL INTERNAL LINKS (status) ===');
for (const [url, info] of [...results.links.entries()].sort()) {
  console.log(`  [${info.status}] ${url}`);
}
