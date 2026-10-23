const puppeteer = require('puppeteer-core');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function checkOverflow() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/profile/create', { waitUntil: 'networkidle0' });

  const overflowingElements = await page.evaluate(() => {
    const overflowList = [];
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 390 || el.scrollWidth > 390 || rect.right > 390) {
        overflowList.push({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          scrollWidth: el.scrollWidth,
          offsetWidth: el.offsetWidth,
          rectRight: rect.right,
          rectWidth: rect.width,
          textSnippet: (el.innerText || '').substring(0, 50).replace(/\n/g, ' ')
        });
      }
    });
    return overflowList.slice(0, 10);
  });

  console.log('Overflowing Elements on 390px Viewport:', overflowingElements);
  await browser.close();
}

checkOverflow().catch(console.error);
