const puppeteer = require('puppeteer');

async function testClick() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Set shortlist in localStorage
  await page.goto('http://localhost:3000/matches', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.setItem('mm_shortlisted_ids', JSON.stringify(['mm-101', 'mm-102'])));
  
  await page.goto('http://localhost:3000/shortlist', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  let cards = await page.$$eval('[class*="card"]', els => els.map(e => e.innerText.slice(0, 30)));
  console.log('Cards on shortlist:', cards);

  // Find heart button by aria-label or title
  const btn = await page.$('button[aria-label*="शॉर्टलिस्टमधून काढा"], button[aria-label*="Remove from shortlist"], button[aria-label*="शॉर्टलिस्ट"]');
  console.log('Found heart button:', !!btn);
  if (btn) {
    await btn.click();
    await new Promise(r => setTimeout(r, 1000));
  }

  cards = await page.$$eval('[class*="card"]', els => els.map(e => e.innerText.slice(0, 30)));
  console.log('Cards after first click:', cards);

  const localIds = await page.evaluate(() => localStorage.getItem('mm_shortlisted_ids'));
  console.log('localStorage mm_shortlisted_ids:', localIds);

  await browser.close();
}

testClick();
