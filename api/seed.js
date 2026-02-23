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
            console.log('[seed] DB already has data, skipping seed');
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
