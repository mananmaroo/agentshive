const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    await page.goto('https://agentshive.net/agents?category=Education', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);
    const count = await page.locator('text=Tech Interview Prep Coach').count();
    const counter = await page.locator('text=/of \\d+ agents/').first().textContent().catch(() => 'n/a');
    console.log('Result counter:', counter);
    console.log('Education filter working:', count > 0 ? 'YES' : 'NO');
    await page.screenshot({ path: 'live-cat-check.png' });
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
