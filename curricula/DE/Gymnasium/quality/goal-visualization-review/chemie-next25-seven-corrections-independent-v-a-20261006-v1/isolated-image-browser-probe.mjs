// Apache-2.0. Independent V-A: isolated raster display, not full SkillPilot app.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import { createRequire } from 'node:module';
const repo = process.cwd();
const require = createRequire(path.join(repo, 'app/package.json'));
const { chromium } = require('playwright');
const own = path.join(repo, 'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-next25-seven-corrections-independent-v-a-20261006-v1');
const author = 'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-next25-seven-proven-defects-correction-author-20261006-v1';
const raw = JSON.parse(fs.readFileSync(path.join(repo, author, 'seven-selected-actual-pngs-and-current-goals.raw-independent-review-input.json')));
const hash = data => 'sha256:' + crypto.createHash('sha256').update(data).digest('hex');
const relative = p => path.relative(repo, p);
const screenshotDir = path.join(own, 'browser-screenshots');
fs.mkdirSync(screenshotDir, { recursive: true });
const rows = new Map(raw.rows.map(row => [row.goalId, row]));
// The exact image declaration and 1px figure border are reproduced. All other
// app layout, padding, routing, controls and book layout are intentionally absent.
const html = id => `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Isolated V-A raster QA</title><style>html{font-size:16px}*{box-sizing:border-box}body{margin:0;background:white}figure{margin:0;overflow:hidden;border-radius:8px;border:1px solid #e2e8f0;background:white}img{display:block;height:auto;max-height:28rem;width:100%;object-fit:contain}</style></head><body><figure><img class="block h-auto max-h-[28rem] w-full object-contain" src="/asset/${id}" alt="Isolated raster under independent V-A review"></figure></body></html>`;
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const id = url.pathname.startsWith('/asset/') ? url.pathname.slice(7) : url.searchParams.get('id');
  const row = rows.get(id);
  if (!row) { res.writeHead(404); res.end(); return; }
  if (url.pathname.startsWith('/asset/')) {
    const png = fs.readFileSync(path.join(repo, row.selectedPNG.path));
    if (hash(png) !== row.selectedPNG.sha256) throw new Error('Asset drift: ' + id);
    res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' });
    res.end(png);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html(id));
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const result = { schemaVersion: 1, documentType: 'independent-machine-V-A-isolated-image-browser-actual-receipt', createdAtUTC: new Date().toISOString(), scope: 'isolated Chromium image harness, exact GoalCard img declarations and 1px figure border; no full app, no native book, no host acceptance', browserVersion: browser.version(), rootFontPx: 16, deviceScaleFactor: 1, requestedViewportWidths: [360, 680], appGoalCard: { path: 'app/src/components/GoalCard.tsx', sha256: hash(fs.readFileSync(path.join(repo, 'app/src/components/GoalCard.tsx'))), imgClass: 'block h-auto max-h-[28rem] w-full object-contain' }, harness: { path: relative(path.join(own, 'isolated-image-browser-probe.mjs')), sha256: hash(fs.readFileSync(path.join(own, 'isolated-image-browser-probe.mjs'))) }, rows: [], activeWrites: 0 };
  for (const row of raw.rows) {
    for (const width of [360, 680]) {
      const page = await browser.newPage({ viewport: { width, height: 460 }, deviceScaleFactor: 1 });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('requestfailed', req => errors.push(req.url() + ' ' + req.failure()?.errorText));
      await page.goto(origin + '/?id=' + row.goalId, { waitUntil: 'networkidle' });
      await page.locator('img').evaluate(img => img.decode());
      const metrics = await page.locator('img').evaluate(img => { const s = getComputedStyle(img); const b = img.getBoundingClientRect(); return { complete: img.complete, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, renderedBounds: { x: b.x, y: b.y, width: b.width, height: b.height }, computed: { display: s.display, height: s.height, maxHeight: s.maxHeight, width: s.width, objectFit: s.objectFit }, documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth, horizontalOverflow: document.documentElement.scrollWidth > innerWidth, userAgent: navigator.userAgent }; });
      const screenshotPath = path.join(screenshotDir, `${row.goalId}.${width}px.png`);
      await page.screenshot({ path: screenshotPath, clip: { x: 0, y: 0, width, height: Math.ceil(metrics.renderedBounds.height + 2) } });
      const png = fs.readFileSync(screenshotPath);
      result.rows.push({ goalId: row.goalId, asset: row.selectedPNG, viewport: { width, initialHeight: 460 }, ...metrics, errors, screenshot: { path: relative(screenshotPath), sha256: hash(png), bytes: png.length }, screenshotSight: 'PENDING independent actual image view after capture' });
      await page.close();
    }
  }
  fs.writeFileSync(path.join(own, 'isolated-image-browser.actual.receipt.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ browserVersion: result.browserVersion, screenshots: result.rows.length, allLoaded: result.rows.every(r => r.complete), errors: result.rows.flatMap(r => r.errors), anyHorizontalOverflow: result.rows.some(r => r.horizontalOverflow), receipt: relative(path.join(own, 'isolated-image-browser.actual.receipt.json')) }));
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
