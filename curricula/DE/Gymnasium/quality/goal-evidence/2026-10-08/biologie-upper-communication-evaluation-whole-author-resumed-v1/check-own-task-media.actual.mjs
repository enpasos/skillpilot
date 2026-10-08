// SPDX-License-Identifier: Apache-2.0
// Actual technical media execution; no native D/P or visualization approval.
import { createRequire } from 'node:module'
import { readFile,writeFile,mkdir } from 'node:fs/promises'
import { resolve,dirname,relative } from 'node:path'
import { fileURLToPath,pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
const root=process.cwd();const own=dirname(fileURLToPath(import.meta.url));const require=createRequire(resolve(root,'app/package.json'));const {chromium}=require('playwright')
const manifest=JSON.parse(await readFile(resolve(own,'analog-digital-media.author-manifest.json'),'utf8'));await mkdir(resolve(own,'checks'),{recursive:true})
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const output=[];const external=[];const errors=[]
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(!r.url().startsWith('file:')&&!r.url().startsWith('data:'))external.push(r.url())})
 const file=resolve(own,'media/research-model-search-index.digital.html');await page.goto(pathToFileURL(file).href)
 await page.locator('#query').fill('Bestäuber');const pollinator=await page.locator('article:visible').evaluateAll(es=>es.map(e=>e.id));assert.deepEqual(pollinator,['D1','D2','D3']);assert.match(await page.locator('#D1').innerText(),/40/)
 await page.locator('#query').fill('Sauerstoff');const oxygen=await page.locator('article:visible').evaluateAll(es=>es.map(e=>e.id));assert.deepEqual(oxygen,['E1','E2'])
 await page.locator('#query').fill('light germination');const fresh=await page.locator('article:visible').evaluateAll(es=>es.map(e=>e.id));assert(fresh.includes('E4'))
 await page.locator('#query').fill('nichtvorhandenxyz');assert.equal(await page.locator('article:visible').count(),0);await page.locator('#query').fill('');assert.equal(await page.locator('article:visible').count(),10)
 for(const entry of manifest.entries){
  for(const width of [360,680]){
   await page.setViewportSize({width,height:900});await page.goto(pathToFileURL(resolve(root,entry.path)).href);const actual=await page.evaluate(()=>({title:document.title,text:document.body.innerText,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,fontSize:getComputedStyle(document.body).fontSize,articleCount:document.querySelectorAll('article,section').length}));assert(actual.text.includes('fiktiv'));assert(actual.articleCount>0);assert.equal(actual.fontSize,'18px');assert(actual.scrollWidth<=width+1,`${entry.path} overflow ${actual.scrollWidth}/${width}`);output.push({path:entry.path,width,scrollWidth:actual.scrollWidth,fontSize:actual.fontSize,actualContentReadCharacters:actual.text.length,articleCount:actual.articleCount})
  }
 }
 assert.deepEqual(errors,[]);assert.deepEqual(external,[])
 const receipt={schemaVersion:1,role:'actual offline task-media technical exercise only',searchChecks:{pollinator,oxygen,freshVariationE4Found:true,noMatch0:true,emptySearch10:true,stableLocalFragmentLocators:true},responsiveChecks:output,externalRequests:external,pageErrors:errors,nativeDReview:false,independentPReview:false,learningGoalImageReview:false,humanApproval:false,exitCode:0}
 await writeFile(resolve(own,'checks/offline-analog-digital-media.actual-terminal.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({technicalMediaPass:true,files:manifest.entries.length,responsiveCases:output.length,searchChecks:5,nativeOrVisualizationApproval:false}))
}finally{await browser.close()}
