// SPDX-License-Identifier: Apache-2.0
import {chromium} from '../../../../../../app/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const own=dirname(fileURLToPath(import.meta.url));const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const browser=await chromium.launch({headless:true});try{for(const [id,v]of [['52d195f7-af13-570a-adc5-0eb27eaab6da',2]]){
 const src=resolve(own,'candidates',id,'candidate-v'+v+'.png');const out=resolve(own,'inspection-captures',id);mkdirSync(out,{recursive:true});const captures=[];
 for(const width of [360,680]){const page=await browser.newPage({viewport:{width,height:600},deviceScaleFactor:1});await page.setContent('<html><body style="margin:0"><img style="display:block;width:'+width+'px;height:auto" src="data:image/png;base64,'+readFileSync(src).toString('base64')+'"></body></html>');await page.locator('img').evaluate(el=>el.decode());const path=resolve(out,'actual-v'+v+'-'+width+'px.png');await page.locator('img').screenshot({path});captures.push({width,path:relative(own,path),sha256:sha(path)});await page.close();}
 writeFileSync(resolve(out,'chromium-captures-v'+v+'.actual.json'),JSON.stringify({goalId:id,sourcePath:relative(own,src),sourceSha256:sha(src),renderer:'actual Playwright Chromium element screenshot',deviceScaleFactor:1,captures,authorInspectionOnly:true,independentApproval:'pending',humanApproval:false},null,2)+'\n',{flag:'wx'});
 }}finally{await browser.close()};process.stdout.write('Captured one corrected model actual PNG candidate at360/680; no approvals.\n');
