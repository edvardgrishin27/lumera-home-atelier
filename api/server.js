import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import pool from './db.js';
import { seed } from './seed.js';
import { defaultSections, defaultProducts } from './defaults.js';

const app = new Hono();

// ─── Config ───
const PORT = parseInt(process.env.PORT || '3001');
const API_SECRET = process.env.API_SECRET;
const S3_BUCKET = process.env.S3_BUCKET || '0a6d6471-klikai-screenshots';
const S3_PREFIX = 'lumera';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT || 'https://s3.twcstorage.ru',
    region: process.env.S3_REGION || 'ru-1',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
    },
    forcePathStyle: true,
});

// ─── S3 Validation ───
const ALLOWED_FOLDERS = ['products', 'pages', 'blog', 'video', 'local'];
const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/webp', 'image/avif',
    'video/mp4', 'video/webm',
];

function sanitizeFilename(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9а-яё._-]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 100);
}

// ─── In-memory cache ───
const cache = {
    content: null,
    contentAt: 0,
    products: null,
    productsAt: 0,
};

function invalidateCache() {
    cache.content = null;
    cache.contentAt = 0;
    cache.products = null;
    cache.productsAt = 0;
}

// ─── Rate limiter (in-memory) ───
const rateLimits = new Map();

function rateLimit(ip, limit, windowMs = 60000) {
    const now = Date.now();
    const key = `${ip}`;
    let entry = rateLimits.get(key);

    if (!entry || now - entry.start > windowMs) {
        entry = { start: now, count: 1 };
        rateLimits.set(key, entry);
        return true;
    }

    entry.count++;
    if (entry.count > limit) {
        return false;
    }
    return true;
}

// Cleanup old rate limit entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimits) {
        if (now - entry.start > 120000) rateLimits.delete(key);
    }
}, 300000);

// ─── XSS sanitization ───
function sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
}

function sanitizeObject(obj) {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return sanitizeString(obj);
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitizeObject);
    const result = {};
    for (const [k, v] of Object.entries(obj)) {
        result[sanitizeString(k)] = sanitizeObject(v);
    }
    return result;
}

// ─── Middlewares ───
function authMiddleware(c, next) {
    if (!API_SECRET) {
        return c.json({ error: 'Server not configured' }, 500);
    }
    const auth = c.req.header('Authorization');
    if (!auth || auth !== `Bearer ${API_SECRET}`) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    return next();
}

function getIP(c) {
    return c.req.header('X-Real-IP') || c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() || 'unknown';
}

function publicRateLimit(c, next) {
    const ip = getIP(c);
    if (!rateLimit(ip, 100)) {
        return c.json({ error: 'Too many requests' }, 429);
    }
    return next();
}

function adminRateLimit(c, next) {
    const ip = getIP(c);
    if (!rateLimit(ip, 30)) {
        return c.json({ error: 'Too many requests' }, 429);
    }
    return next();
}

// ─── Validation helpers ───
const VALID_SECTION_KEYS = ['home', 'about', 'b2b', 'blog', 'contactPage', 'settings'];

function validateProduct(data) {
    const errors = [];
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        errors.push('name is required');
    }
    if (data.name && data.name.length > 200) {
        errors.push('name must be 200 chars or less');
    }
    if (!data.category || typeof data.category !== 'string') {
        errors.push('category is required');
    }
    if (data.price === undefined || data.price === null || typeof data.price !== 'number' || data.price <= 0) {
        errors.push('price must be a positive number');
    }
    if (!data.slug || typeof data.slug !== 'string' || data.slug.trim().length === 0) {
        errors.push('slug is required');
    }
    if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
        errors.push('slug must contain only lowercase letters, numbers, and hyphens');
    }
    return errors;
}

// ═══════════════════════════════════════════
// PUBLIC ENDPOINTS
// ═══════════════════════════════════════════

// ─── Health check ───
app.get('/api/health', (c) => {
    return c.json({ ok: true, time: new Date().toISOString() });
});

// ─── GET /api/content — All content (sections + products) ───
app.get('/api/content', publicRateLimit, async (c) => {
    try {
        const now = Date.now();

        // Return from cache if fresh
        if (cache.content && now - cache.contentAt < CACHE_TTL) {
            return c.json(cache.content);
        }

        // Fetch sections
        const sectionsResult = await pool.query('SELECT key, data FROM content_sections');
        const sections = {};
        for (const row of sectionsResult.rows) {
            sections[row.key] = row.data;
        }

        // Fetch products
        const productsResult = await pool.query(
            'SELECT id, slug, data FROM products ORDER BY sort_order ASC, id ASC'
        );
        const products = productsResult.rows.map(row => ({
            id: row.id,
            slug: row.slug,
            ...row.data,
        }));

        const result = { ...sections, products };

        // Update cache
        cache.content = result;
        cache.contentAt = now;

        return c.json(result);
    } catch (err) {
        console.error('[content] Error:', err.message);
        return c.json({ error: 'Failed to fetch content' }, 500);
    }
});

// ─── GET /api/products — Product list ───
app.get('/api/products', publicRateLimit, async (c) => {
    try {
        const now = Date.now();

        if (cache.products && now - cache.productsAt < CACHE_TTL) {
            return c.json(cache.products);
        }

        const result = await pool.query(
            'SELECT id, slug, data FROM products ORDER BY sort_order ASC, id ASC'
        );
        const products = result.rows.map(row => ({
            id: row.id,
            slug: row.slug,
            ...row.data,
        }));

        cache.products = products;
        cache.productsAt = now;

        return c.json(products);
    } catch (err) {
        console.error('[products] Error:', err.message);
        return c.json({ error: 'Failed to fetch products' }, 500);
    }
});

// ─── GET /api/products/:slug — Single product ───
app.get('/api/products/:slug', publicRateLimit, async (c) => {
    try {
        const { slug } = c.req.param();
        const result = await pool.query(
            'SELECT id, slug, data FROM products WHERE slug = $1',
            [slug]
        );
        if (result.rows.length === 0) {
            return c.json({ error: 'Product not found' }, 404);
        }
        const row = result.rows[0];
        return c.json({ id: row.id, slug: row.slug, ...row.data });
    } catch (err) {
        console.error('[product] Error:', err.message);
        return c.json({ error: 'Failed to fetch product' }, 500);
    }
});

// ═══════════════════════════════════════════
// ADMIN ENDPOINTS (auth required)
// ═══════════════════════════════════════════

// ─── PUT /api/content/:key — Update a section ───
app.put('/api/content/:key', authMiddleware, adminRateLimit, async (c) => {
    try {
        const { key } = c.req.param();

        if (!VALID_SECTION_KEYS.includes(key)) {
            return c.json({ error: `Invalid key. Allowed: ${VALID_SECTION_KEYS.join(', ')}` }, 400);
        }

        const body = await c.req.json();
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return c.json({ error: 'Body must be a JSON object' }, 400);
        }

        const sanitized = sanitizeObject(body);

        await pool.query(
            `INSERT INTO content_sections (key, data, updated_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW()`,
            [key, JSON.stringify(sanitized)]
        );

        invalidateCache();
        console.log(`[content] Updated section: ${key}`);
        return c.json({ ok: true });
    } catch (err) {
        console.error('[content:put] Error:', err.message);
        return c.json({ error: 'Failed to update section' }, 500);
    }
});

// ─── POST /api/products — Create product ───
app.post('/api/products', authMiddleware, adminRateLimit, async (c) => {
    try {
        const body = await c.req.json();
        const { slug, ...data } = body;

        const errors = validateProduct({ ...data, slug });
        if (errors.length > 0) {
            return c.json({ error: errors.join('; ') }, 400);
        }

        // Check slug uniqueness
        const existing = await pool.query('SELECT id FROM products WHERE slug = $1', [slug]);
        if (existing.rows.length > 0) {
            return c.json({ error: 'Product with this slug already exists' }, 409);
        }

        // Get max sort_order
        const maxSort = await pool.query('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM products');
        const sortOrder = maxSort.rows[0].next;

        const sanitized = sanitizeObject(data);

        const result = await pool.query(
            `INSERT INTO products (slug, sort_order, data) VALUES ($1, $2, $3) RETURNING id`,
            [slug, sortOrder, JSON.stringify(sanitized)]
        );

        invalidateCache();
        console.log(`[products] Created: ${slug} (id=${result.rows[0].id})`);
        return c.json({ ok: true, id: result.rows[0].id, slug }, 201);
    } catch (err) {
        console.error('[products:create] Error:', err.message);
        return c.json({ error: 'Failed to create product' }, 500);
    }
});

// ─── PUT /api/products/reorder — Reorder products (MUST be before :id) ───
app.put('/api/products/reorder', authMiddleware, adminRateLimit, async (c) => {
    try {
        const body = await c.req.json();
        const { order } = body;

        if (!Array.isArray(order) || order.length === 0) {
            return c.json({ error: 'order must be a non-empty array of product IDs' }, 400);
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (let i = 0; i < order.length; i++) {
                await client.query(
                    'UPDATE products SET sort_order = $1, updated_at = NOW() WHERE id = $2',
                    [i, order[i]]
                );
            }
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

        invalidateCache();
        console.log(`[products] Reordered: ${order.join(', ')}`);
        return c.json({ ok: true });
    } catch (err) {
        console.error('[products:reorder] Error:', err.message);
        return c.json({ error: 'Failed to reorder products' }, 500);
    }
});

// ─── PUT /api/products/:id — Update product ───
app.put('/api/products/:id', authMiddleware, adminRateLimit, async (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        if (isNaN(id)) return c.json({ error: 'Invalid product ID' }, 400);

        const body = await c.req.json();
        const { slug, ...data } = body;

        const errors = validateProduct({ ...data, slug });
        if (errors.length > 0) {
            return c.json({ error: errors.join('; ') }, 400);
        }

        // Check product exists
        const existing = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return c.json({ error: 'Product not found' }, 404);
        }

        // Check slug uniqueness (excluding self)
        const slugCheck = await pool.query('SELECT id FROM products WHERE slug = $1 AND id != $2', [slug, id]);
        if (slugCheck.rows.length > 0) {
            return c.json({ error: 'Another product with this slug already exists' }, 409);
        }

        const sanitized = sanitizeObject(data);

        await pool.query(
            `UPDATE products SET slug = $1, data = $2, updated_at = NOW() WHERE id = $3`,
            [slug, JSON.stringify(sanitized), id]
        );

        invalidateCache();
        console.log(`[products] Updated: id=${id}, slug=${slug}`);
        return c.json({ ok: true });
    } catch (err) {
        console.error('[products:update] Error:', err.message);
        return c.json({ error: 'Failed to update product' }, 500);
    }
});

// ─── DELETE /api/products/:id — Delete product ───
app.delete('/api/products/:id', authMiddleware, adminRateLimit, async (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        if (isNaN(id)) return c.json({ error: 'Invalid product ID' }, 400);

        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING slug', [id]);
        if (result.rows.length === 0) {
            return c.json({ error: 'Product not found' }, 404);
        }

        invalidateCache();
        console.log(`[products] Deleted: id=${id}, slug=${result.rows[0].slug}`);
        return c.json({ ok: true });
    } catch (err) {
        console.error('[products:delete] Error:', err.message);
        return c.json({ error: 'Failed to delete product' }, 500);
    }
});

// ─── POST /api/content/reset — Reset to defaults ───
app.post('/api/content/reset', authMiddleware, adminRateLimit, async (c) => {
    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Reset sections
            await client.query('DELETE FROM content_sections');
            for (const [key, data] of Object.entries(defaultSections)) {
                await client.query(
                    'INSERT INTO content_sections (key, data) VALUES ($1, $2)',
                    [key, JSON.stringify(data)]
                );
            }

            // Reset products
            await client.query('DELETE FROM products');
            for (let i = 0; i < defaultProducts.length; i++) {
                const p = defaultProducts[i];
                const { id, slug, ...rest } = p;
                await client.query(
                    'INSERT INTO products (slug, sort_order, data) VALUES ($1, $2, $3)',
                    [slug, i, JSON.stringify(rest)]
                );
            }

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

        invalidateCache();
        console.log('[content] Reset to defaults');
        return c.json({ ok: true });
    } catch (err) {
        console.error('[content:reset] Error:', err.message);
        return c.json({ error: 'Failed to reset content' }, 500);
    }
});

// ─── POST /api/presign — Generate presigned URL (S3) ───
app.post('/api/presign', authMiddleware, adminRateLimit, async (c) => {
    try {
        const body = await c.req.json();
        const { filename, folder, contentType } = body;

        if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
            return c.json({ error: `Invalid folder. Allowed: ${ALLOWED_FOLDERS.join(', ')}` }, 400);
        }

        if (!contentType || !ALLOWED_TYPES.includes(contentType)) {
            return c.json({ error: `Invalid content type. Allowed: ${ALLOWED_TYPES.join(', ')}` }, 400);
        }

        if (!filename || filename.length === 0) {
            return c.json({ error: 'Filename is required' }, 400);
        }

        const sanitized = sanitizeFilename(filename);
        const timestamp = Date.now();
        const key = `${S3_PREFIX}/${folder}/${timestamp}-${sanitized}`;

        const command = new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });
        const publicUrl = `https://s3.twcstorage.ru/${S3_BUCKET}/${key}`;

        console.log(`[presign] ${folder}/${sanitized} → ${publicUrl}`);

        return c.json({ uploadUrl, publicUrl });
    } catch (err) {
        console.error('[presign] Error:', err.message);
        return c.json({ error: 'Failed to generate presigned URL' }, 500);
    }
});

// ─── Initialize DB and start server ───
async function start() {
    try {
        // Wait for DB to be ready (retry up to 30 seconds)
        let retries = 15;
        while (retries > 0) {
            try {
                await pool.query('SELECT 1');
                console.log('[db] Connected to PostgreSQL');
                break;
            } catch {
                retries--;
                if (retries === 0) throw new Error('Could not connect to database after 30s');
                console.log(`[db] Waiting for PostgreSQL... (${retries} retries left)`);
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        // Run schema
        const fs = await import('fs');
        const path = await import('path');
        const { fileURLToPath } = await import('url');
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const initSQL = fs.readFileSync(
            path.join(__dirname, 'init.sql'),
            'utf-8'
        );
        await pool.query(initSQL);
        console.log('[db] Schema applied');

        // Seed if empty
        await seed();

        // Start HTTP server
        serve({ fetch: app.fetch, port: PORT }, () => {
            console.log(`Lumera API running at http://0.0.0.0:${PORT}`);
        });
    } catch (err) {
        console.error('[startup] Fatal error:', err.message);
        process.exit(1);
    }
}

console.log(`Lumera API starting on port ${PORT}...`);
start();
