import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash, randomBytes } from 'crypto';
import * as OTPAuth from 'otpauth';
import pool from './db.js';
import { seed } from './seed.js';
import { defaultSections, defaultProducts } from './defaults.js';
import createLogger from './logger.js';

const app = new Hono();
const startedAt = Date.now();

// ─── Config ───
const PORT = parseInt(process.env.PORT || '3001');
const API_SECRET = process.env.API_SECRET; // fallback for backward compat
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const TOTP_SECRET = process.env.TOTP_SECRET;
const S3_BUCKET = process.env.S3_BUCKET || '0a6d6471-klikai-screenshots';
const S3_PREFIX = 'lumera';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

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

// ─── Loggers ───
const log = {
    server: createLogger('server'),
    auth: createLogger('auth'),
    content: createLogger('content'),
    products: createLogger('products'),
    presign: createLogger('presign'),
    db: createLogger('db'),
    rateLimit: createLogger('rateLimit'),
    http: createLogger('http'),
};

// ─── IP Helper (needs to be before middleware) ───
function getIP(c) {
    return c.req.header('X-Real-IP') || c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() || 'unknown';
}

// ─── Request Logging Middleware ───
app.use('*', async (c, next) => {
    const start = Date.now();
    const method = c.req.method;
    const path = c.req.path;

    await next();

    const duration = Date.now() - start;
    const status = c.res.status;
    const ip = getIP(c);

    // Skip health check logging to reduce noise
    if (path === '/api/health') return;

    log.http.info(`${method} ${path}`, {
        method,
        path,
        status,
        duration_ms: duration,
        ip,
    });
});

// ─── Global Error Handler ───
app.onError((err, c) => {
    const path = c.req.path;
    const method = c.req.method;

    log.server.error('Unhandled error', {
        method,
        path,
        error: err.message,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    });

    return c.json({ error: 'Internal server error' }, 500);
});

// ─── DB Rate Limiter ───
async function checkRateLimit(ip, endpoint, limit, windowMs = 60000) {
    try {
        const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);
        const result = await pool.query(
            `INSERT INTO rate_limits (ip, endpoint, window_start, count)
             VALUES ($1, $2, $3, 1)
             ON CONFLICT (ip, endpoint, window_start)
             DO UPDATE SET count = rate_limits.count + 1
             RETURNING count`,
            [ip, endpoint, windowStart]
        );
        return result.rows[0].count <= limit;
    } catch (err) {
        log.rateLimit.error('DB error, allowing request', { error: err.message });
        return true; // fail open — don't block users on DB errors
    }
}

// Cleanup old rate limit entries every 5 minutes
setInterval(async () => {
    try {
        await pool.query("DELETE FROM rate_limits WHERE window_start < NOW() - interval '5 minutes'");
    } catch { /* ignore cleanup errors */ }
}, 300000);

// Cleanup expired sessions every 30 minutes
setInterval(async () => {
    try {
        const result = await pool.query('DELETE FROM admin_sessions WHERE expires_at < NOW()');
        if (result.rowCount > 0) {
            log.db.info('Cleaned up expired sessions', { count: result.rowCount });
        }
    } catch { /* ignore cleanup errors */ }
}, 1800000);

// ─── Login rate limiter (in-memory, for brute-force protection) ───
const loginAttempts = new Map();

function checkLoginRate(ip) {
    const now = Date.now();
    const entry = loginAttempts.get(ip);

    if (!entry) return { allowed: true, remaining: 5 };

    // Lockout expired?
    if (entry.lockedUntil && now >= entry.lockedUntil) {
        loginAttempts.delete(ip);
        return { allowed: true, remaining: 5 };
    }

    // Currently locked?
    if (entry.lockedUntil && now < entry.lockedUntil) {
        const mins = Math.ceil((entry.lockedUntil - now) / 60000);
        return { allowed: false, remaining: 0, lockedMinutes: mins };
    }

    return { allowed: true, remaining: Math.max(0, 5 - entry.count) };
}

function recordLoginFailure(ip) {
    const now = Date.now();
    let entry = loginAttempts.get(ip);

    if (!entry) {
        entry = { count: 0, start: now };
    }

    entry.count++;

    if (entry.count >= 5) {
        entry.lockedUntil = now + 15 * 60 * 1000; // 15 min lockout
    }

    loginAttempts.set(ip, entry);
    return entry;
}

function resetLoginAttempts(ip) {
    loginAttempts.delete(ip);
}

// Cleanup login attempts every 20 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of loginAttempts) {
        if (entry.lockedUntil && now >= entry.lockedUntil) {
            loginAttempts.delete(ip);
        } else if (now - entry.start > 1800000) { // 30 min stale
            loginAttempts.delete(ip);
        }
    }
}, 1200000);

// ─── XSS sanitization ───
function sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/</g, '&lt;')
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

// ─── Auth Middleware (session-based + fallback to API_SECRET) ───
async function authMiddleware(c, next) {
    const auth = c.req.header('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = auth.slice(7); // Remove "Bearer "

    // 1. Check session in DB
    try {
        const result = await pool.query(
            'SELECT token FROM admin_sessions WHERE token = $1 AND expires_at > NOW()',
            [token]
        );
        if (result.rows.length > 0) {
            return next();
        }
    } catch (err) {
        log.auth.error('Session check error', { error: err.message });
    }

    // 2. Fallback: check static API_SECRET (backward compat during transition)
    if (API_SECRET && token === API_SECRET) {
        return next();
    }

    return c.json({ error: 'Unauthorized' }, 401);
}

async function publicRateLimit(c, next) {
    const ip = getIP(c);
    const allowed = await checkRateLimit(ip, 'public', 100);
    if (!allowed) {
        return c.json({ error: 'Too many requests' }, 429);
    }
    return next();
}

async function adminRateLimit(c, next) {
    const ip = getIP(c);
    const allowed = await checkRateLimit(ip, 'admin', 30);
    if (!allowed) {
        return c.json({ error: 'Too many requests' }, 429);
    }
    return next();
}

// ─── Validation helpers ───
const VALID_SECTION_KEYS = ['home', 'about', 'b2b', 'blog', 'contactPage', 'settings', 'catalog', 'workflow', 'returns', 'guarantee'];

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
// AUTH ENDPOINTS
// ═══════════════════════════════════════════

// ─── POST /api/auth/login ───
app.post('/api/auth/login', async (c) => {
    const ip = getIP(c);

    // Check login rate limit
    const rateCheck = checkLoginRate(ip);
    if (!rateCheck.allowed) {
        return c.json({
            error: 'locked',
            message: `Слишком много попыток. Подождите ${rateCheck.lockedMinutes} мин.`,
            lockedMinutes: rateCheck.lockedMinutes,
        }, 429);
    }

    // Check server has auth config
    if (!ADMIN_PASSWORD_HASH || !TOTP_SECRET) {
        log.auth.error('ADMIN_PASSWORD_HASH or TOTP_SECRET not configured');
        return c.json({ error: 'server_error', message: 'Сервер не настроен для аутентификации' }, 500);
    }

    try {
        const body = await c.req.json();
        const { password, totpCode } = body;

        if (!password || typeof password !== 'string') {
            return c.json({ error: 'invalid_input', message: 'Пароль обязателен' }, 400);
        }

        // Artificial delay to slow brute force
        await new Promise(r => setTimeout(r, 300 + Math.random() * 200));

        // 1. Hash password and compare
        const inputHash = createHash('sha256').update(password).digest('hex');

        if (inputHash !== ADMIN_PASSWORD_HASH) {
            const entry = recordLoginFailure(ip);
            const remaining = Math.max(0, 5 - entry.count);

            if (entry.lockedUntil) {
                return c.json({
                    error: 'locked',
                    message: 'Аккаунт заблокирован на 15 минут',
                    lockedMinutes: 15,
                }, 429);
            }

            return c.json({
                error: 'invalid_password',
                message: `Неверный пароль (осталось ${remaining} ${remaining === 1 ? 'попытка' : remaining < 5 ? 'попытки' : 'попыток'})`,
                remaining,
            }, 401);
        }

        // 2. Validate TOTP code
        if (!totpCode || typeof totpCode !== 'string') {
            return c.json({ error: 'invalid_input', message: 'TOTP-код обязателен' }, 400);
        }

        const totp = new OTPAuth.TOTP({
            issuer: 'Lumera',
            label: 'Admin',
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: OTPAuth.Secret.fromBase32(TOTP_SECRET),
        });

        const delta = totp.validate({ token: totpCode.replace(/\s/g, ''), window: 1 });

        if (delta === null) {
            const entry = recordLoginFailure(ip);
            const remaining = Math.max(0, 5 - entry.count);

            if (entry.lockedUntil) {
                return c.json({
                    error: 'locked',
                    message: 'Аккаунт заблокирован на 15 минут',
                    lockedMinutes: 15,
                }, 429);
            }

            return c.json({
                error: 'invalid_totp',
                message: 'Неверный код. Попробуйте ещё.',
                remaining,
            }, 401);
        }

        // 3. Success! Create session
        resetLoginAttempts(ip);

        const token = randomBytes(32).toString('hex'); // 64-char hex
        const expiresAt = new Date(Date.now() + SESSION_DURATION);

        await pool.query(
            'INSERT INTO admin_sessions (token, ip, expires_at) VALUES ($1, $2, $3)',
            [token, ip, expiresAt]
        );

        log.auth.info('Login success', { ip });

        return c.json({
            ok: true,
            token,
            expiresAt: expiresAt.toISOString(),
        });
    } catch (err) {
        log.auth.error('Login error', { error: err.message });
        return c.json({ error: 'server_error', message: 'Ошибка сервера' }, 500);
    }
});

// ─── POST /api/auth/logout ───
app.post('/api/auth/logout', async (c) => {
    const auth = c.req.header('Authorization');
    if (auth && auth.startsWith('Bearer ')) {
        const token = auth.slice(7);
        try {
            await pool.query('DELETE FROM admin_sessions WHERE token = $1', [token]);
            log.auth.info('Logout');
        } catch (err) {
            log.auth.error('Logout error', { error: err.message });
        }
    }
    return c.json({ ok: true });
});

// ─── GET /api/auth/verify ───
app.get('/api/auth/verify', async (c) => {
    const auth = c.req.header('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
        return c.json({ valid: false });
    }

    const token = auth.slice(7);

    try {
        const result = await pool.query(
            'SELECT token FROM admin_sessions WHERE token = $1 AND expires_at > NOW()',
            [token]
        );
        return c.json({ valid: result.rows.length > 0 });
    } catch {
        return c.json({ valid: false });
    }
});

// ═══════════════════════════════════════════
// PUBLIC ENDPOINTS
// ═══════════════════════════════════════════

// ─── Health check (detailed diagnostics) ───
app.get('/api/health', async (c) => {
    const mem = process.memoryUsage();
    const uptimeMs = Date.now() - startedAt;

    let dbOk = false;
    let dbLatency = 0;
    try {
        const t0 = Date.now();
        await pool.query('SELECT 1');
        dbLatency = Date.now() - t0;
        dbOk = true;
    } catch { /* db down */ }

    const healthy = dbOk;
    const status = healthy ? 200 : 503;

    return c.json({
        ok: healthy,
        time: new Date().toISOString(),
        uptime_s: Math.floor(uptimeMs / 1000),
        db: { ok: dbOk, latency_ms: dbLatency },
        memory: {
            rss_mb: Math.round(mem.rss / 1048576),
            heap_used_mb: Math.round(mem.heapUsed / 1048576),
            heap_total_mb: Math.round(mem.heapTotal / 1048576),
        },
    }, status);
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
        log.content.error('Failed to fetch content', { error: err.message });
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
        log.products.error('Failed to fetch products', { error: err.message });
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
        log.products.error('Failed to fetch product', { error: err.message });
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
        log.content.info('Updated section', { key });
        return c.json({ ok: true });
    } catch (err) {
        log.content.error('Failed to update section', { error: err.message });
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
        log.products.info('Created product', { slug, id: result.rows[0].id });
        return c.json({ ok: true, id: result.rows[0].id, slug }, 201);
    } catch (err) {
        log.products.error('Failed to create product', { error: err.message });
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
        log.products.info('Reordered products', { order });
        return c.json({ ok: true });
    } catch (err) {
        log.products.error('Failed to reorder', { error: err.message });
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
        log.products.info('Updated product', { id, slug });
        return c.json({ ok: true });
    } catch (err) {
        log.products.error('Failed to update product', { error: err.message });
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
        log.products.info('Deleted product', { id, slug: result.rows[0].slug });
        return c.json({ ok: true });
    } catch (err) {
        log.products.error('Failed to delete product', { error: err.message });
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
        log.content.info('Reset to defaults');
        return c.json({ ok: true });
    } catch (err) {
        log.content.error('Failed to reset content', { error: err.message });
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

        log.presign.info('Generated presigned URL', { folder, filename: sanitized, publicUrl });

        return c.json({ uploadUrl, publicUrl });
    } catch (err) {
        log.presign.error('Failed to generate presigned URL', { error: err.message });
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
                log.db.info('Connected to PostgreSQL');
                break;
            } catch {
                retries--;
                if (retries === 0) throw new Error('Could not connect to database after 30s');
                log.db.warn('Waiting for PostgreSQL', { retriesLeft: retries });
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
        log.db.info('Schema applied');

        // Seed if empty
        await seed();

        // Log auth status
        if (ADMIN_PASSWORD_HASH && TOTP_SECRET) {
            log.auth.info('Server-side authentication configured');
        } else {
            log.auth.warn('ADMIN_PASSWORD_HASH or TOTP_SECRET not set — login endpoint disabled');
        }

        if (API_SECRET) {
            log.auth.info('API_SECRET fallback available (backward compat)');
        }

        // Start HTTP server
        serve({ fetch: app.fetch, port: PORT }, () => {
            log.server.info('Lumera API started', { port: PORT, url: `http://0.0.0.0:${PORT}` });
        });
    } catch (err) {
        log.server.error('Fatal startup error', { error: err.message });
        process.exit(1);
    }
}

// ─── Process-level error handlers ───
process.on('uncaughtException', (err) => {
    log.server.error('Uncaught exception', { error: err.message, stack: err.stack });
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    log.server.error('Unhandled promise rejection', {
        error: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
    });
});

log.server.info('Lumera API starting', { port: PORT });
start();
