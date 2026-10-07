// Isolated author display fixture. It renders existing PNGs without modifying them.
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require(path.resolve(__dirname, '../../../../../../app/node_modules/playwright'));
const ids = ['ce19b80f-d392-5851-ac92-750c85adfb3e', '1b38144f-cdbd-5dfe-a792-94669bdc31d8', 'e3fb5f1d-e277-5e28-8883-45821b972607', '04d770b3-ba5e-5438-88ca-110cbaeba62c', 'ff1bf88f-2413-5668-a071-ce9fc499cba3', 'e1117126-4e78-5a37-a645-2debc167219b', 'f6280154-d57c-599c-94bf-73313005a6df'];
const revision = process.argv.includes('--after-ap-revision') ? 'after-ap-revision' : 'initial-display';
const out = path.join(__dirname, 'first-seven/author-displays', revision);
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 760, height: 600 }, deviceScaleFactor: 1 });
  const records = [];
  for (const id of ids) {
    const suffix = id.startsWith('e3fb') ? '-revision-02.actual' : id.startsWith('04d7') && revision === 'after-ap-revision' ? '-revision-02.actual' : '.actual';
    const file = path.join(__dirname, 'first-seven/generated-originals', id, 'original-generated' + suffix + '.png');
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
  fs.writeFileSync(path.join(out, 'actual-360-680-display.receipt.json'), JSON.stringify({ role: 'author isolated actual-image display; not independent V or full application acceptance', actualGoalCardCssSource: 'app/src/components/GoalCard.tsx:665-673', imageCssExact: 'display:block;height:auto;max-height:448px;width:100%;object-fit:contain', noCssExceptions: true, noOriginalPngModification: true, records }, null, 2) + '\n');
  process.stdout.write(JSON.stringify({ actualDisplayCount: records.length, widths: [360, 680], out }) + '\n');
})();
