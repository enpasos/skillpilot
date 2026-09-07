import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
// Scoped mechanical archive. Copies exact candidate bytes only; emits receipt patch.
const jobs=[
  {
    "id": "1b664036-3c29-5d94-9f42-97069aaa2c53",
    "stamp": "2026-09-07T00-47-03-958Z",
    "number": 3,
    "root": "curricula/DE/Gymnasium/quality/goal-visualization-review/math-b040-integrals-and-series-v1"
  },
  {
    "id": "df5eeadd-414e-50ae-84ec-7e5dbf7449d6",
    "stamp": "2026-09-07T00-47-03-181Z",
    "number": 3,
    "root": "curricula/DE/Gymnasium/quality/goal-visualization-review/math-b040-integrals-and-series-v1"
  },
  {
    "id": "630bb145-9a3f-5c88-ab5a-fb69a9bb76e4",
    "stamp": "2026-09-07T00-47-05-709Z",
    "number": 2,
    "root": "curricula/DE/Gymnasium/quality/goal-visualization-review/math-b040-series-split-v1"
  }
];
const digest=p=>'sha256:'+createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const desc=p=>({path:p,sha256:digest(p),bytes:fs.statSync(p).size});
const receipts=[];
for(const j of jobs){
 const base=j.root+'/'+j.id,tmp='tmp/goal-visualizations/'+j.id,stem=j.id+'.generated.'+j.stamp,dest=base+'/candidate-'+j.number;
 const receiptPath=dest+'/archive-receipt.json';assert(!fs.existsSync(receiptPath),'No overwrite '+receiptPath);
 const names=fs.readdirSync(tmp+'/generated').filter(n=>n.startsWith(stem+'.')).sort();
 for(const suffix of ['.jpg','.image-reconstruction-prompt.de.md','.image-reconstruction-request.json','.image-reconstruction-response.json'])assert(names.includes(stem+suffix));
 const sources=[...names.map(n=>tmp+'/generated/'+n),...['nano-banana-prompt.de.md','nano-banana-request.json','nano-banana-response-summary.json'].map(n=>tmp+'/'+n),base+'/attempt-'+j.number+'.prompt.de.md'];
 const candidateFiles=sources.map(source=>{assert(fs.existsSync(source));const target=dest+'/'+path.basename(source);fs.mkdirSync(dest,{recursive:true});if(fs.existsSync(target))assert.equal(digest(target),digest(source));else fs.copyFileSync(source,target);assert.equal(digest(target),digest(source));return {...desc(target),copiedFrom:source};});
 const originalDir=base+'/original',originalFiles=fs.existsSync(originalDir)?fs.readdirSync(originalDir).filter(n=>fs.statSync(originalDir+'/'+n).isFile()).map(n=>desc(originalDir+'/'+n)):[];
 const previous=base+'/candidate-'+(j.number-1)+'/archive-receipt.json';assert(fs.existsSync(previous));
 receipts.push({path:receiptPath,record:{schemaVersion:1,archivedAt:new Date().toISOString(),goalId:j.id,candidateNumber:j.number,provider:'Google Gemini / Nano Banana Pro (gemini-3-pro-image)',reconstructionModel:'gemini-2.5-flash',reviewAuthority:'archive_only',humanApprovalClaimed:false,imported:false,originalFiles,originalStatus:originalFiles.length?'retained_original_assets':'not_present: new split child; previous generated candidate retained separately',previousCandidateArchive:desc(previous),candidateFiles,imageSha256:candidateFiles.find(f=>f.path.endsWith('.jpg')).sha256,traceNote:'Exact timestamp generation files plus per-goal prompt/request/summary archived after completion and before a subsequent run. Observed archive time is not an invocation-start claim.'}});
}
console.log(JSON.stringify({patch:'*** Begin Patch\n'+receipts.map(r=>'*** Add File: '+r.path+'\n'+JSON.stringify(r.record,null,2).split('\n').map(l=>'+'+l).join('\n')+'\n').join('')+'*** End Patch',images:receipts.map(r=>({goalId:r.record.goalId,candidateNumber:r.record.candidateNumber,path:r.record.candidateFiles.find(f=>f.path.endsWith('.jpg')).path,sha256:r.record.imageSha256}))}));

