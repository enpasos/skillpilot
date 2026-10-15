// SPDX-License-Identifier: Apache-2.0
const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
let repo=__dirname;while(!fs.existsSync(path.join(repo,'AGENTS.md'))){const parent=path.dirname(repo);if(parent===repo)throw new Error('repository marker not found');repo=parent;}
const {chromium}=require(path.join(repo,'app/node_modules/playwright'));
const evidence = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-kinetic-mechanism-one-current-context-independent-V-20261015-v1';
const out = path.join(repo, evidence, 'browser');
if(fs.existsSync(path.join(repo,evidence,'FIRST.pixel-and-responsive.informed-independent.seal.json')))throw new Error('Review evidence is sealed; use a separate private reproduction copy.');
fs.mkdirSync(out, {recursive:true});
const gid = '13838147-c26d-54ca-b9be-5f2f0b8e9de5';
const sources = {
 original: `curricula/DE/Gymnasium/visualizations/chemie/${gid}/${gid}.jpg`,
 candidate: `curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-kinetic-mechanism-one-actual-GBS-image-correction-author-root-20261015-v1/candidate/visualizations/chemie/${gid}/${gid}.png`
};
const hash = b=>'sha256:'+crypto.createHash('sha256').update(b).digest('hex');
const bindings={};for(const [name,p] of Object.entries(sources)){const b=fs.readFileSync(path.join(repo,p));bindings[name]={path:p,sha256:hash(b),bytes:b.length};}
(async()=>{
 const browser=await chromium.launch({headless:true});
 const records=[];
 for(const width of [360,680]){
  for(const [source,rel] of Object.entries(sources)){
   for(const layout of ['exact-image-width','GoalCard-p5-viewport']){
    const exact=layout==='exact-image-width';
    const page=await browser.newPage({viewport:{width:exact?width+2:width,height:800},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('http://image-review.local/asset',route=>route.fulfill({status:200,contentType:source==='original'?'image/jpeg':'image/png',body:fs.readFileSync(path.join(repo,rel))}));
    const html=`<!doctype html><html lang="de"><meta charset="utf-8"><style>
      *{box-sizing:border-box} html{font-size:16px;background:white} body{margin:0;font-family:Arial,sans-serif}
      .card{width:100%;border:1px solid #cbd5e1;border-radius:24px;padding:20px;background:#fff}
      h2{font-size:24px;line-height:1.25;margin:0;font-weight:600}
      figure{margin:16px 0;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;background:#fff}
      img{display:block;height:auto;max-height:28rem;width:100%;object-fit:contain}
      .exact{width:${width+2}px} .exact figure{margin:0}
      </style><body><main class="${exact?'exact':'card'}">${exact?'':'<h2>Kinetische Mechanismen deuten</h2>'}<figure><img src="http://image-review.local/asset" alt="Prüfbild, noch kein finaler ALT-Text"></figure></main></body></html>`;
    const fixtureName=`${source}.${width}.${layout}.html`;fs.writeFileSync(path.join(out,fixtureName),html+'\n');
    await page.setContent(html);await page.locator('img').evaluate(img=>img.decode());
    const metrics=await page.locator('img').evaluate(img=>{
      const b=img.getBoundingClientRect(),s=getComputedStyle(img);
      return {naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,elementWidth:b.width,elementHeight:b.height,objectFit:s.objectFit,maxHeight:s.maxHeight,height:s.height,complete:img.complete};
    });
    const screenshotName=`${source}.${width}.${layout}.png`;
    await page.locator('main').screenshot({path:path.join(out,screenshotName),animations:'disabled'});
    const raw=fs.readFileSync(path.join(out,screenshotName));
    records.push({source,requestedCSSWidth:width,layout,viewport:page.viewportSize(),metrics,screenshot:{path:`${evidence}/browser/${screenshotName}`,bytes:raw.length,sha256:hash(raw)},fixture:{path:`${evidence}/browser/${fixtureName}`,sha256:hash(Buffer.from(html+'\n'))},pageErrors:errors});
    await page.close();
   }
  }
 }
 const result={schemaVersion:1,role:'Actual Chromium responsive raster rendering; faithful bounded GoalCard image CSS fragment, not full application acceptance',observedAtUTC:new Date().toISOString(),browserVersion:browser.version(),deviceScaleFactor:1,zoom:1,sourceBindings:bindings,goalCardSourcePath:'app/src/components/GoalCard.tsx',goalCardImageClass:'block h-auto max-h-[28rem] w-full object-contain',goalCardContainerClass:'border rounded-3xl p-5',records,newVBindings:0,humanApproval:false,humanTrial:false};
 fs.writeFileSync(path.join(out,'RECEIPT.actual-Chromium-responsive-rendering.json'),JSON.stringify(result,null,2)+'\n');
 await browser.close();console.log(JSON.stringify({browserVersion:result.browserVersion,records:records.map(r=>({source:r.source,width:r.requestedCSSWidth,layout:r.layout,metrics:r.metrics,screenshot:r.screenshot.path}))},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
