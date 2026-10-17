import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from '/home/enpasos/projects/skillpilot/app/node_modules/playwright/index.mjs';
const directory = new URL('./', import.meta.url).pathname;
const capsule = '/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule';
const asset = capsule + '/curricula/DE/Gymnasium/visualizations/chemie/9b56d01e-c2d7-51d8-b78e-237592c1ed20/9b56d01e-c2d7-51d8-b78e-237592c1ed20.jpg';
const bytes = await readFile(asset);
const digest = 'sha256:' + createHash('sha256').update(bytes).digest('hex');
if (digest !== 'sha256:61cec509a1bb973b24037ac24ba88bb10efaec73a0d5cec3f208909b4f85be06') throw Error('unexpected image bytes');
await mkdir(directory + '/browser-temporary', { recursive: true });
const browser = await chromium.launch({ headless: true });
const measurements = [];
try {
  for (const width of [360, 680]) {
    const page = await browser.newPage({viewport: {width, height: 700}, deviceScaleFactor: 1});
    await page.setContent(`<html><head><style>html,body{margin:0;padding:0;background:white}img{display:block;width:${width}px;max-height:448px;object-fit:contain}</style></head><body><img alt="EPA angle visualization under targeted current-goal review" src="data:image/jpeg;base64,${bytes.toString('base64')}"></body></html>`);
    await page.locator('img').evaluate(image => image.decode());
    const box = await page.locator('img').boundingBox();
    const natural = await page.locator('img').evaluate(image => ({width:image.naturalWidth,height:image.naturalHeight}));
    await page.locator('img').screenshot({path: directory + `/actual-render-${width}.png`});
    measurements.push({width, box, natural, screenshot:`actual-render-${width}.png`});
    await page.close();
  }
} finally { await browser.close(); }
await writeFile(directory + '/MEASUREMENT.actual-browser-render-sizes.json', JSON.stringify({asset, digest, measurements, sourceAssetEdited:false, scientificReviewPending:true}, null, 2) + '\n');
console.log(JSON.stringify({digest,measurements}));
