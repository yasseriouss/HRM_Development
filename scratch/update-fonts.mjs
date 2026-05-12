import fs from 'fs';
import path from 'path';

const ttf = fs.readFileSync('tajawal.ttf');
const base64 = ttf.toString('base64');
const content = `export const TAJAWAL_FONT_BASE64 = "${base64}";\n`;
fs.writeFileSync('src/shared/lib/fonts.ts', content);
console.log('Fonts file updated successfully');
