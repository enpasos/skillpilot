import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire('/home/enpasos/projects/skillpilot/app/package.json');
const { chromium } = require('playwright');
const repo='/home/enpasos/projects/skillpilot';
const own=path.join(repo,'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-neuro21-first-seven-independent-v-b-20261007-v1');
const input=JSON.parse(fs.readFileSync(path.join(own,'first-seven.actual-blind-selected-inputs.independent-b.json'),'utf8'));
const hashFile=p=>{const b=fs.readFileSync(p);return {path:p.startsWith(repo+'/')?p.slice(repo.length+1):p,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const html='<!doctype html><meta charset="UTF-8"><title>Independent Bio7 isolated image QA</title><style>html{font-size:16px}body{margin:0;background:white}.isolated{margin:0 0 24px}.goal-image{display:block;height:auto;max-height:28rem;width:100%;object-fit:contain}</style>'+input.records.map(x=>`<div class="isolated" data-goal="${x.goalId}" style="width:680px"><img class="goal-image" alt="${esc(x.boundedImageAltTextDe)}" src="file://${esc(path.join(repo,x.selectedUnchangedOriginalAsset.path))}"></div>`).join('\n');
const htmlPath=path.join(own,'browser/independent-isolated-goalcard-image-css.actual.html');fs.writeFileSync(htmlPath,html);
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:740,height:900},deviceScaleFactor:1});
await page.goto('file://'+htmlPath);await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
const checks=[];
for(const width of [360,680]){
 await page.locator('.isolated').evaluateAll((els,w)=>els.forEach(e=>e.style.width=w+'px'),width);
 for(const r of input.records){
  const img=page.locator(`[data-goal="${r.goalId}"] img`);
  const metrics=await img.evaluate(i=>{const b=i.getBoundingClientRect(),s=getComputedStyle(i),p=i.parentElement.getBoundingClientRect();return {viewportWidth:innerWidth,imageElementBoundingWidth:b.width,imageElementBoundingHeight:b.height,parentBoundingWidth:p.width,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,devicePixelRatio,complete:i.complete,css:{display:s.display,height:s.height,maxHeight:s.maxHeight,width:s.width,objectFit:s.objectFit},visibleBitmapWidth:b.width,visibleBitmapHeight:b.height};});
  if(metrics.imageElementBoundingWidth!==width||metrics.css.objectFit!=='contain'||metrics.css.maxHeight!=='448px')throw new Error('Actual CSS/image width mismatch '+r.goalId);
  const png=path.join(own,'browser',`${r.goalId}.actual-image-width-${width}.png`);await img.screenshot({path:png});
  checks.push({goalId:r.goalId,requestedActualImageWidth:width,metrics,screenshot:hashFile(png),originalAsset:r.selectedUnchangedOriginalAsset,scientificallySeenByReviewer:false});
 }
}
const receipt={documentType:'Independent B actual Chromium isolated GoalCard-image-CSS render; not complete App/native-book validation',createdAtUTC:new Date().toISOString(),browserVersion:browser.version(),viewport:{width:740,height:900},viewportWidthIsNotReportedAsImageWidth:true,goalCardPath:'app/src/components/GoalCard.tsx',goalCardImageClass:'block h-auto max-h-[28rem] w-full object-contain',cssSourceBinding:hashFile(path.join(repo,'app/src/components/GoalCard.tsx')),html:hashFile(htmlPath),actualImageWidthCases:[360,680],checks,activeWrites:false,wholeAppOrBookPageReview:false};
const target=path.join(own,'browser/actual-independent-360-680-image-width-render.receipt.json');fs.writeFileSync(target+'.tmp',JSON.stringify(receipt,null,2)+'\n');fs.renameSync(target+'.tmp',target);
fs.copyFileSync('/tmp/skillpilot-bio7-independent-vb-browser-20261007.mjs',path.join(own,'browser/render-independent-image-widths.actual.mjs'));
await browser.close();
console.log(JSON.stringify({status:'PASS_ACTUAL_RENDER_GEOMETRY_ONLY',actualScreenshots:checks.length,actualImageWidths:[...new Set(checks.map(x=>x.metrics.imageElementBoundingWidth))],viewportWidth:740,browserVersion:receipt.browserVersion,receipt:target}));
