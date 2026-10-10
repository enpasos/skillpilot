// SPDX-License-Identifier: Apache-2.0
// Actual rendered whole-page captures only. No scientific or image approval.
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
const rows=JSON.parse(readFileSync(resolve(D,'assets/protected12-exact-current-raster-bindings.actual.json'),'utf8')).rows
const routes=new Map(rows.map(r=>[r.wholeSelectedVisualization.url,resolve(R,r.wholeExactPublicCopy.path)]))
routes.set('/book-12.html',resolve(D,'native/current-12/bundle/book.html'))
const server=createServer((req,res)=>{const f=routes.get(new URL(req.url,'http://127.0.0.1').pathname);if(!f){res.writeHead(404);res.end();return}res.setHeader('Content-Type',f.endsWith('.png')?'image/png':f.endsWith('.jpg')?'image/jpeg':'text/html; charset=utf-8');res.end(readFileSync(f))})
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1200,height:1400},deviceScaleFactor:1})
const captureRoot=resolve(D,'native/captures/html-whole-pages');mkdirSync(captureRoot,{recursive:true});const captures=[]
try{
 const model=JSON.parse(readFileSync(resolve(D,'native/current-12/bundle/book-model.json'),'utf8'))
 await page.goto(`http://127.0.0.1:${server.address().port}/book-12.html`,{waitUntil:'networkidle'})
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.decode()))})
 assert.equal(await page.locator('.goal-page').count(),12)
 for(const body of model.pages){
  const id=body.goalId,row=rows.find(r=>r.goalId===id),loc=page.locator(`#goal-${id}`)
  const decoded=await loc.locator('.goal-visualization img').evaluate(img=>({src:img.getAttribute('src'),complete:img.complete,width:img.naturalWidth,height:img.naturalHeight}))
  assert.equal(decoded.src,row.wholeSelectedVisualization.url);assert.equal(decoded.complete,true);assert.ok(decoded.width>0&&decoded.height>0)
  const file=resolve(captureRoot,`${id}.actual-whole-html-page.png`);await loc.screenshot({path:file})
  captures.push({goalId:id,bookDigest:model.digest,goalFingerprint:body.goalFingerprint,pageFingerprint:body.pageFingerprint,wholeBoundOriginalRaster:row.wholeExactPublicCopy,actualOriginalRasterDecoded:decoded,capture:ref(file)})
 }
 assert.equal(captures.length,12);assert.equal(new Set(captures.map(x=>x.goalId)).size,12)
 writeFileSync(resolve(D,'checks/actual-whole12-native-html-captures.technical.json'),JSON.stringify({schemaVersion:1,role:'Actual normal whole-page HTML captures with decoded unchanged rasters; not independent review',normalHtmlFile:ref(resolve(D,'native/current-12/bundle/book.html')),captures,actualWholeHtmlPageCount:12,currentIndependentNativeReviewCount:0,independentVisualApproval:false,humanApproval:false,activeWrites:[],strictGain:0},null,2)+'\n')
 console.log(JSON.stringify({actualWholeHtmlPageCount:12,allBoundOriginalRastersDecoded:true,independentApproval:false}))
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
