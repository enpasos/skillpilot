import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from '/home/enpasos/projects/skillpilot/app/node_modules/playwright/index.mjs';

const root = '/mnt/e/skillpilot-chemie-L7-20261017/chemie-four-image-fresh-independent-v-v1';
const selectorPath = '/mnt/e/skillpilot-chemie-L7-20261017/chemie-four-real-image-defects-author-root-v1/SELECTOR.four-selected-image-candidates-for-independent-review.json';
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const selectorBytes = await fs.readFile(selectorPath);
if (sha(selectorBytes) !== 'e17564106f3146f47b2ac00d37efd9d74c4e1fa5bae89885bbe7c2881673f09c') throw Error('Selector pin mismatch');
const selector = JSON.parse(selectorBytes);
await fs.mkdir(path.join(root, 'screenshots'), {recursive:true});
const executablePath = '/home/enpasos/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome';
const browser = await chromium.launch({executablePath, headless:true, args:['--no-sandbox']});
const manifest = {
  role: 'Real Chromium screenshot manifest; scientific observations are separately sealed',
  createdAtUTC: new Date().toISOString(), browser: await browser.version(), executablePath,
  selector: {path:selectorPath,sha256:sha(selectorBytes)},
  rendering: {deviceScaleFactor:1, requestedWidths:[360,680], maxHeight:448, objectFit:'contain', css:'img{display:block;width:100%;height:auto;max-height:448px;object-fit:contain}', clipping:'screenshot of actual figure element; no image crop or synthetic rescale'},
  images: []
};
for (const candidate of selector.candidates) {
  for (const role of ['original','candidate']) {
    const inputPath = role === 'original' ? candidate.originalPath : candidate.path;
    const bytes = await fs.readFile(inputPath);
    const inputSha256 = sha(bytes);
    if (role === 'candidate' && inputSha256 !== candidate.sha256) throw Error('Candidate pin mismatch');
    for (const width of [360,680]) {
      const context = await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1});
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      const mime = role === 'original' ? 'image/jpeg' : 'image/png';
      await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}html,body{padding:0;margin:0;background:white}figure{padding:0;margin:0;width:${width}px;overflow:hidden;background:white}img{display:block;width:100%;height:auto;max-height:448px;object-fit:contain}</style></head><body><figure><img alt="Independent review source" src="data:${mime};base64,${bytes.toString('base64')}"></figure></body></html>`);
      await page.locator('img').evaluate(async image => {await image.decode()});
      const geometry = await page.locator('img').evaluate(image => {
        const rect = image.getBoundingClientRect();
        return {naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,boxWidth:rect.width,boxHeight:rect.height,complete:image.complete,computedObjectFit:getComputedStyle(image).objectFit,computedMaxHeight:getComputedStyle(image).maxHeight};
      });
      const filename = `${candidate.goalId}.${role}.width-${width}.png`;
      const screenshotPath = path.join(root,'screenshots',filename);
      await page.locator('figure').screenshot({path:screenshotPath});
      const screenshot = await fs.readFile(screenshotPath);
      manifest.images.push({goalId:candidate.goalId,role,inputPath,inputSha256,width,geometry,screenshot:{path:screenshotPath,sha256:sha(screenshot),bytes:screenshot.length},pageErrors:errors});
      await context.close();
    }
  }
}
await browser.close();
await fs.writeFile(path.join(root,'TECHNICAL.real-browser-preview-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({browser:manifest.browser,screenshots:manifest.images.length,widths:manifest.rendering.requestedWidths,maxHeight:manifest.rendering.maxHeight,allDecoded:manifest.images.every(x=>x.geometry.complete),pageErrors:manifest.images.flatMap(x=>x.pageErrors)},null,2));
