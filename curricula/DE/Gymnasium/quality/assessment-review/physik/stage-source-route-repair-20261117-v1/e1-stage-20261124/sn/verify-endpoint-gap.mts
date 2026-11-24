// SPDX-License-Identifier: Apache-2.0
// Read-only verification of the rejected lower-offer candidate contracts.
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'
const root=resolve(process.argv[2]??process.cwd())
const base='curricula/DE/Gymnasium/quality/assessment-review/physik/stage-source-route-repair-20261117-v1/e1-stage-20261124/sn'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const digest=(v:any)=>createHash('sha256').update(JSON.stringify(v)).digest('hex')
const rawHash=(p:string)=>createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')
const {normalizeCanonicalLandscape}=await import(pathToFileURL(resolve(root,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const {collectWholeMaterialPrerequisiteClosure}=await import(pathToFileURL(resolve(root,'app/scripts/generateCurriculumQualityStatus.ts')).href)
const report=read(base+'/endpoint-gap-review.actual.json')
assert.equal(report.status,'NOT_APPROVED_SOURCE_STAGE')
const docs=['PHYSIK','MATHEMATIK','CHEMIE'].map(s=>read(`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${s}.de.json`))
const landscape={...docs[0],goals:docs.flatMap(d=>d.goals)}
const byId=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const normById=new Map(normalizeCanonicalLandscape(landscape).goals.map((g:any)=>[g.id,g]))
for(const binding of [report.currentCandidateInputBinding,report.currentPreparationInputBinding]){
 assert.equal(rawHash(binding.path),binding.sha256)
 for(const entry of read(binding.path).goals){
  assert.deepEqual(byId.get(entry.goal.id),entry.goal)
  assert.equal(digest(byId.get(entry.goal.id)),entry.currentGoalJsonStringifySha256)
  assert.equal(digest(normById.get(entry.goal.id)),entry.normalizedGoalJsonStringifySha256)
 }
}
const bindings=[report.circleDecision,...report.energyDecision.candidates]
for(const binding of bindings){
 const closure=collectWholeMaterialPrerequisiteClosure(landscape,binding.taskId)
 assert.deepEqual([...closure.unresolvedReferences],[])
 assert.deepEqual([...closure.atomicGoalIds].sort(),binding.closureGoalIds)
 assert.equal(closure.atomicGoalIds.size,binding.fullRealPrerequisiteClosureCount)
 assert.equal(binding.status,'NOT_APPROVED_SOURCE_STAGE')
}
const source=read('scripts/generate_laender_physics_stage_views.sources.json')
for(const row of report.circleDecision.preservedLowerSeedExclusions){
 assert.deepEqual(source.reviewedLowerSourceMembership.decisions.SN[row.goalId],row.decision)
 assert(report.circleDecision.closureGoalIds.includes(row.goalId),'excluded full seed remains real mandatory preparation')
}
assert(!source.reviewedLowerAssessmentBindings.SN.assessments[report.circleDecision.taskId],'no unsupported b180 lower binding may be activated')
assert.equal(rawHash(report.previousScopedReview.path),report.previousScopedReview.sha256)
for(const primary of report.primaryEvidence)assert.equal(rawHash(primary.path),primary.sha256)
console.log(JSON.stringify({status:'PASS',decision:'NOT_APPROVED_SOURCE_STAGE',existingCandidates:9,boundPreparationPayloads:report.currentPreparationInputBinding.goalCount,circleClosure:report.circleDecision.fullRealPrerequisiteClosureCount,energyAlternativesRejected:report.energyDecision.candidates.length,unresolvedReferences:0,unsupportedCircleLowerBindingAbsent:true}))
