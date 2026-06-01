// Open a browser and capture what a non-technical 12-year-old sees on key pages.
// Saves a screenshot of each page + the visible text headings so we can review.
import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const BASE = process.env.BASE ?? 'https://agentstack-nu.vercel.app';
const OUT = './scripts/walkthrough';

const stops = [
  { path: '/', name: 'home' },
  { path: '/agents', name: 'browse' },
  { path: '/agents/c4b250d4-53f2-4a92-a15c-72081cdf3d92', name: 'agent-detail' },
  { path: '/agents/upload', name: 'upload' },
  { path: '/learn', name: 'learn' },
  { path: '/learn-videos', name: 'learn-videos' },
  { path: '/blog', name: 'blog' },
  { path: '/categories', name: 'categories' },
  { path: '/faq', name: 'faq' },
  { path: '/about', name: 'about' },
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });

const summary = [];

for (const stop of stops) {
  const page = await ctx.newPage();
  const url = new URL(stop.path, BASE).toString();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(800);
  } catch (err) {
    summary.push({ stop, error: String(err.message ?? err) });
    await page.close();
    continue;
  }
  const headings = await page.$$eval('h1, h2, h3', (els) =>
    els.map((el) => `${el.tagName}: ${el.textContent?.trim()}`).slice(0, 25)
  );
  const ctaButtons = await page.$$eval('button, a.bg-indigo-600, a[class*="bg-indigo"]', (els) =>
    els
      .map((el) => el.textContent?.trim())
      .filter((t) => t && t.length < 60 && t.length > 1)
      .slice(0, 20)
  );
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 2500));
  await page.screenshot({ path: `${OUT}/${stop.name}.png`, fullPage: true });
  summary.push({ stop, headings, ctaButtons, bodyText });
  await page.close();
}

await browser.close();
await writeFile(`${OUT}/walk-data.json`, JSON.stringify(summary, null, 2), 'utf8');

for (const s of summary) {
  console.log('\n\n========================================');
  console.log(s.stop.path);
  console.log('========================================');
  if (s.error) {
    console.log('ERROR:', s.error);
    continue;
  }
  console.log('\nHeadings:');
  for (const h of s.headings.slice(0, 8)) console.log('  ' + h);
  console.log('\nCTAs:');
  for (const c of s.ctaButtons.slice(0, 10)) console.log('  - ' + c);
  console.log('\nBody preview:');
  console.log(s.bodyText.slice(0, 700));
}
