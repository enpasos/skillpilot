import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root='/home/enpasos/projects/skillpilot';
const require=createRequire(root+'/app/package.json');
const {chromium}=require('playwright');
const base=root+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/';
const own=base+'chemie-current-fifteen-native-d-independent-b-v1/';
const prepared=base+'chemie-current-atomic-description-positive-gap-author-v1/native-d-fifteen/';
const inputs=new Map();
const read=p=>{const b=readFileSync(p);inputs.set(p.replace(root+'/', ''),{path:p.replace(root+'/', ''),sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length});return b};
const html=read(prepared+'bundle/book.html');
const model=JSON.parse(read(prepared+'bundle/book-model.json'));
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1100,height:1600},deviceScaleFactor:1});
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!=='http://independent-review.invalid')throw new Error('Unexpected request '+u);if(u.pathname==='/book.html')await route.fulfill({status:200,contentType:'text/html',body:html});else if(u.pathname.startsWith('/assets/'))await route.fulfill({status:200,contentType:'image/jpeg',body:read(root+'/app/public'+u.pathname)});else await route.abort()});
 await page.goto('http://independent-review.invalid/book.html',{waitUntil:'networkidle'});
 const rows=[];
 for(const goal of model.pages){
  const element=page.locator('#goal-'+goal.goalId);
  const data=await element.evaluate(e=>({text:e.innerText,images:[...e.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),alt:i.alt,complete:i.complete,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,bounds:i.getBoundingClientRect().toJSON()})),bounds:e.getBoundingClientRect().toJSON()}));
  if(data.images.length!==1||!data.images[0].complete||!data.images[0].naturalWidth||data.images[0].src!==goal.visualization.url||data.images[0].alt!==goal.visualization.altText||!data.text.includes(goal.description)||!data.text.includes(goal.goalId))throw new Error('Actual HTML binding incomplete '+goal.goalId);
  const screenshot='actual-pages/html-'+String(goal.pageNumber).padStart(2,'0')+'.png';
  await element.screenshot({path:own+screenshot});
  rows.push({goalId:goal.goalId,pageNumber:goal.pageNumber,screenshot,...data});
 }
 writeFileSync(own+'actual-html-dom-and-image-bindings.independent-b.json',JSON.stringify({createdAtUTC:new Date().toISOString(),actualHTMLBrowserScreenshots:true,externalNetworkRequests:false,goalCount:rows.length,rows,actualInputs:[...inputs.values()]},null,2)+'\n');
 process.stdout.write(JSON.stringify({actualHTMLGoals:rows.length,actualLoadedImages:rows.length,status:'PASS'})+'\n');
} finally {await browser.close()}
