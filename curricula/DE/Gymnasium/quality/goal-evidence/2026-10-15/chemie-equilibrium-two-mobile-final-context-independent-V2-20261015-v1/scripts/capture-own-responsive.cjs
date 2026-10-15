// SPDX-License-Identifier: Apache-2.0
const fs=require('fs'),path=require('path'),crypto=require('crypto');
let repo=__dirname;while(!fs.existsSync(path.join(repo,'AGENTS.md')))repo=path.dirname(repo);
const {chromium}=require(path.join(repo,'app/node_modules/playwright'));
const own=path.dirname(__dirname),relative=path.relative(repo,own),out=path.join(own,'browser');
if(fs.existsSync(path.join(own,'FIRST.actual-two-mobile-PNG-V-decisions.seal.json')))throw Error('FIRST sealed; preserve original views.');
const inputPath=path.join(own,'inputs/two-whole-final-competencies-prereqs-four-cases-and-PNGs.exact.json');
const input=JSON.parse(fs.readFileSync(inputPath));
const hash=b=>'sha256:'+crypto.createHash('sha256').update(b).digest('hex');
const ref=p=>({path:path.relative(repo,p),sha256:hash(fs.readFileSync(p)),bytes:fs.statSync(p).size});
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const atomic=(p,text)=>{const tmp=p+'.partial';fs.writeFileSync(tmp,text);fs.renameSync(tmp,p);};
(async()=>{
 const browser=await chromium.launch({headless:true});const records=[];
 for(const row of input.wholeContexts){
  const goal=row.goal,asset=path.join(repo,row.actualCurrentNativeImage.path),link=goal.resourceLinks.find(r=>r.type==='goal-visualization');
  if(hash(fs.readFileSync(asset))!==row.actualCurrentNativeImage.sha256)throw Error('Input changed: '+asset);
  for(const width of [360,680])for(const layout of ['exact-image-width','GoalCard-p5-viewport']){
   const exact=layout==='exact-image-width';const page=await browser.newPage({viewport:{width:exact?width+2:width,height:900},deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('http://independent-image-review.local/asset',r=>r.fulfill({status:200,contentType:'image/png',body:fs.readFileSync(asset)}));
   const html=`<!doctype html><html lang="de"><meta charset="utf-8"><style>*{box-sizing:border-box}html{font-size:16px;background:white}body{margin:0;font-family:Arial,sans-serif}.card{width:100%;border:1px solid #cbd5e1;border-radius:24px;padding:20px;background:#fff}h2{font-size:24px;line-height:1.25;margin:0;font-weight:600}figure{margin:16px 0;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;background:#fff}img{display:block;height:auto;max-height:28rem;width:100%;object-fit:contain}.exact{width:${width+2}px}.exact figure{margin:0}p{font-size:14px;line-height:1.5}</style><body><main class="${exact?'exact':'card'}">${exact?'':`<h2>${esc(goal.title)}</h2>`}<figure><img src="http://independent-image-review.local/asset" alt="${esc(link.altText)}"></figure>${exact?'':`<p>${esc(goal.description)}</p>`}</main></body></html>`;
   const base=`${goal.id}.${width}.${layout}`;
   atomic(path.join(out,base+'.html'),html+'\n');await page.setContent(html);await page.locator('img').evaluate(i=>i.decode());
   const metrics=await page.locator('img').evaluate(i=>{const b=i.getBoundingClientRect(),s=getComputedStyle(i);return{naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,elementWidth:b.width,elementHeight:b.height,objectFit:s.objectFit,maxHeight:s.maxHeight,complete:i.complete};});
   await page.locator('main').screenshot({path:path.join(out,base+'.png'),animations:'disabled'});
   records.push({goalId:goal.id,requestedCSSWidth:width,layout,viewport:page.viewportSize(),metrics,screenshot:ref(path.join(out,base+'.png')),fixture:ref(path.join(out,base+'.html')),pageErrors:errors});await page.close();
  }
 }
 const receipt={schemaVersion:1,role:'Own actual Chromium pixel/response observations, bounded current DE/ALT GoalCard CSS context; not full app or human acceptance',
  observedAtUTC:new Date().toISOString(),browserVersion:browser.version(),sourceWholeInput:ref(inputPath),deviceScaleFactor:1,zoom:1,
  goalCardSource:ref(path.join(repo,'app/src/components/GoalCard.tsx')),goalCardContainer:'border rounded-3xl p-5',goalCardImage:'block h-auto max-h-[28rem] w-full object-contain',
  records,normalVBindings:0,finalCombinedContextBinding:'final8152/6959 native2 whole-goal contexts',newHumanApproval:false};
 atomic(path.join(out,'RECEIPT.actual-own-Chromium-responsive-rendering.json'),JSON.stringify(receipt,null,2)+'\n');
 await browser.close();console.log(JSON.stringify({browserVersion:receipt.browserVersion,views:records.length,metrics:records.map(r=>({goalId:r.goalId,width:r.requestedCSSWidth,layout:r.layout,...r.metrics}))},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
