const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  try {
    const sm = await (await page.goto('https://agentshive.net/sitemap.xml')).text();
    const id = (sm.match(/agents\/([0-9a-f-]{36})/) || [])[1];

    await page.goto('https://agentshive.net/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'm-home.png', fullPage: true });
    console.log('saved m-home.png');

    await page.goto('https://agentshive.net/agents', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'm-agents.png', fullPage: true });
    console.log('saved m-agents.png');

    if (id) {
      await page.goto(`https://agentshive.net/agents/${id}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'm-detail.png', fullPage: true });
      console.log('saved m-detail.png');
    }
  } catch (e) { console.error('Error:', e.message); }
  finally { await browser.close(); }
})();
