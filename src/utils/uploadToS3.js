/**
 * S3 Upload Utility
 * Оптимизирует изображения (WebP, max 2000px) и загружает на S3 через presigned URL
 */

import { getAuthHeaders } from './api';

/**
 * Оптимизация изображения: ресайз до maxDim, конвертация в WebP
 * Видео пропускается без изменений
 */
async function optimizeImage(file, maxDim = 2000, quality = 0.85) {
    // Пропустить видео
    if (file.type.startsWith('video/')) return file;

    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            let { width, height } = img;

            // Масштабирование только вниз
            let nw = width;
            let nh = height;
            if (width > maxDim || height > maxDim) {
                const ratio = Math.min(maxDim / width, maxDim / height);
                nw = Math.round(width * ratio);
                nh = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = nw;
            canvas.height = nh;
            canvas.getContext('2d').drawImage(img, 0, 0, nw, nh);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const newName = file.name.replace(/\.\w+$/, '.webp');
                        resolve(new File([blob], newName, { type: 'image/webp' }));
                    } else {
                        resolve(file); // Fallback: оригинал
                    }
                },
                'image/webp',
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(file); // Fallback: оригинал
        };

        img.src = url;
    });
}

/**
 * Загрузить файл на S3 через серверный proxy
 * @param {File} file - Файл для загрузки
 * @param {string} folder - Папка в S3: products, pages, blog, video, local
 * @returns {Promise<string>} - Public URL загруженного файла
 */
export async function uploadFile(file, folder = 'pages') {
    // 1. Оптимизация (только для изображений)
    const optimized = await optimizeImage(file);

    // 2. Загрузить через серверный proxy (обходит CORS)
    const formData = new FormData();
    formData.append('file', optimized);
    formData.append('folder', folder);

    const res = await fetch('/api/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Upload failed: ${err}`);
    }

    const { publicUrl } = await res.json();
    return publicUrl;
}

/**
 * Проверить, является ли строка base64 data URI
 */
export function isBase64(str) {
    return str && str.startsWith('data:');
}
