import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const require = createRequire(resolve(root, 'app/package.json'));
const { chromium } = require('playwright');
const base = 'curricula/DE/Gymnasium/quality/goal-description-review/chemie/rollout-v1/2026-10-05/batch-013w-mol-analysis-corrected-images-current-2-v1';
const output = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-stoffmenge-two-current-d-b-v1';
const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  let file;
  if (path === '/book.html') file = resolve(root, base, 'bundle/book.html');
  else if (path.startsWith('/assets/goal-visualizations/chemie/')) file = resolve(root, 'app/public', path.slice(1));
  else { res.writeHead(404).end(); return; }
  try {
    const content = await readFile(file);
    res.setHeader('Content-Type', file.endsWith('.png') ? 'image/png' : 'text/html; charset=utf-8');
    res.end(content);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolveListening => server.listen(0, '127.0.0.1', resolveListening));
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${server.address().port}/book.html`, { waitUntil: 'networkidle' });
  await page.locator('.goal-page img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  await mkdir(resolve(root, output, 'html-pages'), { recursive: true });
  const observations = await page.locator('.goal-page').evaluateAll(elements => elements.map(element => ({
    goalId: element.dataset.goalId,
    pageNumber: element.dataset.pageNumber,
    text: element.innerText,
    images: [...element.querySelectorAll('img')].map(image => ({ src: image.getAttribute('src'), alt: image.alt, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, complete: image.complete })),
    links: [...element.querySelectorAll('a')].map(link => ({ text: link.innerText, href: link.getAttribute('href') }))
  })));
  for (const goal of observations) await page.locator(`[data-goal-id="${goal.goalId}"]`).screenshot({ path: resolve(root, output, 'html-pages', `${goal.goalId}.png`) });
  await writeFile(resolve(root, output, 'html-observations.json'), JSON.stringify({ inspectedAt: new Date().toISOString(), browserVersion: browser.version(), observations }, null, 2) + '\n');
  console.log(`Inspected ${observations.length} actual HTML goal articles; all images decoded.`);
} finally {
  await browser.close();
  server.close();
}
