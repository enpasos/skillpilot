// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve,dirname,relative} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import {chromium} from '../../../../../../../app/node_modules/playwright/index.mjs'
const own=dirname(fileURLToPath(import.meta.url)),root=resolve('.')
const html=resolve(own,'media/citation-original-model-cards.corrected-v2.html')
const source=readFileSync(html,'utf8');assert.ok(!source.includes('bisTag')&&!source.includes('byday'))
const browser=await chromium.launch({headless:true,args:['--no-sandbox']})
const checks=[]
try{
 for(const width of [360,680]){
  const page=await browser.newPage({viewport:{width,height:1000}})
  await page.goto(pathToFileURL(html).href)
  const actual=await page.locator('body').innerText()
  for(const sentence of ['Im Modell keimten 18 von 20 Samen bis Tag 6.','In the model 18 of 20 seeds germinated by day 6.','Einzelmessungen beweisen keine Ursache.','Single measurements do not prove causation.'])assert.ok(actual.includes(sentence),sentence)
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)
  assert.equal(overflow,false)
  const screenshot=resolve(own,`media/citation-original.actual.${width}px.png`)
  await page.screenshot({path:screenshot,fullPage:true})
  checks.push({width,actualFourQuotationSentencesFound:true,horizontalOverflow:overflow,screenshot:relative(root,screenshot)})
  await page.close()
 }
}finally{await browser.close()}
const bytes=readFileSync(html)
writeFileSync(resolve(own,'actual-corrected-original-responsive-browser.receipt.json'),JSON.stringify({schemaVersion:1,role:'Actual ordinary browser material checks; no scientific approval',source:{path:relative(root,html),sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length},checks,activeWrites:0},null,2)+'\n',{flag:'wx'})
console.log('Actual corrected original quotation DOM and360/680 no-overflow checks PASS.')
