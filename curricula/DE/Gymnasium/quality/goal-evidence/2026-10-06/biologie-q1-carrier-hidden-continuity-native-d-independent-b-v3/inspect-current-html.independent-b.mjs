import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const root='/home/enpasos/projects/skillpilot';
const require=createRequire(root+'/app/package.json');
const {chromium}=require('playwright');
const own=root+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-carrier-hidden-continuity-native-d-independent-b-v3/';
const prepared=root+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-carrier-hidden-continuity-and-length-targeted-author-v3/';
const seen=new Map();
const load=(p)=>{const b=readFileSync(p);seen.set(p,{path:p,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length});return b;};
const html=load(prepared+'bundle/book.html');
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1100,height:1600},deviceScaleFactor:1});
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!=='http://independent-review.invalid')throw new Error('Unexpected request '+u);if(u.pathname==='/book.html')await route.fulfill({status:200,contentType:'text/html',body:html});else if(u.pathname.startsWith('/assets/'))await route.fulfill({status:200,contentType:'image/png',body:load(root+'/app/public'+u.pathname)});else await route.abort();});
 await page.goto('http://independent-review.invalid/book.html',{waitUntil:'networkidle'});
 const element=page.locator('#goal-ac9e824f-003c-50ac-8751-2b8456004c63');
 await element.screenshot({path:own+'carrier-v5.actual-html-goal-page.png'});
 const data=await element.evaluate(e=>({text:e.innerText,images:[...e.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),alt:i.alt,complete:i.complete,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,displayedWidth:i.getBoundingClientRect().width,displayedHeight:i.getBoundingClientRect().height}))}));
 if(data.images.length!==1||!data.images[0].complete||data.images[0].naturalWidth!==1672)throw new Error('Actual HTML image incomplete');
 writeFileSync(own+'carrier-v5.actual-html-dom-and-inputs.json',JSON.stringify({createdAt:new Date().toISOString(),actualHTMLScreenshot:true,allRequestsInterceptedLocally:true,data,actualInputs:[...seen.values()]},null,2)+'\n');
 process.stdout.write(JSON.stringify({status:'PASS',images:data.images.length,loadedNaturalWidth:data.images[0].naturalWidth})+'\n');
}finally{await browser.close();}
