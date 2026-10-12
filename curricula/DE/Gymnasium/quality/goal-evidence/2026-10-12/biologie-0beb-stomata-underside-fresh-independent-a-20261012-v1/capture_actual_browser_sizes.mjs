import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/app/package.json');
const { chromium } = require('playwright');
import { readFile, mkdir, writeFile, access } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';

const [sourcePath, outputDirectory] = process.argv.slice(2);
if (!sourcePath || !outputDirectory) throw new Error('sourcePath and outputDirectory required');
const bytes = await readFile(sourcePath);
const sha256 = 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const captures = [];
try {
  for (const width of [360, 680]) {
    const page = await browser.newPage({ viewport: { width: width + 32, height: 800 }, deviceScaleFactor: 1 });
    await page.route('https://skillpilot-review.invalid/**', async route => {
      const path = new URL(route.request().url()).pathname;
      if (path === '/image.png') return route.fulfill({ contentType: 'image/png', body: bytes });
      if (path === '/') return route.fulfill({ contentType: 'text/html', body: `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;}img{display:block;width:${width}px;height:auto;max-height:448px;object-fit:contain;}</style></head><body><img src="/image.png" alt="Gezielte fachliche Bildkorrektur"></body></html>` });
      throw new Error(`Unexpected request ${path}`);
    });
    await page.goto('https://skillpilot-review.invalid/', { waitUntil: 'networkidle' });
    await page.locator('img').evaluate(img => img.decode());
    const path = `${outputDirectory}/actual-${width}px.png`;
    try { await access(path); throw new Error(`Output exists ${path}`); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    await mkdir(dirname(path), { recursive: true });
    await page.locator('img').screenshot({ path });
    captures.push({ displayedWidth: width, deviceScaleFactor: 1, screenshotPath: path, actualBounds: await page.locator('img').boundingBox(), naturalSize: await page.locator('img').evaluate(img => ({ width: img.naturalWidth, height: img.naturalHeight })) });
    await page.close();
  }
  await writeFile(`${outputDirectory}/browser-display-provenance.actual.json`, JSON.stringify({ schemaVersion: 1, actualBrowser: 'Playwright Chromium', sourcePath, sourceSha256: sha256, sourceBytes: bytes.length, captures, sourceImageEditedByBrowser: false, HumanApproval: false, HumanTrial: false }, null, 2) + '\n', { flag: 'wx' });
  process.stdout.write(JSON.stringify({ sourceSha256: sha256, captures: captures.length }) + '\n');
} finally { await browser.close(); }
