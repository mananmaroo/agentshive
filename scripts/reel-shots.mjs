import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

mkdirSync('reel-shots', { recursive: true });
const BASE = 'https://agentshive.net';
const browser = await chromium.launch();

async function shot(name, path, { mobile = false, full = true } = {}) {
  const ctx = await browser.newContext(
    mobile
      ? { viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2 }
      : { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }
  );
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `reel-shots/${name}.png`, fullPage: full });
  await ctx.close();
  console.log('shot:', name);
}

await shot('home-desktop', '/', { full: false });
await shot('companions-desktop', '/companions');
await shot('browse-desktop', '/agents');
await shot('home-mobile', '/', { mobile: true, full: false });
await shot('companions-mobile', '/companions', { mobile: true });

await browser.close();
console.log('done');
