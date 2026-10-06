// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {createRequire} from 'node:module';
const root=process.cwd();const require=createRequire(path.join(root,'app/package.json'));const {chromium}=require('playwright');
const own=path.dirname(new URL(import.meta.url).pathname);const candidate=path.join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-bacterial-structure-fission-native-candidate-v1');
const handoff=JSON.parse(fs.readFileSync(path.join(candidate,'review-handoff.actual.json'),'utf8'));const isolate=handoff.isolationRoot;
const html=fs.readFileSync(path.join(root,handoff.actualHTMLPath));const model=JSON.parse(fs.readFileSync(path.join(root,handoff.bookModelPath),'utf8'));
const served=[];const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1000,height:900}});
await page.route('http://qa.local/**', async route=>{const url=new URL(route.request().url());if(url.pathname==='/book'){await route.fulfill({body:html,contentType:'text/html'});return;}
const file=path.join(isolate,'app/public',decodeURIComponent(url.pathname));if(fs.existsSync(file)){const body=fs.readFileSync(file);served.push({path:url.pathname,sha256:crypto.createHash('sha256').update(body).digest('hex')});await route.fulfill({body,contentType:url.pathname.endsWith('.png')?'image/png':'application/octet-stream'});return;}
await route.fulfill({status:404,body:'Missing local QA asset'});});
await page.goto('http://qa.local/book');await page.waitForFunction(()=>Array.from(document.images).every(image=>image.complete&&image.naturalWidth>0));
const imageProof=await page.locator('img').evaluateAll(images=>images.map(image=>({src:image.getAttribute('src'),naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight})));
for(const goal of model.pages){const section=page.locator('#'+goal.anchor);if(await section.count()!==1)throw new Error('Missing actual current goal section '+goal.goalId);await section.screenshot({path:path.join(own,'independent-html-'+goal.goalId+'.png')});}
fs.writeFileSync(path.join(own,'independent-html-actual-local-render.receipt.json'),JSON.stringify({htmlSHA256:crypto.createHash('sha256').update(html).digest('hex'),imageProof,served,sections:model.pages.map(page=>page.goalId),externalNetworkUsed:false,scientificDecisionPending:true,humanApproval:false},null,2)+'\n');await browser.close();
