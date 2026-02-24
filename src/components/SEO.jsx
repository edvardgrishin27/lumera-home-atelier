import { useEffect } from 'react';

const SITE_NAME = 'Lumera Home Atelier';
const BASE_URL = 'https://lumerahome.ru';
const DEFAULT_IMAGE = 'https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/blog/filosofiya-pustoty.jpg';

function setMeta(name, content, attr = 'name') {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function setLink(rel, href) {
    if (!href) return;
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
    }
    el.setAttribute('href', href);
}

/**
 * SEO component — manages meta tags, OG, Twitter Cards, canonical, and JSON-LD.
 *
 * Props:
 * - title: Page title (appended with | SITE_NAME)
 * - description: Meta description
 * - image: OG/Twitter image URL
 * - url: Canonical path (e.g. '/catalog')
 * - type: OG type (default 'website')
 * - jsonLd: Single JSON-LD object or array of JSON-LD objects
 * - breadcrumbs: Array of { name, url } for BreadcrumbList schema
 */
const SEO = ({ title, description, image, url, type = 'website', jsonLd, breadcrumbs }) => {
    useEffect(() => {
        const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
        const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
        const ogImage = image || DEFAULT_IMAGE;

        // Title
        document.title = fullTitle;

        // Basic meta
        setMeta('description', description);

        // Open Graph
        setMeta('og:title', fullTitle, 'property');
        setMeta('og:description', description, 'property');
        setMeta('og:image', ogImage, 'property');
        setMeta('og:url', fullUrl, 'property');
        setMeta('og:type', type, 'property');
        setMeta('og:site_name', SITE_NAME, 'property');
        setMeta('og:locale', 'ru_RU', 'property');

        // Twitter Card
        setMeta('twitter:card', 'summary_large_image');
        setMeta('twitter:title', fullTitle);
        setMeta('twitter:description', description);
        setMeta('twitter:image', ogImage);

        // Canonical
        setLink('canonical', fullUrl);

        // JSON-LD — support single object or array of schemas
        // Remove old JSON-LD scripts
        document.querySelectorAll('script[data-seo-jsonld]').forEach(el => el.remove());

        // Collect all schemas
        const schemas = [];

        // Primary JSON-LD
        if (jsonLd) {
            if (Array.isArray(jsonLd)) {
                schemas.push(...jsonLd);
            } else {
                schemas.push(jsonLd);
            }
        }

        // Breadcrumbs JSON-LD
        if (breadcrumbs && breadcrumbs.length > 0) {
            schemas.push({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                'itemListElement': breadcrumbs.map((item, index) => ({
                    '@type': 'ListItem',
                    'position': index + 1,
                    'name': item.name,
                    'item': item.url ? `${BASE_URL}${item.url}` : undefined,
                })),
            });
        }

        // Insert all schemas
        schemas.forEach((schema, i) => {
            const scriptEl = document.createElement('script');
            scriptEl.type = 'application/ld+json';
            scriptEl.setAttribute('data-seo-jsonld', String(i));
            scriptEl.textContent = JSON.stringify(schema);
            document.head.appendChild(scriptEl);
        });

        return () => {
            // Cleanup JSON-LD on unmount
            document.querySelectorAll('script[data-seo-jsonld]').forEach(el => el.remove());
        };
    }, [title, description, image, url, type, jsonLd, breadcrumbs]);

    return null;
};

export { SITE_NAME, BASE_URL, DEFAULT_IMAGE };
export default SEO;
