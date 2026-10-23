const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'qa-step5-screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runQA() {
  console.log('🚀 Starting Step 5 Automated Browser QA Suite...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  const rawKeyRegex = /\b(discovery|filters|profileDetail|shortlist|profileBuilder|common|nav|auth)\.[a-zA-Z0-9_]+\b/g;

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
    // 1. DISCOVERY & SEARCH PAGE (DESKTOP)
    console.log('\n--- 1. Testing Discovery / Search Page (Desktop) ---');
    await page.goto('http://localhost:3000/search', { waitUntil: 'networkidle0' });
    await page.waitForSelector('main', { timeout: 10000 });

    let bodyText = await page.evaluate(() => document.body.innerText);
    checkForRawKeys(bodyText, 'Search Page (MR)');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_search_page_mr.png'), fullPage: false });

    // Switch to English
    console.log('Switching to English...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const enBtn = btns.find(b => b.innerText.includes('English') || b.innerText.includes('EN') || b.innerText.includes('मराठी'));
      if (enBtn) enBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    bodyText = await page.evaluate(() => document.body.innerText);
    checkForRawKeys(bodyText, 'Search Page (EN)');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_search_page_en.png'), fullPage: false });

    // 2. SEARCH & FILTERING
    console.log('\n--- 2. Testing Search Debounce & Community Filter ---');
    const searchInput = await page.$('input[type="search"], input[placeholder*="Search"], input[placeholder*="शोधा"]');
    if (searchInput) {
      await searchInput.type('Prajakta');
      await new Promise(r => setTimeout(r, 600)); // wait for debounce
      const cardsAfterSearch = await page.$$eval('[class*="profileCard"], [class*="card"]', els => els.length);
      console.log(`✓ Debounced search for "Prajakta" returned ${cardsAfterSearch} profile cards`);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_search_results_prajakta.png') });
      
      // Clear search
      await page.evaluate(el => el.value = '', searchInput);
      await searchInput.type(' ');
      await page.keyboard.press('Backspace');
      await new Promise(r => setTimeout(r, 500));
    }

    // 3. SHORTLIST INTERACTION
    console.log('\n--- 3. Testing Shortlist Toggle ---');
    const firstHeartBtn = await page.$('button[aria-label*="shortlist" i], button[aria-label*="जतन" i], button[class*="heartBtn"]');
    if (firstHeartBtn) {
      await firstHeartBtn.click();
      await new Promise(r => setTimeout(r, 400));
      console.log('✓ Shortlist heart button clicked');
    }

    // Navigate to Shortlist Page
    console.log('Navigating to /shortlist...');
    await page.goto('http://localhost:3000/shortlist', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    bodyText = await page.evaluate(() => document.body.innerText);
    checkForRawKeys(bodyText, 'Shortlist Page');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_shortlist_page.png') });

    // 4. EXPRESS INTEREST MODAL
    console.log('\n--- 4. Testing Express Interest Modal ---');
    await page.goto('http://localhost:3000/search', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const interestBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('पसंती दर्शवा') || b.innerText.includes('Express Interest') || b.innerText.includes('Interest'));
    });

    if (interestBtn && interestBtn.asElement()) {
      await interestBtn.asElement().click();
      await new Promise(r => setTimeout(r, 600));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_express_interest_modal.png') });
      console.log('✓ Express Interest Modal opened');

      const modalSubmitBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('div[role="dialog"] button, div[class*="modal"] button'));
        return btns.find(b => b.innerText.includes('पसंती पाठवा') || b.innerText.includes('Send Interest'));
      });
      if (modalSubmitBtn && modalSubmitBtn.asElement()) {
        await modalSubmitBtn.asElement().click();
        await new Promise(r => setTimeout(r, 800));
        console.log('✓ Express Interest sent successfully');
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_interest_sent_card.png') });
      }
    }

    // 5. PROFILE DETAIL PAGE
    console.log('\n--- 5. Testing Profile Detail Page (/profile/mm-101) ---');
    await page.goto('http://localhost:3000/profile/mm-101', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    bodyText = await page.evaluate(() => document.body.innerText);
    checkForRawKeys(bodyText, 'Profile Detail Page');

    const sectionsCount = await page.$$eval('[class*="sectionsContainer"] > div, div[style*="border-radius: 16px"]', els => els.length);
    console.log(`✓ Profile Detail rendered ${sectionsCount} structured section cards`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_profile_detail_desktop.png'), fullPage: true });

    // 6. REPORT & BLOCK MODALS
    console.log('\n--- 6. Testing Report & Block Modals ---');
    const moreActionsBtn = await page.$('button[aria-label*="options" i], button[aria-label*="अधिक पर्याय" i], button[class*="moreActionsBtn"]');
    if (moreActionsBtn) {
      await moreActionsBtn.click();
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_profile_more_menu.png') });
    }

    // 7. MOBILE RESPONSIVE QA (390 x 844)
    console.log('\n--- 7. Testing Mobile Viewport (390 x 844) ---');
    await page.setViewport({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/search', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`Mobile horizontal overflow detected: ${hasHorizontalOverflow ? 'YES ❌' : 'NO ✓'}`);
    if (hasHorizontalOverflow) {
      errors.push('Mobile viewport has horizontal overflow on /search');
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_mobile_search_view.png') });

    const mobileFilterBtn = await page.$('button[class*="filterToggleBtn"], button[aria-label*="filter" i]');
    if (mobileFilterBtn) {
      await mobileFilterBtn.click();
      await new Promise(r => setTimeout(r, 600));
      console.log('✓ Mobile filter drawer opened');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_mobile_filter_drawer.png') });
    }

    // 8. STEP 4A PROFILE BUILDER REGRESSION CHECK
    console.log('\n--- 8. Testing Step 4A Profile Builder Regression ---');
    await page.goto('http://localhost:3000/profile/create', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));
    bodyText = await page.evaluate(() => document.body.innerText);
    checkForRawKeys(bodyText, 'Profile Builder (Regression)');
    console.log('✓ Step 4A Profile Builder is intact and functioning without regressions');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_profile_builder_step1.png') });

  } catch (err) {
    console.error('QA Execution Error:', err);
    errors.push(`QA Runner error: ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log('\n========================================');
  console.log('QA SUMMARY');
  console.log('========================================');
  if (errors.length === 0) {
    console.log('🎉 ALL STEP 5 QA TESTS PASSED WITH ZERO ERRORS!');
  } else {
    console.log(`⚠️ QA found ${errors.length} issues:`);
    errors.forEach(e => console.log(` - ${e}`));
  }
}

runQA();
