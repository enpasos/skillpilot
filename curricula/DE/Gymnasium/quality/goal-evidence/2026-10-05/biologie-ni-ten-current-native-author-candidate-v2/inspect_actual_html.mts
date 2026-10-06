// SPDX-License-Identifier: Apache-2.0
import {chromium} from '../../../../../../../app/node_modules/playwright/index.mjs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import assert from 'node:assert/strict'
const h=dirname(fileURLToPath(import.meta.url)),scratch=JSON.parse(readFileSync(resolve(h,'prospective-paths.json'),'utf8')).nativeInputRoot, browser=await chromium.launch({headless:true,args:['--no-sandbox']});const rows=[]
try{for(const folder of ['native-eighteen-current49-all-images-finalbook','native-existing-five-current49-bindings-finalbook']){
 const model=JSON.parse(readFileSync(resolve(h,folder,'bundle/book-model.json'),'utf8')),page=await browser.newPage({viewport:{width:900,height:900}})
 await page.route('http://native-ni.test/**',async(route:any)=>{const url=new URL(route.request().url());if(url.pathname==='/book.html')return route.fulfill({body:readFileSync(resolve(h,folder,'bundle/book.html')),contentType:'text/html'});if(url.pathname.startsWith('/assets/goal-visualizations/biologie/'))return route.fulfill({body:readFileSync(resolve(scratch,'app/public'+url.pathname)),contentType:'image/png'});return route.abort()});
 const errors:string[]=[];page.on('pageerror',(e:Error)=>errors.push(e.message));await page.goto('http://native-ni.test/book.html');await page.waitForLoadState('networkidle')
 const text=await page.locator('body').innerText();writeFileSync(resolve(h,folder,'bundle/book.actual-browser-text.txt'),text+'\n')
 for(const g of model.pages)assert(text.includes(g.title)&&text.includes(g.goalId),'actual HTML missing goal '+g.goalId)
 const images=await page.locator('img').evaluateAll((els:any[])=>els.map(e=>({src:e.getAttribute('src')?.slice(0,80),complete:e.complete,naturalWidth:e.naturalWidth,naturalHeight:e.naturalHeight})))
 assert(images.length>=model.pages.length);assert(images.every((i:any)=>i.complete&&i.naturalWidth>0));assert.equal(errors.length,0)
 const out=resolve(h,folder,'actual-html-views');mkdirSync(out,{recursive:true})
 await page.screenshot({path:resolve(out,'actual-browser-start.png'),fullPage:false})
 for(const g of model.pages){const el=page.locator('#'+g.anchor);assert.equal(await el.count(),1);await el.screenshot({path:resolve(out,g.goalId+'.png')})}
 rows.push({folder,actualHTMLLoaded:true,goalCount:model.pages.length,actualGoalTitlesAndIdsAllPresent:true,images,consoleErrors:errors,screenshots:model.pages.map((g:any)=>g.goalId+'.png')});await page.close()
}}finally{await browser.close()}
writeFileSync(resolve(h,'actual-html-native-author-inspection.receipt.json'),JSON.stringify({authorOnly:true,candidateOnly:true,humanApproval:false,rows},null,2)+'\n');console.log(JSON.stringify(rows.map(r=>({folder:r.folder,goals:r.goalCount,images:r.images.length,errors:r.consoleErrors.length}))))
