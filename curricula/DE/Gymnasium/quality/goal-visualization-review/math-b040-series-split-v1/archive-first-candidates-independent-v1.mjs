import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
// Archive only: the two new children have no prior active visualization.
const root="curricula/DE/Gymnasium/quality/goal-visualization-review/math-b040-series-split-v1";
const jobs=[{id:'630bb145-9a3f-5c88-ab5a-fb69a9bb76e4',stamp:'2026-09-07T00-38-09-220Z'},{id:'74b5a01b-c086-51d0-bc66-046029c92ef7',stamp:'2026-09-07T00-38-12-062Z'}];
const digest=p=>'sha256:'+createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const receipts=[];
for(const j of jobs){
 const base='tmp/goal-visualizations/'+j.id,stem=j.id+'.generated.'+j.stamp,dest=root+'/'+j.id+'/candidate-1';
 const names=fs.readdirSync(base+'/generated').filter(n=>n.startsWith(stem+'.')).sort();
 for(const s of ['.jpg','.image-reconstruction-prompt.de.md','.image-reconstruction-request.json','.image-reconstruction-response.json'])assert(names.includes(stem+s));
 const sources=[...names.map(n=>base+'/generated/'+n),...['nano-banana-prompt.de.md','nano-banana-request.json','nano-banana-response-summary.json'].map(n=>base+'/'+n)];
 const authored=root+'/'+j.id+'/attempt-1.prompt.de.md';if(fs.existsSync(authored))sources.push(authored);
 const receipt=dest+'/archive-receipt.json';assert(!fs.existsSync(receipt));
 const files=sources.map(source=>{const target=dest+'/'+path.basename(source);assert(fs.existsSync(source));fs.mkdirSync(dest,{recursive:true});if(fs.existsSync(target))assert.equal(digest(target),digest(source));else fs.copyFileSync(source,target);assert.equal(digest(target),digest(source));return {path:target,copiedFrom:source,sha256:digest(target),bytes:fs.statSync(target).size};});
 receipts.push({path:receipt,record:{schemaVersion:1,archivedAt:new Date().toISOString(),goalId:j.id,candidateNumber:1,provider:'Google Gemini / Nano Banana Pro (gemini-3-pro-image)',reconstructionModel:'gemini-2.5-flash',imported:false,reviewAuthority:'archive_only',humanApprovalClaimed:false,originalFiles:[],originalStatus:'not_present: new split child with no active visualization',candidateFiles:files,imageSha256:files.find(f=>f.path.endsWith('.jpg')).sha256,traceNote:'Exact generated timestamp stem. Per-goal request/prompt/summary copied before a subsequent generation; exact invocation start unavailable.'}});
}
console.log(JSON.stringify({patch:'*** Begin Patch\n'+receipts.map(r=>'*** Add File: '+r.path+'\n'+JSON.stringify(r.record,null,2).split('\n').map(l=>'+'+l).join('\n')+'\n').join('')+'*** End Patch',images:receipts.map(r=>({goalId:r.record.goalId,candidateNumber:1,path:r.record.candidateFiles.find(f=>f.path.endsWith('.jpg')).path,sha256:r.record.imageSha256}))}));

