import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from '../app/node_modules/playwright/index.mjs';
const pkg = path.resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-new-visuals-author-v1');
const browser = await chromium.launch({headless:true});
const rows=[];
for(const id of fs.readdirSync(path.join(pkg,'images')).sort()) {
 for(const filename of fs.readdirSync(path.join(pkg,'images',id)).filter(x=>x.endsWith('.png')).sort()) {
  const input=path.join(pkg,'images',id,filename);
  const bytes=fs.readFileSync(input);
  for(const width of [360,680]) {
   const page=await browser.newPage({viewport:{width,height:500},deviceScaleFactor:1});
   await page.setContent(`<html><head><style>html,body{margin:0;padding:0;background:white}img{display:block;width:100%;max-height:28rem;object-fit:contain}</style></head><body><img alt="candidate" src="data:image/png;base64,${bytes.toString('base64')}"></body></html>`);
   const img=page.locator('img');await img.evaluate(async x=>{await x.decode()});
   const dimensions=await img.evaluate(x=>({naturalWidth:x.naturalWidth,naturalHeight:x.naturalHeight,actualWidth:x.getBoundingClientRect().width,actualHeight:x.getBoundingClientRect().height,objectFit:getComputedStyle(x).objectFit,maxHeight:getComputedStyle(x).maxHeight}));
   const out=path.join(pkg,'actual-display',id,`${filename.slice(0,-4)}-${width}px.png`);fs.mkdirSync(path.dirname(out),{recursive:true});
   await img.screenshot({path:out});
   rows.push({goalId:id,attempt:filename,input:path.relative(process.cwd(),input),inputSha256:crypto.createHash('sha256').update(bytes).digest('hex'),displayWidth:width,dimensions,screenshot:path.relative(process.cwd(),out),screenshotSha256:crypto.createHash('sha256').update(fs.readFileSync(out)).digest('hex'),reviewDecision:'not_inferred_from_render_success'});
   await page.close();
  }
 }
}
await browser.close();
fs.writeFileSync(path.join(pkg,'actual-360-and-680-browser-rendering.json'),JSON.stringify({schemaVersion:1,createdAtUTC:new Date().toISOString(),renderer:'actual Chromium browser; no cropping; object-fit contain; 28rem height cap; DPR1',rows,machineApproval:false,humanApproval:false},null,2)+'\n');
console.log(JSON.stringify({actualRasters:new Set(rows.map(x=>x.input)).size,actualScreenshots:rows.length,allUncropped:rows.every(x=>Math.abs(x.dimensions.actualWidth/x.dimensions.actualHeight-x.dimensions.naturalWidth/x.dimensions.naturalHeight)<.001)}));
