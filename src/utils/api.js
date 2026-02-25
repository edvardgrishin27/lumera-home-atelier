const API_BASE = '/api';
const SESSION_KEY = 'lumera_session';

// ─── Auth helpers ───

export function getAuthHeaders() {
    try {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
        return session.token ? { Authorization: `Bearer ${session.token}` } : {};
    } catch {
        return {};
    }
}

function handleUnauthorized(res) {
    if (res.status === 401) {
        // Session expired or invalid — clear and redirect to login
        localStorage.removeItem(SESSION_KEY);
        const uuid = import.meta.env.VITE_ADMIN_UUID;
        if (uuid && window.location.pathname.includes('/panel/')) {
            window.location.href = `/panel/${uuid}/login`;
        }
    }
}

// ─── Auth: Login / Logout / Verify ───

export async function loginAdmin(password, totpCode) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, totpCode }),
    });
    const data = await res.json();
    if (!res.ok) {
        const err = new Error(data.message || 'Ошибка авторизации');
        err.data = data;
        err.status = res.status;
        throw err;
    }
    return data;
}

export async function logoutAdmin() {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
    } catch { /* ignore */ }
    localStorage.removeItem(SESSION_KEY);
}

export async function verifySession() {
    try {
        const res = await fetch(`${API_BASE}/auth/verify`, {
            headers: getAuthHeaders(),
        });
        const data = await res.json();
        return data.valid === true;
    } catch {
        return false;
    }
}

// ─── Public ───

export async function fetchContent() {
    const res = await fetch(`${API_BASE}/content`);
    if (!res.ok) throw new Error(`Failed to fetch content: ${res.status}`);
    return res.json();
}

export async function fetchProducts() {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
    return res.json();
}

export async function fetchProduct(slug) {
    const res = await fetch(`${API_BASE}/products/${slug}`);
    if (!res.ok) throw new Error(`Failed to fetch product: ${res.status}`);
    return res.json();
}

// ─── Admin: Sections ───

export async function updateSection(key, data) {
    const res = await fetch(`${API_BASE}/content/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
    });
    handleUnauthorized(res);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to update section: ${res.status}`);
    }
    return res.json();
}

// ─── Admin: Products ───

export async function createProduct(product) {
    const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(product),
    });
    handleUnauthorized(res);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to create product: ${res.status}`);
    }
    return res.json();
}

export async function updateProduct(id, product) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(product),
    });
    handleUnauthorized(res);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to update product: ${res.status}`);
    }
    return res.json();
}

export async function deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    handleUnauthorized(res);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to delete product: ${res.status}`);
    }
    return res.json();
}

export async function reorderProducts(order) {
    const res = await fetch(`${API_BASE}/products/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ order }),
    });
    handleUnauthorized(res);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to reorder: ${res.status}`);
    }
    return res.json();
}

export async function resetContent() {
    const res = await fetch(`${API_BASE}/content/reset`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    handleUnauthorized(res);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to reset: ${res.status}`);
    }
    return res.json();
}
