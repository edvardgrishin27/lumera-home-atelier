/**
 * Seed script — populates DB with default data if tables are empty.
 * Called automatically on API startup.
 */
import pool from './db.js';
import { defaultSections, defaultProducts } from './defaults.js';

export async function seed() {
    const client = await pool.connect();
    try {
        // Check if content_sections already has data
        const { rows } = await client.query('SELECT COUNT(*) AS cnt FROM content_sections');
        if (parseInt(rows[0].cnt) > 0) {
            console.log('[seed] DB already has data, running migrations...');
            await migrate(client);
            return;
        }

        console.log('[seed] Empty DB detected, seeding defaults...');

        await client.query('BEGIN');

        // Insert content sections
        for (const [key, data] of Object.entries(defaultSections)) {
            await client.query(
                'INSERT INTO content_sections (key, data) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
                [key, JSON.stringify(data)]
            );
        }

        // Insert products
        for (let i = 0; i < defaultProducts.length; i++) {
            const p = defaultProducts[i];
            const { id, slug, ...rest } = p;
            await client.query(
                'INSERT INTO products (slug, sort_order, data) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING',
                [slug, i, JSON.stringify(rest)]
            );
        }

        await client.query('COMMIT');
        console.log(`[seed] Inserted ${Object.keys(defaultSections).length} sections, ${defaultProducts.length} products`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[seed] Error:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

/**
 * Migrations — update existing DB data to match latest defaults.
 * Each migration runs only once (tracked by version number in DB).
 */
async function migrate(client) {
    // Ensure migrations table exists
    await client.query(`
        CREATE TABLE IF NOT EXISTS migrations (
            version INT PRIMARY KEY,
            applied_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);

    const { rows } = await client.query('SELECT MAX(version) AS v FROM migrations');
    const currentVersion = rows[0].v || 0;

    // Migration 1: Update contact info + stats
    if (currentVersion < 1) {
        console.log('[migrate] Running migration 1: update contacts & stats');

        // Update settings
        const settingsRes = await client.query("SELECT data FROM content_sections WHERE key = 'settings'");
        if (settingsRes.rows.length) {
            const settings = settingsRes.rows[0].data;
            settings.phone = '+7 (985) 835-11-90';
            settings.whatsapp = 'https://wa.me/79858351190';
            settings.telegram = 'https://t.me/veromill';
            await client.query(
                "UPDATE content_sections SET data = $1, updated_at = NOW() WHERE key = 'settings'",
                [JSON.stringify(settings)]
            );
        }

        // Update about stats
        const aboutRes = await client.query("SELECT data FROM content_sections WHERE key = 'about'");
        if (aboutRes.rows.length) {
            const about = aboutRes.rows[0].data;
            about.stats1Value = '5+';
            await client.query(
                "UPDATE content_sections SET data = $1, updated_at = NOW() WHERE key = 'about'",
                [JSON.stringify(about)]
            );
        }

        await client.query('INSERT INTO migrations (version) VALUES (1)');
        console.log('[migrate] Migration 1 applied');
    }
}
