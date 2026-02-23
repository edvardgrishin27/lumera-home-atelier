const API_BASE = '/api';

function getAuthHeaders() {
    const secret = import.meta.env.VITE_API_SECRET;
    return secret ? { Authorization: `Bearer ${secret}` } : {};
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
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to reset: ${res.status}`);
    }
    return res.json();
}
