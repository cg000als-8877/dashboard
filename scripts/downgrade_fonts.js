const fs = require('fs');
const path = require('path');

const srcDir = 'd:\\Sinking Voyage\\dashboard\\src';

// The user explicitly stated: "what is Black now must be bold"
// In Tailwind, Black is 900, Extrabold is 800, Bold is 700.
// This indicates a 200-weight shift (or dropping 2 levels in Tailwind's scale).
const weightMap = {
    'black': 'bold',
    'extrabold': 'semibold',
    'bold': 'medium',
    'semibold': 'normal',
    'medium': 'light',
    'normal': 'extralight',
    'light': 'thin'
};

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all font-xxx using a regex that captures the weight name
    const regex = /\bfont-(black|extrabold|bold|semibold|medium|normal|light)\b/g;
    
    const newContent = content.replace(regex, (match, weight) => {
        return `font-${weightMap[weight]}`;
    });
    
    if (content !== newContent) {
        console.log(`Updated: ${filePath}`);
        fs.writeFileSync(filePath, newContent, 'utf8');
    }
}

walkDir(srcDir);
console.log('Done mapping font weights.');
