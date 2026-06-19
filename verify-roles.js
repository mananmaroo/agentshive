const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  try {
    await page.goto('https://agentshive.net/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    const rolesHeading = await page.locator('text=What can agents do for you?').count();
    console.log('Roles section:', rolesHeading > 0 ? 'LIVE' : 'MISSING');
    const categoriesStat = await page.locator('p:has-text("Categories")').count();
    console.log('Categories stat:', categoriesStat > 0 ? 'LIVE' : 'MISSING');
    const creatorsStat = await page.locator('p.text-sm:has-text("Creators")').count();
    console.log('Old Creators stat removed:', creatorsStat === 0 ? 'YES' : 'NO');
    const h1Count = await page.locator('h1').count();
    console.log('h1 elements on homepage:', h1Count);

    // Role card deep link
    await page.locator('text=Students & Job Seekers').click();
    await page.waitForTimeout(3000);
    console.log('After role card click, URL:', page.url());
    const eduCard = await page.locator('text=Tech Interview Prep Coach').count();
    console.log('Education agents filtered:', eduCard > 0 ? 'YES' : 'NO');

    await page.goto('https://agentshive.net/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const roles = page.locator('text=What can agents do for you?');
    await roles.scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'live-roles-section.png' });
    console.log('Screenshot: live-roles-section.png');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
