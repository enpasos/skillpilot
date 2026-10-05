const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(path.resolve('app/node_modules/playwright'));

const repo = process.cwd();
const output = path.dirname(__filename);
const bundle = path.resolve('curricula/DE/Gymnasium/quality/goal-description-review/chemie/rollout-v1/2026-10-05/batch-009-open-redox-one-current-v2/bundle');
const assetPath = '/assets/goal-visualizations/chemie/bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a/bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a.jpg';
const imageInspectionHtml = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;background:white}img{display:block;width:100%;height:auto}</style></head><body><img src="' + assetPath + '" alt="Original bound JPEG at viewport width"></body></html>';

async function main() {
  const requests = [];
  const server = http.createServer((request, response) => {
    const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
    requests.push(pathname);
    if (pathname === '/book.html') {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(fs.readFileSync(path.join(bundle, 'book.html')));
    } else if (pathname === assetPath) {
      response.writeHead(200, { 'content-type': 'image/jpeg' });
      response.end(fs.readFileSync(path.join(repo, 'app/public', assetPath)));
    } else if (pathname === '/original-jpg-inspection.html') {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(imageInspectionHtml);
    } else {
      response.writeHead(404);
      response.end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const browser = await chromium.launch({ headless: true });
  const report = { schemaVersion: 1, purpose: 'Independent current D review surface inspection; no product correction or release authority', routing: { host: '127.0.0.1', book: 'exact bound bundle/book.html', asset: 'exact app/public root-relative asset' }, htmlGoalPages: [], originalJpgFitWidthInspection: [], consoleErrors: [], failedRequests: [] };
  try {
    for (const width of [1280, 680, 360]) {
      const page = await browser.newPage({ viewport: { width, height: 1400 }, deviceScaleFactor: 1 });
      page.on('pageerror', error => report.consoleErrors.push(String(error)));
      page.on('requestfailed', request => report.failedRequests.push({ url: request.url(), error: request.failure() }));
      await page.goto(`http://127.0.0.1:${port}/book.html#goal-bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a`, { waitUntil: 'networkidle' });
      await page.locator('.goal-visualization img').evaluate(img => img.decode());
      const metrics = await page.locator('.goal-page').evaluate(article => {
        const img = article.querySelector('img');
        const box = article.getBoundingClientRect();
        return { goalId: article.dataset.goalId, logicalPageNumber: Number(article.dataset.pageNumber), physicalPageNumber: 3, frontMatterPages: document.querySelectorAll('.front-matter-page').length, articleWidth: box.width, articleHeight: box.height, viewportWidth: innerWidth, documentScrollWidth: document.documentElement.scrollWidth, imageComplete: img.complete, imageNaturalWidth: img.naturalWidth, imageNaturalHeight: img.naturalHeight, imageDisplayedWidth: img.getBoundingClientRect().width, imageDisplayedHeight: img.getBoundingClientRect().height, title: article.querySelector('.goal-title').textContent.trim(), description: article.querySelector('.goal-description > p:not(.section-heading)').textContent.trim(), text: article.innerText };
      });
      const articleFile = `html-goal-page-viewport-${width}.png`;
      const viewportFile = `html-goal-visible-viewport-${width}.png`;
      await page.locator('.goal-page').screenshot({ path: path.join(output, articleFile) });
      await page.screenshot({ path: path.join(output, viewportFile) });
      report.htmlGoalPages.push({ ...metrics, articleScreenshot: articleFile, viewportScreenshot: viewportFile });
      await page.close();
    }
    for (const width of [680, 360]) {
      const page = await browser.newPage({ viewport: { width, height: 700 }, deviceScaleFactor: 1 });
      await page.goto(`http://127.0.0.1:${port}/original-jpg-inspection.html`, { waitUntil: 'networkidle' });
      await page.locator('img').evaluate(img => img.decode());
      const filename = `original-jpg-fit-width-${width}.png`;
      const metrics = await page.locator('img').evaluate(img => ({ naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, displayedWidth: img.getBoundingClientRect().width, displayedHeight: img.getBoundingClientRect().height }));
      await page.locator('img').screenshot({ path: path.join(output, filename) });
      report.originalJpgFitWidthInspection.push({ viewportWidth: width, ...metrics, screenshot: filename, harness: 'Dedicated local fit-width inspection only, does not represent responsive book layout' });
      await page.close();
    }
    report.requests = requests;
    fs.writeFileSync(path.join(output, 'surface-inspection.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ htmlGoalPageCount: report.htmlGoalPages.length, failedRequests: report.failedRequests.length, consoleErrors: report.consoleErrors.length, output }));
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
