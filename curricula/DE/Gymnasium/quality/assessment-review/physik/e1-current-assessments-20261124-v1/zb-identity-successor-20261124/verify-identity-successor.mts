// SPDX-License-Identifier: Apache-2.0
// Run from the repository root. Read-only exact-current verification; no learner writes.
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const base='curricula/DE/Gymnasium/quality/assessment-review/physik/e1-current-assessments-20261124-v1/zb-identity-successor-20261124/'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex')
const hash=(p:string)=>sha(readFileSync(p))
const pin=(p:{path:string;sha256:string})=>assert.equal(hash(p.path),p.sha256,p.path)
const load=async(p:string)=>await import(pathToFileURL(resolve(p)).href)
const proof=read(base+'identity-activation.actual.json')
for(const p of [proof.productionBase,proof.priorPrEdition,proof.archive,proof.successor,proof.originalOctoberReview,proof.reviewDisposition])pin(p)
assert.equal(proof.status,'DUAL_ACCEPTED_DISTINCT_IDENTITY_BOUNDED_REPLACEMENT')
assert.equal(proof.successor.sha256,'c296fa2301f35817e8cd8aeb38c91e575fea9bc35fc4c7e0cb1a3d48d43bbe60')
const production=read(proof.productionBase.path),prior=read(proof.priorPrEdition.path),archive=read(proof.archive.path),successor=read(proof.successor.path)
assert.equal(production.examData.scoring.passingPoints,22);assert.equal(prior.examData.scoring.passingPoints,36)
assert.equal(successor.examData.scoring.maxPoints,36);assert.equal(successor.examData.scoring.passingPoints,35.5)
assert.deepEqual(archive.examData,production.examData)
for(const [field,value] of Object.entries(proof.originalBodySha256))assert.equal(sha(archive.examData[field]),value,field)
const expected=structuredClone(production)
expected.applicability={};expected.extendedData={...expected.extendedData,applicabilityProjection:'excluded',applicabilityMappingInheritance:'boundary'}
delete expected.extendedData.applicabilityFromRequires
assert.deepEqual(archive,expected,'Archive restores complete production goal with only explicit exclusion metadata')
assert.deepEqual(archive.requires,proof.productionPreparationRestored)
assert.deepEqual(successor.requires,proof.successorPreparation)
const threads=[]
for(const binding of proof.twoActualReviews){
 for(const p of [binding.run,binding.input,binding.response])pin(p)
 const run=read(binding.run.path),input=read(binding.input.path),response=read(binding.response.path).reviews.find((r:any)=>r.goalId===proof.newGoalId)
 assert.equal(run.exitCode,0);assert.equal(run.reasoningEffort,'ultra');assert.equal(run.sandbox.type,'read-only');assert.equal(run.blindToOtherRun,true)
 assert.equal(run.model,binding.model);assert.equal(run.threadId,binding.threadId)
 assert.equal(input.candidateFileSha256,proof.successor.sha256);assert.deepEqual(input.candidate,successor)
 assert.equal(response.candidateDecision,'accept');assert.deepEqual(response.requiredCorrections,[])
 assert.equal(response.recommendedPassingPoints,35.5);assert.deepEqual(response.recommendedRequires,successor.requires)
 assert.deepEqual(response.recommendedCoveredGoalIds,successor.examData.coveredGoalIds);assert.equal(response.semanticKind,'practiceAssessment')
 threads.push(run.threadId)
}
assert.equal(threads.length,2);assert.equal(new Set(threads).size,2)
assert.equal(read(proof.reviewDisposition.path).eligibleForActivation,true)
const canonicalPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',canonical=read(canonicalPath)
assert.deepEqual(canonical.goals.find((g:any)=>g.id===proof.oldGoalId),archive)
assert.deepEqual(canonical.goals.find((g:any)=>g.id===proof.newGoalId),successor)
const parent=canonical.goals.find((g:any)=>g.id===proof.sameActiveSlotParent),historic=canonical.goals.find((g:any)=>g.id===proof.archivedSlotParent)
assert.equal(parent.contains.filter((id:string)=>id===proof.newGoalId).length,1);assert(!parent.contains.includes(proof.oldGoalId))
assert.equal(historic.contains.at(-1),proof.oldGoalId);assert(!historic.contains.includes(proof.newGoalId))
assert.deepEqual(canonical.goals.filter((g:any)=>g.contains?.includes(proof.oldGoalId)).map((g:any)=>g.id),[historic.id])
assert.deepEqual(canonical.goals.filter((g:any)=>g.requires?.includes(proof.oldGoalId)).map((g:any)=>g.id),[])
// Reconstruct the prior active edition only for comparison. No historical file is rewritten.
const before=structuredClone(canonical)
before.goals=before.goals.filter((g:any)=>g.id!==proof.newGoalId).map((g:any)=>g.id===proof.oldGoalId?prior:g)
before.goals.find((g:any)=>g.id===parent.id).contains=parent.contains.map((id:string)=>id===proof.newGoalId?proof.oldGoalId:id)
before.goals.find((g:any)=>g.id===historic.id).contains=historic.contains.filter((id:string)=>id!==proof.oldGoalId)
const {normalizeLandscape}=await load('app/src/hooks/useLandscapes.ts')
const {normalizeLearnerProjectedEntries}=await load('app/src/utils/learnerTreeProjection.ts')
const {applyCompositionViewProjection}=await load('app/src/utils/compositionViewRuntime.ts')
const {buildVisibleChildrenMap}=await load('app/src/utils/treeProjectionRuntime.ts')
const {collectCompositionProjectionRoleGoalIds}=await load('app/src/utils/authoring/compositionViewAuthoring.ts')
const {CANONICAL_GYMNASIUM_ROOT_ID}=await load('app/src/utils/curriculumDisplay.ts')
const {collectWholeMaterialPrerequisiteClosure}=await load('app/scripts/generateCurriculumQualityStatus.ts')
const {loadCurrentCurriculumCatalog}=await load('app/scripts/currentCurriculumCatalog.ts')
const {liveVerificationInputs}=await load('app/scripts/lib/verificationInputSnapshot.ts')
const docs=loadCurrentCurriculumCatalog(liveVerificationInputs).entries.map((r:any)=>r.landscape)
const combined=(physics:any)=>({...physics,goals:docs.flatMap((d:any)=>d.landscapeId===physics.landscapeId?physics.goals:d.goals)})
const closure=(catalog:any,id:string)=>{const c=collectWholeMaterialPrerequisiteClosure(catalog,id);assert.equal(c.unresolvedReferences.size,0);return[...c.atomicGoalIds].sort()}
const preparation=closure(combined(canonical),proof.newGoalId)
assert.equal(preparation.length,72);assert.deepEqual(preparation,closure(combined(before),proof.oldGoalId))
const current=normalizeLandscape(canonical),previous=normalizeLandscape(before)
const byId=new Map(canonical.goals.map((g:any)=>[g.id,g]))
const replaceBack=(value:any):any=>{
 if(Array.isArray(value))return value.map(replaceBack)
 if(value&&typeof value==='object'){
  const out=Object.fromEntries(Object.entries(value).map(([k,v])=>[k,replaceBack(v)]))
  if(['goalEntry','canonicalSubtree'].includes(out.kind)&&out.goalId===proof.newGoalId)out.goalId=proof.oldGoalId
  if(out.kind==='structure'&&out.id==='physics-acquisition-'+proof.newGoalId)out.id='physics-acquisition-'+proof.oldGoalId
  return out
 }return value
}
const visible=(landscape:any,view:any)=>{
 const [projected]=normalizeLearnerProjectedEntries(applyCompositionViewProjection([landscape],view))
 const goals=new Map(projected.goals.map((g:any)=>[g.id,g])),filters=[view.scope.courseProfile,view.scope.jurisdiction].filter(Boolean)
 const children=buildVisibleChildrenMap(goals,undefined,{[CANONICAL_GYMNASIUM_ROOT_ID]:{selected:true,stage:view.scope.stage},[landscape.meta.landscapeId]:{selected:true,filterId:filters.join(',')}})
 const paths=new Map<string,string[]>()
 const walk=(id:string,parents:string[])=>{assert(!paths.has(id));paths.set(id,parents);for(const c of children.get(id)??[])walk(c,[...parents,id])}
 projected.goals.filter((g:any)=>g.tags?.includes('root')).forEach((g:any)=>walk(g.id,[]))
 return{paths,goals}
}
const records=[]
for(const name of readdirSync('curricula/DE/Gymnasium/composition-views/physik').filter(n=>n.endsWith('.view.json')).sort()){
 const path='curricula/DE/Gymnasium/composition-views/physik/'+name,view=read(path),oldView=replaceBack(view)
 const tree=visible(current,view),oldTree=visible(previous,oldView),roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,byId)
 const offered=tree.paths.has(proof.newGoalId)
 assert.equal(offered,oldTree.paths.has(proof.oldGoalId),path)
 assert(!tree.paths.has(proof.oldGoalId));assert(!roles.targetGoalIds.has(proof.oldGoalId));assert(!roles.prerequisiteOnlyGoalIds.has(proof.oldGoalId))
 if(offered){
  assert.deepEqual(tree.paths.get(proof.newGoalId),oldTree.paths.get(proof.oldGoalId)!.map(x=>x.replaceAll(proof.oldGoalId,proof.newGoalId)),path)
  assert.deepEqual(tree.goals.get(proof.newGoalId).examData,successor.examData,path)
 }
 records.push({path,viewId:view.viewId,sha256:hash(path),successorVisible:offered,archiveVisible:false,sameSlot:true})
}
assert.equal(records.length,90);assert.equal(records.filter(r=>r.successorVisible).length,64)
console.log(JSON.stringify({status:'PASS',canonicalRawSha256:hash(canonicalPath),oldGoalId:proof.oldGoalId,newGoalId:proof.newGoalId,archivePassingPoints:22,successorPassingPoints:35.5,viewCount:records.length,offeredViews:64,archivedVisibleViews:0,unchangedPreparationCount:preparation.length,twoActualReviews:true,viewBindings:records},null,2))
