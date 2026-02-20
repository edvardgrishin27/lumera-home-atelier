/**
 * Puppeteer Screenshot Tool for Lumera Home Atelier
 * Usage: node scripts/screenshot.mjs [url] [output] [--full] [--mobile] [--width=N] [--height=N]
 *
 * Examples:
 *   node scripts/screenshot.mjs https://lumerahome.ru screenshots/home-desktop.png --full
 *   node scripts/screenshot.mjs https://lumerahome.ru/catalog screenshots/catalog-mobile.png --mobile
 *   node scripts/screenshot.mjs http://localhost:5173 screenshots/dev.png --width=1440
 */

import puppeteer from 'puppeteer-core';
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

const args = process.argv.slice(2);
const url = args[0] || 'https://lumerahome.ru';
const output = args[1] || 'screenshots/screenshot.png';
const fullPage = args.includes('--full');
const mobile = args.includes('--mobile');
const widthArg = args.find(a => a.startsWith('--width='));
const heightArg = args.find(a => a.startsWith('--height='));

const width = widthArg ? parseInt(widthArg.split('=')[1]) : (mobile ? 390 : 1440);
const height = heightArg ? parseInt(heightArg.split('=')[1]) : (mobile ? 844 : 900);

// Ensure output directory exists
const dir = dirname(output);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function takeScreenshot() {
  console.log(`📸 Capturing: ${url}`);
  console.log(`   Viewport: ${width}x${height} | Full page: ${fullPage} | Mobile: ${mobile}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      `--window-size=${width},${height}`,
      '--host-resolver-rules=MAP lumerahome.ru 147.45.153.45,MAP www.lumerahome.ru 147.45.153.45',
      '--ignore-certificate-errors',
    ],
  });

  const page = await browser.newPage();

  await page.setViewport({
    width,
    height,
    deviceScaleFactor: mobile ? 3 : 2,
    isMobile: mobile,
    hasTouch: mobile,
  });

  if (mobile) {
    await page.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    );
  }

  // Navigate and wait for all animations/images to load
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait extra for GSAP animations and lazy-loaded images
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));

  // Scroll down and back up to trigger scroll-based animations (if full page)
  if (fullPage) {
    await page.evaluate(async () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const step = window.innerHeight;
      for (let y = 0; y < scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 300));
      }
      // Scroll back to top
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 500));
    });
  }

  await page.screenshot({
    path: output,
    fullPage,
    type: 'png',
  });

  await browser.close();
  console.log(`✅ Saved: ${output}`);
}

takeScreenshot().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
