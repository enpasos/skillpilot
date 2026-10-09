// SPDX-License-Identifier: Apache-2.0
// Technical execution of own finite task inputs, not a learner/experiment result.
import { createRequire } from 'node:module'
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
const ROOT=process.cwd(),OWN=dirname(fileURLToPath(import.meta.url))
const require=createRequire(join(ROOT,'app/package.json'))
const {chromium}=require('playwright')
const taskPath=join(OWN,'media/inquiry-finite-model.html')
const bytes=await readFile(taskPath)
const browser=await chromium.launch({headless:true})
const runs=[]
try{
 for(const width of [360,680]){
  const page=await browser.newPage({viewport:{width,height:900}})
  const errors=[];page.on('pageerror',e=>errors.push(e.message))
  await page.goto(pathToFileURL(taskPath).href)
  const output=async()=>JSON.parse(await page.locator('#output').innerText())
  let data=await output();assert.equal(data.modelOnly,true);assert.equal(data.stages.length,1)
  await page.locator('#next').click();data=await output();assert.equal(data.stages.length,2)
  assert.deepEqual(data.stages[1].moderately_moist,[8,9])
  await page.locator('#next').click();data=await output();assert.equal(data.stages.length,3)
  assert.deepEqual(data.stages[2].dry,[1,1]);assert.deepEqual(data.stages[2].moderately_moist,[16,15]);assert.deepEqual(data.stages[2].submerged,[5,6])
  assert.equal(await page.locator('#next').isDisabled(),true)
  await page.locator('#reset').click();assert.equal((await output()).stages.length,1)
  await page.selectOption('#scenario','aquatic_light');assert.equal((await output()).stages.length,1)
  await page.locator('#next').click();data=await output()
  assert.deepEqual(data.stages[1].low_light_delta_oxygen_mg_per_L,[0.2,0.3,0.1])
  assert.deepEqual(data.stages[1].medium_light_delta_oxygen_mg_per_L,[0.7,0.8,0.6])
  assert.deepEqual(data.stages[1].high_light_delta_oxygen_mg_per_L,[0.8,0.9,0.7])
  await page.locator('#next').click();data=await output()
  assert.equal(data.stages[2].temperature_C,28);assert.equal(data.stages[2].high_light_delta_oxygen_mg_per_L,0.4)
  await page.locator('#record').fill('Technical test of local record field; no learner data.')
  assert.equal(await page.locator('#record').inputValue(),'Technical test of local record field; no learner data.')
  const geometry=await page.evaluate(()=>({viewportWidth:innerWidth,documentWidth:document.documentElement.scrollWidth}))
  assert.equal(errors.length,0)
  runs.push({viewportWidth:width,germinationStagesActuallyRevealed:3,aquaticStagesActuallyRevealed:3,resetActuallyExecuted:true,recordFieldActuallyWritable:true,pageErrors:errors,geometry,actualLearnerPerformance:false,actualExperimentPerformed:false})
  await page.close()
 }
}finally{await browser.close()}
const report={schemaVersion:1,role:'actual offline Chromium execution of own finite didactic task medium; no scientific/learner approval',executedAt:new Date().toISOString(),taskInput:{path:relative(ROOT,taskPath),sha256:'sha256:'+createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length},runs,exitCode:0,independentApproval:false,humanApproval:false}
await writeFile(join(OWN,'checks/finite-task-browser.actual-terminal.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({viewports:runs.map(r=>r.viewportWidth),actualFiniteScenarios:2,exitCode:0}))
