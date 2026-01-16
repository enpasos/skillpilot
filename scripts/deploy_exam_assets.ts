import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Configuration
const SOURCE_DIR = path.join(ROOT_DIR, 'curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Mathe/Klausurbeispiel2026_1');
const TARGET_DIR = path.join(ROOT_DIR, 'app/public/assets/abi/2026_1');

// Ensure target directory exists
if (!fs.existsSync(TARGET_DIR)) {
  console.log(`Creating target directory: ${TARGET_DIR}`);
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Function to walk directory and copy png files
function copyImages(source: string, target: string) {
  if (!fs.existsSync(source)) {
    console.warn(`Source directory does not exist: ${source}`);
    return;
  }

  const items = fs.readdirSync(source, { withFileTypes: true });

  for (const item of items) {
    const sourcePath = path.join(source, item.name);

    if (item.isDirectory()) {
      // Recurse into subdirectories (e.g. 'en')
      // Maintain structure in target? Or flatten?
      // The current manually deployed images in json usually refer to /assets/abi/2026_1/imageX.png directly.
      // But subdirectories might be for languages. 
      // Let's flatten for now as per previous manual finds (image.de.png, image.en.png are typically in same folder or subfolder but referenced flatly or we need to respect structure).
      // Markdown references: /assets/abi/2026_1/image4.png
      // Source layout: .../en/image1.en.png, .../image1.de.png
      // If we flatten, we get them all in one dir, identifying by filename.
      copyImages(sourcePath, target);
    } else if (item.isFile() && item.name.toLowerCase().endsWith('.png')) {
      const targetPath = path.join(target, item.name);
      // console.log(`Copying ${item.name}`); // Reduce spam
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

try {
  console.log(`Starting image deployment...`);
  console.log(`Source: ${SOURCE_DIR}`);
  console.log(`Target: ${TARGET_DIR}`);

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Error: Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  copyImages(SOURCE_DIR, TARGET_DIR);
  console.log('Image deployment completed successfully.');
} catch (error) {
  console.error('Deployment failed:', error);
  process.exit(1);
}
