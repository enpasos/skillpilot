// SPDX-License-Identifier: Apache-2.0
const { chromium } = require('../../../../../../../app/node_modules/playwright');
const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { createHash } = require('node:crypto');
const http = require('node:http');
const root = process.cwd(), own = __dirname;
const input = resolve(own, '../chemie-b010-five-prospective-current-candidate-v1');
const model = JSON.parse(readFileSync(resolve(input, 'native-finalbook/bundle/book-model.json'), 'utf8'));
const html = resolve(input, 'native-finalbook/bundle/book.html');
const sha = b => createHash('sha256').update(b).digest('hex');
(async () => {
  const server = http.createServer((req, res) => {
    try {
      const u = new URL(req.url, 'http://localhost');
      let path = u.pathname === '/book.html' ? html : resolve(root, 'app/public', '.' + u.pathname);
      if (u.pathname.includes('/950c73c6-4ed1-488a-9267-1142e95e0055/')) {
        path = resolve(input, 'prospective-input-tree/app/public', '.' + u.pathname);
      }
      const bytes = readFileSync(path);
      res.setHeader('Content-Type', path.endsWith('.html') ? 'text/html; charset=utf-8' : path.endsWith('.png') ? 'image/png' : 'image/jpeg');
      res.end(bytes);
    } catch { res.statusCode = 404; res.end(); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ headless: true });
  const rows = [];
  try {
    const page = await browser.newPage({ viewport: { width: 980, height: 1400 }, deviceScaleFactor: 1 });
    await page.goto(`http://127.0.0.1:${server.address().port}/book.html`, { waitUntil: 'networkidle' });
    await page.locator('img').evaluateAll(imgs => Promise.all(imgs.map(i => i.decode())));
    for (const goal of model.pages) {
      const section = page.locator('#' + goal.anchor);
      const actualText = await section.innerText();
      if (!actualText.includes(goal.title) || !actualText.includes(goal.description)) throw new Error(`Actual HTML text mismatch ${goal.goalId}`);
      const geometry = await section.locator('.goal-title').evaluate(e => {
        const b = e.getBoundingClientRect(), r = document.createRange();
        r.selectNodeContents(e);
        return { headingText: e.innerText, box: { x: b.x, y: b.y, width: b.width, height: b.height }, textRects: [...r.getClientRects()].map(a => ({ x: a.x, y: a.y, width: a.width, height: a.height })) };
      });
      await section.scrollIntoViewIfNeeded();
      const output = resolve(own, 'actual-renders', `html-${goal.goalId.slice(0, 8)}.png`);
      await section.screenshot({ path: output, animations: 'disabled' });
      rows.push({ goalId: goal.goalId, fullTextPresent: true, geometry, screenshotPath: output.slice(root.length + 1), screenshotSHA256: sha(readFileSync(output)) });
    }
  } finally {
    await browser.close(); server.closeAllConnections(); await new Promise(r => server.close(r));
  }
  writeFileSync(resolve(own, 'exact-html-render.actual.receipt.json'), JSON.stringify({ method: 'Exact frozen native HTML, local Chromium, 980 CSS pixels; actual goal images from current exact baseline or frozen 950 candidate', htmlSHA256: sha(readFileSync(html)), modelDigest: model.digest, rows, humanApproval: false, activeWrites: 0 }, null, 2) + '\n');
  console.log(JSON.stringify({ actualHTMLSections: rows.length, allActualTextPresent: true }));
})().catch(e => { console.error(e); process.exitCode = 1; });
