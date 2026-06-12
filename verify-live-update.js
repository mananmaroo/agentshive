const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
  try {
    await page.goto('https://agentshive.net/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const hero = await page.textContent('h1').catch(() => null);
    console.log('H1:', hero);
    const hasSnippet = await page.locator('text=install any agent in one command').count();
    console.log('Install snippet visible:', hasSnippet > 0 ? 'YES' : 'NO');
    const hasRuntimes = await page.locator('text=Works with Claude Code').count();
    console.log('Runtime tagline visible:', hasRuntimes > 0 ? 'YES' : 'NO');
    const statsVisible = await page.locator('text=Free & Open').count();
    console.log('Stats strip visible:', statsVisible > 0 ? 'YES' : 'NO');

    await page.screenshot({ path: 'live-fresh-home.png', fullPage: false });
    console.log('Screenshot saved: live-fresh-home.png');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
