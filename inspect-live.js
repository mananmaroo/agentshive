const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const baseUrl = 'https://agentstack-nu.vercel.app';

  try {
    console.log('🔍 Inspecting live deployment...\n');

    // HOME PAGE
    console.log('📍 HOME PAGE:');
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'home-live.png', fullPage: true });
    console.log('✅ Screenshot: home-live.png');

    // Check for sidebar
    const sidebarHome = await page.$('.fixed.left-0');
    console.log(`   Sidebar: ${sidebarHome ? '✅ YES' : '❌ NO'}`);

    // Check for footer
    const footerHome = await page.$('footer');
    console.log(`   Footer: ${footerHome ? '✅ YES' : '❌ NO'}`);

    // AGENTS PAGE
    console.log('\n📍 AGENTS PAGE:');
    await page.goto(`${baseUrl}/agents`, { waitUntil: 'networkidle' });

    // Count agent cards
    const agentCards = await page.$$('a[href*="/agents/"]');
    const agentCount = agentCards.filter(a => !a.getAttribute('href').includes('/agents/upload')).length;
    console.log(`   Agents found: ${agentCount}`);

    // Check for sidebar
    const sidebarAgents = await page.$('.fixed.left-0');
    console.log(`   Sidebar: ${sidebarAgents ? '✅ YES' : '❌ NO'}`);

    // Check background color
    const bgElement = await page.$('main');
    if (bgElement) {
      const bgClass = await bgElement.getAttribute('class');
      console.log(`   Background: ${bgClass ? 'Custom' : 'Default'}`);
    }

    await page.screenshot({ path: 'agents-live.png', fullPage: true });
    console.log('✅ Screenshot: agents-live.png');

    // LEARN/VIDEOS PAGE
    console.log('\n📍 LEARN PAGE:');
    await page.goto(`${baseUrl}/learn-videos`, { waitUntil: 'networkidle' });

    // Count navbar items
    const navItems = await page.$$('nav a, nav button, aside a');
    console.log(`   Nav items: ${navItems.length}`);

    // Check for sidebar
    const sidebarLearn = await page.$('.fixed.left-0');
    console.log(`   Sidebar: ${sidebarLearn ? '✅ YES' : '❌ NO'}`);

    await page.screenshot({ path: 'learn-live.png', fullPage: true });
    console.log('✅ Screenshot: learn-live.png');

    // Check console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    console.log(`\n📊 Console errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log('   Errors:');
      errors.slice(0, 3).forEach(e => console.log(`   - ${e}`));
    }

    console.log('\n✨ Inspection complete!');
    console.log('Check: home-live.png, agents-live.png, learn-live.png');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
