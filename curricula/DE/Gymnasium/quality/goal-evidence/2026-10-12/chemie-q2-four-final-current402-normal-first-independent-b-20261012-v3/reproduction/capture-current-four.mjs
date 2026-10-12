import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {chromium} from '../../../../../../../../app/node_modules/playwright/index.mjs';
const own=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.resolve(own,'../../../../../../../');
const neutral=JSON.parse(await fs.readFile(path.join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-four-joint-current402-root-integration-preparation-20261012-v1/FINAL.neutral-current402-selected-four-review-input.json'),'utf8'));
const bindings=new Map(neutral.goals.map(g=>[g.originalActualAssetAndDeviceBindings.imageUrl,g.originalActualAssetAndDeviceBindings.actualOwnNativeImage]));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1040,height:1400},deviceScaleFactor:1});
const receipts=[];
await page.route('**/*',async route=>{
 const u=new URL(route.request().url());
 if(u.pathname==='/book.html')return route.fulfill({body:await fs.readFile(path.join(own,'bundle/book.html')),contentType:'text/html'});
 const b=bindings.get(u.pathname);
 if(b){const data=await fs.readFile(path.join(root,b.path));if('sha256:'+createHash('sha256').update(data).digest('hex')!==b.sha256)throw Error('Asset changed');return route.fulfill({body:data,contentType:u.pathname.endsWith('.png')?'image/png':'image/jpeg'});}
 return route.abort();
});
await page.goto('http://review.invalid/book.html',{waitUntil:'networkidle'});
await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(x=>x.decode()));});
for(const g of neutral.goals){
 const loc=page.locator('#goal-'+g.goalId);await loc.screenshot({path:path.join(own,'actual-views',g.goalId+'.current-native-html.png')});
 receipts.push({goalId:g.goalId,role:'exact normal HTML goal page',imageLoaded:await loc.locator('img').evaluate(x=>x.complete&&x.naturalWidth>0),bounds:await loc.boundingBox()});
}
for(const width of [360,680])for(const g of neutral.goals){
 const b=g.originalActualAssetAndDeviceBindings.actualOwnNativeImage;const data=await fs.readFile(path.join(root,b.path));const mime=b.path.endsWith('.png')?'image/png':'image/jpeg';
 await page.setViewportSize({width,height:500});await page.setContent(`<html><body style="margin:0"><img style="display:block;width:${width}px;height:auto" src="data:${mime};base64,${data.toString('base64')}"></body></html>`);
 await page.locator('img').evaluate(x=>x.decode());await page.locator('img').screenshot({path:path.join(own,'actual-views',g.goalId+'.'+width+'.actual.png')});
 receipts.push({goalId:g.goalId,role:'actual asset display',containerWidth:width,rect:await page.locator('img').boundingBox(),assetSha256:b.sha256});
}
await browser.close();
const r=spawnSync('pdftoppm',['-f','3','-l','6','-r','100','-png',path.join(own,'bundle/book.pdf'),path.join(own,'actual-views/current-physical-pdf')],{encoding:'utf8'});
if(r.status!==0)throw Error(r.stderr);
await fs.writeFile(path.join(own,'checks/current-native-device-capture.actual.json'),JSON.stringify({exactInputHtmlPath:path.relative(root,path.join(own,'bundle/book.html')),exactInputPdfPath:path.relative(root,path.join(own,'bundle/book.pdf')),receipts,physicalPdfPages:[3,4,5,6],networkRequestsRestrictedToBoundLocalInputs:true,humanApproval:false},null,2)+'\n');
console.log('Captured four current normal HTML pages, PDF pages3-6 and actual360/680 images.');
