// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {spawn} from 'node:child_process'
import {mkdtempSync,writeFileSync} from 'node:fs'
import {createInterface} from 'node:readline'
import {join} from 'node:path'
import {chromium} from '/home/enpasos/projects/skillpilot/app/node_modules/playwright/index.mjs'

const base=process.argv[2],output=process.argv[3]
const scratch=mkdtempSync('/dev/shm/gk22-browser-')
const server=spawn('python3',['-B',join(base,'reference.py'),'--serve','--db',join(scratch,'case.sqlite')],{stdio:['ignore','pipe','pipe']})
const stderr:string[]=[];server.stderr.on('data',chunk=>stderr.push(String(chunk)))
const line=await new Promise<string>((resolve,reject)=>{
 const reader=createInterface({input:server.stdout});reader.once('line',line=>{reader.close();resolve(line)})
 server.once('exit',code=>reject(new Error('Fixture server exited '+code+': '+stderr.join(''))))
})
const ready=JSON.parse(line);assert.equal(ready.fixtureOnly,true)
const origin=new URL(ready.url).origin
const browser=await chromium.launch({headless:true})
const records=[]
try{
 for(const width of [320,768,1024]){
  const page=await browser.newPage({viewport:{width,height:900}})
  const response=await page.goto(ready.url);assert.equal(response?.status(),200)
  assert.deepEqual(await page.locator('[data-title]').allTextContents(),['Fotobasis','Audiolabor'])
  await page.getByRole('link',{name:'Weiter',exact:true}).click()
  assert.deepEqual(await page.locator('[data-title]').allTextContents(),['Datenschutz-Werkstatt','Archiv <offen>'])
  assert.equal(await page.locator('offen').count(),0)
  assert.equal(new URL(page.url()).searchParams.get('maxPreis'),'30')
  assert.equal(new URL(page.url()).searchParams.get('page'),'2')
  await page.getByRole('link',{name:'Zurueck',exact:true}).click()
  await page.getByLabel('Hoechstpreis in EUR').fill('20')
  await page.getByRole('button',{name:'Suchen',exact:true}).click()
  assert.deepEqual(await page.locator('[data-title]').allTextContents(),['Fotobasis','Datenschutz-Werkstatt'])
  records.push({width,actualGetFormSubmission:true,actualNextAndPreviousLinks:true,filterPreserved:true,escapedTitleRenderedAsText:true})
  await page.close()
 }
 const page=await browser.newPage()
 for(const query of ['maxPreis=0%20OR%201%3D1&page=1','maxPreis=30&page=-1','maxPreis=30&page=1&page=2']){
  assert.equal((await page.request.get(origin+'/kurse?'+query)).status(),400)
 }
 assert.equal((await page.request.post(origin+'/buchen',{form:{kid:'40',csrfToken:'wrong'}})).status(),403)
 await page.goto(ready.url)
 const booking=page.getByRole('button',{name:'Kurs 40 buchen',exact:true})
 const request=page.waitForResponse(response=>response.url()===origin+'/buchen')
 await booking.click();assert.equal((await request).status(),201)
 assert.equal(await page.locator('body').innerText(),'Gebucht')
 await page.close()
 writeFileSync(output,JSON.stringify({purpose:'actual-local-reference-browser-not-SkillPilot-or-host-acceptance',
  records,httpNegativeStatuses:[400,400,400,403],actualPostFormStatus:201,
  realLearnerSessionUsed:false,independentContentApproval:false,sourceOrQaWrites:false,serverStderr:stderr},null,2)+'\n')
 console.log(JSON.stringify({viewports:records.length,actualGetPostAndPaging:true,negativeRequests:4,exit:0}))
}finally{
 await browser.close();server.kill('SIGTERM')
}
