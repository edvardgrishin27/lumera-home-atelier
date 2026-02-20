import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const app = new Hono();

// ─── Config ───
const PORT = parseInt(process.env.PORT || '3001');
const API_SECRET = process.env.API_SECRET;
const S3_BUCKET = process.env.S3_BUCKET || '0a6d6471-klikai-screenshots';
const S3_PREFIX = 'lumera';

const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT || 'https://s3.twcstorage.ru',
    region: process.env.S3_REGION || 'ru-1',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
    },
    forcePathStyle: true,
});

// ─── Validation ───
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

// ─── Auth middleware ───
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

// ─── Health check ───
app.get('/api/health', (c) => {
    return c.json({ ok: true, time: new Date().toISOString() });
});

// ─── Generate presigned URL ───
app.post('/api/presign', authMiddleware, async (c) => {
    try {
        const body = await c.req.json();
        const { filename, folder, contentType } = body;

        // Validate folder
        if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
            return c.json({ error: `Invalid folder. Allowed: ${ALLOWED_FOLDERS.join(', ')}` }, 400);
        }

        // Validate content type
        if (!contentType || !ALLOWED_TYPES.includes(contentType)) {
            return c.json({ error: `Invalid content type. Allowed: ${ALLOWED_TYPES.join(', ')}` }, 400);
        }

        // Validate filename
        if (!filename || filename.length === 0) {
            return c.json({ error: 'Filename is required' }, 400);
        }

        // Generate unique key
        const sanitized = sanitizeFilename(filename);
        const timestamp = Date.now();
        const key = `${S3_PREFIX}/${folder}/${timestamp}-${sanitized}`;

        // Create presigned URL
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

// ─── Start server ───
console.log(`Lumera API starting on port ${PORT}...`);
serve({ fetch: app.fetch, port: PORT }, () => {
    console.log(`Lumera API running at http://0.0.0.0:${PORT}`);
});
