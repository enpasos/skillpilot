import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Configuration
const MAPPINGS = [
    {
        source: path.join(ROOT_DIR, 'docs', 'whitepaper'),
        target: path.join(ROOT_DIR, 'app', 'public', 'whitepaper'),
        extensions: ['.md', '.png', '.jpg', '.jpeg', '.svg', '.pdf']
    },
    {
        source: path.join(ROOT_DIR, 'docs', 'comic1'),
        target: path.join(ROOT_DIR, 'app', 'public', 'comic1'),
        extensions: ['.png', '.jpg', '.jpeg']
    },
    {
        source: path.join(ROOT_DIR, 'docs', 'comic2'),
        target: path.join(ROOT_DIR, 'app', 'public', 'comic2'),
        extensions: ['.png', '.jpg', '.jpeg']
    }
];

const PAGE_BREAK_DIV_REGEX = /^[ \t]*<div\s+style=["']page-break-after:\s*always;?["']\s*>\s*<\/div>\s*\r?\n?/gim;

const sanitizeMarkdownForWebGui = (content: string) => (
    content.replace(PAGE_BREAK_DIV_REGEX, '')
);

function copyAssets(sourceDir: string, targetDir: string, allowedExtensions: string[]) {
    if (!fs.existsSync(sourceDir)) {
        console.warn(`Source directory not found: ${sourceDir}`);
        return 0;
    }

    // Create target directory (clearing it first might be safer, but simpler: just ensure exists)
    // Python script did: if exists, rmtree; then makedirs. Let's match that behavior.
    if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
    }
    fs.mkdirSync(targetDir, { recursive: true });

    const items = fs.readdirSync(sourceDir);
    let count = 0;

    for (const name of items) {
        const sourcePath = path.join(sourceDir, name);
        const stat = fs.statSync(sourcePath);

        if (stat.isFile()) {
            const ext = path.extname(name).toLowerCase();
            if (allowedExtensions.includes(ext)) {
                const targetPath = path.join(targetDir, name);
                if (ext === '.md') {
                    const sourceContent = fs.readFileSync(sourcePath, 'utf8');
                    fs.writeFileSync(targetPath, sanitizeMarkdownForWebGui(sourceContent), 'utf8');
                } else {
                    fs.copyFileSync(sourcePath, targetPath);
                }
                count++;
            }
        }
    }

    console.log(`Deployed ${count} assets to ${targetDir}`);
    return count;
}

function deployWhitepaper() {
    console.log('Starting whitepaper deployment...');
    let total = 0;

    for (const mapping of MAPPINGS) {
        total += copyAssets(mapping.source, mapping.target, mapping.extensions);
    }

    console.log(`Deployment complete. ${total} whitepaper assets deployed.`);
}

deployWhitepaper();
