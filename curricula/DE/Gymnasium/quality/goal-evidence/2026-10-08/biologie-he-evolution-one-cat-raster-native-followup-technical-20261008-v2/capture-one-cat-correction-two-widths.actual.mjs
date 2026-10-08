// SPDX-License-Identifier: Apache-2.0
// Actual browser-width captures of exact candidate bytes, never visual approval.
import assert from 'node:assert/strict';
import {chromium} from '../../../../../../../app/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync,mkdirSync,renameSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const own=dirname(fileURLToPath(import.meta.url)),root=resolve('.');
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const manifestPath=resolve(own,'selected-eighteen-one-corrected-seventeen-exact.author-input.json'),manifest=JSON.parse(readFileSync(manifestPath,'utf8'));assert.equal(manifest.images.length,18);
const atomicJSON=(p,v)=>{const tmp=p+'.'+process.pid+'.tmp';writeFileSync(tmp,JSON.stringify(v,null,2)+'\n',{flag:'wx'});renameSync(tmp,p)};
const browser=await chromium.launch({headless:true});
try {
 for(const row of manifest.images.filter(row=>row.changedTarget)){
  const source=resolve(root,row.selectedPath);assert.equal(sha(source),row.sha256);
  const out=resolve(own,'width-captures',row.goalId);mkdirSync(out,{recursive:true});const captures=[];
  for(const width of [360,680]){
   const page=await browser.newPage({viewport:{width,height:600},deviceScaleFactor:1});
   try {
    await page.setContent('<html><body style="margin:0"><img style="display:block;width:100%;max-width:680px;height:auto;max-height:448px;object-fit:contain" src="data:image/png;base64,'+readFileSync(source).toString('base64')+'"></body></html>');
    await page.locator('img').evaluate(el=>el.decode());
    const measured=await page.locator('img').evaluate(el=>{const b=el.getBoundingClientRect(),c=getComputedStyle(el);return {naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,renderedWidth:b.width,renderedHeight:b.height,objectFit:c.objectFit}});
    assert.equal(measured.naturalWidth,1672);assert.equal(measured.naturalHeight,941);assert.equal(measured.renderedWidth,width);
    const path=resolve(out,'actual-selected-'+width+'px.png');await page.locator('img').screenshot({path});
    captures.push({width,path:relative(root,path),sha256:sha(path),measured});
   } finally {await page.close()}
  }
  atomicJSON(resolve(out,'chromium-captures.actual.json'),{goalId:row.goalId,sourcePath:row.selectedPath,sourceSha256:sha(source),originalPNG:row.actualSource,renderer:'Actual Playwright Chromium element screenshots with documented image-card sizing',scope:'Image-card sizing only; no real device/full application acceptance asserted',deviceScaleFactor:1,captures,independentVisualApproval:'pending',generationIsNotApproval:true,humanApproval:false,activeWrites:0});
  process.stdout.write('Captured '+row.goalId+' at360/680px\n');
 }
} finally {await browser.close()}
process.stdout.write('Actual1 corrected PNG,2 width captures; independent final review pending.\n');
