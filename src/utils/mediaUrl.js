/**
 * Converts S3 direct URLs to nginx-cached proxy URLs.
 * https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/... → /media/lumera/...
 * Non-S3 URLs are returned as-is.
 */
const S3_BASE = 'https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/';

export function mediaUrl(url) {
    if (!url || typeof url !== 'string') return url;
    if (url.startsWith(S3_BASE)) {
        return '/media/' + url.slice(S3_BASE.length);
    }
    return url;
}
