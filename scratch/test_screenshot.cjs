const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ 
      headless: 'new',
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    
    console.log('Navigating to http://localhost:3000/search ...');
    await page.goto('http://localhost:3000/search', { waitUntil: 'networkidle2' });
    
    // Wait 1.5s for the 800ms race timeout to complete and render cards
    await new Promise(r => setTimeout(r, 1800));
    
    // Check cards
    const cards = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('h3, h4')).map(h => h.textContent.trim());
      const imgs = Array.from(document.querySelectorAll('img')).map(i => i.src);
      return { items, imgs };
    });
    console.log('Cards found:', cards);

    await page.screenshot({ path: 'a:/Marathi Matrimony/scratch/search_rendered_final.png' });
    console.log('Saved search_rendered_final.png');

    await browser.close();
  } catch (err) {
    console.error('Error:', err);
  }
})();
