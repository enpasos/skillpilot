// Apache-2.0. Actual browser views, never edits to learning assets.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const root=process.cwd(), own=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next25-current-description-two-unchanged-assets-independent-root-v1');
const req=createRequire(resolve(root,'app/package.json')); const {chromium}=req('playwright');
const browser=await chromium.launch({headless:true}); const rows=[];
try { for (const id of ['0acc8cd2-be6d-567e-a023-1d9e90475510','3bc48951-025c-5144-99b1-924db611a5f9']) {
 const path='app/public/assets/goal-visualizations/chemie/'+id+'/'+id+'.jpg', bytes=readFileSync(resolve(root,path));
 for(const width of [360,680]) {const page=await browser.newPage({viewport:{width:width+16,height:450},deviceScaleFactor:1});
  await page.setContent('<style>body{margin:0;background:white}img{display:block;width:'+width+'px;height:auto}</style><img src="data:image/jpeg;base64,'+bytes.toString('base64')+'">');
  await page.locator('img').evaluate(img=>img.decode());const dimensions=await page.locator('img').evaluate(img=>({naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,width:img.getBoundingClientRect().width,height:img.getBoundingClientRect().height}));
  const file=id+'.actual-image-width-'+width+'.png'; await page.locator('img').screenshot({path:resolve(own,file)});
  rows.push({goalId:id,originalPath:path,assetSha256:'sha256:'+createHash('sha256').update(bytes).digest('hex'),dimensions,file});await page.close();
 }
}}finally{await browser.close();}
writeFileSync(resolve(own,'actual-two-assets-four-native-browser-widths.receipt.json'),JSON.stringify({rows,sourceImagesModified:false,scienceSightPending:true,activeWrites:false},null,2)+'\n');
console.log('Actual360/680 image widths rendered for two unchanged original2752x1536 JPGs.');
