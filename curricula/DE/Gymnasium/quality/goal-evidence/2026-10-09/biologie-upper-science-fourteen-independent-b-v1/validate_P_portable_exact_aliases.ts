import { createRequire, syncBuiltinESMExports } from 'node:module'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { reviewPositiveGoalEvidenceConfig } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceReview.ts'
const require=createRequire(import.meta.url);const fs=require('node:fs');const originalRead=fs.readFileSync;const originalExists=fs.existsSync
const root='/home/enpasos/projects/skillpilot';const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-upper-science-fourteen-independent-b-v1'
const read=(p:string)=>JSON.parse(originalRead(resolve(root,p),'utf8'))
const bind=(p:string)=>{const b=originalRead(resolve(root,p));return {path:p,sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const e14=read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-upper-science-fourteen-whole-author-v1/native-preparation-v1/neutral-fourteen-native-independent-review.entry.json')
const e2=read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-upper-science-fourteen-whole-author-v1/native-targeted-two-v2/neutral-targeted-two-native-independent-review.entry.json')
const receipt=read(own+'/normal-current-records.materialization.receipt.json')
const results=[]
for(const out of receipt.positiveOutputs){
 const entry=out.goalIds.length===12?e14:e2;const rows=entry.rasterBindings??[...entry.targetRasterBindings,...entry.retainedOtherTwelveRasterBindings];const mapping=new Map<string,string>();const verified=[]
 for(const id of out.goalIds){const r=rows.find((x:any)=>x.goalId===id);const url=r.resourceLinkCandidate.url;const alias=r.portableAlias;const b=bind(alias.path);if(b.sha256!==alias.sha256||b.bytes!==alias.bytes)throw Error('alias mismatch '+id);mapping.set(resolve(root,'app/public',url.slice(1)),resolve(root,alias.path));verified.push({goalId:id,url,exactPortableAlias:b,actualOriginalImage:r.actualOriginalImage})}
 const accesses:Array<{operation:string,requested:string,actual:string}>=[]
 const mapped=(p:any,op:string)=>{const path=String(p);const dest=mapping.get(path);if(dest){accesses.push({operation:op,requested:path,actual:dest});return dest}return p}
 try{
  fs.readFileSync=(p:any,...rest:any[])=>originalRead(mapped(p,'read'),...rest);fs.existsSync=(p:any)=>originalExists(mapped(p,'exists'));syncBuiltinESMExports()
  const r=reviewPositiveGoalEvidenceConfig(out.config.path);results.push({label:out.label,config:bind(out.config.path),records:bind(out.records.path),run:bind(out.run.path),recordCount:r.records.length,counts:r.counts,errors:r.errors,exactAssetMappings:verified,actualReadOnlyAliasAccesses:accesses})
 }finally{fs.readFileSync=originalRead;fs.existsSync=originalExists;syncBuiltinESMExports()}
}
const data={schemaVersion:1,createdAtUTC:new Date().toISOString(),validatorSource:bind('app/scripts/positiveGoalEvidenceReview.ts'),validatorSourceUnchanged:true,method:'Normal exported reviewPositiveGoalEvidenceConfig executes unchanged. Read-only fs path lookup for exactly selected app/public candidate PNG paths is redirected to byte-exact neutral portable aliases. No filesystem writes, profile/fingerprint changes, or active asset installation are performed.',rawDefaultRootFailureReceipt:bind(own+'/normal-D2-P12-P2.actual-validator-terminal.json'),results,humanApproval:false,strictGain:0,activeWrites:[]}
const dest=resolve(root,own+'/normal-P12-P2.portable-exact-alias.actual-validator-terminal.json');if(originalExists(dest))throw Error('exists');fs.writeFileSync(dest,JSON.stringify(data,null,2)+'\n');console.log(JSON.stringify(results.map(r=>({label:r.label,recordCount:r.recordCount,counts:r.counts,errors:r.errors,exactMappings:r.exactAssetMappings.length,actualAliasReads:r.actualReadOnlyAliasAccesses.filter(x=>x.operation==='read').length}))));if(results.some(r=>r.errors.length))process.exitCode=1
