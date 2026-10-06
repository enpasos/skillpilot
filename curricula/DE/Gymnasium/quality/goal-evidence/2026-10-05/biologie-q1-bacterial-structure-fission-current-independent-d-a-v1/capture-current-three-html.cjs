// SPDX-License-Identifier: Apache-2.0
const { chromium } = require('../../../../../../../app/node_modules/playwright');
const { readFileSync, writeFileSync, mkdirSync } = require('node:fs');
const { resolve } = require('node:path');
const { createHash } = require('node:crypto');
const http = require('node:http');
const root = process.cwd(), own = __dirname;
const prepared = resolve(root, process.argv[2] || 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-bacterial-structure-fission-native-candidate-v1');
if (!process.argv[3]) throw new Error('An explicit prepared physical public-asset root is required');
const publicRoot = resolve(root, process.argv[3]);
const model = JSON.parse(readFileSync(resolve(prepared, 'native-finalbook/bundle/book-model.json'), 'utf8'));
if (model.pages.length !== 3) throw new Error('Expected exactly three supplied current pages');
const html = resolve(prepared, 'native-finalbook/bundle/book.html');
const sha = b => createHash('sha256').update(b).digest('hex');
(async () => {
  mkdirSync(resolve(own, 'actual-renders'), { recursive: true });
  const assetReads = {};
  const server = http.createServer((req, res) => {
    try {
      const u = new URL(req.url, 'http://localhost');
      if (u.pathname !== '/book.html' && !u.pathname.startsWith('/assets/goal-visualizations/')) throw new Error('Unsupported local path');
      const path = u.pathname === '/book.html' ? html : resolve(publicRoot, '.' + u.pathname);
      if (path !== html && !path.startsWith(publicRoot + '/assets/goal-visualizations/')) throw new Error('Outside explicit bounded public assets');
      const bytes = readFileSync(path);
      if (u.pathname !== '/book.html') assetReads[u.pathname] = sha(bytes);
      res.setHeader('Content-Type', path.endsWith('.html') ? 'text/html; charset=utf-8' : path.endsWith('.png') ? 'image/png' : 'image/jpeg');
      res.end(bytes);
    } catch { res.statusCode = 404; res.end(); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ headless: true });
  const rows = [];
  try {
    const page = await browser.newPage({ viewport: { width: 780, height: 1400 }, deviceScaleFactor: 1 });
    await page.goto(`http://127.0.0.1:${server.address().port}/book.html`, { waitUntil: 'networkidle' });
    await page.locator('img').evaluateAll(imgs => Promise.all(imgs.map(i => i.decode())));
    for (const goal of model.pages) {
      const section = page.locator('#' + goal.anchor);
      const actualText = await section.innerText();
      if (!actualText.includes(goal.title) || !actualText.includes(goal.description)) throw new Error(`Actual HTML text mismatch ${goal.goalId}`);
      const actualImage = goal.visualization ? await section.locator('img').evaluate(e => ({ url: new URL(e.src).pathname, altText: e.alt, naturalWidth: e.naturalWidth, naturalHeight: e.naturalHeight, displayedWidth: e.getBoundingClientRect().width })) : null;
      if (goal.visualization && (actualImage.url !== goal.visualization.url || 'sha256:' + assetReads[actualImage.url] !== goal.visualization.originalDigest)) throw new Error('Actual image binding mismatch');
      if (goal.visualization && actualImage.altText !== goal.visualization.altText) throw new Error('Actual alt text mismatch');
      await section.scrollIntoViewIfNeeded();
      const output = resolve(own, 'actual-renders', `html-${goal.goalId.slice(0, 8)}.png`);
      await section.screenshot({ path: output, animations: 'disabled' });
      rows.push({ goalId: goal.goalId, fullActualNativeTextPresent: true, actualText, actualImage, screenshotPath: output.slice(root.length + 1), screenshotSHA256: sha(readFileSync(output)) });
    }
  } finally {
    await browser.close(); server.closeAllConnections(); await new Promise(r => server.close(r));
  }
  writeFileSync(resolve(own, 'actual-current-three-html.receipt.json'), JSON.stringify({ method: 'Exact supplied current native HTML served locally with explicitly supplied exact physical future image assets; Chromium 780 CSS px viewport, actual image width measured', htmlPath: html.slice(root.length + 1), htmlSHA256: sha(readFileSync(html)), modelDigest: model.digest, publicRoot, rows, servedImageSHA256: assetReads, humanApproval: false, activeWrites: 0 }, null, 2) + '\n');
  console.log(JSON.stringify({ actualNativeHTMLSections: rows.length, allActualTextAndImageBindingsPresent: true }));
})().catch(e => { console.error(e); process.exitCode = 1; });
