/**
 * Puppeteer Screenshot Tool — Dark Mode variant
 * Usage: node scripts/screenshot-dark.mjs [url] [output] [--full]
 */

import puppeteer from 'puppeteer-core';
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

const args = process.argv.slice(2);
const url = args[0] || 'https://lumerahome.ru';
const output = args[1] || 'screenshots/screenshot-dark.png';
const fullPage = args.includes('--full');

const dir = dirname(output);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function takeScreenshot() {
  console.log(`📸 Capturing (dark): ${url}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1440,900',
      '--host-resolver-rules=MAP lumerahome.ru 147.45.153.45,MAP www.lumerahome.ru 147.45.153.45',
      '--ignore-certificate-errors',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));

  // Enable dark mode
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('lumera_theme', 'dark');
  });
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 800)));

  if (fullPage) {
    await page.evaluate(async () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const step = window.innerHeight;
      for (let y = 0; y < scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 300));
      }
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 500));
    });
  }

  await page.screenshot({ path: output, fullPage, type: 'png' });
  await browser.close();
  console.log(`✅ Saved: ${output}`);
}

takeScreenshot().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
