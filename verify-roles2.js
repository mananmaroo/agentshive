const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  try {
    await page.goto('https://agentshive.net/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(6000); // give the stats fetch time
    const statsText = await page.locator('div.flex.gap-8.md\\:gap-14').textContent().catch(() => null);
    console.log('Stats strip content:', statsText);

    // Direct category deep link
    await page.goto('https://agentshive.net/agents?category=Education', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);
    console.log('URL:', page.url());
    const eduCard = await page.locator('text=Tech Interview Prep Coach').count();
    const flash = await page.locator('text=Flashcard Generator').count();
    console.log('Education filter working:', (eduCard > 0 || flash > 0) ? 'YES' : 'NO');
    await page.screenshot({ path: 'live-category-filter.png' });
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
