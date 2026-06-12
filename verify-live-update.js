const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  try {
    // Homepage
    await page.goto('https://agentshive.net/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    const hasSnippet = await page.locator('text=install any agent in one command').count();
    console.log('Home: install snippet:', hasSnippet > 0 ? 'YES' : 'NO');
    await page.screenshot({ path: 'live-fresh-home.png' });

    // Browse agents — search for a newly seeded agent
    await page.goto('https://agentshive.net/agents?q=Code Review Companion', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    const card = page.locator('a[href*="/agents/"]', { hasText: 'Code Review Companion' }).first();
    const found = await card.count();
    console.log('Browse: "Code Review Companion" card:', found > 0 ? 'FOUND' : 'NOT FOUND');
    await page.screenshot({ path: 'live-fresh-agents.png' });

    // Agent detail — check gated download (logged out)
    if (found > 0) {
      const href = await card.getAttribute('href');
      await page.goto(`https://agentshive.net${href}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2500);
      const gatedBtn = await page.locator('text=Sign up to Download').count();
      const gatedCmd = await page.locator('text=Sign up free to get the install command').count();
      console.log('Detail: gated download button:', gatedBtn > 0 ? 'YES' : 'NO');
      console.log('Detail: gated install command:', gatedCmd > 0 ? 'YES' : 'NO');
      await page.screenshot({ path: 'live-fresh-detail.png', fullPage: false });
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
