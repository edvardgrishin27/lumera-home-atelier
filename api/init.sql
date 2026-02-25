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

-- Admin sessions (server-side auth)
CREATE TABLE IF NOT EXISTS admin_sessions (
    token       TEXT PRIMARY KEY,
    ip          TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    expires_at  TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_expires ON admin_sessions(expires_at);

-- Rate limits (persistent, survives restarts)
CREATE TABLE IF NOT EXISTS rate_limits (
    ip              TEXT NOT NULL,
    endpoint        TEXT NOT NULL DEFAULT 'general',
    window_start    TIMESTAMPTZ NOT NULL,
    count           INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (ip, endpoint, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup ON rate_limits(window_start);
