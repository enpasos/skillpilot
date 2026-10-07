import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {resolve} from 'node:path'
import assert from 'node:assert/strict'
const repo=process.cwd(),base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/',own=base+'chemie-current-coordinate-final-native-d-independent-b-v5',author=base+'chemie-current-coordinate-final-native-review-inputs-author-v5'
const candidateBase=base+'chemie-current-atomic-description-positive-gap-author-v2/visual-candidates'
const pngs={'b8d3b453':candidateBase+'/b8/attempt-01.png','973c12d9':candidateBase+'/carbonyl/attempt-01.png','363c5740':base+'chemie-current-coordinate-bond-visual-correction-author-v4/visual-candidate/attempt-02.png'}
const sha=bytes=>'sha256:'+createHash('sha256').update(bytes).digest('hex')
const require=createRequire(resolve(repo,'app/package.json')),{chromium}=require('playwright')
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']})
const out=own+'/actual-html-page-views';mkdirSync(resolve(repo,out));const bundles=[]
try {
 for(const [key,folder] of [['four','native-d-four-excluding-coordinate'],['one','native-d-coordinate-single']]) {
  const input=JSON.parse(readFileSync(resolve(repo,author,folder,'round-b/description-review-input.json'),'utf8'))
  const htmlPath=author+'/'+folder+'/bundle/book.html',html=readFileSync(resolve(repo,htmlPath))
  const resources=new Map(input.goals.map(g=>{const v=g.reviewContext.page.visualization,path=pngs[g.goalId.slice(0,8)]??'app/public'+v.url,bytes=readFileSync(resolve(repo,path));assert.equal(sha(bytes),v.originalDigest);return[v.url,{path,bytes,digest:sha(bytes),mime:path.endsWith('.png')?'image/png':'image/jpeg'}]}))
  const requests=[],unexpected=[],rows=[]
  const context=await browser.newContext({viewport:{width:1024,height:1600},deviceScaleFactor:1}),page=await context.newPage()
  await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!=='http://frozen-review.skillpilot.invalid'){unexpected.push(u.href);return route.abort()};if(u.pathname==='/')return route.fulfill({contentType:'text/html',body:html});const r=resources.get(u.pathname);if(r){requests.push({url:u.pathname,path:r.path,sha256:r.digest});return route.fulfill({contentType:r.mime,body:r.bytes})};unexpected.push(u.pathname);return route.abort()})
  await page.goto('http://frozen-review.skillpilot.invalid/',{waitUntil:'networkidle'})
  await page.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())))
  for(const g of input.goals){const article=page.locator('article#goal-'+g.goalId);assert.equal(await article.count(),1);const actual=await article.evaluate(el=>({text:el.innerText,clientWidth:el.clientWidth,scrollWidth:el.scrollWidth,links:[...el.querySelectorAll('a')].map(a=>({text:a.innerText,href:a.getAttribute('href')})),image:[...el.querySelectorAll('img')].map(img=>({src:img.getAttribute('src'),alt:img.alt,loaded:img.complete&&img.naturalWidth>0,nativeSize:[img.naturalWidth,img.naturalHeight],displaySize:[img.getBoundingClientRect().width,img.getBoundingClientRect().height]}))}));assert(actual.image[0].loaded);assert(actual.text.includes(g.currentDescriptionDe));assert.equal(actual.image[0].alt,g.reviewContext.page.visualization.altText);assert(actual.scrollWidth<=actual.clientWidth);const screenshot=out+'/'+key+'-'+g.goalId+'.actual-html-1024.png';await article.screenshot({path:resolve(repo,screenshot)});rows.push({goalId:g.goalId,...actual,screenshot:{path:screenshot,sha256:sha(readFileSync(resolve(repo,screenshot)))},goalFingerprint:g.goalFingerprint,pageFingerprint:g.pageFingerprint})}
  assert.equal(unexpected.length,0);bundles.push({key,sourceFrozenHTML:{path:htmlPath,sha256:sha(html)},reviewInputFingerprint:input.reviewInputFingerprint,requests,unexpectedRequests:unexpected,rows});await context.close()
 }
 writeFileSync(resolve(repo,own,'actual-two-html-five-goal-pages.receipt.json'),JSON.stringify({schemaVersion:1,createdAtUTC:new Date().toISOString(),browserVersion:browser.version(),method:'Exact two frozen native HTML files, exactly bound real image bytes, actualarticle screenshots at1024viewport/DPR1; no regeneration or layout patch',bundles,activeWrites:false,humanApproval:false,fullLiveHostAcceptance:false},null,2)+'\n')
 console.log(JSON.stringify({actualBundles:2,actualArticles:bundles.reduce((n,b)=>n+b.rows.length,0),allImagesLoaded:true,allDescriptionsAndAltTextsPresent:true,noContentOverflow:true,unexpectedRequests:[]}))
}finally{await browser.close()}
