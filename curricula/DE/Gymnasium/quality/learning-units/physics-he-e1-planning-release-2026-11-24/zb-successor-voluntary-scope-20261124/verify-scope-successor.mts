// SPDX-License-Identifier: Apache-2.0
// Run from the repository root. Strict one-field current material successor; no writes.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const base='curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-planning-release-2026-11-24/zb-successor-voluntary-scope-20261124/'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const pin=(p:{path:string;sha256:string})=>assert.equal(hash(p.path),p.sha256,p.path)
const digest=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex')
const load=async(p:string)=>await import(pathToFileURL(resolve(p)).href)
const proof=read(base+'scope-successor.actual.json')
for(const p of [proof.identityActivation,proof.materialBefore,proof.materialAfter,proof.unchangedReviewedPlanningReleaseRegistry,proof.priorDprimePlanningProof])pin(p)
assert.equal(proof.status,'REVIEWED_BOUNDED_VOLUNTARY_IDENTITY_MATERIAL_SUCCESSOR')
assert.equal(proof.allowedDelta.path,'/unit/sectionAssessmentPolicy/voluntaryAssessmentGoalIds/0')
const before=read(proof.materialBefore.path),after=read(proof.materialAfter.path),expected=structuredClone(before)
assert.equal(expected.unit.sectionAssessmentPolicy.voluntaryAssessmentGoalIds[0],proof.allowedDelta.before)
expected.unit.sectionAssessmentPolicy.voluntaryAssessmentGoalIds[0]=proof.allowedDelta.after
assert.deepEqual(after,expected,'Only the reviewed voluntary assessment identity changes')
assert.equal(hash(proof.currentMaterialPath),proof.materialAfter.sha256)
assert.deepEqual(read(proof.currentMaterialPath),after)
assert.deepEqual(before.unit.sectionAssessmentPolicy.voluntaryAssessmentGoalIds,proof.oldVoluntaryAssessmentGoalIds)
assert.deepEqual(after.unit.sectionAssessmentPolicy.voluntaryAssessmentGoalIds,proof.newVoluntaryAssessmentGoalIds)
assert.equal(after.unit.assessmentContract.revision,proof.unchangedContractRevision)
assert.equal(after.unit.sectionAssessmentPolicy.requiredPartsFingerprint,proof.unchangedRequiredPartsFingerprint)
assert.deepEqual(after.unit.assessmentContract.parts,proof.unchangedRequiredParts)
assert.deepEqual(after.unit.assessmentContract.planningCredits,proof.unchangedPlanningCredits)
assert.equal(proof.unchangedRequiredParts.length,4)
const oldDprime=read(proof.priorDprimePlanningProof.path)
assert.equal(oldDprime.material.path,proof.currentMaterialPath)
assert.equal(oldDprime.material.sha256,proof.materialBefore.sha256,'The immutable Dprime observation remains bound to its exact frozen before bytes')
assert.deepEqual(oldDprime.credit,proof.unchangedPlanningCredits[0])
assert.deepEqual(oldDprime.credit.requiredPartIds,['f13ca187-b680-5f47-b4ad-76bd474bd8a2'])
assert.deepEqual(oldDprime.credit.goalIds,['e4b38061-1f28-43ad-8371-a3e7c0e81856'])
const canonical=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
assert.equal(digest(canonical.goals.find((g:any)=>g.id===oldDprime.credit.requiredPartIds[0])),oldDprime.DGoalJsonStringifySha256)
const r2=read('curricula/DE/Gymnasium/quality/assessment-review/physik/e1-current-assessments-20261124-v1/dprime-passmark-successor-20261124/r2-coverage.actual.json')
const own=canonical.programUnits.find((u:any)=>u.id===r2.unitId)
assert.deepEqual(own.coverageReviews.find((r:any)=>r.assessmentGoalId===r2.coverage.assessmentGoalId),r2.coverage)
assert.deepEqual(own.coverageReviews.find((r:any)=>r.assessmentGoalId===oldDprime.credit.requiredPartIds[0]),oldDprime.DCoverage)
const {checkUnitPlanningReleases,planningReleaseFingerprint}=await load('app/scripts/checkUnitPlanningReleases.ts')
assert.equal(planningReleaseFingerprint(after.unit,oldDprime.credit),proof.unchangedPlanningFingerprint)
assert.deepEqual(checkUnitPlanningReleases(),[proof.unchangedPlanningFingerprint])
const registry=read(proof.unchangedReviewedPlanningReleaseRegistry.path)
assert.equal(registry.reviewedPlanningReleases[proof.unchangedPlanningFingerprint],oldDprime.credit.release.review.sha256)
for(const part of after.unit.assessmentContract.parts)assert.notEqual(part.goalId,proof.allowedDelta.after)
for(const credit of after.unit.assessmentContract.planningCredits){assert(!credit.goalIds.includes(proof.allowedDelta.after));assert(!credit.requiredPartIds.includes(proof.allowedDelta.after))}
console.log(JSON.stringify({status:'PASS',materialBeforeSha256:proof.materialBefore.sha256,materialAfterSha256:hash(proof.currentMaterialPath),onlyChangedField:proof.allowedDelta.path,requiredParts:4,unchangedPlanningFingerprint:proof.unchangedPlanningFingerprint,dprimeR2Unchanged:true,newPlanningCredits:0,oldRecordsRebound:0},null,2))
