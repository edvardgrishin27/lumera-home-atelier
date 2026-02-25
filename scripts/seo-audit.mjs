/**
 * SEO Audit Script — runs during CI/CD to catch regressions.
 * Checks all pages for: H1 tags, SEO component, alt-tags, JSON-LD, etc.
 *
 * Usage: node scripts/seo-audit.mjs
 * Exit code 1 if critical issues found, 0 if all OK.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');
const PAGES_DIR = join(SRC, 'pages');
const COMPONENTS_DIR = join(SRC, 'components');

// ─── Helpers ───

function read(path) {
    return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

let errors = 0;
let warnings = 0;
const results = [];

function fail(page, msg) { errors++; results.push(`  ❌ [${page}] ${msg}`); }
function warn(page, msg) { warnings++; results.push(`  ⚠️  [${page}] ${msg}`); }
function ok(page, msg) { results.push(`  ✅ [${page}] ${msg}`); }

console.log('🔍 Running SEO Audit...\n');

// ─── 1. H1 tags & SEO component on all pages ───

const skipPages = ['Admin', 'Login'];
const pageFiles = readdirSync(PAGES_DIR)
    .filter(f => f.endsWith('.jsx') && !skipPages.some(s => f.startsWith(s)))
    .map(f => ({ name: f.replace('.jsx', ''), path: join(PAGES_DIR, f) }));

for (const page of pageFiles) {
    const src = read(page.path);
    if (!src) continue;

    // H1 check
    if (/<h1[\s>]/.test(src)) ok(page.name, 'H1 tag');
    else fail(page.name, 'Missing H1 tag');

    // SEO component
    const hasSEO = /import SEO/.test(src) && /<SEO[\s\n]/.test(src);
    if (hasSEO) ok(page.name, 'SEO component');
    else if (page.name !== 'NotFound') fail(page.name, 'Missing SEO component');

    // Images without alt
    const imgs = src.match(/<img[\s\S]*?\/?\s*>/g) || [];
    const noAlt = imgs.filter(i => !/alt[={]/.test(i));
    if (noAlt.length > 0) fail(page.name, `${noAlt.length} image(s) without alt attribute`);
    else if (imgs.length > 0) ok(page.name, `${imgs.length} image(s) with alt`);
}

// ─── 2. JSON-LD schemas ───

const pd = read(join(PAGES_DIR, 'ProductDetail.jsx'));
if (pd) {
    const checks = { offers: /offers/.test(pd), brand: /brand/.test(pd), availability: /availability/.test(pd) };
    const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length === 0) ok('ProductDetail', 'Product JSON-LD complete (offers, brand, availability)');
    else fail('ProductDetail', `Product JSON-LD missing: ${missing.join(', ')}`);
}

const seo = read(join(COMPONENTS_DIR, 'SEO.jsx'));
if (seo && /BreadcrumbList/.test(seo)) ok('SEO.jsx', 'BreadcrumbList schema');
else fail('SEO.jsx', 'Missing BreadcrumbList schema');

for (const p of ['B2B', 'Delivery']) {
    const c = read(join(PAGES_DIR, `${p}.jsx`));
    if (c && /FAQPage/.test(c)) ok(p, 'FAQPage JSON-LD');
    else warn(p, 'No FAQPage JSON-LD');
}

// ─── 3. robots.txt ───

const robots = read(join(ROOT, 'public', 'robots.txt'));
if (robots) {
    if (/Allow:\s*\//.test(robots)) ok('robots.txt', 'Allow: / present');
    else fail('robots.txt', 'Missing Allow: /');
    if (/Sitemap:/.test(robots)) ok('robots.txt', 'Sitemap reference');
    else fail('robots.txt', 'Missing Sitemap reference');
    if (/Disallow:\s*\/admin/.test(robots)) ok('robots.txt', '/admin blocked');
    else warn('robots.txt', '/admin not blocked');
} else {
    fail('robots.txt', 'File not found');
}

// ─── 4. sitemap.xml ───

const sitemap = read(join(ROOT, 'public', 'sitemap.xml'));
if (sitemap) {
    const urlCount = (sitemap.match(/<url>/g) || []).length;
    if (urlCount >= 15) ok('sitemap.xml', `${urlCount} URLs`);
    else warn('sitemap.xml', `Only ${urlCount} URLs — expected 15+`);
    for (const p of ['/catalog', '/blog', '/delivery', '/b2b']) {
        if (sitemap.includes(p)) ok('sitemap.xml', `${p} included`);
        else fail('sitemap.xml', `${p} missing`);
    }
} else {
    fail('sitemap.xml', 'File not found');
}

// ─── 5. index.html ───

const html = read(join(ROOT, 'index.html'));
if (html) {
    if (/metrika|ym\(\d+/.test(html)) ok('index.html', 'Yandex.Metrika');
    else fail('index.html', 'Missing Yandex.Metrika');
    if (/og:title/.test(html)) ok('index.html', 'OG tags');
    else fail('index.html', 'Missing OG tags');
    if (/rel="canonical"/.test(html)) ok('index.html', 'Canonical URL');
    else warn('index.html', 'No canonical in index.html fallback');
} else {
    fail('index.html', 'File not found');
}

// ─── 6. Blog content ───

const blog = read(join(SRC, 'data', 'blogContent.js'));
if (blog) {
    const slugs = (blog.match(/['"][a-z0-9-]+['"]\s*:/g) || []).length;
    ok('blogContent.js', `${slugs} articles with HTML content`);
} else {
    warn('blogContent.js', 'No blog content file');
}

// ─── 7. Verification files ───

if (existsSync(join(ROOT, 'public', 'yandex_a88e44fd7a0f27ed.html')))
    ok('Verification', 'Yandex Webmaster file');
else warn('Verification', 'Missing Yandex Webmaster verification file');

if (existsSync(join(ROOT, 'public', 'googled3970ff07d75de16.html')))
    ok('Verification', 'Google Search Console file');
else warn('Verification', 'Missing Google Search Console verification file');

// ─── Report ───

console.log('\n' + '═'.repeat(60));
console.log('  SEO AUDIT REPORT');
console.log('═'.repeat(60) + '\n');

for (const r of results) console.log(r);

console.log('\n' + '─'.repeat(60));
console.log(`  Total: ${errors} errors, ${warnings} warnings`);
console.log('─'.repeat(60) + '\n');

if (errors > 0) {
    console.log('❌ SEO audit FAILED — fix errors before deploying.\n');
    process.exit(1);
} else if (warnings > 0) {
    console.log('⚠️  SEO audit PASSED with warnings.\n');
} else {
    console.log('✅ SEO audit PASSED — all checks OK!\n');
}
