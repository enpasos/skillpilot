const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('/home/enpasos/projects/skillpilot/app/node_modules/playwright');

(async () => {
  const out = __dirname;
  const root = '/home/enpasos/projects/skillpilot';
  const input = path.join(root, 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-neuro-ce19-axon-leader-targeted-correction-author-20261007-v2/original-generated-targeted-axon-leader-attempt-02.png');
  const browser = await chromium.launch({ headless: true });
  const records = [];
  try {
    for (const width of [360, 680]) {
      const fixture = path.join(out, 'displays', `ce19.${width}.html`);
      const screenshot = path.join(out, 'displays', `ce19.${width}.png`);
      const html = `<!doctype html><html lang="de"><meta charset="utf-8"><title>Independent V-A image display</title><style>html{font-size:16px}body{margin:0;background:white}.frame{width:${width}px;padding:16px}img{display:block;width:100%;height:auto;max-height:28rem;object-fit:contain}</style><div class="frame"><img src="${pathToFileURL(input).href}" alt="Modellhafte Nervenzelle"></div></html>`;
      fs.writeFileSync(fixture, html);
      const page = await browser.newPage({viewport:{width:width+32,height:500},deviceScaleFactor:1});
      await page.goto(pathToFileURL(fixture).href);
      await page.locator('img').evaluate(async img => { await img.decode(); });
      const evidence = await page.locator('img').evaluate(img => {
        const box = img.getBoundingClientRect();
        const css = getComputedStyle(img);
        return {imageBox:{x:box.x,y:box.y,width:box.width,height:box.height},naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,devicePixelRatio:devicePixelRatio,css:{width:css.width,height:css.height,maxHeight:css.maxHeight,objectFit:css.objectFit,display:css.display},loaded:img.complete&&img.naturalWidth>0};
      });
      if (evidence.imageBox.width !== width || !evidence.loaded) throw new Error('Actual image width or image load failed');
      await page.locator('img').screenshot({path:screenshot});
      records.push({requestedActualImageWidth:width,input:path.relative(root,input),fixture:path.relative(root,fixture),screenshot:path.relative(root,screenshot),...evidence});
      await page.close();
    }
    fs.writeFileSync(path.join(out,'actual-360-680-browser-displays.independent-v-a.receipt.json'),JSON.stringify({role:'independent V-A isolated browser image display, no app/host acceptance',recordedAt:new Date().toISOString(),browser:'Playwright Chromium headless',browserVersion:browser.version(),noInputRasterModification:true,objectFit:'contain',heightCapRem:28,records},null,2)+'\n');
    console.log(JSON.stringify(records,null,2));
  } finally {
    await browser.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
