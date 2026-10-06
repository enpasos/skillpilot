// SPDX-License-Identifier: Apache-2.0
// Independent read-only view of the exact frozen author book, without a build.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium } = require('./app/node_modules/playwright');
const repo = '/home/enpasos/projects/skillpilot';
const own = path.join(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-seven-current-independent-p-v1');
const author = path.join(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-six-source-operator-remediation-current-candidate-v1');
const publicRoot = path.join(repo, 'tmp/chemie-q1-six-source-operator-native-isolated-20261005-v1/app/public');
const htmlPath = path.join(author, 'native-finalbook-v2/bundle/book.html');
const book = JSON.parse(fs.readFileSync(path.join(author, 'native-finalbook-v2/bundle/book-model.json')));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const normalizeHtmlWhitespace = text => text.trim().replace(/\s+/g, ' ');
let browser;
(async () => {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const requests = [];
  const errors = [];
  page.on('pageerror', err => errors.push(String(err)));
  await page.route('http://independent-p7.local/**', async route => {
    const u = new URL(route.request().url());
    if (u.pathname === '/book.html') return route.fulfill({ status: 200, contentType: 'text/html', body: fs.readFileSync(htmlPath) });
    const expected = book.pages.find(row => row.visualization?.url === u.pathname);
    if (!expected) return route.fulfill({ status: 404, body: 'Not a frozen book asset' });
    const physical = path.join(publicRoot, u.pathname.slice(1));
    const bytes = fs.readFileSync(physical);
    if ('sha256:' + sha(bytes) !== expected.visualization.originalDigest) throw new Error(`Image digest drift: ${expected.goalId}`);
    requests.push({ goalId: expected.goalId, url: u.pathname, physicalPath: physical, sha256: sha(bytes), bytes: bytes.length });
    return route.fulfill({ status: 200, contentType: u.pathname.endsWith('.png') ? 'image/png' : 'image/jpeg', body: bytes });
  });
  await page.goto('http://independent-p7.local/book.html', { waitUntil: 'networkidle' });
  await page.locator('article.goal-page img').evaluateAll(imgs => Promise.all(imgs.map(img => img.decode())));
  const views = path.join(own, 'actual-native-html-views');
  fs.mkdirSync(views, { recursive: true });
  const rows = [];
  for (const expected of book.pages) {
    const article = page.locator(`article[data-goal-id="${expected.goalId}"]`);
    if (await article.count() !== 1) throw new Error(`Missing or duplicate goal article: ${expected.goalId}`);
    const row = await article.evaluate(el => {
      const img = el.querySelector('img');
      return { goalId: el.dataset.goalId, pageNumber: Number(el.dataset.pageNumber), fullText: el.innerText, description: el.querySelector('.goal-description p').textContent, image: { currentSrc: img.currentSrc, complete: img.complete, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, alt: img.alt } };
    });
    if (normalizeHtmlWhitespace(row.description) !== normalizeHtmlWhitespace(expected.description) || !row.image.complete || !row.image.naturalWidth) throw new Error(`Incomplete current goal input: ${expected.goalId}; ${JSON.stringify(row)}`);
    row.viewPath = path.join(views, expected.goalId + '.png');
    await article.screenshot({ path: row.viewPath });
    row.viewSHA256 = sha(fs.readFileSync(row.viewPath));
    rows.push(row);
  }
  if (errors.length || requests.length !== 8) throw new Error(`Unexpected HTML state: errors=${errors.length}, assets=${requests.length}`);
  fs.writeFileSync(path.join(own, 'actual-native-html-dom.receipt.json'), JSON.stringify({ atUTC: new Date().toISOString(), mode: 'local synthetic origin route fulfillment; read-only exact frozen HTML and public images', htmlPath, htmlSHA256: sha(fs.readFileSync(htmlPath)), bookDigest: book.digest, actualLoadedAssets: requests, actualGoalArticles: rows, errors, scientificVerdict: null, humanApproval: false }, null, 2) + '\n');
  console.log(JSON.stringify({ goalArticles: rows.length, actualLoadedAssets: requests.length, exactDescriptions: true, errors: errors.length }));
})().catch(err => { console.error(err); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); });
