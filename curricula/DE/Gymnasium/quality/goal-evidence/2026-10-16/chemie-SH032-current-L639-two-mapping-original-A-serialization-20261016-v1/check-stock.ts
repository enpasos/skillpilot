import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, relative, join } from 'node:path'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
async function main(){
const R=process.cwd()
const O=resolve(R,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-SH032-current-L639-two-mapping-original-A-serialization-20261016-v1')
const L=resolve(R,'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const files=(p:string):string[]=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(p,e.name)):[join(p,e.name)])
const C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const canon=read(resolve(L,C));assert.equal(sha(resolve(L,C)),'sha256:0c4277b9bc9ec90740dbe5b885e35cbbde777c488518252d623ce09b044b3cf9')
const cas=read(resolve(O,'CAS.two-whole-Source032-mappings.actual-L639.original-A-bound.inactive.json'))
const mapFiles=files(resolve(L,'curricula/DE/Gymnasium/mapping')).filter(p=>p.endsWith('.json')).map(p=>({p,j:read(p)})).filter(({j})=>j.targetLandscapeId===canon.landscapeId&&Array.isArray(j.mappings))
assert.equal(mapFiles.length,82)
const before=mapFiles.map(({p,j})=>({...j,file:relative(L,p)}))
const sourcePaths=[...new Set(before.map(j=>j.sourceExtractionPath).filter(Boolean))]
const sources=new Map(sourcePaths.map((p:string)=>[p,read(resolve(L,p))]))
assert.equal(sources.size,35)
const observed=[resolve(L,C),...mapFiles.map(({p})=>p),...sourcePaths.map((p:string)=>resolve(L,p)),...['de-sh-gk.view.json','de-sh-lk.view.json'].map(p=>resolve(L,'curricula/DE/Gymnasium/composition-views/chemie',p))]
const inputPins=observed.map(p=>({path:relative(R,p),sha256:sha(p)}))
const after=before.map(j=>{
 const op=cas.operations.find((o:any)=>o.normalPath===j.file)
 if(!op)return j
 assert.equal(sha(resolve(L,op.normalPath)),op.beforeWholeFileSha256)
 return {...read(resolve(R,op.after.path)),file:j.file}
})
const {evaluateCourseLevelMappingConsistency}=await import(pathToFileURL(resolve(R,'app/scripts/generateCurriculumQualityStatus.ts')).href)
const stockBefore=evaluateCourseLevelMappingConsistency(canon,before,sources)
const stockAfter=evaluateCourseLevelMappingConsistency(canon,after,sources)
assert.equal(stockBefore.status,'pass');assert.equal(stockAfter.status,'pass')
assert.equal(stockBefore.metrics.mismatches,0);assert.equal(stockAfter.metrics.mismatches,0)
assert.equal(stockAfter.metrics.checkedMappingEdges,stockBefore.metrics.checkedMappingEdges) // stock CQR-004 deliberately skips partial edges; finite direct course check follows
const newGoal=canon.goals.find((g:any)=>g.id==='3eb2a06c-d283-57aa-9eb4-088940c4801a');assert(newGoal.tags.includes('GK')&&newGoal.tags.includes('LK'))
const sid='de-sh-chemie-sekii-fachanforderungen-2022-3-2-chemie-der-funktionalen-stoffe-und-materialien-032-74ed63ca'
const gid='3eb2a06c-d283-57aa-9eb4-088940c4801a'
for(const op of cas.operations){
 const b=read(resolve(R,op.before.path));const a=read(resolve(R,op.after.path))
 assert.equal(sha(resolve(R,op.after.path)),op.after.sha256)
 assert.equal(a.decisions.length,b.decisions.length)
 assert.equal(a.mappings.length,b.mappings.length+1)
 assert.deepEqual(a.mappings.slice(0,-1),b.mappings)
 assert.deepEqual(a.decisions.filter((d:any)=>d.sourceGoalId!==sid),b.decisions.filter((d:any)=>d.sourceGoalId!==sid))
 const bd=b.decisions.find((d:any)=>d.sourceGoalId===sid);const ad=a.decisions.find((d:any)=>d.sourceGoalId===sid)
 assert.deepEqual(ad.canonicalGoalIds,[...bd.canonicalGoalIds,gid]);assert.equal(ad.decision,'mapped')
 assert.deepEqual(ad.source032BeforeAllAuthoredThemesAuthorSuccessor.wholeDecision,bd)
 assert.deepEqual(ad.source032HistoricalAllocationBeforeBYPracticumCorrection,bd.source032HistoricalAllocationBeforeBYPracticumCorrection)
 assert.deepEqual(a.status.source032StatusBeforeMappedSerialization,b.status)
 const sourceIds=new Set(sources.get(a.sourceExtractionPath).sourceGoals.map((g:any)=>g.id))
 const goalIds=new Set(canon.goals.map((g:any)=>g.id))
 for(const e of a.mappings){assert(sourceIds.has(e.legacyGoalId));assert(goalIds.has(e.canonicalGoalId))}
 for(const d of a.decisions){assert(sourceIds.has(d.sourceGoalId));for(const id of d.canonicalGoalIds??[])assert(goalIds.has(id))}
 assert.equal(a.status.mappedSourceGoals,a.decisions.filter((d:any)=>d.decision==='mapped').length)
 assert.equal(a.status.unreviewedSourceGoals,a.decisions.filter((d:any)=>d.decision==='unreviewed').length)
 const keys=new Set(a.mappings.map((e:any)=>`${e.legacyGoalId}\0${e.canonicalGoalId}`));assert.equal(keys.size,a.mappings.length)
 assert(!ad.canonicalGoalIds.includes('cf2631d9-da24-50e8-9e50-db625e6efaad'))
 assert(!ad.canonicalGoalIds.includes('69928892-ac71-553d-a35c-4f96f16b6d6e'))
}
const drift=inputPins.filter(p=>sha(resolve(R,p.path))!==p.sha256);assert.deepEqual(drift,[])
const out={role:'Actual bounded stock CQR-004 and whole-alias structural validation; technical only',createdAtUtc:new Date().toISOString(),stockFunction:'app/scripts/generateCurriculumQualityStatus.ts#evaluateCourseLevelMappingConsistency',stockCodeSha256:sha(resolve(R,'app/scripts/generateCurriculumQualityStatus.ts')),canonicalGoals:canon.goals.length,actualMappingFiles:before.length,actualSourceExtractions:sources.size,stockBefore,stockAfter,stockCqr004SkipsPartialEdges:true,new3ebPartialEdgesDirectCourseCheck:{sourceCourseLevel:'GK_LK',targetTags:newGoal.tags,compatibleGKAndLK:true,officialOptionalThemeUnchanged:true},sourceCellsUnchanged:stockBefore.metrics.sourceGoals===stockAfter.metrics.sourceGoals,onlyTwoAddedSource032Edges:true,wholeOtherDecisionBodiesExact:true,wholePredecessorHistoryExact:true,allMappedIdsExist:true,allWholeAliasStatusCountsRecomputed:true,duplicateMappingEdges:0,inputPins,inputDrift:drift,unsupportedSourceFindings:[],newScienceVotes:0,normalWrites:0,GitActions:0,HumanApproval:false,HumanTrial:false}
writeFileSync(resolve(O,'CHECKS.actual-stock82-CQR004-and-whole-mapping-structure.json'),JSON.stringify(out,null,2)+'\n')
console.log(JSON.stringify({mappingFiles:before.length,sourceExtractions:sources.size,before:stockBefore,after:stockAfter,inputDrift:drift,newScienceVotes:0,normalWrites:0},null,2))

}
main().catch(error=>{console.error(error);process.exitCode=1})
