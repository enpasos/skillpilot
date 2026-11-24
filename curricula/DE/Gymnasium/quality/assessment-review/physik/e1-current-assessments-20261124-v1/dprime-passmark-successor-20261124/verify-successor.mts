// SPDX-License-Identifier: Apache-2.0
// Run from the repository root. Strict current-input verification, no activation/write mode.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const base='curricula/DE/Gymnasium/quality/assessment-review/physik/e1-current-assessments-20261124-v1/dprime-passmark-successor-20261124/'
const id='a8dc0290-9f80-5763-8943-e16b8d2aa860',bes='e4b38061-1f28-43ad-8371-a3e7c0e81856',d='f13ca187-b680-5f47-b4ad-76bd474bd8a2',ffx='f41e4e30-794e-5ce4-ba5e-cc72712cd691'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const digest=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex')
const pin=(p:{path:string;sha256:string})=>assert.equal(hash(p.path),p.sha256,p.path)
const load=async(p:string)=>await import(pathToFileURL(resolve(p)).href)
const { assessmentReviewRevisions }=await load('app/scripts/lib/learningUnitContracts.ts')
const { checkUnitPlanningReleases, planningReleaseFingerprint }=await load('app/scripts/checkUnitPlanningReleases.ts')
const bindings=read(base+'review-bindings.actual.json'),r2=read(base+'r2-coverage.actual.json'),planning=read(base+'planning-invariance.actual.json'),deltas=read(base+'binding-deltas.actual.json')
assert.equal(bindings.status,'ACCEPT_EXACT_SIGNED_V3_19_OF_20')
for(const p of [bindings.candidate,bindings.releasedGoal,bindings.previousGoal,...bindings.priorDissentPreserved])pin(p)
assert.equal(bindings.candidate.sha256,'f41f6906b5df5b79225a74b955077dbdc0bb502a04b09fb7e050835595d3152e')
assert.equal(bindings.releasedGoal.sha256,bindings.candidate.sha256)
const threads=[]
for(const binding of bindings.twoActualReviews) {
 for(const p of [binding.run,binding.input,binding.response])pin(p)
 const run=read(binding.run.path),input=read(binding.input.path),response=read(binding.response.path).reviews.find((r:any)=>r.goalId===id)
 assert.equal(run.exitCode,0);assert.equal(run.reasoningEffort,'ultra');assert.equal(run.sandbox.type,'read-only');assert.equal(run.blindToOtherRun,true)
 assert.equal(input.candidateFileSha256,bindings.candidate.sha256);assert.deepEqual(input.candidate,read(bindings.releasedGoal.path))
 assert.equal(response.candidateDecision,'accept');assert.deepEqual(response.requiredCorrections,[]);assert.equal(response.recommendedPassingPoints,19)
 assert.deepEqual(response.recommendedCoveredGoalIds,[bes]);assert.deepEqual(response.recommendedRequires,['262f807a-30d0-503e-986f-856cbd048e8e']);assert.equal(response.semanticKind,'practiceAssessment')
 threads.push(run.threadId)
}
assert.equal(threads.length,2);assert.equal(new Set(threads).size,2)
const canonical=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'),current=canonical.goals.find((g:any)=>g.id===id)
assert.deepEqual(current,read(bindings.releasedGoal.path))
const previous=read(bindings.previousGoal.path),expected=structuredClone(previous)
assert.deepEqual(bindings.exactChangedExamFields,['reviewNote','scoring','solutionContent','solutionContentEn'])
for(const field of bindings.exactChangedExamFields)expected.examData[field]=current.examData[field]
assert.deepEqual(expected,current,'Only the reviewed scoring/solution and separately labelled historical note may change')
assert.equal(current.examData.scoring.maxPoints,20);assert.equal(current.examData.scoring.passingPoints,19)
assert.deepEqual(current.requires,['262f807a-30d0-503e-986f-856cbd048e8e']);assert.deepEqual(current.examData.coveredGoalIds,[bes])
assert.equal(r2.status,'ACCEPT_EXACT_BES_ONLY_R2_NO_PLANNING_CREDIT')
assert.deepEqual(assessmentReviewRevisions(current),r2.newRevisions)
assert.deepEqual(r2.coverage.goalIds,[bes]);assert.equal(r2.coverage.assessmentGoalId,id);assert.equal(r2.coverage.reference,base+'r2-coverage.actual.json')
for(const value of [r2.wholeUnitPromiseCertified,r2.ownExperimentCertified,r2.requiredHessianE1Part,r2.planningCreditGranted])assert.equal(value,false)
pin(r2.reviewBindings);pin(r2.priorCoverageReview);pin(r2.priorDprimePayload)
const unit=canonical.programUnits.find((u:any)=>u.id===r2.unitId)
assert.equal(unit.revision,r2.unitRevision);assert.equal(unit.promise,r2.unchangedBroaderUnitPromise.de);assert.equal(unit.promiseEn,r2.unchangedBroaderUnitPromise.en)
assert.deepEqual(unit.coverageReviews.find((r:any)=>r.assessmentGoalId===id),r2.coverage)
assert.deepEqual(canonical.goalPlacements.filter((p:any)=>p.relation==='own'&&p.unitId===unit.id).map((p:any)=>p.goalId).sort(),[bes,id,d,'b4e95dce-8537-5e38-8aa6-0d9cfaa2b19e'].sort())
pin(planning.material);pin(planning.registry)
const material=read(planning.material.path),registry=read(planning.registry.path)
assert.deepEqual(material.unit.assessmentContract.planningCredits,[planning.credit])
assert.deepEqual(planning.credit.requiredPartIds,[d]);assert.deepEqual(planning.credit.goalIds,[bes])
assert.equal(digest(canonical.goals.find((g:any)=>g.id===d)),planning.DGoalJsonStringifySha256)
assert.deepEqual(unit.coverageReviews.find((r:any)=>r.assessmentGoalId===d),planning.DCoverage)
assert.equal(planningReleaseFingerprint(material.unit,planning.credit),'sha256:efb05e6c680bd40abe5a947fcce45e638f41c35909762c7f429b0016b75bb94d')
assert.deepEqual(checkUnitPlanningReleases(),[planning.credit.release.fingerprint])
assert.equal(registry.reviewedPlanningReleases[planning.credit.release.fingerprint],planning.credit.release.review.sha256)
const offers=read(base+'current-stage-offers.actual.json');pin(offers.currentSharedPreparation)
assert.equal(offers.assessments[0].goalId,id);assert.equal(offers.assessments[0].maxPoints,20);assert.equal(offers.assessments[0].passingPoints,19)
assert.deepEqual(offers.assessments[0].approvedScopes.map((s:any)=>[s.jurisdiction,s.stage]),[['DE-SN','SekI'],['DE-ST','SekI']])
assert.deepEqual(offers.assessments[0].currentPreparation,offers.currentSharedPreparation)
for(const p of offers.immutablePredecessors)pin(p)
for(const binding of offers.assessments[0].actualIndependentCurrentReviews)pin(binding)
const source=read('scripts/generate_laender_physics_stage_views.sources.json')
for(const row of deltas.sourceRows)assert.deepEqual(source.reviewedLowerAssessmentBindings[row.jurisdiction].assessments[row.assessmentGoalId],row.after)
const warnings=read('docs/qa-ci/applicability-accepted-warnings.json').acceptedWarnings
assert.deepEqual(warnings.find((r:any)=>r.code==='APV-201'&&r.goalId===ffx),deltas.derivedFFXWarning.after)
const oldWarning=structuredClone(deltas.derivedFFXWarning.before),newWarning=deltas.derivedFFXWarning.after
for(const field of ['reviewPath','reviewFileSha256','currentPreparationReviewPath','currentPreparationReviewSha256'])oldWarning.evidence[field]=newWarning.evidence[field]
assert.deepEqual(oldWarning,newWarning,'FFX only follows four actual shared evidence references')
await load(base+'verify-current-stage-preparation.mts')
console.log('Dprime exact V3 dual review, BES-only R2, P66/216, bounded SN/ST offers, unchanged D-only planning and derived-only FFX bindings verified.')
