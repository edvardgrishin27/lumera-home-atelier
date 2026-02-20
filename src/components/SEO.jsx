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

const SEO = ({ title, description, image, url, type = 'website', jsonLd }) => {
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

        // JSON-LD
        let scriptEl = document.querySelector('script[data-seo-jsonld]');
        if (jsonLd) {
            if (!scriptEl) {
                scriptEl = document.createElement('script');
                scriptEl.type = 'application/ld+json';
                scriptEl.setAttribute('data-seo-jsonld', '');
                document.head.appendChild(scriptEl);
            }
            scriptEl.textContent = JSON.stringify(jsonLd);
        } else if (scriptEl) {
            scriptEl.remove();
        }

        return () => {
            // Cleanup JSON-LD on unmount
            const el = document.querySelector('script[data-seo-jsonld]');
            if (el) el.remove();
        };
    }, [title, description, image, url, type, jsonLd]);

    return null;
};

export default SEO;
