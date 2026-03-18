const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const TOOLING_REGISTRY_PATH_CANDIDATES = [
    path.join(ROOT_DIR, 'curricula/DE/Gymnasium/input/DE-HE/retained-asset-registry.json'),
    path.join(ROOT_DIR, 'curricula/DE/Gymnasium/input/HE/retained-asset-registry.json'),
];
const LEGACY_UPPER_SECONDARY_PATH_PREFIX = 'curricula/DE/Gymnasium/input/DE-HE/';
const UPPER_SECONDARY_PATH_PREFIX = 'curricula/DE/Gymnasium/input/HE/';
const TOOLING_REGISTRY_PATH = TOOLING_REGISTRY_PATH_CANDIDATES.find((candidatePath) =>
    fs.existsSync(candidatePath),
);

if (!TOOLING_REGISTRY_PATH || !fs.existsSync(TOOLING_REGISTRY_PATH)) {
    throw new Error(
        `Missing Hessen upper-secondary tooling registry: ${TOOLING_REGISTRY_PATH_CANDIDATES.join(', ')}`,
    );
}

const normalizeToolingPath = (value) => value.replaceAll(
  LEGACY_UPPER_SECONDARY_PATH_PREFIX,
  UPPER_SECONDARY_PATH_PREFIX,
);

const rawToolingRegistry = JSON.parse(fs.readFileSync(TOOLING_REGISTRY_PATH, 'utf8'));
const toolingRegistry = {
    ...rawToolingRegistry,
    abiArchivePath: normalizeToolingPath(rawToolingRegistry.abiArchivePath),
    mappingArchivePath: normalizeToolingPath(rawToolingRegistry.mappingArchivePath),
};

// Target directory
const TARGET_DIR = path.join(ROOT_DIR, toolingRegistry.abiArchivePath, 'input');

// Ensure target directory exists
if (!fs.existsSync(TARGET_DIR)) {
    console.log(`Creating directory: ${TARGET_DIR}`);
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Function to download a file
const downloadFile = (url, dest, filename) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const request = https.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                // Handle redirection
                file.close();
                fs.unlinkSync(dest);
                return downloadFile(response.headers.location, dest, filename).then(resolve).catch(reject);
            }

            if (response.statusCode !== 200) {
                file.close();
                fs.unlinkSync(dest);
                return reject(`Failed to download ${url}: Status Code ${response.statusCode}`);
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close(() => {
                    console.log(`Downloaded: ${filename}`);
                    resolve();
                });
            });
        }).on('error', (err) => {
            fs.unlinkSync(dest);
            reject(err.message);
        });
    });
};

// Function to sanitize filename
const sanitizeFilename = (name) => {
    return name.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
};

// Load extracted JSON files and merge them
let allTasks = [];

const filesToLoad = [
    'iqb_tasks_2017_2019.json',
    'iqb_tasks_2020_2021.json',
    'iqb_tasks_2022_2023.json',
    'iqb_tasks_2024_2025.json',
    'hessen_tasks.json'
];

filesToLoad.forEach(file => {
    const filePath = path.join(TARGET_DIR, file);
    if (fs.existsSync(filePath)) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const tasks = JSON.parse(content);
            allTasks = allTasks.concat(tasks);
            console.log(`Loaded ${tasks.length} tasks from ${file}`);
        } catch (err) {
            console.error(`Error reading ${file}:`, err);
        }
    } else {
        console.warn(`Warning: File not found: ${file}`);
    }
});

async function main() {
    console.log(`Total tasks to process: ${allTasks.length}`);

    // Save combined list
    fs.writeFileSync(path.join(TARGET_DIR, 'all_tasks_combined.json'), JSON.stringify(allTasks, null, 2));

    for (const task of allTasks) {
        // Handle different property names from different extraction batches
        const title = task.title || task.text || 'Unknown_Task';
        const url = task.url;

        if (!url) {
            console.warn(`Skipping task without URL: ${title}`);
            continue;
        }

        const ext = path.extname(url) || '.pdf';

        // Create a unique filename based on the title
        let filename = sanitizeFilename(title);

        // Add a hash to ensure uniqueness if titles are duplicate
        const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);

        // Distinguish source if helpful, but filename usually tells enough.
        // IQB tasks usually start with year, Hessen tasks also often do or have specific names.
        // We'll just use the sanitized title + hash.

        // Adjust filename length if too long
        if (filename.length > 200) {
            filename = filename.substring(0, 200);
        }

        filename = `${filename}_${hash}${ext}`;

        const destPath = path.join(TARGET_DIR, filename);

        if (fs.existsSync(destPath)) {
            // Check if file size is > 0
            try {
                const stats = fs.statSync(destPath);
                if (stats.size > 0) {
                    // console.log(`Skipping existing file: ${filename}`);
                    process.stdout.write('.'); // Compact output
                    continue;
                }
            } catch (e) {
                // ignore
            }
        }

        try {
            console.log(`Downloading ${url} -> ${filename}`);
            await downloadFile(url, destPath, filename);
            // Add a small delay to be polite
            await new Promise(r => setTimeout(r, 100));
        } catch (err) {
            console.error(`Error downloading ${url}:`, err);
        }
    }
    console.log('\nDownload process completed.');
}

main();
