import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import assert from 'node:assert/strict'
const repo=process.cwd(),base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/',own=base+'chemie-current-aromatic-one-native-d-independent-b-v6/',author=base+'chemie-current-aromatic-delocalization-final-native-author-v6/'
const g=JSON.parse(readFileSync(author+'native-d-aromatic-single/round-b/description-review-input.json','utf8')).goals[0],htmlPath=author+'native-d-aromatic-single/bundle/book.html',html=readFileSync(htmlPath),pngPath=base+'chemie-current-atomic-description-positive-gap-author-v2/visual-candidates/b8/attempt-01.png',png=readFileSync(pngPath),sha=b=>'sha256:'+createHash('sha256').update(b).digest('hex')
assert.equal(sha(png),g.reviewContext.page.visualization.originalDigest)
const require=createRequire(resolve(repo,'app/package.json')),{chromium}=require('playwright'),browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']})
try {
 const requests=[],unexpected=[],context=await browser.newContext({viewport:{width:1024,height:1600},deviceScaleFactor:1}),page=await context.newPage()
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!=='http://frozen-review.skillpilot.invalid'){unexpected.push(u.href);return route.abort()};if(u.pathname==='/')return route.fulfill({contentType:'text/html',body:html});if(u.pathname===g.reviewContext.page.visualization.url){requests.push({url:u.pathname,path:pngPath,sha256:sha(png)});return route.fulfill({contentType:'image/png',body:png})};unexpected.push(u.pathname);return route.abort()})
 await page.goto('http://frozen-review.skillpilot.invalid/',{waitUntil:'networkidle'});await page.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())))
 const article=page.locator('article#goal-'+g.goalId);assert.equal(await article.count(),1)
 const actual=await article.evaluate(el=>({text:el.innerText,clientWidth:el.clientWidth,scrollWidth:el.scrollWidth,links:[...el.querySelectorAll('a')].map(a=>({text:a.innerText,href:a.getAttribute('href')})),image:[...el.querySelectorAll('img')].map(img=>({src:img.getAttribute('src'),alt:img.alt,loaded:img.complete&&img.naturalWidth>0,nativeSize:[img.naturalWidth,img.naturalHeight],displaySize:[img.getBoundingClientRect().width,img.getBoundingClientRect().height]}))}))
 assert(actual.image[0].loaded);assert(actual.text.includes(g.currentDescriptionDe));assert.equal(actual.image[0].alt,g.reviewContext.page.visualization.altText);assert(actual.scrollWidth<=actual.clientWidth);assert.equal(unexpected.length,0)
 const screenshot=own+'actual-aromatic-html-1024.png';await article.screenshot({path:resolve(repo,screenshot)})
 writeFileSync(own+'actual-aromatic-html.receipt.json',JSON.stringify({schemaVersion:1,createdAtUTC:new Date().toISOString(),browserVersion:browser.version(),method:'Unmodified exact frozen native HTML with exact unchanged PNG, actualarticle screenshot at1024viewport/DPR1',sourceHTML:{path:htmlPath,sha256:sha(html)},goalId:g.goalId,goalFingerprint:g.goalFingerprint,pageFingerprint:g.pageFingerprint,...actual,requests,unexpectedRequests:unexpected,screenshot:{path:screenshot,sha256:sha(readFileSync(screenshot))},activeWrites:false,humanApproval:false,fullLiveHostAcceptance:false},null,2)+'\n');console.log('Actual aromatic HTML page decoded, current text/alt/context and no overflow PASS')
 await context.close()
}finally{await browser.close()}
