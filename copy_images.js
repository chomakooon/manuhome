const fs = require('fs');
const path = require('path');

const srcDir = '/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e';
const destDir = '/Users/sitter/manuhome/public/images/portfolio/icon';
const statusFile = '/Users/sitter/manuhome/copy_status.txt';

const files = [
    'media__1773168252110.jpg',
    'media__1773168252130.jpg',
    'media__1773168252143.jpg',
    'media__1773168252160.png',
    'media__1773168252336.jpg'
];

try {
    fs.mkdirSync(destDir, { recursive: true });

    let logs = [];
    files.forEach(file => {
        fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
        logs.push(`Copied ${file}`);
    });
    fs.writeFileSync(statusFile, logs.join('\n'));
} catch (e) {
    fs.writeFileSync(statusFile, 'Error: ' + e.message);
}
