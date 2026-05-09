const fs = require('fs');
const path = require('path');

function restoreUnderscoresInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    const brokenConstants = [
        'LEVEL LABELS', 'STATUS LABELS', 'STEP ICONS', 'TRAINING TYPE KEYS',
        'CAMPAIGN TYPES', 'CAMPAIGN STATUSES', 'LEVEL DESC T', 'ADMIN HR DEPT',
        'ALL ROLES', 'LEVEL BADGE', 'STATUS BADGE', 'TRAINING STATUS',
        'STATUS CONFIG', 'SUB FACTORS', 'LEVEL DESC', 'LEVEL DESC AR',
        'STATUS OPTIONS', 'TRAINING TYPE', 'TRAINING STATUS', 'CAT WEIGHTS', 'GRADES',
        'SUITE APPS', 'MOBILE BREAKPOINT', 'SIDEBAR WIDTH', 'SIDEBAR WIDTH ICON',
        'SIDEBAR COOKIE NAME', 'SIDEBAR WIDTH MOBILE', 'SIDEBAR KEYBOARD SHORTCUT',
        'SIDEBAR COOKIE MAX AGE', 'ALL NAV', 'ADMIN HR', 'WORKFLOW ROLES'
    ];
    
    let newContent = content;
    for (const constName of brokenConstants) {
        const regex = new RegExp(constName, 'g');
        newContent = newContent.replace(regex, constName.replace(/ /g, '_'));
    }
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Restored variables in: ${filePath}`);
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
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
             restoreUnderscoresInFile(fullPath);
        }
    }
}

const targetDir = 'artifacts/hrm-skill-matrix/src';
walk(targetDir);
