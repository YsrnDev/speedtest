const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const size = 50 * 1024 * 1024; // 50MB
const target = path.join(__dirname, '../public/download.bin');

console.log(`Generating ${size / 1024 / 1024}MB file at ${target}...`);
const buffer = Buffer.alloc(size);

// Fill with random data to prevent compression
try {
    crypto.randomFillSync(buffer);
} catch (e) {
    console.warn('Crypto failed, using fallback random...');
    for (let i = 0; i < size; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
    }
}

fs.writeFileSync(target, buffer);
console.log('Done.');
