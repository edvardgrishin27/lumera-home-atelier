/**
 * Pre-render script for SEO
 * Generates static HTML for all public routes using Puppeteer.
 * Run after `vite build`: node scripts/prerender.mjs
 *
 * This solves the main SEO problem: search engines (especially Yandex)
 * can't execute JavaScript to see CSR content. Pre-rendered HTML
 * gives them full page content at crawl time.
 */

import { spawn } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const PORT = 4173;

// All public routes to pre-render
const ROUTES = [
    '/',
    '/catalog',
    '/product/milano-sofa',
    '/product/zenit-armchair',
    '/product/marble-blocks',
    '/product/oak-wave-chair',
    '/product/cloud-sectional',
    '/product/travertine-table',
    '/b2b',
    '/about',
    '/blog',
    '/blog/filosofiya-pustoty',
    '/blog/kak-vybrat-divan',
    '/blog/trendy-interiera-2025',
    '/contact',
    '/request',
];

async function prerender() {
    console.log('🔍 Pre-rendering pages for SEO...\n');

    // Start preview server
    const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
        cwd: ROOT,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
    });

    // Wait for server to be ready
    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Server start timeout')), 15000);
        server.stdout.on('data', (data) => {
            const str = data.toString();
            if (str.includes('Local:') || str.includes(String(PORT))) {
                clearTimeout(timeout);
                resolve();
            }
        });
        server.stderr.on('data', (data) => {
            const str = data.toString();
            if (str.includes('Local:') || str.includes(String(PORT))) {
                clearTimeout(timeout);
                resolve();
            }
        });
    });

    console.log(`  ✅ Preview server started on port ${PORT}\n`);

    let browser;
    try {
        // Dynamic import puppeteer-core
        const puppeteer = await import('puppeteer-core');

        // Find Chrome executable
        const chromePaths = [
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium',
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        ];

        let executablePath;
        for (const p of chromePaths) {
            if (existsSync(p)) {
                executablePath = p;
                break;
            }
        }

        if (!executablePath) {
            // Fallback: try regular puppeteer (which bundles Chrome)
            try {
                const puppeteerFull = await import('puppeteer');
                browser = await puppeteerFull.default.launch({ headless: 'new' });
            } catch {
                console.error('❌ No Chrome/Chromium found. Install puppeteer or Google Chrome.');
                process.exit(1);
            }
        }

        if (!browser) {
            browser = await puppeteer.default.launch({
                executablePath,
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
        }

        const page = await browser.newPage();

        // Set viewport for desktop rendering
        await page.setViewport({ width: 1280, height: 800 });

        let rendered = 0;

        for (const route of ROUTES) {
            const url = `http://localhost:${PORT}${route}`;

            try {
                await page.goto(url, {
                    waitUntil: 'networkidle0',
                    timeout: 30000,
                });

                // Wait for React to fully render
                await page.waitForSelector('#root > *', { timeout: 10000 });

                // Small extra delay for animations/lazy content
                await new Promise(r => setTimeout(r, 500));

                const html = await page.content();

                // Determine output path
                const routePath = route === '/' ? '/index.html' : `${route}/index.html`;
                const outputPath = join(DIST, routePath);
                const outputDir = dirname(outputPath);

                // Create directory if needed
                if (!existsSync(outputDir)) {
                    mkdirSync(outputDir, { recursive: true });
                }

                // Write pre-rendered HTML
                // For root route, overwrite the existing index.html
                if (route === '/') {
                    writeFileSync(join(DIST, 'index.html'), html, 'utf8');
                } else {
                    writeFileSync(outputPath, html, 'utf8');

                    // Also write a flat HTML file for servers that don't support directory index
                    const flatPath = join(DIST, `${route}.html`);
                    const flatDir = dirname(flatPath);
                    if (!existsSync(flatDir)) {
                        mkdirSync(flatDir, { recursive: true });
                    }
                    writeFileSync(flatPath, html, 'utf8');
                }

                rendered++;
                console.log(`  ✅ ${route}`);
            } catch (err) {
                console.error(`  ❌ ${route}: ${err.message}`);
            }
        }

        console.log(`\n🎉 Pre-rendered ${rendered}/${ROUTES.length} pages\n`);

    } finally {
        if (browser) await browser.close();
        server.kill();
    }
}

prerender().catch((err) => {
    console.error('Pre-render failed:', err);
    process.exit(1);
});
