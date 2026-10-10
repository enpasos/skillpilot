// SPDX-License-Identifier: Apache-2.0
// Technical captures of actual normal output; not independent inspection.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {dirname,resolve,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createRequire} from 'node:module'
import {createServer} from 'node:http'
import {createHash} from 'node:crypto'
const R=resolve('.'),D=dirname(fileURLToPath(import.meta.url)),P=relative(R,D)
const {chromium}=createRequire(resolve(R,'app/package.json'))('playwright')
const B=resolve(D,'native/eight-current-P/bundle'),manifest=JSON.parse(readFileSync(resolve(B,'manifest.json'),'utf8'))
const ids=manifest.goals.map(g=>g.goalId),routes=new Map([['/book.html',resolve(B,'book.html')]])
for(const id of ids)routes.set(`/assets/goal-visualizations/biologie/${id}/${id}.png`,resolve(D,`assets/biologie/${id}/${id}.png`))
const server=createServer((req,res)=>{
 const path=routes.get(new URL(req.url,'http://127.0.0.1').pathname)
 if(!path){res.writeHead(404);res.end();return}
 res.setHeader('Content-Type',path.endsWith('.png')?'image/png':'text/html; charset=utf-8');res.end(readFileSync(path))
})
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
const browser=await chromium.launch({headless:true})
const page=await browser.newPage({viewport:{width:1200,height:1400},deviceScaleFactor:1})
const captureRoot=resolve(D,'native/captures/html-whole-pages');mkdirSync(captureRoot,{recursive:true})
const captures=[]
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/book.html`,{waitUntil:'networkidle'})
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.decode()))})
 assert.equal(await page.locator('.goal-page').count(),8)
 for(const id of ids){
  const loc=page.locator(`#goal-${id}`),file=resolve(captureRoot,`${id}.actual-whole-html-page.png`)
  const actualImage=await loc.locator('.goal-visualization img').evaluate(img=>({src:img.getAttribute('src'),complete:img.complete,width:img.naturalWidth,height:img.naturalHeight}))
  assert.equal(actualImage.src,`/assets/goal-visualizations/biologie/${id}/${id}.png`);assert.equal(actualImage.complete,true)
  assert.equal(actualImage.width,1672);assert.equal(actualImage.height,941)
  await loc.screenshot({path:file})
  const bytes=readFileSync(file)
  captures.push({goalId:id,actualOriginalBoundRasterDecoded:actualImage,capture:{path:relative(R,file),sha256:'sha256:'+createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length}})
 }
 writeFileSync(resolve(D,'checks/actual-whole-native-html-captures.technical.json'),JSON.stringify({schemaVersion:1,role:'Technical capture of unchanged actual normal HTML and bound originals; not independent visual judgment',normalHtmlPath:`${P}/native/eight-current-P/bundle/book.html`,normalHtmlSha256:'sha256:'+createHash('sha256').update(readFileSync(resolve(B,'book.html'))).digest('hex'),captures,independentApproval:false,humanApproval:false,activeWrites:0},null,2)+'\n')
 console.log(JSON.stringify({actualWholeHtmlPages:8,allBoundOriginalPNGsDecoded:true,independentApproval:false}))
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
