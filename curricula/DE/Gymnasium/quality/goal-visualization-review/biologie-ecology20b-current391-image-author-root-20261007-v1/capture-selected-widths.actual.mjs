// SPDX-License-Identifier: Apache-2.0
import {chromium} from '../../../../../../app/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const own=dirname(fileURLToPath(import.meta.url));const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const browser=await chromium.launch({headless:true});try{for(const [id,v]of [["ea5d75af-d97f-593a-bea4-722a41d12eb8", 2], ["5ef8ffbf-aed6-5952-910a-1553580bac54", 2], ["5bfb8ede-235c-580f-b2c9-4eb84bba4d0a", 1], ["52d195f7-af13-570a-adc5-0eb27eaab6da", 1], ["914fb22b-e19e-5f5e-adfd-eff27bf5f1f5", 1], ["4c037a86-d04e-58c7-85e8-75a5b26b8d36", 2], ["68bb29c8-7ef2-5c0c-a072-0c7dfc87a76c", 1], ["ac4a650d-45a9-519d-9e4d-1f87910f8844", 1], ["e6120e08-b704-553c-a038-b4e7a82828d1", 1], ["258218b2-8b29-559b-b48f-9525b7cdefbc", 1], ["ca6d4912-f4d2-5c57-86d9-70aa090cc32f", 1], ["25eaa5cf-e8f9-573d-8a53-8ae9d1cd02e2", 2]]){
 const src=resolve(own,'candidates',id,'candidate-v'+v+'.png');const out=resolve(own,'inspection-captures',id);mkdirSync(out,{recursive:true});const captures=[];
 for(const width of [360,680]){const page=await browser.newPage({viewport:{width,height:600},deviceScaleFactor:1});await page.setContent('<html><body style="margin:0"><img style="display:block;width:'+width+'px;height:auto" src="data:image/png;base64,'+readFileSync(src).toString('base64')+'"></body></html>');await page.locator('img').evaluate(el=>el.decode());const path=resolve(out,'actual-v'+v+'-'+width+'px.png');await page.locator('img').screenshot({path});captures.push({width,path:relative(own,path),sha256:sha(path)});await page.close();}
 writeFileSync(resolve(out,'chromium-captures-v'+v+'.actual.json'),JSON.stringify({goalId:id,sourcePath:relative(own,src),sourceSha256:sha(src),renderer:'actual Playwright Chromium element screenshot',deviceScaleFactor:1,captures,authorInspectionOnly:true,independentApproval:'pending',humanApproval:false},null,2)+'\n',{flag:'wx'});
 }}finally{await browser.close()};process.stdout.write('Captured twelve actual PNG candidates at360/680; no approvals.\n');
