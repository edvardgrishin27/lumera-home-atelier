#!/usr/bin/env node

/**
 * Indexation Monitor — checks which pages are indexed by Google and Yandex.
 *
 * Usage: node scripts/check-indexation.mjs
 *
 * Reads sitemap.xml and checks each URL for indexation by fetching
 * the page directly to confirm it's accessible (HTTP 200).
 * For actual search engine indexation, use Google Search Console
 * and Yandex.Webmaster dashboards.
 *
 * This script checks:
 *   1. All sitemap URLs return HTTP 200
 *   2. Pre-rendered HTML files exist in dist/
 *   3. Meta tags are present in pre-rendered HTML
 *   4. JSON-LD is present in pre-rendered HTML
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

// ─── Config ───

const SITE_URL = 'https://lumerahome.ru';
const CHECK_LIVE = process.argv.includes('--live');

let passed = 0;
let failed = 0;
const issues = [];

function ok(msg) { passed++; console.log(`  ✅ ${msg}`); }
function fail(msg) { failed++; issues.push(msg); console.log(`  ❌ ${msg}`); }
function warn(msg) { console.log(`  ⚠️  ${msg}`); }

// ─── 1. Parse sitemap ───

console.log('🔍 Indexation Monitor\n');

const sitemapPath = join(ROOT, 'public', 'sitemap.xml');
if (!existsSync(sitemapPath)) {
    console.error('❌ sitemap.xml not found. Run: node scripts/generate-sitemap.mjs');
    process.exit(1);
}

const sitemap = readFileSync(sitemapPath, 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);

console.log(`📋 Found ${urls.length} URLs in sitemap.xml\n`);

// ─── 2. Check pre-rendered files ───

console.log('── Pre-rendered HTML check ──\n');

for (const url of urls) {
    const path = url.replace(SITE_URL, '');
    const route = path === '' ? '/' : path;

    // Check if pre-rendered HTML exists
    let htmlPath;
    if (route === '/') {
        htmlPath = join(DIST, 'index.html');
    } else {
        htmlPath = join(DIST, route, 'index.html');
    }

    if (existsSync(htmlPath)) {
        const html = readFileSync(htmlPath, 'utf8');
        const size = Math.round(html.length / 1024);

        // Check for real content (not just empty SPA shell)
        const hasContent = html.includes('</h1>') || html.includes('</h2>') || html.includes('</p>');
        const hasMetaDesc = /<meta[^>]*name="description"/.test(html);
        const hasJsonLd = /application\/ld\+json/.test(html);
        const hasOgTitle = /og:title/.test(html);

        if (hasContent && size > 5) {
            ok(`${route} — ${size}KB, content: ✓, meta: ${hasMetaDesc ? '✓' : '✗'}, JSON-LD: ${hasJsonLd ? '✓' : '✗'}, OG: ${hasOgTitle ? '✓' : '✗'}`);
        } else {
            fail(`${route} — ${size}KB, may be empty SPA shell (no content tags found)`);
        }
    } else {
        fail(`${route} — pre-rendered HTML not found at ${htmlPath}`);
    }
}

// ─── 3. Live check (optional) ───

if (CHECK_LIVE) {
    console.log('\n── Live URL accessibility check ──\n');
    warn('Checking live URLs (this may take a minute)...\n');

    for (const url of urls) {
        try {
            const res = await fetch(url, {
                method: 'HEAD',
                headers: { 'User-Agent': 'LumeraSEOBot/1.0' },
                signal: AbortSignal.timeout(10000),
            });

            if (res.ok) {
                ok(`${url} — HTTP ${res.status}`);
            } else {
                fail(`${url} — HTTP ${res.status}`);
            }
        } catch (e) {
            fail(`${url} — ${e.message}`);
        }
    }
}

// ─── 4. Additional checks ───

console.log('\n── Additional checks ──\n');

// robots.txt accessible
if (existsSync(join(ROOT, 'public', 'robots.txt'))) ok('robots.txt exists');
else fail('robots.txt missing');

// Verification files
if (existsSync(join(ROOT, 'public', 'yandex_a88e44fd7a0f27ed.html'))) ok('Yandex verification file');
else warn('Yandex verification file missing');

if (existsSync(join(ROOT, 'public', 'googled3970ff07d75de16.html'))) ok('Google verification file');
else warn('Google verification file missing');

// sitemap in robots.txt
const robots = readFileSync(join(ROOT, 'public', 'robots.txt'), 'utf8');
if (robots.includes('Sitemap:')) ok('Sitemap referenced in robots.txt');
else fail('Sitemap not referenced in robots.txt');

// ─── Report ───

console.log('\n' + '═'.repeat(60));
console.log('  INDEXATION REPORT');
console.log('═'.repeat(60));
console.log(`\n  ${urls.length} pages in sitemap`);
console.log(`  ${passed} checks passed`);
console.log(`  ${failed} checks failed`);

if (issues.length > 0) {
    console.log('\n  Issues to fix:');
    for (const issue of issues) console.log(`    • ${issue}`);
}

console.log('\n  💡 For actual search engine indexation status, check:');
console.log('     • Google: https://search.google.com/search-console');
console.log('     • Yandex: https://webmaster.yandex.ru');

if (!CHECK_LIVE) {
    console.log('\n  💡 Run with --live flag to check actual URL accessibility:');
    console.log('     node scripts/check-indexation.mjs --live');
}

console.log('');

if (failed > 0) process.exit(1);
