import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { chromium } from 'playwright'
import tailwindcss from '@tailwindcss/vite'
import { startViteTestServer } from '../scripts/viteTestServer'
const appRoot=process.cwd()
const evidence=path.resolve(appRoot,'../curricula/DE/Gymnasium/quality/learning-units/physics-directed-quantity-arrows-20261126-v1/k4/v3')
const candidate=JSON.parse(await readFile(path.join(evidence,'candidate.goal.json'),'utf8'))
await writeFile(path.join(appRoot,'tmp/k4-v3-candidate.json'),JSON.stringify(candidate))
await writeFile(path.join(appRoot,'tmp/k4-v3-preview.html'),'<html><body><div id="root"></div><script type="module" src="/tmp/k4-v3-preview.tsx"></script></body></html>')
await writeFile(path.join(appRoot,'tmp/k4-v3-preview.tsx'),`import React from 'react';import{createRoot}from'react-dom/client';import{GoalCard}from'/src/components/GoalCard';import{LanguageProvider}from'/src/contexts/LanguageContext';import{convertLearningGoal}from'/src/goalTypes';import'/src/index.css';import c from'./k4-v3-candidate.json';const en=new URLSearchParams(location.search).get('lang')==='en';localStorage.setItem('skillpilot_lang',en?'en':'de');const g=convertLearningGoal(c);if(en){g.title=c.titleEn;g.description=c.descriptionEn;g.examData={...g.examData,taskContent:c.examData.taskContentEn};}g.examData={...g.examData,reviewStatus:'released'};createRoot(document.getElementById('root')).render(<LanguageProvider><main style={{padding:12}}><GoalCard goal={g} masteryValue={0} showLearnerTools={false} readOnly hideTechnicalStructureUi /></main></LanguageProvider>);`)
await mkdir(path.join(evidence,'author/render'),{recursive:true})
const server=await startViteTestServer(appRoot,'tmp/k4-v3-preview.html',{plugins:[tailwindcss()]})
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage','--no-sandbox']})
const observations=[]
try{
 for(const lang of ['de','en'])for(const width of [360,960]){
  const context=await browser.newContext({viewport:{width,height:1000}})
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message))
  await page.goto(server.baseUrl+'/tmp/k4-v3-preview.html?lang='+lang,{waitUntil:'networkidle'})
  const img=page.locator('img[src$="arrow-scale-stimulus-v3.png"]');await img.waitFor({state:'visible'})
  assert.equal(await img.evaluate((x:HTMLImageElement)=>x.complete&&x.naturalWidth===720),true)
  const body=await page.locator('body').innerText()
  assert.ok(body.includes(lang==='de'?'Lies aus der Skizze ab':'Read from the sketch'))
  assert.ok(!body.includes(lang==='de'?'3 cm ·':'The ruler gives a length of 3 cm'))
  const box=await img.boundingBox();assert.ok(box&&box.width>230&&box.x>=0&&box.x+box.width<=width+1)
  const pathName='author/render/goalcard-'+lang+'-'+width+'.png'
  await page.screenshot({path:path.join(evidence,pathName),fullPage:true})
  observations.push({lang,width,image:await img.getAttribute('src'),naturalWidth:720,displayBox:box,pageErrors:errors,screenshot:pathName})
  assert.deepEqual(errors,[])
  await context.close()
 }
 const sha=(x:string)=>createHash('sha256').update(x).digest('hex')
 const source=await readFile(path.join(appRoot,'src/components/GoalCard.tsx'),'utf8')
 await writeFile(path.join(evidence,'author/render.actual.json'),JSON.stringify({status:'pass',scope:'actual-GoalCard-local-Chromium-task-rendering-not-host-acceptance',candidateSha256:sha(await readFile(path.join(evidence,'candidate.goal.json'),'utf8')),goalCardSourceSha256:sha(source),previewOnlyStatusOverride:'released only in the fixture so needs_review candidate can be displayed; canonical candidate is unchanged',englishProjection:'fixture selects existing titleEn/descriptionEn/taskContentEn for display',observations},null,2)+'\n')
 console.log(JSON.stringify({status:'pass',renders:observations.length,evidence:path.join(evidence,'author/render.actual.json')}))
}finally{await browser.close();await server.close();for(const name of ['k4-v3-candidate.json','k4-v3-preview.html','k4-v3-preview.tsx'])await rm(path.join(appRoot,'tmp',name),{force:true})}
