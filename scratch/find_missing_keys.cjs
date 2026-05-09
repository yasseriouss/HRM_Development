const fs = require('fs');
const path = require('path');

const srcDir = 'artifacts/hrm-skill-matrix/src';
const enPath = 'artifacts/hrm-skill-matrix/src/i18n/en.ts';

// 1. Get all keys from en.ts
const enContent = fs.readFileSync(enPath, 'utf8');
const keyRegex = /^\s+([a-z0-9_]+):/gm;
const enKeys = new Set();
let match;
while ((match = keyRegex.exec(enContent)) !== null) {
  enKeys.add(match[1]);
}

// 2. Find all t("key") calls in src
const tRegex = /t\("([a-z0-9_]+)"/g;
const missingKeys = new Set();

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file === 'node_modules' || file === 'dist') continue;
      walk(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      if (fullPath.includes('en.ts') || fullPath.includes('ar.ts')) continue;
      const content = fs.readFileSync(fullPath, 'utf8');
      let m;
      while ((m = tRegex.exec(content)) !== null) {
        const key = m[1];
        if (!enKeys.has(key)) {
          missingKeys.add(key);
        }
      }
    }
  }
}

walk(srcDir);
console.log('Missing keys:', Array.from(missingKeys));
