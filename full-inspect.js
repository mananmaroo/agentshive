const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const baseUrl = 'https://agentstack-nu.vercel.app';

  try {
    console.log('🔍 FULL SITE INSPECTION\n');

    // PAGE 1: HOME
    console.log('=' .repeat(50));
    console.log('1️⃣  HOME PAGE');
    console.log('='.repeat(50));
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

    // Check for sidebar
    const hasSidebar = await page.$('aside, nav.fixed, [class*="sidebar"]').catch(() => null);
    console.log(`Sidebar exists: ${hasSidebar ? '✅ YES' : '❌ NO'}`);

    // Check for main
    const hasMain = await page.$('main');
    console.log(`Main element: ${hasMain ? '✅ YES' : '❌ NO'}`);

    // Check for footer
    const hasFooter = await page.$('footer');
    console.log(`Footer: ${hasFooter ? '✅ YES' : '❌ NO'}`);

    // Check body flex
    const bodyClass = await page.$eval('body', el => el.className);
    console.log(`Body classes: ${bodyClass || 'none'}`);

    await page.screenshot({ path: 'home-check.png', fullPage: true });
    console.log('📸 Screenshot: home-check.png\n');

    // PAGE 2: AGENTS
    console.log('='.repeat(50));
    console.log('2️⃣  AGENTS PAGE');
    console.log('='.repeat(50));
    await page.goto(`${baseUrl}/agents`, { waitUntil: 'networkidle' });

    const agentCards = await page.$$('a[href*="/agents/"]');
    console.log(`Agent cards found: ${agentCards.length}`);

    const noAgentsMsg = await page.$text('No agents found').catch(() => null);
    if (noAgentsMsg) console.log(`⚠️  Message: "${noAgentsMsg}"`);

    await page.screenshot({ path: 'agents-check.png', fullPage: true });
    console.log('📸 Screenshot: agents-check.png\n');

    // PAGE 3: LEARN
    console.log('='.repeat(50));
    console.log('3️⃣  LEARN/VIDEOS PAGE');
    console.log('='.repeat(50));
    await page.goto(`${baseUrl}/learn-videos`, { waitUntil: 'networkidle' });

    const videos = await page.$$('[class*="video"], iframe, img[alt*="thumbnail"]');
    console.log(`Video elements: ${videos.length}`);

    await page.screenshot({ path: 'learn-check.png', fullPage: true });
    console.log('📸 Screenshot: learn-check.png\n');

    // PAGE 4: BLOG
    console.log('='.repeat(50));
    console.log('4️⃣  BLOG PAGE');
    console.log('='.repeat(50));
    await page.goto(`${baseUrl}/blog`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'blog-check.png', fullPage: true });
    console.log('📸 Screenshot: blog-check.png\n');

    // PAGE 5: DONATE
    console.log('='.repeat(50));
    console.log('5️⃣  DONATE PAGE');
    console.log('='.repeat(50));
    await page.goto(`${baseUrl}/donate`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'donate-check.png', fullPage: true });
    console.log('📸 Screenshot: donate-check.png\n');

    console.log('✅ Inspection complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
