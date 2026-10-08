// SPDX-License-Identifier: Apache-2.0
// Actual browser images for independent inspection; these grant no approval.
import {chromium} from '../../../../../../app/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const own=dirname(fileURLToPath(import.meta.url));
const root=resolve(own,'../../../../../..');
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const manifestPath=resolve(root,process.argv[2]);
const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
if(manifest.images.length!==1)throw new Error('Exactly1 author candidates required');
const browser=await chromium.launch({headless:true});
try{
 for(const row of manifest.images){
  const source=resolve(root,row.path);
  if(sha(source)!==row.sha256.replace('sha256:',''))throw new Error('Changed frozen PNG '+row.goalId);
  const out=resolve(own,'inspection-captures-amnion14-v3',row.goalId);mkdirSync(out,{recursive:true});
  const captures=[];
  for(const width of [360,680]){
   const page=await browser.newPage({viewport:{width,height:600},deviceScaleFactor:1});
   await page.setContent('<html><body style="margin:0"><img style="display:block;width:100%;max-width:680px;height:auto;max-height:448px;object-fit:contain" src="data:image/png;base64,'+readFileSync(source).toString('base64')+'"></body></html>');
   await page.locator('img').evaluate(el=>el.decode());
   const measured=await page.locator('img').evaluate(el=>{const b=el.getBoundingClientRect();const c=getComputedStyle(el);return{naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,renderedWidth:b.width,renderedHeight:b.height,objectFit:c.objectFit}});
   const path=resolve(out,'actual-selected-'+width+'px.png');
   await page.locator('img').screenshot({path});
   captures.push({width,path:relative(root,path),sha256:sha(path),measured});
   await page.close();
  }
  writeFileSync(resolve(out,'chromium-captures.actual.json'),JSON.stringify({goalId:row.goalId,sourcePath:row.path,sourceSha256:sha(source),renderer:'actual Playwright Chromium element screenshot with documented image-card sizing',scope:'image sizing only; not a full app/device acceptance test',deviceScaleFactor:1,captures,authorInspectionOnly:true,independentApproval:'pending',humanApproval:false},null,2)+'\n',{flag:'wx'});
 }
}finally{await browser.close()}
console.log('Captured actual1 PNG candidates at360/680px; independent decisions pending.');
