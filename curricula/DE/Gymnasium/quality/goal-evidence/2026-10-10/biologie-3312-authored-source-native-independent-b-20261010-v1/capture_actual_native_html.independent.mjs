import assert from 'node:assert/strict'
import { chromium } from '../../../../../../../app/node_modules/playwright/index.mjs'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const own=dirname(fileURLToPath(import.meta.url))
const repo=resolve(own,'../../../../../../..')
const author='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-3312-authored-operationalization-primary-source-author-successor-v3'
const entry=JSON.parse(readFileSync(resolve(repo,author,'neutral-current3312-authored-source-and-native-one.independent-review.entry.json'),'utf8'))
const htmlPath=entry.neutralWholeFirstInputs.actualCurrentNative1WholeHTML.path
const browser=await chromium.launch({headless:true})
const page=await browser.newPage({viewport:{width:1100,height:1200},deviceScaleFactor:1})
const resolved=[]
await page.route('**/*',async route=>{
 const pathname=new URL(route.request().url()).pathname
 if(pathname==='/book.html') return route.fulfill({body:readFileSync(resolve(repo,htmlPath)),contentType:'text/html'})
 const match=pathname.match(/^\/assets\/goal-visualizations\/biologie\/([a-z0-9-]+)\/([a-z0-9-]+)\.png$/)
 assert.ok(match && match[1]===match[2] && entry.ownedCanonicalGoalIds.includes(match[1]),`No unbound request: ${pathname}`)
 const path=entry.neutralWholeFirstInputs.allEightActualUnchangedOriginalPhoneDesktopRasters.find(x=>x.goalId===match[1]).png.path
 resolved.push({url:pathname,path})
 return route.fulfill({body:readFileSync(resolve(repo,path)),contentType:'image/png'})
})
await page.goto('http://independent-review.local/book.html',{waitUntil:'networkidle'})
await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))})
const output=resolve(own,'actual-native-html')
mkdirSync(output,{recursive:true})
const pages=[]
for(const id of entry.ownedCanonicalGoalIds){
 const article=page.locator(`article[data-goal-id="${id}"]`)
 assert.equal(await article.count(),1)
 const actual=await article.evaluate(el=>({goalId:el.dataset.goalId,pageNumber:el.dataset.pageNumber,text:el.innerText,clientHeight:el.clientHeight,scrollHeight:el.scrollHeight,images:[...el.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),alt:i.alt,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,complete:i.complete}))}))
 assert.equal(actual.images.length,1);assert.ok(actual.images[0].complete && actual.images[0].naturalWidth>=1000)
 assert.ok(actual.scrollHeight<=actual.clientHeight+1,'Native article content overflow')
 await article.screenshot({path:resolve(output,`${id}.actual-whole-html-page.png`)})
 pages.push(actual)
}
writeFileSync(resolve(own,'actual-html-browser-inspection.input-observations.json'),`${JSON.stringify({schemaVersion:1,actualExitCode:0,htmlPath,role:'Actual original HTML loaded unchanged; only one bound original PNG resource requests fulfilled from frozen author package; independent read-only browser',resolved,pages,activeWrites:0},null,2)}\n`)
await browser.close()
console.log(JSON.stringify({actualExitCode:0,wholePages:pages.length,originalBoundPngs:resolved.length,allWholeArticlesNoContentOverflow:true,activeWrites:0}))
