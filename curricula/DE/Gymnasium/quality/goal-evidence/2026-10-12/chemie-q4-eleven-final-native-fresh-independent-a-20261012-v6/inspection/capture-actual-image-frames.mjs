// SPDX-License-Identifier: Apache-2.0
// Isolated inspection frames of exact sealed image bytes, not a UI acceptance claim.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, extname, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(resolve('app/node_modules/playwright/index.mjs')).href);
const sourceRoot='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q4-eleven-current220-preserving-root-preparation-20261012-v5';
const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q4-eleven-final-native-fresh-independent-a-20261012-v6/inspection';
const model=JSON.parse(readFileSync(sourceRoot+'/native-D11/bundle/book-model.json','utf8'));
const digest=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const browser=await chromium.launch({headless:true});
const images=[];
try {
 for(const goal of model.pages){
  const name=basename(goal.visualization.url);
  const corrected=['56115f9d-1d32-5454-94b1-00dbc4a7bc6f','dc5173e8-6e63-58d3-a79b-bd74ef3cb98b','0a5a49f2-8e8a-5edb-b6ca-3f8636957a17'].includes(goal.goalId);
  const sourcePath=corrected?sourceRoot+'/assets/'+name:'curricula/DE/Gymnasium/visualizations/chemie/'+goal.goalId+'/'+name;
  const bytes=readFileSync(sourcePath);if(digest(bytes)!==goal.visualization.originalDigest)throw new Error('foreign image bytes '+goal.goalId);
  const mime=extname(name)==='.png'?'image/png':'image/jpeg';
  const item={goalId:goal.goalId,sourcePath,sourceSha256:digest(bytes),frames:[]};
  for(const width of [360,680]){
   const page=await browser.newPage({viewport:{width,height:720},deviceScaleFactor:1});
   await page.setContent('<!doctype html><html><head><style>body{margin:16px;background:white}#image-frame{width:min(100%,597px);aspect-ratio:4/3;background:white}img{display:block;width:100%;height:100%;object-fit:contain}</style></head><body><div id="image-frame"><img src="data:'+mime+';base64,'+bytes.toString('base64')+'"></div></body></html>');
   await page.locator('img').evaluate(img=>img.decode());
   const natural=await page.locator('img').evaluate(img=>({width:img.naturalWidth,height:img.naturalHeight}));
   const frame=await page.locator('#image-frame').boundingBox();
   const folder=out+'/image-frames/'+goal.goalId;mkdirSync(folder,{recursive:true});
   const path=folder+'/viewport-'+width+'.png';
   const screenshot=await page.locator('#image-frame').screenshot({path});
   item.frames.push({viewportWidth:width,path,sha256:digest(screenshot),frameBounds:frame,naturalImage:natural,capturedAtUTC:new Date().toISOString()});
   await page.close();
  }
  images.push(item);
 }
} finally {await browser.close();}
const result={role:'actual independent A isolated image inspection captures; no semantic editing or real-host/UI claim',policy:'4:3 contain; max597px; actual360/680 browser viewport, 16px page margins',browserTool:'Playwright Chromium',images,ownFrameCount:images.reduce((n,x)=>n+x.frames.length,0),visualJudgmentsNotInferredFromCapture:true};
writeFileSync(out+'/own-image-frame-capture.actual.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({goals:images.length,frames:result.ownFrameCount,outputs:out+'/own-image-frame-capture.actual.json'}));
