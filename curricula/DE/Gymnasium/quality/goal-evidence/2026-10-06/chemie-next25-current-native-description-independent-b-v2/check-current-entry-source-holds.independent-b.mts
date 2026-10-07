import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { expandGoalBookSourceAtlasReceipt } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
const own=base+'/chemie-next25-current-native-description-independent-b-v2'
const otherOwn=base+'/chemie-next25-current-positive-profile-independent-b-v2'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const bind=(p:string)=>({path:p,sha256:'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex'),bytes:readFileSync(p).length})
const compactPath='app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/source-projection.receipt.json'
const futurePath=base+'/chemie-b007-bw-reviewed-metadata-native-binding-preparation-author-v6/future-metadata-only/native-artifacts/source-atlas.receipt.json'
const canonPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const compact=read(compactPath),active:any=expandGoalBookSourceAtlasReceipt(compact),future=read(futurePath),canon=read(canonPath)
const stable=(v:any):string=>JSON.stringify(v&&typeof v==='object'?Array.isArray(v)?v.map((x:any)=>JSON.parse(stable(x))):Object.fromEntries(Object.keys(v).sort().map(k=>[k,JSON.parse(stable(v[k]))])):v)
for(const key of ['counts','unresolvedSourceScopes','omittedGoals'])assert.deepEqual(active[key],future[key])
assert.equal(active.scopes.length,48)
const scopes=active.scopes.map((s:any,i:number)=>{
 const f=future.scopes[i],{witnesses,...fields}=s,{witnesses:fw,...ffields}=f
 assert.deepEqual(fields,ffields)
 assert.deepEqual(witnesses.map(stable).sort(),fw.map(stable).sort())
 return {key:s.key,orderedGoalIdsExact:true,scopeFieldsExact:true,witnessMultisetExact:true,witnesses:witnesses.length}
})
assert.equal(canon.goals.length,479)
const goals=new Map(canon.goals.map((g:any)=>[g.id,g]))
const unresolvedGroups=new Map<string,number>()
for(const r of active.unresolvedSourceScopes){const k=r.mappingPath+'|'+r.reason;unresolvedGroups.set(k,(unresolvedGroups.get(k)??0)+1)}
const receipt={schemaVersion:1,createdAtUTC:new Date().toISOString(),documentType:'independent-b-actual-current-whole-source-hold-preservation-check',currentCanonical:bind(canonPath),currentNodeCount:479,currentCompressedSourceReceipt:bind(compactPath),nativeExpansionFunction:bind('app/scripts/goalBookSourceAtlasInputs.ts'),previousTechnicallyReviewedFutureReceipt:bind(futurePath),actualCounts:active.counts,all48ScopeFieldsAndOrderedGoalSetsExact:true,all48WitnessMultisetsExact:true,compactWitnessOrderNotMisrepresentedAsOriginalOrder:true,scopes,unresolvedScopeGroups:[...unresolvedGroups].map(([key,count])=>({key,count})),actualOmittedWholeGoals:active.omittedGoals.map((r:any)=>({...r,titleDe:(goals.get(r.goalId) as any).title,titleEn:(goals.get(r.goalId) as any).titleEn})),sourceWholeApproval:false,newScienceDecisions:0,activeWrites:false,strictNetGain:0,humanApproval:false,humanTrial:false}
for(const dir of [own,otherOwn])writeFileSync(dir+'/independent-b.current-entry.source-whole-holds-preserved.actual.json',JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify({counts:active.counts,all48ScopeFieldsAndOrderedGoalSetsExact:true,all48WitnessMultisetsExact:true,activeCanonicalSha256:receipt.currentCanonical.sha256,wholeSourceApproval:false}))
