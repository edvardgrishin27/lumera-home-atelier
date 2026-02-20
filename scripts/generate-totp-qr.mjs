/**
 * Generate TOTP QR Code for Google Authenticator setup
 *
 * Usage: node scripts/generate-totp-qr.mjs
 *
 * This will generate a QR code image that you scan with Google Authenticator.
 * The secret is read from .env file (VITE_TOTP_SECRET).
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read .env file
const envPath = resolve(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length) envVars[key.trim()] = val.join('=').trim();
});

const secret = envVars.VITE_TOTP_SECRET;
if (!secret) {
    console.error('❌ VITE_TOTP_SECRET not found in .env');
    process.exit(1);
}

// Generate otpauth:// URI
const issuer = 'Lumera';
const account = 'Admin';
const uri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

console.log('\n🔐 TOTP Setup for Lumera Admin');
console.log('═'.repeat(50));
console.log(`\n📱 Scan QR code with Google Authenticator:\n`);

// Generate QR in terminal using simple block characters
try {
    const QRCode = (await import('qrcode')).default;
    const qrText = await QRCode.toString(uri, { type: 'terminal', small: true });
    console.log(qrText);
} catch (e) {
    console.log('(QR display failed — use the URI below instead)');
}

console.log(`\n📋 Manual entry secret: ${secret}`);
console.log(`🔗 URI: ${uri}`);
console.log(`\n${'═'.repeat(50)}`);
console.log('⚠️  Save this secret! If you lose access to your authenticator,');
console.log('    you will need to generate a new TOTP secret.\n');
