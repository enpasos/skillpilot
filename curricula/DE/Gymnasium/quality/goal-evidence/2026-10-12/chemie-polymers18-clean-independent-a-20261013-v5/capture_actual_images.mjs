import { createRequire } from 'node:module';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
const require=createRequire(resolve('app/package.json'));
const {chromium}=require('playwright');
const out=resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-polymers18-clean-independent-a-20261013-v5');
const rows=JSON.parse(await readFile(resolve(out,'visual_inputs.current18.json'),'utf8'));
await mkdir(resolve(out,'inspection'),{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1400,height:1600},deviceScaleFactor:1});
await page.route('http://review.local/**',async route=>{const id=new URL(route.request().url()).pathname.slice(1);const r=rows.find(x=>x.goalId===id);if(!r)return route.abort();const body=await readFile(resolve(r.assetPath));await route.fulfill({status:200,contentType:r.assetPath.endsWith('.png')?'image/png':'image/jpeg',body});});
const observed=[];
for(let start=0;start<rows.length;start+=3){
 const subset=rows.slice(start,start+3);
 const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
 const html=`<style>body{margin:0;background:#eee;font:14px Arial}.row{padding:10px;background:white;margin-bottom:8px}.imgs{display:flex;gap:12px;align-items:flex-start}.panel{flex-shrink:0}.image{display:block;height:auto;max-height:448px;width:100%;object-fit:contain}h2{font-size:16px;margin:0 0 6px}small{display:block;margin-bottom:4px}</style>`+subset.map(r=>`<section class=row><h2>${escape(r.title)} · ${r.goalId}</h2><div class=imgs>${[360,316,680].map(w=>`<div class=panel style="width:${w}px"><small>${w}px Bildbox · max-height 448px · object-fit contain</small><img class=image data-id=${r.goalId} data-width=${w} src=http://review.local/${r.goalId}></div>`).join('')}</div></section>`).join('');
 await page.setContent(html);
 await page.locator('img').evaluateAll(async imgs=>await Promise.all(imgs.map(im=>im.decode())));
 const metrics=await page.locator('img').evaluateAll(imgs=>imgs.map(im=>{const b=im.getBoundingClientRect();const s=Math.min(b.width/im.naturalWidth,b.height/im.naturalHeight);return{goalId:im.dataset.id,boxWidth:im.dataset.width,element:{width:b.width,height:b.height},natural:{width:im.naturalWidth,height:im.naturalHeight},painted:{width:im.naturalWidth*s,height:im.naturalHeight*s},loaded:im.complete&&im.naturalWidth>0};}));
 observed.push(...metrics);
 await page.screenshot({path:resolve(out,'inspection',`current18.actual-css-three-widths-sheet-${start/3+1}.png`),fullPage:true});
}
for(const r of rows){const body=await readFile(resolve(r.assetPath));r.assetSha256='sha256:'+createHash('sha256').update(body).digest('hex');}
await writeFile(resolve(out,'inspection/actual-css-image-capture-manifest.json'),JSON.stringify({schemaVersion:1,actualCssSource:'app/src/components/GoalCard.tsx',css:'display:block;height:auto;max-height:448px;width:100%;object-fit:contain',widths:[360,316,680],scope:'read-only browser fixture reproducing actual image CSS; not full application or host acceptance',assets:rows,metrics:observed},null,2)+'\n');
await browser.close();
console.log(JSON.stringify({assets:rows.length,captures:observed.length,sheets:6,allLoaded:observed.every(r=>r.loaded)}));
