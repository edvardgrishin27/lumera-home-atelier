/**
 * Dynamic sitemap.xml generator
 * Generates sitemap from routes and products data.
 * Run during build: node scripts/generate-sitemap.mjs
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const BASE_URL = 'https://lumerahome.ru';
const TODAY = new Date().toISOString().split('T')[0];

// Static pages
const STATIC_PAGES = [
    { url: '/',        priority: '1.0', changefreq: 'weekly' },
    { url: '/catalog', priority: '0.9', changefreq: 'weekly' },
    { url: '/about',   priority: '0.7', changefreq: 'monthly' },
    { url: '/b2b',     priority: '0.7', changefreq: 'monthly' },
    { url: '/blog',    priority: '0.8', changefreq: 'weekly' },
    { url: '/contact', priority: '0.6', changefreq: 'monthly' },
    { url: '/request', priority: '0.5', changefreq: 'monthly' },
    { url: '/delivery', priority: '0.7', changefreq: 'monthly' },
];

// Product slugs (sync with src/data/products.js)
const PRODUCT_SLUGS = [
    'milano-sofa',
    'zenit-armchair',
    'marble-blocks',
    'oak-wave-chair',
    'cloud-sectional',
    'travertine-table',
];

// Blog slugs (sync with blog content in api/defaults.js)
const BLOG_SLUGS = [
    'trendy-2026-vozvrashhenie-k-taktilnosti',
    'filosofiya-pustoty',
    'kollekcionnyj-dizajn-v-restorane',
    'ergonomika-lobbi-barov',
    'kak-vybrat-divan-polnoe-rukovodstvo',
    'kak-vybrat-krovat-razmer-matras-material',
    'razmery-divanov-tablitsa-standarty',
];

function generateSitemap() {
    const urls = [];

    // Static pages
    for (const page of STATIC_PAGES) {
        urls.push(`  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
    }

    // Product pages
    for (const slug of PRODUCT_SLUGS) {
        urls.push(`  <url>
    <loc>${BASE_URL}/product/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    }

    // Blog pages
    for (const slug of BLOG_SLUGS) {
        urls.push(`  <url>
    <loc>${BASE_URL}/blog/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    // Write to public/ (for dev) and dist/ (for build)
    writeFileSync(join(ROOT, 'public', 'sitemap.xml'), sitemap, 'utf8');
    console.log(`✅ Generated sitemap.xml with ${urls.length} URLs`);
}

generateSitemap();
