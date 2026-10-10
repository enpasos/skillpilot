// SPDX-License-Identifier: Apache-2.0
// Actual normal HTML captures only; not an independent visual/scientific review.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,renameSync} from 'node:fs'
import {dirname,resolve,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createRequire} from 'node:module'
import {createServer} from 'node:http'
import {createHash} from 'node:crypto'
const R=resolve('.'),D=dirname(fileURLToPath(import.meta.url)),P=relative(R,D)
const T=resolve(R,'tmp/m7-resumption-20261010/biologie-insect-eight-native-technical/capture-staging');mkdirSync(T,{recursive:true})
const {chromium}=createRequire(resolve(R,'app/package.json'))('playwright')
const B=resolve(D,'native/eight-current-P/bundle'),manifest=JSON.parse(readFileSync(resolve(B,'manifest.json'),'utf8'))
const ids=manifest.goals.map(g=>g.goalId),routes=new Map([['/book.html',resolve(B,'book.html')]])
assert.equal(ids.length,8)
for(const id of ids)routes.set(`/assets/goal-visualizations/biologie/${id}/${id}.png`,resolve(D,`assets/biologie/${id}/${id}.png`))
const server=createServer((req,res)=>{
 const path=routes.get(new URL(req.url,'http://127.0.0.1').pathname)
 if(!path){res.writeHead(404);res.end();return}
 res.setHeader('Content-Type',path.endsWith('.png')?'image/png':'text/html; charset=utf-8');res.end(readFileSync(path))
})
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
const browser=await chromium.launch({headless:true})
const page=await browser.newPage({viewport:{width:1200,height:1400},deviceScaleFactor:1})
const captures=[],out=resolve(D,'native/captures/html-whole-pages');mkdirSync(out,{recursive:true})
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/book.html`,{waitUntil:'networkidle'})
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.decode()))})
 assert.equal(await page.locator('.goal-page').count(),8)
 for(const id of ids){
  const loc=page.locator(`#goal-${id}`),file=resolve(out,`${id}.actual-whole-html-page.png`),staged=resolve(T,`${id}.actual-whole-html-page.png`)
  const img=await loc.locator('.goal-visualization img').evaluate(img=>({src:img.getAttribute('src'),complete:img.complete,width:img.naturalWidth,height:img.naturalHeight}))
  assert.equal(img.src,`/assets/goal-visualizations/biologie/${id}/${id}.png`);assert.equal(img.complete,true);assert.equal(img.width,1672);assert.equal(img.height,941)
  await loc.screenshot({path:staged});renameSync(staged,file)
  const bytes=readFileSync(file)
  captures.push({goalId:id,actualOriginalBoundRasterDecoded:img,capture:{path:relative(R,file),sha256:'sha256:'+createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length}})
 }
 const proof={schemaVersion:1,role:'Technical whole native HTML capture; new independent Native8 D/P reviews pending',normalHTMLPath:`${P}/native/eight-current-P/bundle/book.html`,normalHTMLSha256:'sha256:'+createHash('sha256').update(readFileSync(resolve(B,'book.html'))).digest('hex'),captures,newIndependentApproval:false,humanApproval:false,activeWrites:false,strictGain:0}
 const file=resolve(T,'actual-whole-native8-html-captures.technical.json');writeFileSync(file,JSON.stringify(proof,null,2)+'\n');renameSync(file,resolve(D,'checks/actual-whole-native8-html-captures.technical.json'))
 console.log(JSON.stringify({actualWholeHTMLPages:8,allEightBoundOriginalPNGsDecoded:true,newIndependentApproval:false}))
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
