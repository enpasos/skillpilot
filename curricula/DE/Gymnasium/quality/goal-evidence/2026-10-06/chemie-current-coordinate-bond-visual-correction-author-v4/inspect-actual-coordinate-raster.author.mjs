import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const root=resolve('.')
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-coordinate-bond-visual-correction-author-v4'
const require=createRequire(resolve(root,'app/package.json'))
const {chromium}=require('playwright')
const files=[{key:'coordinate-bond',path:`${own}/visual-candidate/attempt-02.png`}]
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']})
const rows=[]
try{
 for(const file of files){
  const bytes=readFileSync(resolve(root,file.path))
  const sha256='sha256:'+createHash('sha256').update(bytes).digest('hex')
  for(const width of [360,680]){
   const context=await browser.newContext({viewport:{width,height:800},deviceScaleFactor:1})
   const page=await context.newPage(), unexpected=[]
   await page.route('**/*',async route=>{
    const u=new URL(route.request().url())
    if(u.origin!=='http://candidate.skillpilot.invalid'){unexpected.push(u.href);return route.abort()}
    if(u.pathname==='/image.png')return route.fulfill({contentType:'image/png',body:bytes})
    if(u.pathname==='/')return route.fulfill({contentType:'text/html',body:`<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;padding:0;background:white}img{display:block;width:100%;height:auto}</style><img alt="Unapproved chemistry author candidate" src="/image.png">`})
    unexpected.push(u.href);return route.abort()
   })
   await page.goto('http://candidate.skillpilot.invalid/',{waitUntil:'networkidle'})
   const actual=await page.locator('img').evaluate(img=>({naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,loaded:img.complete&&img.naturalWidth>0,displayedWidth:img.getBoundingClientRect().width,displayedHeight:img.getBoundingClientRect().height,imageURL:img.getAttribute('src')}))
   assert(actual.loaded);assert.equal(actual.displayedWidth,width);assert.equal(unexpected.length,0)
   const screenshotPath=`${own}/visual-candidate/actual-browser-${width}.png`
   await page.locator('img').screenshot({path:resolve(root,screenshotPath)})
   const screenshotBytes=readFileSync(resolve(root,screenshotPath))
   rows.push({key:file.key,source:{path:file.path,sha256,bytes:bytes.length},width,deviceScaleFactor:1,...actual,screenshot:{path:screenshotPath,sha256:'sha256:'+createHash('sha256').update(screenshotBytes).digest('hex'),bytes:screenshotBytes.length},unexpectedRequests:unexpected})
   await context.close()
  }
 }
 writeFileSync(resolve(root,own,'actual-coordinate-candidate-browser-width-bindings.author.json'),JSON.stringify({schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'AUTHOR actual Chromium display of exact PNG bytes at phone360 and desktop680; not independent V approval',browserVersion:browser.version(),method:'Exact local PNG bytes served read-only via bounded route; img display width100%, heightauto, DPR1. Actual browser screenshots, no programmatic raster editing.',rows,scientificVerdictPendingAuthorView:true,independentVisualApproval:false,humanApproval:false,fullLiveCockpitAcceptance:false,activeWrites:false},null,2)+'\n')
 console.log(JSON.stringify({browserVersion:browser.version(),actualRenders:rows.length,sourceBindings:rows.map(r=>({key:r.key,width:r.width,sha256:r.source.sha256})),independentApproval:false}))
}finally{await browser.close()}
