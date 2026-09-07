import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

// Mechanical archive only. No import, active asset, canonical, QA or review decision write.
const mathRoot='curricula/DE/Gymnasium/quality/goal-visualization-review/math-b040-integrals-and-series-v1';
const physicsRoot='curricula/DE/Gymnasium/quality/goal-visualization-review/physics-b040-orbits-and-cosmology-v1';
const jobs=[
 {id:'1b664036-3c29-5d94-9f42-97069aaa2c53',stamp:'2026-09-07T00-28-35-433Z',number:2,root:mathRoot},
 {id:'df5eeadd-414e-50ae-84ec-7e5dbf7449d6',stamp:'2026-09-07T00-28-32-038Z',number:2,root:mathRoot},
 {id:'ece68088-71a8-466b-874c-09e6baac19fc',stamp:'2026-09-07T00-28-31-566Z',number:2,root:mathRoot},
 {id:'5042fd2b-bab2-50be-8144-c9ccf5618615',stamp:'2026-09-07T00-28-31-554Z',number:2,root:mathRoot},
 {id:'60211ac1-cbe1-5182-87ef-673a068c5b0a',stamp:'2026-09-07T00-25-38-249Z',number:4,root:physicsRoot},
];
const digest=p=>'sha256:'+createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const descriptor=p=>({path:p,sha256:digest(p),bytes:fs.statSync(p).size});
const receipts=[];
for(const job of jobs){
 const temp='tmp/goal-visualizations/'+job.id;
 const stem=job.id+'.generated.'+job.stamp;
 const base=job.root+'/'+job.id;
 const dest=base+'/candidate-'+job.number;
 const names=fs.readdirSync(temp+'/generated').filter(n=>n.startsWith(stem+'.')).sort();
 for(const suffix of ['.jpg','.image-reconstruction-prompt.de.md','.image-reconstruction-request.json','.image-reconstruction-response.json'])assert(names.includes(stem+suffix),'Missing exact generation artifact '+stem+suffix);
 const sources=[...names.map(n=>temp+'/generated/'+n),...['nano-banana-prompt.de.md','nano-banana-request.json','nano-banana-response-summary.json'].map(n=>temp+'/'+n),base+'/attempt-'+job.number+'.prompt.de.md'];
 const receiptPath=dest+'/archive-receipt.json';
 assert(!fs.existsSync(receiptPath),'Refuse existing receipt overwrite '+receiptPath);
 const originalDir=base+'/original';assert(fs.existsSync(originalDir),'Missing already retained originals');
 const originalFiles=fs.readdirSync(originalDir).filter(n=>fs.statSync(originalDir+'/'+n).isFile()).map(n=>descriptor(originalDir+'/'+n));
 const candidateFiles=sources.map(src=>{
  assert(fs.existsSync(src),'Missing source '+src);
  const target=dest+'/'+path.basename(src);fs.mkdirSync(path.dirname(target),{recursive:true});
  if(fs.existsSync(target))assert.equal(digest(target),digest(src),'Refuse archive mismatch '+target);
  else fs.copyFileSync(src,target);
  assert.equal(digest(target),digest(src));return {...descriptor(target),copiedFrom:src};
 });
 const image=candidateFiles.find(f=>f.path.endsWith('.jpg'));assert(image);
 receipts.push({path:receiptPath,record:{schemaVersion:1,archivedAt:new Date().toISOString(),goalId:job.id,candidateNumber:job.number,provider:'Google Gemini / Nano Banana Pro (gemini-3-pro-image, reference-image input)',reconstructionModel:'gemini-2.5-flash',imported:false,reviewAuthority:'archive_only',humanApprovalClaimed:false,originalFiles,candidateFiles,imageSha256:image.sha256,traceNote:'Generated and reconstruction files are bound to the exact requested timestamp stem. Current per-goal request/prompt/response-summary bytes were archived before any subsequent run; no precise invocation-start claim is made.'}});
}
console.log(JSON.stringify({archived:jobs.length,patch:'*** Begin Patch\n'+receipts.map(({path,record})=>'*** Add File: '+path+'\n'+JSON.stringify(record,null,2).split('\n').map(s=>'+'+s).join('\n')+'\n').join('')+'*** End Patch',images:receipts.map(({record})=>({goalId:record.goalId,candidateNumber:record.candidateNumber,path:record.candidateFiles.find(f=>f.path.endsWith('.jpg')).path,sha256:record.imageSha256}))}));
