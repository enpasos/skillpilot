// SPDX-License-Identifier: Apache-2.0
import { chromium } from '../../../../../../../app/node_modules/playwright/index.mjs'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ephase-seven-current-native-candidate-v1',root=process.cwd()
const meta=JSON.parse(readFileSync(resolve(root,own,'prospective-paths.json'),'utf8'))
const out=resolve(root,own,'actual-final-HTML-views');mkdirSync(out,{recursive:true})
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1100,height:900}})
const served=[]
await page.route('http://qa.local/**',async route=>{
 const u=new URL(route.request().url())
 if(u.pathname==='/book'){await route.fulfill({body:readFileSync(resolve(root,own,'native-finalbook/bundle/book.html')),contentType:'text/html'});return}
 const file=resolve(meta.isolationRoot,'app/public','.'+u.pathname)
 assert.ok(file.startsWith(resolve(meta.isolationRoot,'app/public')+'/'))
 assert.ok(existsSync(file),'Missing actual local generated HTML asset')
 served.push({url:u.pathname,path:file});await route.fulfill({body:readFileSync(file),contentType:u.pathname.endsWith('.png')?'image/png':'application/octet-stream'})
})
await page.goto('http://qa.local/book');await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0))
const rows=[]
for(const id of meta.goalIds){
 const locator=page.locator(`[data-goal-id="${id}"]`)
 assert.equal(await locator.count(),1)
 await locator.scrollIntoViewIfNeeded()
 const row=await locator.evaluate(el=>({text:el.textContent,images:[...el.querySelectorAll('img')].map(i=>({complete:i.complete,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,srcType:i.src.slice(0,30)})),bounds:{width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}}))
 assert.ok(row.images.length===1 && row.images.every(i=>i.complete && i.naturalWidth>0))
 await locator.screenshot({path:resolve(out,id+'.png')});rows.push({goalId:id,...row})
}
await browser.close();writeFileSync(resolve(root,own,'actual-loaded-HTML.author.receipt.json'),JSON.stringify({nativeHtmlPath:own+'/native-finalbook/bundle/book.html',pages:rows,actualImagesLoaded:true,served,externalNetworkUsed:false,authorDisplayInspection:true,independentScienceReview:'pending',humanApproval:false},null,2)+'\n');console.log(JSON.stringify({actualLoadedPages:rows.length}))
