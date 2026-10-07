import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require(path.resolve('app/node_modules/playwright'));
const base='curricula/DE/Gymnasium/quality/goal-visualization-review';
const author=path.join(base,'chemie-next25-seven-proven-defects-correction-author-20261006-v1');
const own=path.join(base,'chemie-next25-seven-corrections-independent-v-b-20261006-v1');
const input=JSON.parse(fs.readFileSync(path.join(author,'seven-selected-actual-pngs-and-current-goals.raw-independent-review-input.json')));
fs.mkdirSync(path.join(own,'actual-browser-views'),{recursive:true});
const browser=await chromium.launch({headless:true,args:['--allow-file-access-from-files']});
const results=[];
try{
 const context=await browser.newContext({deviceScaleFactor:1,viewport:{width:700,height:520}});
 const page=await context.newPage();
 for(const row of input.rows){
  for(const width of [360,680]){
   const url=pathToFileURL(path.resolve(own,'actual-candidate-preview.independent-b.html'));
   url.searchParams.set('image',pathToFileURL(path.resolve(row.selectedPNG.path)).href);
   url.searchParams.set('width',String(width));
   await page.goto(url.href);
   await page.locator('#actual').evaluate(async img=>{await img.decode();});
   const metrics=await page.locator('#actual').evaluate(img=>{const r=img.getBoundingClientRect();const s=getComputedStyle(img);return {naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,x:r.x,y:r.y,width:r.width,height:r.height,objectFit:s.objectFit,maxHeight:s.maxHeight,cssWidth:s.width,complete:img.complete};});
   if(metrics.width!==width||metrics.objectFit!=='contain'||metrics.maxHeight!=='448px'||!metrics.complete)throw Error('actual CSS binding failed');
   const file=path.join(own,'actual-browser-views',`${row.goalId}.actual-${width}.png`);
   await page.locator('#actual').screenshot({path:file});
   const data=fs.readFileSync(file);
   results.push({goalId:row.goalId,selectedAsset:row.selectedPNG,requestedImageWidth:width,deviceScaleFactor:1,metrics,screenshot:{path:file,sha256:crypto.createHash('sha256').update(data).digest('hex'),bytes:data.length},scope:'actual selected PNG in isolated browser CSS fixture; no full App/GoalCard, native book, device or host acceptance'});
  }
 }
 await context.close();
}finally{await browser.close();}
fs.writeFileSync(path.join(own,'actual-browser-360-680-receipt.independent-b.json'),JSON.stringify({schemaVersion:1,browser:'Playwright Chromium',actualGoalCardCss:'block h-auto max-h-[28rem] w-full object-contain',rows:results,fullAppAcceptance:false,nativeBookRender:false,activeWrites:false},null,2)+'\n');
console.log(JSON.stringify({actualBrowserViews:results.length,widths:[360,680],decodeAndCssChecks:'PASS',scope:'isolated candidate raster preview only'}));
