const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport to desktop size
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    console.log('📸 Inspecting agentshive.net...\n');

    // Check home page
    console.log('1️⃣ HOME PAGE:');
    await page.goto('https://agentshive.net/', { waitUntil: 'networkidle' });
    const homeTitle = await page.title();
    console.log(`   Title: ${homeTitle}`);

    // Check for sidebar
    const sidebar = await page.$('.fixed.left-0.top-0');
    console.log(`   Sidebar visible: ${sidebar ? '✅ YES' : '❌ NO'}`);

    // Check for agents
    const agentsLink = await page.$('a[href="/agents"]');
    console.log(`   "/agents" link exists: ${agentsLink ? '✅ YES' : '❌ NO'}`);

    // Take screenshot
    await page.screenshot({ path: 'home-page.png' });
    console.log('   Screenshot saved: home-page.png\n');

    // Check agents page
    console.log('2️⃣ AGENTS PAGE:');
    await page.goto('https://agentshive.net/agents', { waitUntil: 'networkidle' });

    // Check for agents
    const agentCards = await page.$$('a[href^="/agents/"]');
    console.log(`   Agent cards found: ${agentCards.length}`);

    // Check for sidebar on agents page
    const agentSidebar = await page.$('.fixed.left-0.top-0');
    console.log(`   Sidebar visible: ${agentSidebar ? '✅ YES' : '❌ NO'}`);

    // Check page background
    const bgColor = await page.$eval('div.min-h-screen', el =>
      window.getComputedStyle(el).backgroundColor
    );
    console.log(`   Background color: ${bgColor}`);

    // Take screenshot
    await page.screenshot({ path: 'agents-page.png' });
    console.log('   Screenshot saved: agents-page.png\n');

    // Check learn/videos page
    console.log('3️⃣ LEARN/VIDEOS PAGE:');
    await page.goto('https://agentshive.net/learn-videos', { waitUntil: 'networkidle' });

    // Count nav tabs
    const navTabs = await page.$$('nav a, nav button');
    console.log(`   Navigation items: ${navTabs.length}`);

    // Take screenshot
    await page.screenshot({ path: 'learn-page.png' });
    console.log('   Screenshot saved: learn-page.png\n');

    console.log('✅ Inspection complete! Check the .png files.\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
