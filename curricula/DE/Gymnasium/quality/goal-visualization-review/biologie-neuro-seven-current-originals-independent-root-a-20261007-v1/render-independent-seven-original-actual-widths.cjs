// Isolated author display fixture. It renders existing PNGs without modifying them.
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require(path.resolve(__dirname, '../../../../../../app/node_modules/playwright'));
const rows = JSON.parse(fs.readFileSync(path.join(__dirname,'seven-neutral-whole-goal-case-raster-input.actual.json'),'utf8')).rows;
const out = path.join(__dirname,'independent-a-actual-displays');
fs.mkdirSync(out,{recursive:true});
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 760, height: 600 }, deviceScaleFactor: 1 });
  const records = [];
  for (const row of rows) {
    const id = row.goalId;
    const file = path.resolve(row.originalRaster.path);
    for (const width of [360, 680]) {
      // This figure has content width exactly requested width. No padded-container width claim.
      const html = '<!doctype html><html lang="de"><meta charset="utf-8"><title>Isolierte Bilddarstellung</title><style>html,body{margin:0;background:white}figure{margin:16px;overflow:hidden;border-radius:8px;border:1px solid #e2e8f0;background:white;width:' + width + 'px}img{display:block;height:auto;max-height:448px;width:100%;object-fit:contain}</style><figure><img src="' + pathToFileURL(file).href + '" alt="Modellillustration im Autoren-Sichttest"></figure></html>';
      const fixture = path.join(out, id + '.' + width + '.html');
      fs.writeFileSync(fixture, html);
      await page.goto(pathToFileURL(fixture).href);
      await page.locator('img').evaluate(async img => { await img.decode(); });
      const actual = await page.locator('img').evaluate(img => {
        const r = img.getBoundingClientRect(), c = getComputedStyle(img);
        return { imageBox: { x: r.x, y: r.y, width: r.width, height: r.height }, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, css: { display: c.display, height: c.height, maxHeight: c.maxHeight, width: c.width, objectFit: c.objectFit }, devicePixelRatio: window.devicePixelRatio };
      });
      if (actual.imageBox.width !== width || actual.css.maxHeight !== '448px' || actual.css.objectFit !== 'contain' || actual.devicePixelRatio !== 1) throw new Error('Actual image CSS differs from requested fixture');
      const screenshot = path.join(out, id + '.' + width + '.png');
      await page.locator('img').screenshot({ path: screenshot });
      records.push({ goalId: id, requestedActualImageWidth: width, file, fixture, screenshot, ...actual });
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(out, 'actual-360-680-display.receipt.json'), JSON.stringify({ role: 'independent A isolated actual-image display; first scientific V verdict recorded separately; not full application or human acceptance', actualGoalCardCssSource: 'app/src/components/GoalCard.tsx:665-673', imageCssExact: 'display:block;height:auto;max-height:448px;width:100%;object-fit:contain', noCssExceptions: true, noOriginalPngModification: true, records }, null, 2) + '\n');
  process.stdout.write(JSON.stringify({ actualDisplayCount: records.length, widths: [360, 680], out }) + '\n');
})();
