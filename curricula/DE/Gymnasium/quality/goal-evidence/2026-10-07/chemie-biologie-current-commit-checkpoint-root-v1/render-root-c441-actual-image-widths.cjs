const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(path.resolve('app/node_modules/playwright'));

(async () => {
  const directory = path.join(__dirname, 'c441-independent-root-a-displays');
  fs.mkdirSync(directory, { recursive: true });
  const original = path.resolve('curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-c441-gasfoermige-caption-targeted-author-20261007-v1/c441-gasfoermige-ionen.corrected-original.png');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 760, height: 550 }, deviceScaleFactor: 1 });
  const receipts = [];
  for (const width of [360, 680]) {
    const html = path.join(directory, `c441.${width}.html`);
    fs.writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:white}.image-box{width:${width}px}img{display:block;height:auto;max-height:448px;width:100%;object-fit:contain}</style><div class="image-box"><img src="${pathToFileURL(original).href}" alt="Energetische Bildung von Natriumchlorid"></div>`);
    await page.goto(pathToFileURL(html).href);
    await page.locator('img').evaluate(image => image.decode());
    const actual = await page.locator('img').evaluate(image => ({ naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, displayedWidth: image.getBoundingClientRect().width, displayedHeight: image.getBoundingClientRect().height, devicePixelRatio: window.devicePixelRatio }));
    if (actual.displayedWidth !== width || actual.devicePixelRatio !== 1) throw new Error('Actual image width does not match the requested native display.');
    const screenshot = path.join(directory, `c441.${width}.png`);
    await page.locator('.image-box').screenshot({ path: screenshot });
    receipts.push({ imageWidth: width, actual, html: path.relative(process.cwd(), html), screenshot: path.relative(process.cwd(), screenshot) });
  }
  await browser.close();
  fs.writeFileSync(path.join(directory, 'actual-width-render.receipt.json'), JSON.stringify({ documentType: 'actual native image CSS width render, not a visual judgment', renderedAtUTC: new Date().toISOString(), originalRaster: path.relative(process.cwd(), original), receipts }, null, 2) + '\n');
  console.log(JSON.stringify(receipts));
})().catch(error => { console.error(error); process.exit(1); });
