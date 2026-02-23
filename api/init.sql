-- Lumera DB Schema + Seed
-- Run once on first startup

CREATE TABLE IF NOT EXISTS content_sections (
    key         TEXT PRIMARY KEY,
    data        JSONB NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    slug        TEXT UNIQUE NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    data        JSONB NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order);
