// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {chromium} from '../../../../../../../app/node_modules/playwright/index.mjs'
const D=dirname(fileURLToPath(import.meta.url)),freeze=JSON.parse(readFileSync(resolve(D,'first-input.freeze.json'),'utf8')),input=JSON.parse(readFileSync(resolve(D,'selected-final-four-whole-body-profile-case-input.actual.json'),'utf8'))
const sh=b=>'sha256:'+createHash('sha256').update(b).digest('hex')
for(const r of freeze.requiredFiles){const b=readFileSync(r.path);assert.equal(sh(b),r.sha256);assert.equal(b.length,r.bytes)}
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']})
const previews=[]
try {
 for(const r of input.images)for(const width of [360,680]){
  const b=readFileSync(r.assetPath);assert.equal(sh(b),'sha256:'+r.sha256)
  const page=await browser.newPage({viewport:{width,height:500},deviceScaleFactor:1})
  await page.setContent('<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#fff}img{display:block;width:100%;height:auto}</style></head><body><img alt="Actual frozen public curriculum candidate" src="data:image/png;base64,'+b.toString('base64')+'"></body></html>')
  const size=await page.locator('img').evaluate(async el=>{await el.decode();return {width:el.width,height:el.height,naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight}})
  assert.equal(size.width,width);assert.equal(size.naturalWidth,r.dimensions.width);assert.equal(size.naturalHeight,r.dimensions.height)
  const out=resolve(D,'actual-previews',r.goalId+'.'+width+'px.png');mkdirSync(dirname(out),{recursive:true});await page.locator('img').screenshot({path:out});const ob=readFileSync(out);previews.push({goalId:r.goalId,ordinal:r.ordinal,width,actualRasterSource:{path:r.assetPath,sha256:sh(b)},browserDisplayedSize:size,screenshot:{path:out.replace(resolve('.')+'/',''),sha256:sh(ob),bytes:ob.length}})
  await page.close()
 }
} finally {await browser.close()}
writeFileSync(resolve(D,'actual-360-680-browser-rendering.receipt.json'),JSON.stringify({schemaVersion:1,browser:'Playwright Chromium, deviceScaleFactor1',externalRequests:0,originalImagesEdited:false,previews},null,2)+'\n')
console.log(JSON.stringify({actualPreviewCount:previews.length,widths:[360,680],hashMatches:true,originalImagesEdited:false}))
