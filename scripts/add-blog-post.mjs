#!/usr/bin/env node

/**
 * Blog Article Generator — adds a new blog post to the site.
 *
 * Usage:
 *   node scripts/add-blog-post.mjs \
 *     --slug "kak-vybrat-stol" \
 *     --title "Как выбрать обеденный стол" \
 *     --category "Гид по выбору" \
 *     --image "https://s3.twcstorage.ru/.../image.jpg" \
 *     --excerpt "Краткое описание статьи для карточки." \
 *     --content-file "./articles/kak-vybrat-stol.html"
 *
 * What it does:
 *   1. Adds HTML content to src/data/blogContent.js
 *   2. Adds post metadata to src/context/ContentContext.jsx
 *   3. Adds route to scripts/prerender.mjs
 *   4. Adds slug to scripts/generate-sitemap.mjs
 *   5. Bumps CACHE_VERSION
 *   6. Regenerates sitemap.xml
 *
 * After running, just commit + push — CI/CD handles the rest.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ─── Parse args ───

function getArg(name) {
    const idx = process.argv.indexOf(`--${name}`);
    return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : null;
}

const slug = getArg('slug');
const title = getArg('title');
const category = getArg('category') || 'Гид по выбору';
const image = getArg('image') || 'https://placehold.co/1200x675';
const excerpt = getArg('excerpt') || title;
const contentFile = getArg('content-file');

if (!slug || !title) {
    console.error(`
❌ Missing required arguments.

Usage:
  node scripts/add-blog-post.mjs \\
    --slug "kak-vybrat-stol" \\
    --title "Как выбрать обеденный стол" \\
    --category "Гид по выбору" \\
    --image "https://s3.twcstorage.ru/.../image.jpg" \\
    --excerpt "Краткое описание..." \\
    --content-file "./articles/kak-vybrat-stol.html"
`);
    process.exit(1);
}

// ─── Read HTML content ───

let htmlContent = '';
if (contentFile && existsSync(contentFile)) {
    htmlContent = readFileSync(contentFile, 'utf8').trim();
    console.log(`📄 Read content from ${contentFile} (${htmlContent.length} chars)`);
} else if (contentFile) {
    console.error(`❌ Content file not found: ${contentFile}`);
    process.exit(1);
} else {
    // Generate placeholder content
    htmlContent = `<p class="first-letter:text-7xl first-letter:font-serif first-letter:text-accent first-letter:mr-3 first-letter:float-left">${excerpt}</p>

<h2>Раздел 1</h2>
<p>Содержание раздела. Замените этот текст на полноценную статью.</p>

<h2>Раздел 2</h2>
<p>Содержание раздела. Замените этот текст на полноценную статью.</p>`;
    console.log('📝 Generated placeholder content (replace with real article)');
}

const today = new Date();
const months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
const dateStr = `${String(today.getDate()).padStart(2, '0')} ${months[today.getMonth()]}, ${today.getFullYear()}`;

console.log(`\n🚀 Adding blog post: "${title}"\n`);

// ─── 1. Add to blogContent.js ───

const blogContentPath = join(ROOT, 'src', 'data', 'blogContent.js');
let blogContentSrc = readFileSync(blogContentPath, 'utf8');

if (blogContentSrc.includes(`'${slug}'`)) {
    console.log('  ⚠️  blogContent.js — slug already exists, skipping');
} else {
    const escaped = htmlContent.replace(/`/g, '\\`').replace(/\$/g, '\\$');
    const newEntry = `\n    '${slug}': \`${escaped}\`,`;
    blogContentSrc = blogContentSrc.replace(/\n};/, `${newEntry}\n};`);
    writeFileSync(blogContentPath, blogContentSrc, 'utf8');
    console.log('  ✅ blogContent.js — article HTML added');
}

// ─── 2. Add to ContentContext.jsx ───

const ctxPath = join(ROOT, 'src', 'context', 'ContentContext.jsx');
let ctxSrc = readFileSync(ctxPath, 'utf8');

if (ctxSrc.includes(`"${slug}"`)) {
    console.log('  ⚠️  ContentContext.jsx — slug already exists, skipping');
} else {
    // Find the last post with blogContent and add after it
    const lastPostRegex = /\{ id: (\d+),.*?content: blogContent\['[^']+'\] \},?\s*\n(\s+)\]/;
    const lastPostMatch = ctxSrc.match(lastPostRegex);

    if (lastPostMatch) {
        const lastId = parseInt(lastPostMatch[1]);
        const indent = lastPostMatch[2];
        const newPost = `{ id: ${lastId + 1}, slug: "${slug}", title: "${title}", date: "${dateStr}", category: "${category}", image: "${image}", excerpt: "${excerpt}", content: blogContent['${slug}'] },\n${indent}]`;
        ctxSrc = ctxSrc.replace(lastPostRegex, newPost);
    }

    // Bump CACHE_VERSION
    const versionMatch = ctxSrc.match(/const CACHE_VERSION = (\d+);/);
    if (versionMatch) {
        const newVersion = parseInt(versionMatch[1]) + 1;
        ctxSrc = ctxSrc.replace(/const CACHE_VERSION = \d+;/, `const CACHE_VERSION = ${newVersion};`);
        console.log(`  ✅ ContentContext.jsx — post added, CACHE_VERSION bumped to ${newVersion}`);
    }

    writeFileSync(ctxPath, ctxSrc, 'utf8');
}

// ─── 3. Add to prerender.mjs ───

const prerenderPath = join(ROOT, 'scripts', 'prerender.mjs');
let prerenderSrc = readFileSync(prerenderPath, 'utf8');

const blogRoute = `/blog/${slug}`;
if (prerenderSrc.includes(`'${blogRoute}'`)) {
    console.log('  ⚠️  prerender.mjs — route already exists, skipping');
} else {
    prerenderSrc = prerenderSrc.replace(
        "    '/contact',",
        `    '${blogRoute}',\n    '/contact',`
    );
    writeFileSync(prerenderPath, prerenderSrc, 'utf8');
    console.log('  ✅ prerender.mjs — route added');
}

// ─── 4. Add to generate-sitemap.mjs ───

const sitemapScriptPath = join(ROOT, 'scripts', 'generate-sitemap.mjs');
let sitemapSrc = readFileSync(sitemapScriptPath, 'utf8');

if (sitemapSrc.includes(`'${slug}'`)) {
    console.log('  ⚠️  generate-sitemap.mjs — slug already exists, skipping');
} else {
    sitemapSrc = sitemapSrc.replace(
        /(\s+)'razmery-divanov-tablitsa-standarty',\n\];/,
        `$1'razmery-divanov-tablitsa-standarty',\n$1'${slug}',\n];`
    );
    writeFileSync(sitemapScriptPath, sitemapSrc, 'utf8');
    console.log('  ✅ generate-sitemap.mjs — slug added');
}

// ─── 5. Regenerate sitemap ───

try {
    // Safe: no user input in args, just running a known script
    execFileSync('node', ['scripts/generate-sitemap.mjs'], { cwd: ROOT, stdio: 'pipe' });
    console.log('  ✅ sitemap.xml regenerated');
} catch (e) {
    console.log('  ⚠️  Could not regenerate sitemap:', e.message);
}

// ─── Done ───

console.log(`
🎉 Done! New blog post "${title}" added.

Next steps:
  1. Review the changes: git diff
  2. Commit: git add -A && git commit -m "feat(blog): add article — ${title}"
  3. Push: git push origin main
  4. CI/CD will build, audit, and deploy automatically.
`);
