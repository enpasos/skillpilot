// SPDX-License-Identifier: Apache-2.0
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { resolve, relative, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
const own = dirname(fileURLToPath(import.meta.url)), root = resolve(own, '../../../../../../..');
const base = resolve(own, '../biologie-source7-SN-ST-SekI-82ac-stage-route-author-successor-v1/native/actual82ac');
const { chromium } = createRequire(resolve(root, 'app/package.json'))('playwright');
const server = createServer((request, response) => {
  const route = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  const resourceBase = route.startsWith('/assets/goal-visualizations/biologie/82acfbde-9ce8-5658-892e-4dcfb1c3a1f1/') ? resolve(root, 'app/public') : base;
  const path = resolve(resourceBase, '.' + route);
  try {
    if (!path.startsWith(resourceBase + '/') || !statSync(path).isFile()) throw Error('out-of-scope');
    response.setHeader('Content-Type', ({ '.html': 'text/html', '.png': 'image/png', '.jpg': 'image/jpeg' })[extname(path)] ?? 'application/octet-stream'); response.end(readFileSync(path));
  } catch { response.statusCode = 404; response.end('Not found'); }
});
await new Promise(ok => server.listen(0, '127.0.0.1', ok));
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1400 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:' + server.address().port + '/book.html', { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
  const loc = page.locator('[data-goal-id="82acfbde-9ce8-5658-892e-4dcfb1c3a1f1"]');
  const status = await loc.evaluate(el => ({ text: el.innerText, images: [...el.querySelectorAll('img')].map(i => ({ src: i.getAttribute('src'), complete: i.complete, naturalWidth: i.naturalWidth, naturalHeight: i.naturalHeight, alt: i.alt })), width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }));
  if (status.images.some(i => !i.complete || !i.naturalWidth)) throw Error('Unloaded bound actual image');
  const path = resolve(own, 'actual82ac-whole-native-html.png'); await loc.screenshot({ path });
  const bytes = readFileSync(path);
  writeFileSync(resolve(own, 'actual82ac-whole-native-html.capture.actual.json'), JSON.stringify({ schemaVersion: 1, license: 'CC-BY-4.0', role: 'Actual own Chromium HTML capture, scientific review recorded separately', html: { path: relative(root, resolve(base, 'book.html')), sha256: 'sha256:' + createHash('sha256').update(readFileSync(resolve(base, 'book.html'))).digest('hex') }, capture: { path: relative(root, path), sha256: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length }, status, humanApproval: false }, null, 2) + '\n');
  console.log(JSON.stringify({ actualHTMLPages: 1, imagesLoaded: status.images.length }));
} finally { await browser.close(); await new Promise(ok => server.close(ok)); }
