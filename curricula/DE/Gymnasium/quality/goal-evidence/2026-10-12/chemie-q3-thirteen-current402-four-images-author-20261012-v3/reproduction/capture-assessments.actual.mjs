import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const own = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const repo = path.resolve(own, ...Array(7).fill('..'));
const { chromium } = await import(pathToFileURL(path.join(repo, 'app/node_modules/playwright/index.mjs')));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 800, height: 1100 } });
const receipt = { role: 'author_actual_assessment_pixels_not_independent_approval', humanApproval: false, articles: [] };
try {
  await page.goto(pathToFileURL(path.join(own, 'native/assessment-graphs.bilingual.html')).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => Promise.all(Array.from(document.images, i => i.decode())));
  const articles = page.locator('article');
  for (let i = 0; i < await articles.count(); i++) {
    const article = articles.nth(i);
    const out = path.join(own, `native/actual-views/assessment-html-${i + 1}.png`);
    await article.screenshot({ path: out });
    receipt.articles.push({ order: i + 1, path: path.relative(repo, out), boundingBox: await article.boundingBox(),
      actualLayout: await article.evaluate(a => ({ clientHeight: a.clientHeight, scrollHeight: a.scrollHeight,
        imageNaturalWidth: a.querySelector('img').naturalWidth, imageNaturalHeight: a.querySelector('img').naturalHeight,
        bottomContent: a.querySelector('footer').getBoundingClientRect().bottom - a.getBoundingClientRect().top })) });
  }
  await page.pdf({ path: path.join(own, 'native/assessment-graphs.bilingual.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
} finally { await browser.close(); }
await fs.writeFile(path.join(own, 'checks/actual-assessment-capture.receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log(`Captured ${receipt.articles.length} actual bilingual assessment sheets and PDF.`);
