/**
 * S3 Upload Utility
 * Оптимизирует изображения (WebP, max 2000px) и загружает на S3 через presigned URL
 */

const API_SECRET = import.meta.env.VITE_API_SECRET;

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
 * Загрузить файл на S3
 * @param {File} file - Файл для загрузки
 * @param {string} folder - Папка в S3: products, pages, blog, video, local
 * @returns {Promise<string>} - Public URL загруженного файла
 */
export async function uploadFile(file, folder = 'pages') {
    // 1. Оптимизация (только для изображений)
    const optimized = await optimizeImage(file);

    // 2. Получить presigned URL
    const presignRes = await fetch('/api/presign', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_SECRET}`,
        },
        body: JSON.stringify({
            filename: optimized.name,
            folder,
            contentType: optimized.type,
        }),
    });

    if (!presignRes.ok) {
        const err = await presignRes.text();
        throw new Error(`Presign failed: ${err}`);
    }

    const { uploadUrl, publicUrl } = await presignRes.json();

    // 3. Загрузить напрямую на S3
    const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: optimized,
        headers: {
            'Content-Type': optimized.type,
        },
    });

    if (!uploadRes.ok) {
        throw new Error(`S3 upload failed: ${uploadRes.status}`);
    }

    // 4. Вернуть постоянный public URL
    return publicUrl;
}

/**
 * Проверить, является ли строка base64 data URI
 */
export function isBase64(str) {
    return str && str.startsWith('data:');
}
