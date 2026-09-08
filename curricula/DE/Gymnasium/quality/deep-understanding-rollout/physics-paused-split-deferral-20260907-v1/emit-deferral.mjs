import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { buildB040Rollback } from './build-b040-rollback.mjs';
const sha=s=>'sha256:'+createHash('sha256').update(s).digest('hex');
const root=process.cwd(),own='curricula/DE/Gymnasium/quality/deep-understanding-rollout/physics-paused-split-deferral-20260907-v1';
async function patchFile(f){
  if(f.after===null)return '*** Delete File: '+f.path+'\n';
  return await new Promise((ok,bad)=>{const p=spawn('python3',['-B','-c',"import sys,json,difflib; x=json.load(sys.stdin); d=list(difflib.unified_diff(x['before'].splitlines(True),x['after'].splitlines(True),n=3)); sys.stdout.write('*** Update File: '+x['path']+'\\n'+''.join('@@\\n' if s.startswith('@@') else s for s in d[2:]))"],{stdio:['pipe','pipe','pipe']});let out='',err='';p.stdout.on('data',b=>out+=b);p.stderr.on('data',b=>err+=b);p.on('close',c=>c===0?ok(out):bad(Error(err)));p.stdin.end(JSON.stringify(f));});
}
const b40=await buildB040Rollback({root});
const staged=new Map(b40.files.map(f=>[f.path,f.after]));
const b35mod=await import(pathToFileURL(resolve(root,own,'build-b035-rollback.mjs')).href);
const b35=await b35mod.buildB035Rollback({root,files:staged});
const final=new Map(b40.files.map(f=>[f.path,f]));
for(const f of b35.files){const original=final.get(f.path);final.set(f.path,{path:f.path,before:original?.before??f.before,after:f.after});}
const files=[...final.values()].filter(f=>f.before!==f.after);
const canon=JSON.parse(readFileSync(resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'),'utf8'));
const newIds=[...b40.receipt.removedGoalIds,'d05a146f-7fcd-56ae-b9b9-b54203328579','f2538793-8b0a-5c3b-b216-5d329a4e87bd'];
const archivedGoals=canon.goals.filter(g=>newIds.includes(g.id));if(archivedGoals.length!==9)throw Error('nine current goals required');
const receipt={schemaVersion:1,status:'PAUSED_DEFERRED_CANDIDATE_NOT_APPLIED',generatedAt:new Date().toISOString(),B040:b40.receipt,B035:b35.receipt,fileCount:files.length,fileDigests:files.map(f=>({path:f.path,beforeSha256:sha(f.before),afterSha256:f.after===null?null:sha(f.after)})),archivedGoals,newGoalIds:newIds,notPerformed:['new subject content','new subject approvals','quality floor exception','assessment adoption','historical receipt modification']};
if(process.argv.includes('--receipt'))console.log(JSON.stringify(receipt));
else if(process.argv.includes('--summary'))console.log(JSON.stringify({fileCount:files.length,B035:b35.receipt,newGoalIds:newIds}));
else {const batch=Number(process.argv.find(x=>x.startsWith('--batch='))?.slice(8)??0),selected=files.slice(batch*15,(batch+1)*15);let patch='*** Begin Patch\n';for(const f of selected){if(readFileSync(resolve(root,f.path),'utf8')!==f.before)throw Error('live full-file lease changed '+f.path);patch+=await patchFile(f);}patch+='*** End Patch\n';console.log(JSON.stringify({batch,complete:(batch+1)*15>=files.length,fileCount:files.length,patch,bindings:selected.map(f=>({path:f.path,beforeSha256:sha(f.before),afterSha256:f.after===null?null:sha(f.after)}))}));}
