const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Mock auth session object for supabase
const mockAuthSession = {
  access_token: 'mock-test-access-token-step4a',
  token_type: 'bearer',
  expires_in: 3600,
  refresh_token: 'mock-refresh-token',
  user: {
    id: 'test-user-step4a-uuid',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'testuser@marathimatrimony.com',
    email_confirmed_at: '2026-09-28T10:00:00.000Z',
    phone: '',
    user_metadata: {
      first_name: 'Rahul',
      last_name: 'Kadam',
    },
    app_metadata: {
      provider: 'email',
    },
    created_at: '2026-09-28T10:00:00.000Z',
    updated_at: '2026-09-28T10:00:00.000Z',
  },
};

// Supabase project storage key
const SUPABASE_STORAGE_KEY = 'sb-kurdyzoumgjrfwwucxyg-auth-token';

async function runQA() {
  console.log('🚀 Starting Comprehensive Browser QA for Profile Builder...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // 1. Navigate to localhost
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // 2. Set mock session in localStorage
  await page.evaluate((key, session) => {
    localStorage.setItem(key, JSON.stringify(session));
    localStorage.setItem('dev_mock_user', JSON.stringify(session.user));
    localStorage.setItem('app_language', 'mr');
  }, SUPABASE_STORAGE_KEY, mockAuthSession);

  // 3. Navigate to /profile/create
  console.log('Navigating to http://localhost:3000/profile/create...');
  await page.goto('http://localhost:3000/profile/create', { waitUntil: 'networkidle0' });
  await page.waitForTimeout ? page.waitForTimeout(1000) : new Promise(r => setTimeout(r, 1000));

  const results = [];

  for (let step = 1; step <= 10; step++) {
    console.log(`\n--- Testing Step ${step} (Marathi) ---`);

    // Click step tab directly via stepper buttons
    if (step > 1) {
      await page.evaluate((stepNum) => {
        // Find stepper buttons (the 10 pills inside StepperHeader)
        const allButtons = Array.from(document.querySelectorAll('button'));
        const stepperButtons = allButtons.filter(b => {
          const txt = b.textContent || '';
          return txt.includes(`${stepNum}.`) || txt.includes(`${stepNum}`) || txt.includes(`टप्पा ${stepNum}`);
        });
        if (stepperButtons.length > 0) {
          stepperButtons[0].click();
        }
      }, step);
      await new Promise(r => setTimeout(r, 600));
    }

    // Capture text content
    const pageText = await page.evaluate(() => document.body.innerText);
    const pageHtml = await page.evaluate(() => document.body.innerHTML);

    // Check for raw keys
    const rawKeyMatches = pageText.match(/profileBuilder\.[a-zA-Z0-9_]+/g) || [];

    // Check form controls styling
    const controlsAudit = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="range"])'));
      const selects = Array.from(document.querySelectorAll('select'));
      const textareas = Array.from(document.querySelectorAll('textarea'));

      const inputHeights = inputs.map(i => window.getComputedStyle(i).height);
      const inputRadii = inputs.map(i => window.getComputedStyle(i).borderRadius);
      const selectAppearances = selects.map(s => window.getComputedStyle(s).appearance || window.getComputedStyle(s).webkitAppearance);
      const selectHeights = selects.map(s => window.getComputedStyle(s).height);

      // Check section cards
      const sectionHeaders = Array.from(document.querySelectorAll('h3, h4')).map(h => h.textContent.trim());

      return {
        inputCount: inputs.length,
        selectCount: selects.length,
        textareaCount: textareas.length,
        inputHeights: inputHeights.slice(0, 5),
        inputRadii: inputRadii.slice(0, 5),
        selectAppearances: selectAppearances.slice(0, 5),
        selectHeights: selectHeights.slice(0, 5),
        sectionHeaders: sectionHeaders.slice(0, 6),
      };
    });

    console.log(`Step ${step} Stats:`);
    console.log(`  Raw keys found: ${rawKeyMatches.length} (${rawKeyMatches.join(', ') || 'NONE'})`);
    console.log(`  Inputs: ${controlsAudit.inputCount}, Selects: ${controlsAudit.selectCount}, Textareas: ${controlsAudit.textareaCount}`);
    console.log(`  Section Headers: ${controlsAudit.sectionHeaders.join(' | ')}`);
    if (controlsAudit.selectCount > 0) {
      console.log(`  Select appearance: ${controlsAudit.selectAppearances.join(', ')}`);
      console.log(`  Select heights: ${controlsAudit.selectHeights.join(', ')}`);
    }

    // Save screenshot
    const screenshotPath = path.join(SCREENSHOT_DIR, `step_${step}_mr.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    results.push({
      step,
      language: 'mr',
      rawKeysCount: rawKeyMatches.length,
      rawKeys: rawKeyMatches,
      controlsAudit,
      screenshot: screenshotPath,
    });
  }

  // Test English Toggle
  console.log('\n--- Switching Language to English ---');
  await page.evaluate(() => {
    localStorage.setItem('app_language', 'en');
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const enText = await page.evaluate(() => document.body.innerText);
  const enRawKeys = enText.match(/profileBuilder\.[a-zA-Z0-9_]+/g) || [];
  console.log(`English Mode Raw keys found: ${enRawKeys.length} (${enRawKeys.join(', ') || 'NONE'})`);

  const enScreenshot = path.join(SCREENSHOT_DIR, `step_1_en.png`);
  await page.screenshot({ path: enScreenshot, fullPage: true });

  // Mobile Viewport test (390 x 844 iPhone 14)
  console.log('\n--- Testing Mobile Viewport (390 x 844) ---');
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const mobileScreenshot = path.join(SCREENSHOT_DIR, `mobile_step_1.png`);
  await page.screenshot({ path: mobileScreenshot, fullPage: true });

  await browser.close();

  console.log('\n=============================================');
  console.log('QA RUN COMPLETE!');
  console.log('=============================================');
  const allRawKeys = results.reduce((acc, r) => acc + r.rawKeysCount, 0) + enRawKeys.length;
  console.log(`TOTAL RAW KEYS ACROSS ALL STEPS: ${allRawKeys}`);
  if (allRawKeys === 0) {
    console.log('✅ ZERO RAW KEYS VERIFIED IN RENDERED BROWSER DOM!');
  } else {
    console.error('❌ RAW KEYS STILL DETECTED IN DOM!');
  }
}

runQA().catch(err => {
  console.error('QA Error:', err);
  process.exit(1);
});
