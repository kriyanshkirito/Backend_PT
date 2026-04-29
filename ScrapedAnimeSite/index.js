const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });

  const page = await browser.newPage();

  // Open website
  await page.goto('https://myanimelist.net/topanime.php', {
    waitUntil: 'networkidle2'
  });

  console.log('✅ Page Loaded');

  // Wait for anime list
  await page.waitForSelector('.ranking-list');

  // Scrape data
  const animeData = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.ranking-list')).map(item => {
      const title = item.querySelector('h3 a')?.innerText.trim();

      const imgTag = item.querySelector('img');
      let image =
        imgTag?.getAttribute('data-src') || 
        imgTag?.getAttribute('src');

      if (image) {
        image = image.replace(/t\.jpg/, 'jpg');
      }

      return { title, image };
    });
  });

  // Save to JSON
  fs.writeFileSync('anime.json', JSON.stringify(animeData, null, 2));

  console.log('🎉 Scraping Done!');
  console.log(`📦 Total Anime: ${animeData.length}`);
  console.log('Sample Data:', animeData.slice(0, 5));

  await browser.close();
})();

