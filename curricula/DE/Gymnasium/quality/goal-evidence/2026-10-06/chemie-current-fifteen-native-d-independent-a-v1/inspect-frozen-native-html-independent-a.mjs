import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const root=resolve('.'); const require=createRequire(resolve(root,'app/package.json')); const {chromium}=require('playwright')
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const own=resolve(root,base,'chemie-current-fifteen-native-d-independent-a-v1')
const author=resolve(root,base,'chemie-current-atomic-description-positive-gap-author-v1/native-d-fifteen')
const input=JSON.parse(readFileSync(resolve(author,'round-a/description-review-input.json'),'utf8'))
const images=new Map(input.goals.map(g=>{ const v=g.reviewContext.page.visualization; const bytes=readFileSync(resolve(root,'app/public',v.url.replace(/^\//u,''))); const digest='sha256:'+createHash('sha256').update(bytes).digest('hex'); assert.equal(digest,v.originalDigest); return [v.url,{bytes,digest}] }))
const browser=await chromium.launch({headless:true})
try {
 const page=await browser.newPage({viewport:{width:1024,height:1400},deviceScaleFactor:1}); const unexpected=[]
 await page.route('**/*',async route=>{const u=new URL(route.request().url()); if(u.origin!=='http://review.skillpilot.invalid'){unexpected.push(u.href);return route.abort()} if(u.pathname==='/book.html')return route.fulfill({contentType:'text/html',body:readFileSync(resolve(author,'bundle/book.html'))}); if(images.has(u.pathname))return route.fulfill({contentType:'image/png',body:images.get(u.pathname).bytes}); unexpected.push(u.href);return route.abort() })
 await page.goto('http://review.skillpilot.invalid/book.html',{waitUntil:'networkidle'})
 const rows=[]
 for(let i=0;i<input.goals.length;i++){const g=input.goals[i], article=page.locator('#goal-'+g.goalId); const actual=await article.evaluate(node=>{const img=node.querySelector('img'), title=node.querySelector('h2');return {title:title.textContent.trim(),description:node.querySelector('.goal-description').querySelector(':scope > p:not(.section-heading)').textContent.trim(),imageLoaded:img.complete&&img.naturalWidth>0,imageURL:img.getAttribute('src'),altText:img.getAttribute('alt'),naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,titleScrollWidth:title.scrollWidth,titleClientWidth:title.clientWidth,pageNumber:node.getAttribute('data-page-number'),actualArticleText:node.innerText}})
 assert.equal(actual.title,g.currentTitleDe);assert.equal(actual.description,g.currentDescriptionDe);assert.equal(actual.imageURL,g.reviewContext.page.visualization.url);assert.equal(actual.altText,g.reviewContext.page.visualization.altText);assert(actual.imageLoaded)
 await article.screenshot({path:resolve(own,'inspection',`actual-html-goal-${String(i+1).padStart(2,'0')}.png`)})
 rows.push({goalId:g.goalId,...actual,currentImageDigest:images.get(actual.imageURL).digest}) }
 assert.equal(unexpected.length,0)
 writeFileSync(resolve(own,'actual-frozen-html-browser-check.json'),JSON.stringify({schemaVersion:1,createdAtUTC:new Date().toISOString(),method:'Unmodified frozen HTML actually loaded in Chromium; exact current PNGs served locally by intercept, no live app/session requests',browserVersion:browser.version(),viewport:[1024,1400],actualGoalCount:rows.length,rows,unexpectedRequests:unexpected,allTitlesDescriptionsAltAndCurrentPNGsExact:true,actualPrintHTMLIsNotFullCockpitAcceptance:true,roundBResultsRead:false,newPAuthorMaterialsRead:false,activeWrites:false},null,2)+'\n')
 console.log(JSON.stringify({actualHTMLGoalCount:rows.length,allCurrentPNGsExact:true,unexpectedRequests:unexpected.length,titleOverflowGoals:rows.filter(r=>r.titleScrollWidth>r.titleClientWidth).map(r=>r.goalId)}))
}finally{await browser.close()}
