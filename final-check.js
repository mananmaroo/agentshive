const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('⏳ Waiting for Vercel deployment to be ready...\n');
  
  try {
    // Check current state
    await page.goto('https://agentstack-nu.vercel.app/', { waitUntil: 'load', timeout: 10000 });
    await page.waitForTimeout(2000);
    
    console.log('📊 CURRENT STATUS:');
    
    const sidebar = await page.$('aside.fixed');
    console.log(`  Sidebar: ${sidebar ? '✅ VISIBLE' : '❌ MISSING'}`);
    
    const agents = await page.$$('a[href*="/agents/"]').then(l => l.filter(a => !a.getAttribute('href').includes('/upload')).length);
    console.log(`  Agents: ${agents} found`);
    
    const supportedFormats = await page.$text('Supported Agent Formats').catch(() => null);
    console.log(`  Supported Formats in main: ${supportedFormats ? '❌ YES (BAD)' : '✅ NO (GOOD)'}`);
    
    const footer = await page.$('footer');
    console.log(`  Footer: ${footer ? '✅ EXISTS' : '❌ MISSING'}`);
    
    await page.screenshot({ path: 'final-status.png', fullPage: true });
    console.log(`  📸 Screenshot saved: final-status.png`);
    
    console.log('\n✅ Check complete! Review final-status.png');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
