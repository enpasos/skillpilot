import { chromium } from '/home/enpasos/projects/skillpilot/app/node_modules/playwright/index.mjs'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
const [nativePath, fixturePath, outputPath] = process.argv.slice(2).map(x=>resolve(x))
const nativeBytes=readFileSync(join(nativePath,'native-views.json'))
const native=JSON.parse(nativeBytes)
const contexts=native.contexts.filter(c=>c.scope.stage==='CrossStage'&&c.scope.courseProfile==='GK+LK'&&!c.authorization.startsWith('unsupported'))
mkdirSync(outputPath,{recursive:true})
const browser=await chromium.launch({headless:true})
const page=await browser.newPage({viewport:{width:1720,height:1000},reducedMotion:'reduce'})
const errors=[],writes=[],boards=[]
page.on('pageerror',e=>errors.push(e.message))
await page.route('**/*',async r=>{if(!['GET','HEAD','OPTIONS'].includes(r.request().method())){writes.push(r.request().method()+' '+r.request().url());return r.abort()}return r.continue()})
const titles=()=>page.locator('.lum-node-main').evaluateAll(ns=>ns.map(n=>n.getAttribute('title')))
const settle=async(expected)=>{
 await page.waitForFunction(title=>[...document.querySelectorAll('.lum-node-main')].some(n=>n.getAttribute('title')===title),expected)
 await page.waitForTimeout(350)
 assert.equal(await page.locator('.lum-legend-backward').count(),0,'no backward legend')
 assert.equal(await page.locator('[data-testid="learner-map-layout-error"]').count(),0,'no layout error')
}
try{
 for(const context of contexts)for(const subject of ['mathematik','physik']){
  const name=context.id.replaceAll(':','_').replaceAll('+','-')+'-'+subject
  const bytes=readFileSync(join(fixturePath,name+'.json'));const {fixture}=JSON.parse(bytes)
  for(const stage of ['sek1','sek2']){
   const parent=fixture.entries[fixture.unitEntryIds[stage]];assert(parent&&parent.children.length,name+stage)
   const params=new URLSearchParams({fixture:name,stage})
   await page.goto('http://127.0.0.1:5199/tmp/laender-kartenpruefung/index.html?'+params,{waitUntil:'networkidle'})
   await settle(fixture.entries[parent.children[0]].title)
   const record=async(id,level)=>{
    const screenshot=['canonical','DE-HE','DE-BY','DE-BW','DE-NW'].some(x=>context.id.startsWith(x))?join(outputPath,name+'-'+stage+'-'+level+'.png'):null
    if(screenshot)await page.screenshot({path:screenshot})
    boards.push({context:context.id,subject,stage,level,scopeId:id,titles:await titles(),screenshot,fixtureSha256:createHash('sha256').update(bytes).digest('hex')})
   }
   await record(parent.id,'stage')
   const inner=parent.children.map(id=>fixture.entries[id]).find(e=>e.kind==='unit'&&e.children?.length)
   if(inner){
    await page.locator('.lum-node-main[title='+JSON.stringify(inner.title)+']').first().dblclick()
    await settle(fixture.entries[inner.children[0]].title);await record(inner.id,'inner')}
  }
  console.log(context.id+' '+subject+' PASS')
 }
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[])
 writeFileSync(join(outputPath,'actual.json'),JSON.stringify({at:new Date().toISOString(),nativeViewsSha256:createHash('sha256').update(nativeBytes).digest('hex'),basis:'Read-only actual LearningUnitMap component; fresh native views and complete backend scope; stage and first nested board for every supported combined-course Land/duration and canonical context',contexts:contexts.length,boards,errors,writes},null,2)+'\n')
}catch(error){await page.screenshot({path:join(outputPath,'failure.png')});writeFileSync(join(outputPath,'failure.json'),JSON.stringify({error:String(error),boards,errors,writes},null,2)+'\n');throw error}
finally{await browser.close()}
