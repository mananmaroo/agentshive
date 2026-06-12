const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  try {
    // Mobile homepage
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobile.goto('https://agentshive.net/', { waitUntil: 'networkidle' });
    await mobile.waitForTimeout(2500);
    await mobile.screenshot({ path: 'audit-mobile-home.png', fullPage: true });
    console.log('saved audit-mobile-home.png');

    // Desktop browse page
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await desktop.goto('https://agentshive.net/agents', { waitUntil: 'networkidle' });
    await desktop.waitForTimeout(2500);
    await desktop.screenshot({ path: 'audit-desktop-agents.png' });
    console.log('saved audit-desktop-agents.png');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
