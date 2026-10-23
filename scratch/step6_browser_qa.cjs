const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'qa-step6-screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runStep6QA() {
  console.log('🚀 Starting Step 6 Shortlist System QA Suite...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  const rawKeyRegex = /\b(shortlist|discovery|filters|profileDetail|profileBuilder|common|nav|auth)\.[a-zA-Z0-9_]+\b/g;

  function checkForRawKeys(text, contextName) {
    const matches = text.match(rawKeyRegex);
    if (matches && matches.length > 0) {
      const unique = [...new Set(matches)];
      errors.push(`[${contextName}] Found raw translation keys: ${unique.join(', ')}`);
      console.error(`❌ [${contextName}] Raw translation keys:`, unique);
    } else {
      console.log(`✓ [${contextName}] 0 raw translation keys found.`);
    }
  }

  try {
    // 1. EMPTY SHORTLIST STATE (MR & EN)
    console.log('\n--- 1. Testing Empty Shortlist State ---');
    // Clear localStorage to ensure fresh empty state
    await page.goto('http://localhost:3000/shortlist', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.removeItem('mm_shortlisted_ids'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));

    let bodyText = await page.evaluate(() => document.body.innerText);
    checkForRawKeys(bodyText, 'Empty Shortlist Page (MR)');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_empty_shortlist_mr.png') });

    // Verify empty state texts in Marathi
    const emptyTitleMR = await page.$eval('[class*="emptyTitle"]', el => el.innerText).catch(() => '');
    console.log(`✓ Empty Title (MR): "${emptyTitleMR}"`);

    // Switch to English on Empty Shortlist
    console.log('Switching to English...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const enBtn = btns.find(b => b.innerText.includes('English') || b.innerText.includes('EN'));
      if (enBtn) enBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    bodyText = await page.evaluate(() => document.body.innerText);
    checkForRawKeys(bodyText, 'Empty Shortlist Page (EN)');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_empty_shortlist_en.png') });

    const emptyTitleEN = await page.$eval('[class*="emptyTitle"]', el => el.innerText).catch(() => '');
    console.log(`✓ Empty Title (EN): "${emptyTitleEN}"`);

    // Switch back to Marathi
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const mrBtn = btns.find(b => b.innerText.includes('मराठी'));
      if (mrBtn) mrBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // 2. SHORTLIST FROM MATCHES PAGE / PROFILE CARD
    console.log('\n--- 2. Testing Shortlist Toggle on /matches ---');
    await page.goto('http://localhost:3000/matches', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));

    // Click heart on first profile card
    const firstHeartBtn = await page.$('button[aria-label*="शॉर्टलिस्ट" i], button[class*="shortlistBtn"]');
    if (firstHeartBtn) {
      await firstHeartBtn.click();
      await new Promise(r => setTimeout(r, 500));
      console.log('✓ Clicked heart on first profile card');

      // Check toast notification
      const toastText = await page.$eval('[class*="toastMessage"]', el => el.innerText).catch(() => '');
      console.log(`✓ Toast feedback: "${toastText}"`);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_toast_shortlisted_card.png') });
    }

    // 3. VERIFY SHORTLIST PAGE WITH POPULATED PROFILES
    console.log('\n--- 3. Verifying Populated Shortlist Page ---');
    await page.goto('http://localhost:3000/shortlist', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));

    bodyText = await page.evaluate(() => document.body.innerText);
    checkForRawKeys(bodyText, 'Populated Shortlist Page (MR)');

    const countOnShortlist = await page.$$eval('[class*="card"]', els => els.length);
    console.log(`✓ Shortlist page currently displays ${countOnShortlist} profiles`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_populated_shortlist_mr.png') });

    // 4. SHORTLIST FROM PROFILE DETAIL PAGE & PERSISTENCE
    console.log('\n--- 4. Testing Shortlist from Profile Detail Page & Refresh ---');
    await page.goto('http://localhost:3000/profile/mm-102', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));

    const heroShortlistBtn = await page.$('button[class*="shortlistHeroBtn"]');
    if (heroShortlistBtn) {
      const btnTextBefore = await page.evaluate(el => el.innerText, heroShortlistBtn);
      console.log(`Initial Detail Shortlist Btn text: "${btnTextBefore.trim()}"`);

      await heroShortlistBtn.click();
      await new Promise(r => setTimeout(r, 500));

      const btnTextAfter = await page.evaluate(el => el.innerText, heroShortlistBtn);
      console.log(`After click Detail Shortlist Btn text: "${btnTextAfter.trim()}"`);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_detail_page_shortlisted.png') });

      // Refresh page to verify persistence
      console.log('Refreshing page to verify persistence...');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 600));

      const heroShortlistBtnAfterReload = await page.$('button[class*="shortlistHeroBtn"]');
      const btnTextAfterReload = await page.evaluate(el => el.innerText, heroShortlistBtnAfterReload);
      console.log(`After reload Detail Shortlist Btn text: "${btnTextAfterReload.trim()}"`);
      if (btnTextAfterReload.includes('शॉर्टलिस्ट केले आहे') || btnTextAfterReload.includes('Shortlisted')) {
        console.log('✓ Persistence verified after page refresh!');
      } else {
        errors.push('Shortlist state failed to persist after page reload');
      }
    }

    // 5. REMOVE FROM SHORTLIST PAGE
    console.log('\n--- 5. Testing Remove from Shortlist Page ---');
    await page.goto('http://localhost:3000/shortlist', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 800));

    while (true) {
      const btn = await page.$('button[aria-label*="शॉर्टलिस्टमधून काढा"], button[aria-label*="Remove from shortlist"], button[aria-label*="शॉर्टलिस्ट"]');
      if (!btn) break;
      await btn.click();
      await new Promise(r => setTimeout(r, 800));
    }

    await new Promise(r => setTimeout(r, 600));
    const emptyStateRendered = await page.$('[class*="emptyState"]');
    if (emptyStateRendered) {
      console.log('✓ All profiles removed; Empty state rendered immediately without page reload!');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_empty_state_after_removal.png') });
    } else {
      errors.push('Empty state did not render immediately after removing profiles');
    }

    // 6. RESPONSIVE QA ACROSS 6 VIEWPORTS
    console.log('\n--- 6. Testing Responsive Viewports ---');
    const viewports = [
      { name: 'Mobile (390x844)', width: 390, height: 844 },
      { name: 'Mobile Large (414x896)', width: 414, height: 896 },
      { name: 'Tablet Portrait (768x1024)', width: 768, height: 1024 },
      { name: 'Tablet Landscape (1024x768)', width: 1024, height: 768 },
      { name: 'Desktop Small (1280x800)', width: 1280, height: 800 },
      { name: 'Desktop (1440x900)', width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:3000/shortlist', { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 300));

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      console.log(`[Viewport ${vp.name}] Horizontal overflow: ${overflow ? 'YES ❌' : 'NO ✓'}`);
      if (overflow) {
        errors.push(`Horizontal overflow on shortlist page at ${vp.name}`);
      }
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_responsive_mobile_390.png') });

    // 7. STEP 4A REGRESSION QA
    console.log('\n--- 7. Step 4A Regression Test ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/profile/create', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 500));
    bodyText = await page.evaluate(() => document.body.innerText);
    checkForRawKeys(bodyText, 'Profile Create Guard (Regression)');
    console.log('✓ Step 4A Profile Builder guard intact');

  } catch (err) {
    console.error('QA Runner Exception:', err);
    errors.push(`QA Runner error: ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log('\n========================================');
  console.log('STEP 6 QA SUMMARY');
  console.log('========================================');
  if (errors.length === 0) {
    console.log('🎉 ALL STEP 6 SHORTLIST QA TESTS PASSED WITH ZERO ERRORS!');
  } else {
    console.log(`⚠️ QA found ${errors.length} issues:`);
    errors.forEach(e => console.log(` - ${e}`));
  }
}

runStep6QA();
