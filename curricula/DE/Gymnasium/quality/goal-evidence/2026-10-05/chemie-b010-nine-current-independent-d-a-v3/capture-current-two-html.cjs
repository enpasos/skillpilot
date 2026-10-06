// SPDX-License-Identifier: Apache-2.0
const { chromium } = require('../../../../../../../app/node_modules/playwright');
const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { createHash } = require('node:crypto');
const http = require('node:http');
const root = process.cwd(), own = __dirname;
const prepared = resolve(own, '../chemie-b010-five-corrected-image-current-candidate-v3');
const iso = resolve(root, 'tmp/chemie-b010-five-corrected-native-isolated-20261005-v3');
const model = JSON.parse(readFileSync(resolve(prepared, 'native-finalbook/bundle/book-model.json'), 'utf8'));
const html = resolve(prepared, 'native-finalbook/bundle/book.html');
const sha = b => createHash('sha256').update(b).digest('hex');
(async () => {
  const assetReads = {};
  const server = http.createServer((req, res) => {
    try {
      const u = new URL(req.url, 'http://localhost');
      if (u.pathname !== '/book.html' && !u.pathname.startsWith('/assets/goal-visualizations/')) throw new Error('Unsupported local path');
      const path = u.pathname === '/book.html' ? html : resolve(iso, 'app/public', '.' + u.pathname);
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
    for (const goal of model.pages.filter(g => /^(16a80de2|1f5ee84f)/.test(g.goalId))) {
      const section = page.locator('#' + goal.anchor);
      const actualText = await section.innerText();
      if (!actualText.includes(goal.title) || !actualText.includes(goal.description)) throw new Error(`Actual HTML text mismatch ${goal.goalId}`);
      const actualImage = await section.locator('img').evaluate(e => ({ url: new URL(e.src).pathname, altText: e.alt, naturalWidth: e.naturalWidth, naturalHeight: e.naturalHeight, displayedWidth: e.getBoundingClientRect().width }));
      if (actualImage.url !== goal.visualization.url || 'sha256:' + assetReads[actualImage.url] !== goal.visualization.originalDigest) throw new Error('Actual image binding mismatch');
      if (actualImage.altText !== goal.visualization.altText) throw new Error('Actual alt text mismatch');
      await section.scrollIntoViewIfNeeded();
      const output = resolve(own, 'actual-renders', `html-${goal.goalId.slice(0, 8)}.png`);
      await section.screenshot({ path: output, animations: 'disabled' });
      rows.push({ goalId: goal.goalId, fullActualNativeTextPresent: true, actualText, actualImage, screenshotPath: output.slice(root.length + 1), screenshotSHA256: sha(readFileSync(output)) });
    }
  } finally {
    await browser.close(); server.closeAllConnections(); await new Promise(r => server.close(r));
  }
  writeFileSync(resolve(own, 'actual-current-two-html.receipt.json'), JSON.stringify({ method: 'Exact frozen native HTML served locally with exact physical final future image assets; Chromium 780 CSS px viewport, actual image width measured', htmlSHA256: sha(readFileSync(html)), modelDigest: model.digest, rows, servedImageSHA256: assetReads, humanApproval: false, activeWrites: 0 }, null, 2) + '\n');
  console.log(JSON.stringify({ targetedNativeHTMLSections: rows.length, allActualTextAndImageBindingsPresent: true }));
})().catch(e => { console.error(e); process.exitCode = 1; });
