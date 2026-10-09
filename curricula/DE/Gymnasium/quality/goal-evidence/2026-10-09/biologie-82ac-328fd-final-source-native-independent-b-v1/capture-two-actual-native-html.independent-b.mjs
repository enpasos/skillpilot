// SPDX-License-Identifier: Apache-2.0
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { resolve, relative, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
const own = dirname(fileURLToPath(import.meta.url)), root = resolve(own, '../../../../../../..');
const base = resolve(own, '../biologie-82ac-nine-lower-jurisdictions-and-SN-ST-digital-prerequisite-source-author-v1/native/actual-two');
const goals = ['82acfbde-9ce8-5658-892e-4dcfb1c3a1f1', '328fd9d3-d3c3-5731-a8da-a909143d3962'];
const hash = path => 'sha256:' + createHash('sha256').update(readFileSync(path)).digest('hex');
const { chromium } = createRequire(resolve(root, 'app/package.json'))('playwright');
const server = createServer((request, response) => {
  const route = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  const resourceBase = goals.some(id => route.startsWith('/assets/goal-visualizations/biologie/' + id + '/')) ? resolve(root, 'app/public') : base;
  const path = resolve(resourceBase, '.' + route);
  try {
    if (!path.startsWith(resourceBase + '/') || !statSync(path).isFile()) throw Error('out-of-scope');
    response.setHeader('Content-Type', ({ '.html': 'text/html', '.png': 'image/png', '.jpg': 'image/jpeg' })[extname(path)] ?? 'application/octet-stream');
    response.end(readFileSync(path));
  } catch { response.statusCode = 404; response.end('Not found'); }
});
await new Promise(ok => server.listen(0, '127.0.0.1', ok));
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1400 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:' + server.address().port + '/book.html', { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
  const records = [];
  for (const id of goals) {
    const loc = page.locator('[data-goal-id="' + id + '"]');
    const status = await loc.evaluate(el => ({ text: el.innerText, images: [...el.querySelectorAll('img')].map(i => ({ src: i.getAttribute('src'), complete: i.complete, naturalWidth: i.naturalWidth, naturalHeight: i.naturalHeight, alt: i.alt })), width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }));
    if (status.images.some(i => !i.complete || !i.naturalWidth)) throw Error('Unloaded bound actual image');
    const path = resolve(own, id + '.actual-whole-native-html.png');
    await loc.screenshot({ path });
    records.push({ goalId: id, capture: { path: relative(root, path), sha256: hash(path), bytes: readFileSync(path).length }, status });
  }
  writeFileSync(resolve(own, 'two-actual-whole-native-html.capture.actual.json'), JSON.stringify({ schemaVersion: 1, license: 'CC-BY-4.0', role: 'Actual own Chromium captures; scientific verdict recorded separately', html: { path: relative(root, resolve(base, 'book.html')), sha256: hash(resolve(base, 'book.html')) }, records, humanApproval: false }, null, 2) + '\n');
  console.log(JSON.stringify({ actualHTMLPages: records.length, imagesLoaded: records.reduce((n, r) => n + r.status.images.length, 0) }));
} finally { await browser.close(); await new Promise(ok => server.close(ok)); }
