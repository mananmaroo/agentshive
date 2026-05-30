const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('🔍 CHECKING LIVE SITE NOW\n');

    // HOME PAGE
    console.log('HOME PAGE:');
    await page.goto('https://agentstack-nu.vercel.app/', { waitUntil: 'load' });
    await page.waitForTimeout(1000);
    
    const sidebar = await page.$('aside.fixed');
    console.log(`  Sidebar: ${sidebar ? '✅ SHOWING' : '❌ NOT SHOWING'}`);
    
    const sidebarVisible = sidebar ? await page.isVisible('aside.fixed') : false;
    console.log(`  Sidebar visible: ${sidebarVisible ? '✅ YES' : '❌ NO'}`);
    
    const mainContent = await page.$('main');
    console.log(`  Main content: ${mainContent ? '✅ EXISTS' : '❌ MISSING'}`);
    
    await page.screenshot({ path: 'live-home.png', fullPage: true });
    console.log('  📸 Screenshot: live-home.png\n');

    // AGENTS PAGE
    console.log('AGENTS PAGE:');
    await page.goto('https://agentstack-nu.vercel.app/agents', { waitUntil: 'load' });
    await page.waitForTimeout(1000);
    
    const agentsCount = await page.$$('a[href*="/agents/"]').then(links => 
      links.filter(l => !l.getAttribute('href').includes('/upload')).length
    ).catch(() => 0);
    console.log(`  Agent cards: ${agentsCount} found`);
    
    const noAgentsText = await page.$('text=No agents found').catch(() => null);
    if (noAgentsText) console.log('  ⚠️  "No agents found" message showing');
    
    await page.screenshot({ path: 'live-agents.png', fullPage: true });
    console.log('  📸 Screenshot: live-agents.png\n');

    // DONATE PAGE
    console.log('DONATE PAGE:');
    try {
      await page.goto('https://agentstack-nu.vercel.app/donate', { waitUntil: 'load' });
      await page.waitForTimeout(1000);
      const donateTitle = await page.$text('Support Agentshive').catch(() => null);
      console.log(`  Donate page: ${donateTitle ? '✅ LOADS' : '❌ ERROR'}`);
      await page.screenshot({ path: 'live-donate.png', fullPage: true });
    } catch (e) {
      console.log(`  Donate page: ❌ ERROR - ${e.message}`);
    }
    console.log('  📸 Screenshot: live-donate.png\n');

    // REQUEST-AGENT PAGE
    console.log('REQUEST-AGENT PAGE:');
    try {
      await page.goto('https://agentstack-nu.vercel.app/request-agent', { waitUntil: 'load' });
      await page.waitForTimeout(1000);
      const requestTitle = await page.$text('Request Agent').catch(() => null);
      console.log(`  Request page: ${requestTitle ? '✅ LOADS' : '❌ ERROR'}`);
      await page.screenshot({ path: 'live-request.png', fullPage: true });
    } catch (e) {
      console.log(`  Request page: ❌ ERROR - ${e.message}`);
    }
    console.log('  📸 Screenshot: live-request.png\n');

    console.log('✅ Inspection complete!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
