# ScrapedAnimeSite (MAL Top Anime) — Puppeteer Scraper + Frontend

A small Node.js + Puppeteer project that scrapes **MyAnimeList (MAL) Top Anime** and visualizes the results in a simple frontend.

> Flow: **Puppeteer scrape → `anime.json` → `index.html` renders cards**

## What it does
- Opens `https://myanimelist.net/topanime.php`
- Extracts:
  - Anime title (`h3 a` inside `.ranking-list`)
  - Anime image URL (`img` tag; prefers `data-src`, then `src`)
- Saves results to `anime.json`
- `index.html` loads `anime.json` and renders a responsive grid (first 50 items).

## Project structure
- `index.js` — Puppeteer scraping script
- `anime.json` — Output data consumed by the frontend
- `index.html` — Frontend UI to display scraped results
- `catalog.html` — (Unused/placeholder; UI lives in `index.html`)
- `package.json` — Dependencies (Puppeteer)

## Setup
1. Install Node.js (LTS recommended)
2. Install dependencies:
   ```bash
   cd Backend_PT/ScrapedAnimeSite
   npm install
   ```

## Scrape the data
Run the scraper:
```bash
node index.js
```

- It runs Puppeteer (not headless) and writes `anime.json` in the same folder.
- After completion, you should see logs like total count + sample data.

## View the catalog
1. Scrape first (so `anime.json` exists)
2. Open `index.html` in your browser.

**Tip (recommended):** serve the folder with a simple static server to avoid any browser restrictions around `fetch('anime.json')`.

Example (if you have Python):
```bash
cd Backend_PT/ScrapedAnimeSite
python -m http.server 8000
```
Then open:
- `http://localhost:8000/index.html`

## Customization
### Change the source URL
In `index.js`, update:
- `page.goto('https://myanimelist.net/topanime.php', ...)`

### Change extracted fields / selectors
In `index.js`, the `page.evaluate()` uses:
- `.ranking-list`
- `h3 a` for title
- `img` for image URL

If MAL changes their HTML, you may need to adjust these selectors.

### Show more/less cards
In `index.html`, this line controls rendering:
```js
data.slice(0, 50).forEach(...)
```
Change `50` to whatever you want.

## Troubleshooting
- **Puppeteer fails / cannot load page:** MAL may block automated browsing. Try running at a different time or ensure network access.
- **Images broken:** the script attempts to normalize URLs by replacing `t.jpg` with `jpg`. If MAL changes filenames, adjust that logic.
- **`anime.json` fetch error in browser:** make sure you ran `node index.js` first and that you’re serving the files (not strictly required in all cases, but often helps).

## Notes (important)
- This project scrapes content from a third-party website.
- Use responsibly and comply with the website’s Terms of Service and robots policy.
- For production use, consider caching, rate limiting, and honoring site rules.

