const fs = require('fs');
const path = require('path');

function replaceUnderscoresInText(text) {
    // Match uppercase underscore sequences, e.g. MAIN_SYSTEM_DIRECTORY
    return text.replace(/[A-Z0-9]+(_[A-Z0-9]+)+/g, (match) => {
        return match.replace(/_/g, ' ');
    });
}

function processFile(filePath, isTranslation) {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent;
    
    if (isTranslation) {
        newContent = content.replace(/: "([^"]*)"/g, (match, p1) => {
            return `: "${p1.replace(/_/g, ' ')}"`;
        });
    } else {
        // Replace inside quotes
        newContent = content.replace(/"([^"]*)"/g, (match, p1) => {
            if (p1.includes('/') || p1.includes('bg-') || p1.includes('text-') || p1.includes('hover:')) {
                return match;
            }
            return `"${replaceUnderscoresInText(p1)}"`;
        });
        
        // Replace between tags e.g. >TEXT_HERE<
        newContent = newContent.replace(/>([^<]*_[^<]*)< /g, (match, p1) => {
             return `>${replaceUnderscoresInText(p1)}<`;
        });
        // Also handle cases with whitespace
        newContent = newContent.replace(/>\s*([^<]*_[^<]*)\s*</g, (match, p1) => {
             return `>${replaceUnderscoresInText(p1)}<`;
        });
    }
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                walk(fullPath);
            }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            if (file !== 'use-toast.ts') {
                processFile(fullPath, file === 'en.ts' || file === 'ar.ts');
            }
        }
    }
}

const targetDir = 'artifacts/hrm-skill-matrix/src';
walk(targetDir);
