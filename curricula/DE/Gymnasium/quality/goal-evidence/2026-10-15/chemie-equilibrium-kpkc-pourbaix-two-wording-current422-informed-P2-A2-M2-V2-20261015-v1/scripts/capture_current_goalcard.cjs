// SPDX-License-Identifier: Apache-2.0
const fs=require('fs'),path=require('path'),crypto=require('crypto');
let repo=__dirname;while(!fs.existsSync(path.join(repo,'AGENTS.md')))repo=path.dirname(repo);
const {chromium}=require(path.join(repo,'app/node_modules/playwright'));
const own=path.dirname(__dirname),out=path.join(own,'browser');
if(fs.existsSync(path.join(own,'science/FIRST.actual-informed-V2.seal.json')))throw Error('FIRST already sealed');
const inputPath=path.join(own,'inputs/two-whole-final-contexts-four-profiles-eight-cases.actual.json');
const input=JSON.parse(fs.readFileSync(inputPath));
const sha=b=>'sha256:'+crypto.createHash('sha256').update(b).digest('hex');
const ref=p=>({path:path.relative(repo,p),sha256:sha(fs.readFileSync(p)),bytes:fs.statSync(p).size});
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const atomic=(p,s)=>{fs.writeFileSync(p+'.partial',s);fs.renameSync(p+'.partial',p)};
(async()=>{
 const browser=await chromium.launch({headless:true}),records=[];
 for(const row of input.wholeContexts){
  const g=row.goal,asset=path.join(repo,row.actualCurrentNativeImage.path),link=g.resourceLinks.find(l=>l.type==='goal-visualization');
  if(sha(fs.readFileSync(asset))!==row.actualCurrentNativeImage.sha256)throw Error('asset bytes changed');
  for(const width of [360,680]){
   const page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('http://own-current-image.local/asset',r=>r.fulfill({status:200,contentType:asset.endsWith('.jpg')?'image/jpeg':'image/png',body:fs.readFileSync(asset)}));
   const html=`<!doctype html><html lang="de"><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:white}.card{width:100%;border:1px solid #cbd5e1;border-radius:24px;padding:20px}h2{font-size:24px;line-height:1.25;margin:0}figure{margin:16px 0;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}img{display:block;height:auto;max-height:28rem;width:100%;object-fit:contain}p{font-size:14px;line-height:1.5}</style><main class="card"><h2>${esc(g.title)}</h2><figure><img src="http://own-current-image.local/asset" alt="${esc(link.altText)}"></figure><p>${esc(g.description)}</p></main></html>`;
   const base=`${g.id}.${width}.current-GoalCard`;
   atomic(path.join(out,base+'.html'),html+'\n');
   await page.setContent(html);await page.locator('img').evaluate(i=>i.decode());
   const metrics=await page.locator('img').evaluate(i=>{const b=i.getBoundingClientRect(),s=getComputedStyle(i);return{naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,imageWidth:b.width,imageHeight:b.height,complete:i.complete,objectFit:s.objectFit,maxHeight:s.maxHeight}});
   await page.locator('main').screenshot({path:path.join(out,base+'.png'),animations:'disabled'});
   records.push({goalId:g.id,viewportWidth:width,metrics,pageErrors:errors,fixture:ref(path.join(out,base+'.html')),screenshot:ref(path.join(out,base+'.png'))});
   await page.close();
  }
 }
 const receipt={schemaVersion:1,role:'Own actual four current GoalCard browser views; no wholebook/native renderer',
  observedAtUTC:new Date().toISOString(),browserVersion:browser.version(),sourceWholeInput:ref(inputPath),
  deviceScaleFactor:1,zoom:1,goalCardSource:ref(path.join(repo,'app/src/components/GoalCard.tsx')),
  goalCardContainer:'border rounded-3xl p-5',goalCardImage:'block h-auto max-h-[28rem] w-full object-contain',
  records,sourceImageCopies:0,normalVBindingsAtCapture:0,newHumanApproval:false};
 atomic(path.join(out,'RECEIPT.actual-own-current-316-636-Chromium.json'),JSON.stringify(receipt,null,2)+'\n');
 await browser.close();console.log(JSON.stringify({browser:receipt.browserVersion,views:records.length,widths:records.map(r=>r.metrics.imageWidth)},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
