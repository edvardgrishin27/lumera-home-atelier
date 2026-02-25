/**
 * Одноразовый скрипт: загрузка фото основателей на S3
 * Запускать через GitHub Actions или локально с S3 credentials
 *
 * Usage: S3_ACCESS_KEY=xxx S3_SECRET_KEY=yyy node scripts/upload-founders.mjs
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const S3_ENDPOINT = 'https://s3.twcstorage.ru';
const S3_BUCKET = '0a6d6471-klikai-screenshots';
const S3_REGION = 'ru-1';

const s3 = new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
    },
    forcePathStyle: true,
});

const files = [
    {
        localPath: process.argv[2] || 'founder-veronika.jpg',
        key: 'lumera/pages/founder-veronika.jpg',
        contentType: 'image/jpeg',
    },
    {
        localPath: process.argv[3] || 'founder-edward.jpg',
        key: 'lumera/pages/founder-edward.jpg',
        contentType: 'image/jpeg',
    },
];

for (const file of files) {
    try {
        const body = readFileSync(resolve(file.localPath));
        console.log(`Uploading ${file.localPath} -> s3://${S3_BUCKET}/${file.key} (${body.length} bytes)...`);

        await s3.send(new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: file.key,
            Body: body,
            ContentType: file.contentType,
        }));

        console.log(`✅ https://s3.twcstorage.ru/${S3_BUCKET}/${file.key}`);
    } catch (err) {
        console.error(`❌ Failed to upload ${file.localPath}:`, err.message);
    }
}

console.log('\nDone!');
