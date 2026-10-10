// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import {spawnSync} from 'node:child_process'
import {createRequire} from 'node:module'
const R=process.cwd(),P='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-bio8-targeted-text-and-source-author-successor-20261010-v4'
const C=path.join(R,'tmp/bio8-targeted-text-source-v4-native-capsule')
const require=createRequire(path.join(R,'app/package.json')),{chromium}=require('playwright')
const read=p=>JSON.parse(fs.readFileSync(path.join(R,P,p),'utf8'))
const ref=p=>{const b=fs.readFileSync(path.join(R,p));return {path:p,sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const put=(p,x)=>{fs.mkdirSync(path.dirname(path.join(R,P,p)),{recursive:true});fs.writeFileSync(path.join(R,P,p),JSON.stringify(x,null,2)+'\n')}
const b=P+'/native/affected-current-native/bundle',portable=P+'/native/portable-affected3/bundle'
const model=read('native/affected-current-native/bundle/book-model.json'),manifest=read('native/affected-current-native/bundle/book.pdf.render-manifest.json')
let html=fs.readFileSync(path.join(R,b,'book.html'),'utf8');const assets=[]
for(const p of model.pages){if(!p.visualization)continue;const dst=portable+'/asset-copies/'+p.goalId+'.png';fs.mkdirSync(path.dirname(path.join(R,dst)),{recursive:true});fs.copyFileSync(path.join(C,'app/public'+p.visualization.url),path.join(R,dst));html=html.replaceAll(p.visualization.url,'asset-copies/'+p.goalId+'.png');assets.push({goalId:p.goalId,originalDigest:p.visualization.originalDigest,exactRegularCopy:ref(dst)});assert.equal(assets.at(-1).exactRegularCopy.sha256,p.visualization.originalDigest)}
fs.mkdirSync(path.join(R,portable),{recursive:true});fs.writeFileSync(path.join(R,portable,'book.html'),html)
put('native/portable-affected3.actual-bindings.json',{normalHTML:ref(b+'/book.html'),portableHTML:ref(portable+'/book.html'),exactRegularAssets:assets,onlyPublicImageLocatorsReplaced:true,normalPDF:ref(b+'/book.pdf')})
const browser=await chromium.launch({headless:true})
try{
 const page=await browser.newPage({viewport:{width:1900,height:1300},deviceScaleFactor:1})
 await page.goto(pathToFileURL(path.join(R,portable,'book.html')).href,{waitUntil:'networkidle'})
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))})
 const images=await page.locator('.goal-visualization img').evaluateAll(xs=>xs.map(x=>({src:x.getAttribute('src'),width:x.naturalWidth,height:x.naturalHeight,complete:x.complete})))
 assert.equal(images.length,model.pages.length);assert.ok(images.every(x=>x.complete&&x.width>0))
 const rows=[]
 for(const p of model.pages){const l=page.locator(`article.goal-page[data-goal-id="${p.goalId}"]`);assert.equal(await l.count(),1);assert.ok((await l.innerText()).includes(p.goalId));const f=P+`/native/captures/html/${p.goalId}.whole-page.png`;fs.mkdirSync(path.dirname(path.join(R,f)),{recursive:true});await l.screenshot({path:path.join(R,f)});rows.push({goalId:p.goalId,pageNumber:p.pageNumber,pageFingerprint:p.pageFingerprint,capture:ref(f)})}
 put('checks/affected3-HTML-whole-page-captures.actual.json',{actualHTMLPages:rows.length,actualLoadedImages:images,wholePages:rows,scientificApproval:false})
}finally{await browser.close()}
const pdf=path.join(R,b,'book.pdf'),info=spawnSync('pdfinfo',[pdf],{encoding:'utf8'});assert.equal(info.status,0)
const count=Number(info.stdout.match(/^Pages:\s*(\d+)/m)?.[1]);assert.equal(count,manifest.physicalPageCount);const offset=count-model.pages.length;assert.equal(offset,manifest.frontMatterPageCount)
const pdfRows=[]
for(const p of model.pages){const n=offset+p.pageNumber,txt=spawnSync('pdftotext',['-f',String(n),'-l',String(n),pdf,'-'],{encoding:'utf8'});assert.equal(txt.status,0);assert.ok(txt.stdout.includes(p.goalId));const prefix=path.join(R,P,`native/captures/pdf/${p.goalId}.whole-page`);fs.mkdirSync(path.dirname(prefix),{recursive:true});const cap=spawnSync('pdftoppm',['-f',String(n),'-l',String(n),'-singlefile','-scale-to','1500','-png',pdf,prefix],{encoding:'utf8'});assert.equal(cap.status,0,cap.stderr);pdfRows.push({goalId:p.goalId,pageNumber:p.pageNumber,physicalPDFPage:n,pageFingerprint:p.pageFingerprint,actualWholePageIdConfirmed:true,capture:ref(P+`/native/captures/pdf/${p.goalId}.whole-page.png`)})}
put('checks/affected3-PDF-whole-page-captures.actual.json',{actualPDFPages:pdfRows.length,physicalPageCount:count,frontMatterPageCount:offset,pdfInfoRaw:info.stdout,wholePages:pdfRows,scientificApproval:false})
console.log(JSON.stringify({actualHTMLPages:3,actualPDFPages:3,loadedExactRasterCopies:3,wholePageIdentitiesConfirmed:true,scientificApproval:false}))
