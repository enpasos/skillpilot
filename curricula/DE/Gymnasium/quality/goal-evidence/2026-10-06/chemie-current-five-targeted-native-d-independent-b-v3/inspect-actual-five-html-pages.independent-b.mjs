import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {resolve} from 'node:path'
import assert from 'node:assert/strict'
const repo=process.cwd(), own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-five-targeted-native-d-independent-b-v3', author='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-fifteen-final-native-review-inputs-author-v3'
const input=JSON.parse(readFileSync(resolve(repo,author,'native-d-five/round-b/description-review-input.json'),'utf8'))
const htmlPath=author+'/native-d-five/bundle/book.html',html=readFileSync(resolve(repo,htmlPath))
const candidateBase='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-atomic-description-positive-gap-author-v2/visual-candidates'
const pngs={'b8d3b453':candidateBase+'/b8/attempt-01.png','973c12d9':candidateBase+'/carbonyl/attempt-01.png'}
const sha=bytes=>'sha256:'+createHash('sha256').update(bytes).digest('hex')
const resources=new Map(input.goals.map(g=>{const v=g.reviewContext.page.visualization;const path=pngs[g.goalId.slice(0,8)]??'app/public'+v.url;const bytes=readFileSync(resolve(repo,path));assert.equal(sha(bytes),v.originalDigest);return[v.url,{path,bytes,digest:sha(bytes),mime:path.endsWith('.png')?'image/png':'image/jpeg'}]}))
const require=createRequire(resolve(repo,'app/package.json')),{chromium}=require('playwright')
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']})
const out=own+'/actual-html-page-views';mkdirSync(resolve(repo,out));const requests=[],unexpected=[],rows=[]
try{
 const context=await browser.newContext({viewport:{width:1024,height:1600},deviceScaleFactor:1});const page=await context.newPage()
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!=='http://frozen-review.skillpilot.invalid'){unexpected.push(u.href);return route.abort()};if(u.pathname==='/'){return route.fulfill({contentType:'text/html',body:html})};const r=resources.get(u.pathname);if(r){requests.push({url:u.pathname,path:r.path,sha256:r.digest});return route.fulfill({contentType:r.mime,body:r.bytes})};unexpected.push(u.pathname);return route.abort()})
 await page.goto('http://frozen-review.skillpilot.invalid/',{waitUntil:'networkidle'})
 await page.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())))
 for(const g of input.goals){const article=page.locator('article#goal-'+g.goalId);assert.equal(await article.count(),1);const actual=await article.evaluate(el=>({text:el.innerText,clientWidth:el.clientWidth,scrollWidth:el.scrollWidth,image:[...el.querySelectorAll('img')].map(img=>({src:img.getAttribute('src'),alt:img.alt,loaded:img.complete&&img.naturalWidth>0,nativeSize:[img.naturalWidth,img.naturalHeight],displaySize:[img.getBoundingClientRect().width,img.getBoundingClientRect().height]}))}));assert(actual.image[0].loaded);assert(actual.text.includes(g.currentDescriptionDe));const screenshot=out+'/'+g.goalId+'.actual-html-1024.png';await article.screenshot({path:resolve(repo,screenshot)});rows.push({goalId:g.goalId,...actual,screenshot:{path:screenshot,sha256:sha(readFileSync(resolve(repo,screenshot)))},goalFingerprint:g.goalFingerprint,pageFingerprint:g.pageFingerprint})}
 assert.equal(unexpected.length,0)
 writeFileSync(resolve(repo,own,'actual-html-five-pages.receipt.json'),JSON.stringify({schemaVersion:1,browserVersion:browser.version(),sourceFrozenHTML:{path:htmlPath,sha256:sha(html)},method:'Exact frozen HTML served unmodified with exactly5 bound real original images, actualarticle screenshot at1024viewport/DPR1; no regeneration or layout patch',requests,unexpectedRequests:unexpected,rows,activeWrites:false,humanApproval:false,fullLiveHostAcceptance:false},null,2)+'\n');console.log(JSON.stringify({actualArticles:rows.length,all5ImagesLoaded:true,all5DescriptionsPresent:true,noContentOverflow:rows.every(r=>r.scrollWidth<=r.clientWidth),unexpectedRequests:unexpected}))
 await context.close()
}finally{await browser.close()}
