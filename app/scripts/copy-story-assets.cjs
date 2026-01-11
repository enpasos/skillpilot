
const fs = require('fs');
const path = require('path');

// __dirname works naturally in CJS
const SOURCE_DIR = path.resolve(__dirname, '../../docs/story2');
const DEST_DIR = path.resolve(__dirname, '../public');

console.log(`Copying story assets from ${SOURCE_DIR} to ${DEST_DIR}...`);

if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
}

if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

const files = fs.readdirSync(SOURCE_DIR);

files.forEach(file => {
    const srcPath = path.join(SOURCE_DIR, file);
    const destPath = path.join(DEST_DIR, file);

    // Basic check to copy only files (markdown + images)
    try {
        if (fs.lstatSync(srcPath).isFile()) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${file}`);
        }
    } catch (err) {
        console.error(`Error copying ${file}:`, err);
    }
});

console.log('Story assets copied successfully.');
