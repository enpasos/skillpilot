// SPDX-License-Identifier: Apache-2.0
import {chromium} from '../../../../../../../app/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd(),own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-six-source-operator-remediation-current-candidate-v1',iso=resolve(root,'tmp/chemie-q1-six-source-operator-native-isolated-20261005-v1'),html=resolve(iso,own,'native-finalbook-v2/bundle/book.html');
const sha=b=>createHash('sha256').update(b).digest('hex');
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1150,height:1600},deviceScaleFactor:1});const requests=[];const failures=[];
page.on('pageerror',e=>failures.push(String(e)));
await page.route('**/*',async route=>{const url=new URL(route.request().url());let p;
 if(url.pathname==='/book.html')p=html;else if(url.pathname.startsWith('/assets/'))p=resolve(iso,'app/public',url.pathname.slice(1));else {await route.abort();return;}
 const bytes=readFileSync(p);requests.push({request:url.pathname,actualFile:p,sha256:sha(bytes),bytes:bytes.length});await route.fulfill({body:bytes,contentType:p.endsWith('.html')?'text/html':p.endsWith('.png')?'image/png':'image/jpeg'});
});
await page.goto('http://author-isolated-review.local/book.html',{waitUntil:'networkidle'});
const actual=await page.locator('.goal-page').evaluateAll(es=>es.map(e=>({goalId:e.dataset.goalId,description:e.innerText,images:Array.from(e.querySelectorAll('img')).map(i=>({source:i.getAttribute('src'),alt:i.getAttribute('alt'),complete:i.complete,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight}))})));
if(actual.length!==8||actual.some(a=>a.images.some(i=>!i.complete||i.naturalWidth===0))||failures.length)throw Error('Actual isolated HTML failed to load');
const screenshots=[];
for(const a of actual){const p=resolve(root,own,'actual-current-page-views',`${a.goalId}.actual-loaded-html.png`);await page.locator(`#goal-${a.goalId}`).screenshot({path:p});screenshots.push({goalId:a.goalId,path:p,sha256:sha(readFileSync(p))});}
await browser.close();
writeFileSync(resolve(root,own,'actual-final-current-loaded-html.receipt.json'),JSON.stringify({actualHTML:html,htmlSHA256:sha(readFileSync(html)),servedExactlyFromOwnFutureFrontendAssets:true,actualGoalSections:actual,requests,screenshots,failures,authorReadOnlyView:true,independentDApproval:false,activeWrites:0},null,2)+'\n');
console.log(JSON.stringify({actualGoals:actual.length,loadedImages:actual.flatMap(x=>x.images).length,failures,activeWrites:0}));
