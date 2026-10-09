// SPDX-License-Identifier: Apache-2.0
// Actual bounded DOM controls/data/layout check; no real laboratory performance.
import {createRequire} from 'node:module'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {dirname,join,relative} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import assert from 'node:assert/strict'
const ROOT=process.cwd(),OWN=dirname(fileURLToPath(import.meta.url)),require=createRequire(join(ROOT,'app/package.json')),{chromium}=require('playwright')
const file=join(OWN,'media/finite-inquiry-and-preparation.html'),bytes=await readFile(file),browser=await chromium.launch({headless:true}),runs=[]
try{for(const width of [360,680]){
 const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(file).href)
 const output=async()=>JSON.parse(await page.locator('#output').innerText())
 await page.locator('#start').click();assert.equal((await output()).configured,false);assert.match(await page.locator('#notice').innerText(),/not yet confirmed/)
 const germination=[]
 for(const [water,expected] of [['dry',[1,1]],['moderately_moist',[16,15]],['submerged',[5,6]]]){
  await page.selectOption('#water',water);await page.selectOption('#temperature','22');await page.locator('#controls').check();await page.locator('#start').click()
  let o=await output();assert.equal(o.settings.water,water);assert.equal(o.settings.temperature_C,22);assert.deepEqual(o.replicate_germinated_counts,[0,0]);assert.equal(o.day,0)
  await page.locator('#next').click();assert.equal((await output()).day,2);await page.locator('#next').click();o=await output();assert.equal(o.day,4);assert.deepEqual(o.replicate_germinated_counts,expected);germination.push(o)
  await page.locator('#reset').click()
 }
 await page.selectOption('#scenario','aquatic_light');const oxygen=[]
 for(const [light,delta] of [['low',[0.2,0.3,0.1]],['medium',[0.7,0.8,0.6]],['high',[0.8,0.9,0.7]]]){
  await page.selectOption('#light',light);await page.selectOption('#temperature','20');await page.selectOption('#baseline','6');await page.locator('#controls').check();await page.locator('#start').click()
  let o=await output();assert.equal(o.settings.light,light);assert.equal(o.settings.temperature_C,20);assert.deepEqual(o.replicate_initial_oxygen_mg_per_L,[6,6,6]);assert.deepEqual(o.replicate_measured_oxygen_mg_per_L,[6,6,6])
  await page.locator('#next').click();o=await output();assert.deepEqual(o.replicate_delta_oxygen_mg_per_L,delta)
  for(let i=0;i<3;i++)assert.ok(Math.abs(o.replicate_measured_oxygen_mg_per_L[i]-o.replicate_initial_oxygen_mg_per_L[i]-delta[i])<1e-12)
  oxygen.push(o);await page.locator('#reset').click()
 }
 await page.selectOption('#light','high');await page.selectOption('#temperature','28');await page.locator('#controls').check();await page.locator('#start').click();await page.locator('#next').click();const disturbance=await output();assert.deepEqual(disturbance.replicate_delta_oxygen_mg_per_L,[0.4,0.5,0.3]);assert.equal(disturbance.settings.temperature_C,28)
 await page.locator('#reset').click();await page.selectOption('#scenario','organ_preparation');await page.locator('#controls').check();await page.locator('#start').click();assert.equal((await output()).completed_preparation_steps.length,0)
 for(let step=1;step<=4;step++){await page.locator('#next').click();assert.equal((await output()).completed_preparation_steps.length,step)}
 assert.equal(await page.locator('#next').isDisabled(),true);const organ=await output()
 const geometry=await page.evaluate(()=>({viewportWidth:innerWidth,documentWidth:document.documentElement.scrollWidth}));assert.equal(geometry.documentWidth,width,'Actual document overflow at '+width)
 assert.deepEqual(errors,[]);runs.push({viewportWidth:width,geometry,actualWaterSelections:germination,actualLightSelectionsAndMeasurements:oxygen,actualTemperatureDisturbance:disturbance,actualPermittedPreparationActions:organ,missingControlBlocked:true,actualLearnerPerformance:false,actualRealExperiment:false,pageErrors:errors});await page.close()
}}finally{await browser.close()}
await mkdir(join(OWN,'checks'),{recursive:true});const out={schemaVersion:1,role:'actual controlled finite DOM model and exact no-overflow check; no empirical/learner/scientific approval',executedAt:new Date().toISOString(),actualHTML:{path:relative(ROOT,file),sha256:'sha256:'+createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length},runs,realPracticalSourceDutiesRetained:true,actualRealLaboratoryOrFieldPerformance:false,independentApproval:false,humanApproval:false,exitCode:0}
await writeFile(join(OWN,'checks/remediated-task-controls-data-layout.actual-terminal.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({actualViewports:[360,680],actualWaterChoices:3,actualLightChoices:3,actualReplicatesAndDeltas:true,actualPreparationActions:4,noOverflow:true,exitCode:0}))
