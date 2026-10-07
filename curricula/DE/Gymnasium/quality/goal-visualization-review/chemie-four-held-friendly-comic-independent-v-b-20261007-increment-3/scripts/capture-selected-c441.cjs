// SPDX-License-Identifier: Apache-2.0
// Isolated independent render evidence; no app or curriculum mutation.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {pathToFileURL} = require('url');
const root = '/home/enpasos/projects/skillpilot';
const {chromium} = require(path.join(root, 'app/node_modules/playwright'));
const out = path.resolve(__dirname, '..');
const author = path.join(root, 'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-four-evidenced-friendly-comic-author-20261007-v1');
const targets = [
 {id:'c441d9e8-d9d9-5e55-a189-a37345541321', relative:'candidates/c441d9e8-d9d9-5e55-a189-a37345541321/attempt-4/c441d9e8-d9d9-5e55-a189-a37345541321.png', expected:'b27343bcab57a53ced2c45885012acac55c58beaaf8e7f20d67834aef9c0827e', browserPrefix:'candidates-c441d9e8-d9d9-5e55-a189-a37345541321-attempt-4-c441d9e8-d9d9-5e55-a189-a37345541321'}
];
const digest = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
(async () => {
  for (const dir of ['assets','browser','receipts']) fs.mkdirSync(path.join(out,dir),{recursive:true});
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:760,height:600},deviceScaleFactor:1});
  const records=[];
  try {
    for (const t of targets) {
      const original = path.join(author,t.relative);
      if (digest(original) !== t.expected) throw new Error('selected SHA mismatch '+t.id);
      const ownAsset = path.join(out,'assets',t.id+'.png');
      fs.copyFileSync(original,ownAsset);
      for (const width of [360,680]) {
        const authorFixture = path.join(author,'browser',t.browserPrefix+'.'+width+'.html');
        const actualAuthorFixture = fs.readFileSync(authorFixture,'utf8');
        if (!actualAuthorFixture.includes(pathToFileURL(original).href)) throw new Error('author source mismatch '+t.id);
        if (!actualAuthorFixture.includes('width:'+width+'px;object-fit:contain')) throw new Error('author width mismatch '+t.id);
        const fixture = path.join(out,'browser',t.id+'.'+width+'.html');
        fs.writeFileSync(fixture,`<!doctype html><html lang="de"><meta charset="utf-8"><title>Independent isolated V-B view</title><style>html,body{margin:0;background:white}img{display:block;height:auto;max-height:448px;width:${width}px;object-fit:contain}</style><img src="${pathToFileURL(ownAsset).href}">`);
        await page.goto(pathToFileURL(fixture).href);
        await page.locator('img').evaluate(img => img.decode());
        const geometry = await page.locator('img').evaluate(img => {
          const b=img.getBoundingClientRect(), c=getComputedStyle(img);
          return {src:img.src,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,imageBox:{x:b.x,y:b.y,width:b.width,height:b.height},computed:{width:c.width,height:c.height,maxHeight:c.maxHeight,objectFit:c.objectFit},devicePixelRatio:devicePixelRatio};
        });
        if (geometry.imageBox.width!==width || geometry.naturalWidth!==1672 || geometry.naturalHeight!==941 || geometry.computed.maxHeight!=='448px' || geometry.computed.objectFit!=='contain') throw new Error('geometry mismatch '+t.id);
        const screenshot=path.join(out,'browser',t.id+'.'+width+'.png');
        await page.locator('img').screenshot({path:screenshot});
        const authorScreenshot=path.join(author,'browser',t.browserPrefix+'.'+width+'.png');
        records.push({goalId:t.id,selectedAssetPath:path.relative(root,original),assetSha256:t.expected,requestedActualWidth:width,fixture:path.relative(root,fixture),screenshot:path.relative(root,screenshot),screenshotSha256:digest(screenshot),authorFixturePath:path.relative(root,authorFixture),authorFixtureSha256:digest(authorFixture),authorScreenshotPath:path.relative(root,authorScreenshot),authorScreenshotSha256:digest(authorScreenshot),samePngBytesAsViewedAuthorScreenshot:digest(screenshot)===digest(authorScreenshot),geometry});
      }
    }
    fs.writeFileSync(path.join(out,'receipts','own-isolated-browser.actual.json'),JSON.stringify({documentType:'Independent V-B actual isolated browser source and geometry binding',reviewer:'/root/chem17_fresh_blind_a',noCssExceptions:true,sourceAssetBytesUnchanged:true,appAcceptance:false,humanApproval:false,records},null,2)+'\n');
    console.log(JSON.stringify({selectedCount:targets.length,actualScreenshots:records.length,allExactByteMatches:records.every(r=>r.samePngBytesAsViewedAuthorScreenshot)}));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
