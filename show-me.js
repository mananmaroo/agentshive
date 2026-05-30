const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('📸 TAKING FULL PAGE SCREENSHOTS NOW\n');

    // HOME
    console.log('1️⃣ HOME PAGE - https://agentstack-nu.vercel.app/');
    await page.goto('https://agentstack-nu.vercel.app/', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'show-home.png', fullPage: true });
    console.log('   ✅ Screenshot saved: show-home.png\n');

    // AGENTS
    console.log('2️⃣ AGENTS PAGE - https://agentstack-nu.vercel.app/agents');
    await page.goto('https://agentstack-nu.vercel.app/agents', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'show-agents.png', fullPage: true });
    console.log('   ✅ Screenshot saved: show-agents.png\n');

    // DONATE
    console.log('3️⃣ DONATE PAGE - https://agentstack-nu.vercel.app/donate');
    await page.goto('https://agentstack-nu.vercel.app/donate', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'show-donate.png', fullPage: true });
    console.log('   ✅ Screenshot saved: show-donate.png\n');

    console.log('✅ All screenshots ready! Showing below...');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
