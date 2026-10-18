// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {dirname} from 'node:path'
import {createHash} from 'node:crypto'
import {buildGoalBookSourceAtlasInputs,readGoalBookSourceAtlasInputConfig,expandGoalBookSourceAtlasReceipt} from '../../../../../../../../app/scripts/goalBookSourceAtlasInputs'
const O='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-final-source-atlas-inputs-integration-technical-20261018-v1/'
const C='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
const H=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex')
const pin=(path:string)=>{const b=readFileSync(path);return {path,sha256:H(b),bytes:b.length}}
const J=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const put=(p:string,v:any)=>{mkdirSync(dirname(O+p),{recursive:true});writeFileSync(O+p,JSON.stringify(v,null,2)+'\n')}
function main(){
 assert.deepEqual(process.argv.slice(2),['--source-freeze-go'])
 const config=readGoalBookSourceAtlasInputConfig(C),original=structuredClone(config),base=expandGoalBookSourceAtlasReceipt(J(config.outputDirectory+'/source-projection.receipt.json')) as any
 const protectedInputs=[pin(config.landscapePath),pin(config.semanticKindLedgerPath)]
 const failures:any[]=[];let result:ReturnType<typeof buildGoalBookSourceAtlasInputs>|undefined
 for(let i=0;i<3;i++){
  try{result=buildGoalBookSourceAtlasInputs(config);break}catch(error){const e=error as any;failures.push({message:e.message,actual:e.actual,expected:e.expected,code:e.code,stack:e.stack});put('dryrun/actual-original-count-or-contract-failures.json',failures)
   if(e.message.startsWith('Source-supported atlas goal count changed')&&Number.isInteger(e.actual)){config.expectedCurricularAtomicGoalCount=e.actual;continue}
   if(e.message.startsWith('Source-scope uncertainty changed')&&Number.isInteger(e.actual)){config.expectedUnresolvedScopeDecisionCount=e.actual;continue}
   throw error
  }
 }
 assert(result,'No complete original derivation after finite measured count successor')
 for(const f of protectedInputs)assert.deepEqual(pin(f.path),f,'Canonical/SEM changed during inactive derivation')
 const old=(base.scopes??[]).flatMap((s:any)=>s.witnesses.map((w:any)=>({...w,scopeKey:s.key}))),now=result.receipt.scopes.flatMap((s:any)=>s.witnesses.map((w:any)=>({...w,scopeKey:s.key})))
 const key=(w:any)=>JSON.stringify([w.scopeKey,w.sourceGoalId,w.goalId,w.mappedTargetGoalId,w.coverage,w.profileBasis,w.mappingPath,w.fallbackViewPath??''])
 const oldMap=new Map(old.map((w:any)=>[key(w),w])),newMap=new Map(now.map(w=>[key(w),w]));const added=now.filter(w=>!oldMap.has(key(w))),removed=old.filter((w:any)=>!newMap.has(key(w)))
 const oldUnion=new Set<string>(base.scopes.flatMap((s:any)=>s.goalIds)),newUnion=new Set<string>(result.receipt.scopes.flatMap(s=>s.goalIds));const unionAdded=[...newUnion].filter(g=>!oldUnion.has(g)).sort(),unionRemoved=[...oldUnion].filter(g=>!newUnion.has(g)).sort()
 const scopeChanges=result.receipt.scopes.map(s=>{const b=base.scopes.find((x:any)=>x.key===s.key);return {scopeKey:s.key,before:b?.goalIds.length??0,after:s.goalIds.length,added:s.goalIds.filter(g=>!(b?.goalIds??[]).includes(g)),removed:(b?.goalIds??[]).filter((g:string)=>!s.goalIds.includes(g))}}).filter(s=>s.added.length||s.removed.length)
 for(const[path,bytes]of Object.entries(result.outputs)){const shadow=O+'dryrun/outputs/'+path;mkdirSync(dirname(shadow),{recursive:true});writeFileSync(shadow,bytes)}
 put('dryrun/INACTIVE.measured-original-input-config.json',config)
 put('dryrun/DELTA.actual-source-witnesses-scopes-and-union.json',{role:'Measured technical delta awaiting qualification, not a new source vote',originalConfig:pin(C),expectedOnlyConfigDelta:{published:[original.expectedCurricularAtomicGoalCount,config.expectedCurricularAtomicGoalCount],unresolved:[original.expectedUnresolvedScopeDecisionCount,config.expectedUnresolvedScopeDecisionCount]},beforeCounts:base.counts,afterCounts:result.receipt.counts,sourceScopesChanged:scopeChanges,unionAdded,unionRemoved,addedWitnesses:added,removedWitnesses:removed,oldWitnesses:old.length,currentWitnesses:now.length,currentOmittedGoals:result.receipt.omittedGoals,inputBindings:result.receipt.inputBindings,canonicalSEMStableDuringRead:protectedInputs,countAssertionFailuresRecorded:failures.length,normalWrites:0})
 console.log(JSON.stringify({status:'INACTIVE_DRYRUN_COMPLETE',beforeCounts:base.counts,afterCounts:result.receipt.counts,unionAdded,unionRemoved,addedWitnesses:added.length,removedWitnesses:removed.length,sourceScopesChanged:scopeChanges.map(s=>({scopeKey:s.scopeKey,before:s.before,after:s.after,added:s.added.length,removed:s.removed.length})),normalWrites:0},null,2))
}
main()
