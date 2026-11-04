// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs'
import path from 'node:path'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
const here=path.dirname(fileURLToPath(import.meta.url))
let root=here
while(!fs.existsSync(path.join(root,'LICENSING.md'))) {
  const parent=path.dirname(root)
  if(parent===root)throw new Error('SkillPilot checkout not found')
  root=parent
}
const require=createRequire(import.meta.url)
const {chromium}=require(path.join(root,'app/node_modules/playwright'))
const browser=await chromium.launch({headless:true,args:['--no-sandbox']})
try {
  const page=await browser.newPage({viewport:{width:780,height:1080},deviceScaleFactor:2})
  await page.setContent('<!doctype html><meta charset="utf-8"><body style="margin:0"></body>')
  await page.evaluate(svg=>{document.body.innerHTML=svg},fs.readFileSync(path.join(here,'given-panels.svg'),'utf8'))
  await page.evaluate(()=>document.fonts.ready)
  await page.locator('svg').screenshot({path:path.join(here,'given-panels.png')})
} finally {await browser.close()}
