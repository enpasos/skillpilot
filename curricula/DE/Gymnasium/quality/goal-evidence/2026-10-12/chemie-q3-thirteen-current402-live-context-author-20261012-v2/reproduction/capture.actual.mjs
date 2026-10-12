import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { pathToFileURL } from 'node:url';
const own = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const repo = path.resolve(own, ...Array(7).fill('..'));
const { chromium } = await import(pathToFileURL(path.join(repo, 'app/node_modules/playwright/index.mjs')));
const publicRoot = path.join(repo, 'tmp/chemie-q3-thirteen-author-v2-execution-capsule/app/public');
const model = JSON.parse(await fs.readFile(path.join(own, 'native/thirteen.normal-model.author.actual.json'), 'utf8'));
const captureRoot = path.join(own, 'native/actual-views');
await fs.mkdir(captureRoot, { recursive: true });
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const target = url.pathname.startsWith('/assets/') ? path.join(publicRoot, url.pathname) : path.join(own, 'native/thirteen.html');
    res.setHeader('Content-Type', target.endsWith('.html') ? 'text/html' : target.endsWith('.png') ? 'image/png' : 'image/jpeg');
    res.end(await fs.readFile(target));
  } catch { res.statusCode = 404; res.end('missing'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1024, height: 1200 } });
const receipt = { role: 'actual_pixels_capture_not_independent_approval', wholeModelPages: 13, native: [], images: [], humanApproval: false };
try {
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => Promise.all(Array.from(document.images, i => i.decode())));
  for (const goal of model.pages) {
    const article = page.locator(`[data-goal-id="${goal.goalId}"]`);
    const locator = await article.count() ? article : page.locator(`#${goal.anchor}`).locator('xpath=ancestor::article');
    const out = path.join(captureRoot, `${goal.goalId}.native-html.png`);
    await locator.screenshot({ path: out });
    receipt.native.push({ goalId: goal.goalId, path: path.relative(repo, out), boundingBox: await locator.boundingBox() });
  }
  for (const width of [360, 680]) {
    for (let start = 0; start < model.pages.length; start += 3) {
      const group = model.pages.slice(start, start + 3);
      await page.setViewportSize({ width: (width + 16) * group.length, height: 560 });
      await page.setContent(`<style>body{margin:0;background:white;display:flex;align-items:flex-start;gap:16px}figure{margin:0;width:${width}px}img{display:block;max-width:100%;max-height:448px;width:auto;height:auto;margin:auto}figcaption{font:12px sans-serif}</style>` + group.map(g => `<figure><img src="${base}${g.visualization.url}"><figcaption>${g.goalId}</figcaption></figure>`).join(''));
      await page.evaluate(() => Promise.all(Array.from(document.images, i => i.decode())));
      const out = path.join(captureRoot, `image-${width}-group${start / 3 + 1}.png`);
      await page.screenshot({ path: out, fullPage: true });
      const metrics = await page.evaluate(() => Array.from(document.images, i => ({ naturalWidth: i.naturalWidth, naturalHeight: i.naturalHeight, displayedWidth: i.getBoundingClientRect().width, displayedHeight: i.getBoundingClientRect().height })));
      group.forEach((g, i) => receipt.images.push({ goalId: g.goalId, reviewWidth: width, screenshotPath: path.relative(repo, out), ...metrics[i] }));
    }
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
await fs.writeFile(path.join(own, 'checks/actual-native-and-device-capture.receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log(`Captured 13 native HTML pages and ${receipt.images.length} image/device views.`);
