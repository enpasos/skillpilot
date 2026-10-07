// Apache-2.0. Four selected raster corrections only; no app/book or active writes.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import { createRequire } from 'node:module';
const repo=process.cwd();const require=createRequire(path.join(repo,'app/package.json'));
const {chromium}=require('playwright');
const own=path.join(repo,'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-next25-four-corrections-independent-v-a-20261006-v2');
const input=JSON.parse(fs.readFileSync(path.join(own,'targeted-v-a-v2.entry.receipt.json')));
const rows=new Map(input.rows.map(r=>[r.goalId,r]));
const hash=x=>'sha256:'+crypto.createHash('sha256').update(x).digest('hex');
const binding=p=>({path:path.relative(repo,p),sha256:hash(fs.readFileSync(p)),bytes:fs.statSync(p).size});
const settings=[{key:'image360',viewportWidth:362,expectedImageWidth:360,p5:false},{key:'image680',viewportWidth:682,expectedImageWidth:680,p5:false},{key:'viewport360-card-p5-image316',viewportWidth:360,expectedImageWidth:316,p5:true}];
const html=(id,setting)=>`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html{font-size:16px}*{box-sizing:border-box}body{margin:0;background:white}.card{width:100%;${setting.p5?'border:1px solid #cbd5e1;padding:20px;border-radius:24px;':''}}figure{margin:0;overflow:hidden;border:1px solid #e2e8f0;border-radius:8px;background:white}img{display:block;height:auto;max-height:28rem;width:100%;object-fit:contain}</style></head><body><div class="card"><figure><img class="block h-auto max-h-[28rem] w-full object-contain" src="/asset/${id}" alt="Isolated targeted V-A-v2 candidate"></figure></div></body></html>`;
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://127.0.0.1');const id=u.pathname.startsWith('/asset/')?u.pathname.slice(7):u.searchParams.get('id');const row=rows.get(id);if(!row){res.writeHead(404);res.end();return}if(u.pathname.startsWith('/asset/')){const bytes=fs.readFileSync(path.join(repo,row.selectedPNG.path));if(hash(bytes)!==row.selectedPNG.sha256)throw Error('Asset drift');res.writeHead(200,{'Content-Type':'image/png'});res.end(bytes)}else{const setting=settings.find(s=>s.key===u.searchParams.get('case'));if(!setting){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html(id,setting))}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
try{
  browser=await chromium.launch({headless:true});const origin=`http://127.0.0.1:${server.address().port}`;
  fs.mkdirSync(path.join(own,'browser-screenshots'));
  const result={schemaVersion:1,createdAtUTC:new Date().toISOString(),scope:'Isolated actual image QA with exact current GoalCard image CSS; no full app/native book; main cases use actual image360/680, additional viewport360/GoalCard border+p5/figure border gives actual image316',browserVersion:browser.version(),deviceScaleFactor:1,currentGoalCard:binding(path.join(repo,'app/src/components/GoalCard.tsx')),imgClass:'block h-auto max-h-[28rem] w-full object-contain',settings,rows:[],activeWrites:0};
  for(const row of rows.values())for(const setting of settings){
    const page=await browser.newPage({viewport:{width:setting.viewportWidth,height:460},deviceScaleFactor:1});const errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.failure()?.errorText));
    await page.goto(`${origin}/?id=${row.goalId}&case=${setting.key}`,{waitUntil:'networkidle'});await page.locator('img').evaluate(img=>img.decode());
    const metrics=await page.locator('img').evaluate(img=>{const s=getComputedStyle(img),r=img.getBoundingClientRect(),card=img.closest('.card').getBoundingClientRect();return{loaded:img.complete,nativeSize:[img.naturalWidth,img.naturalHeight],actualImageBounds:{x:r.x,y:r.y,width:r.width,height:r.height},cardBounds:{x:card.x,y:card.y,width:card.width,height:card.height},viewportWidth:innerWidth,documentWidth:document.documentElement.scrollWidth,computed:{display:s.display,width:s.width,height:s.height,maxHeight:s.maxHeight,objectFit:s.objectFit}}});
    if(metrics.actualImageBounds.width!==setting.expectedImageWidth)throw Error('Actual image width mismatch '+JSON.stringify(metrics));
    const screenshot=path.join(own,'browser-screenshots',`${row.goalId}.${setting.key}.png`);await page.screenshot({path:screenshot,clip:{x:0,y:0,width:setting.viewportWidth,height:Math.ceil(metrics.cardBounds.height)}});
    result.rows.push({goalId:row.goalId,assetHash:row.selectedPNG.sha256,case:setting.key,...metrics,errors,screenshot:binding(screenshot),actualSight:'PENDING screenshot view after capture'});await page.close();
  }
  fs.writeFileSync(path.join(own,'targeted-isolated-browser.actual.receipt.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({browserVersion:result.browserVersion,actualImages:result.rows.length,allLoaded:result.rows.every(r=>r.loaded),errors:result.rows.flatMap(r=>r.errors),actualImageWidths:[...new Set(result.rows.map(r=>r.actualImageBounds.width))],viewportWidths:[...new Set(result.rows.map(r=>r.viewportWidth))]}));
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
