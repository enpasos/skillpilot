// SPDX-License-Identifier: Apache-2.0
// Actual technical capture; no independent science or visual approval.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {dirname,resolve,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createRequire} from 'node:module'
import {createServer} from 'node:http'
import {createHash} from 'node:crypto'
const R=resolve('.'),D=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const {chromium}=createRequire(resolve(R,'app/package.json'))('playwright')
const ref=f=>({path:relative(R,f),sha256:'sha256:'+createHash('sha256').update(readFileSync(f)).digest('hex'),bytes:readFileSync(f).length})
const rasters=JSON.parse(readFileSync(resolve(D,'assets/whole26-exact-current-raster-origin-and-binding-map.json'),'utf8')).rows
const routes=new Map(rasters.map(r=>[r.selectedResourceLink.url,resolve(R,r.wholeExactSelectedRaster.ownExactCopy.path)]))
for(const n of [20,6])routes.set(`/book-${n}.html`,resolve(D,`native/current-${n}/bundle/book.html`))
const server=createServer((req,res)=>{
 const f=routes.get(new URL(req.url,'http://127.0.0.1').pathname)
 if(!f){res.writeHead(404);res.end();return}
 res.setHeader('Content-Type',f.endsWith('.png')?'image/png':f.endsWith('.jpg')?'image/jpeg':'text/html; charset=utf-8');res.end(readFileSync(f))
})
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
const browser=await chromium.launch({headless:true})
const page=await browser.newPage({viewport:{width:1200,height:1400},deviceScaleFactor:1})
const captureRoot=resolve(D,'native/captures/html-whole-pages');mkdirSync(captureRoot,{recursive:true})
const captures=[]
try{
 for(const n of [20,6]){
  const model=JSON.parse(readFileSync(resolve(D,`native/current-${n}/bundle/book-model.json`),'utf8'))
  await page.goto(`http://127.0.0.1:${server.address().port}/book-${n}.html`,{waitUntil:'networkidle'})
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.decode()))})
  assert.equal(await page.locator('.goal-page').count(),n)
  for(const body of model.pages){
   const id=body.goalId,raster=rasters.find(r=>r.goalId===id),loc=page.locator(`#goal-${id}`)
   const image=await loc.locator('.goal-visualization img').evaluate(img=>({src:img.getAttribute('src'),complete:img.complete,width:img.naturalWidth,height:img.naturalHeight}))
   assert.equal(image.src,raster.selectedResourceLink.url);assert.equal(image.complete,true);assert.deepEqual([image.width,image.height],raster.actualDimensions)
   const file=resolve(captureRoot,`${id}.actual-whole-html-page.png`);await loc.screenshot({path:file})
   captures.push({goalId:id,normalBundleSize:n,bookDigest:model.digest,goalFingerprint:body.goalFingerprint,pageFingerprint:body.pageFingerprint,wholeBoundOriginalRaster:raster.wholeExactSelectedRaster.ownExactCopy,actualOriginalRasterDecoded:image,capture:ref(file)})
  }
 }
 assert.equal(captures.length,26);assert.equal(new Set(captures.map(r=>r.goalId)).size,26)
 writeFileSync(resolve(D,'checks/actual-whole26-native-html-captures.technical.json'),JSON.stringify({schemaVersion:1,role:'Actual ordinary whole-page HTML capture and exact unchanged raster decode; not independent review',normalHtmlFiles:[20,6].map(n=>ref(resolve(D,`native/current-${n}/bundle/book.html`))),captures,currentIndependentNativeReviewCount:0,independentVisualApproval:false,humanApproval:false,activeWrites:0,strictGain:0},null,2)+'\n')
 console.log(JSON.stringify({actualWholeHtmlPages:26,allBoundOriginalRastersDecoded:true,independentApproval:false}))
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
