const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  try {
    const sm = await (await page.goto('https://agentshive.net/sitemap.xml')).text();
    const id = (sm.match(/agents\/([0-9a-f-]{36})/) || [])[1];

    await page.goto('https://agentshive.net/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'mz-home-hero.png' }); // viewport only

    if (id) {
      await page.goto(`https://agentshive.net/agents/${id}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'mz-detail-top.png' });
    }
    console.log('done');
  } catch (e) { console.error('Error:', e.message); }
  finally { await browser.close(); }
})();
