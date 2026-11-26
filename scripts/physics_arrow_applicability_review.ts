// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {buildApplicabilityCompilation} from '../app/scripts/applicabilityCompiler'
const folder='curricula/DE/Gymnasium/quality/learning-units/physics-directed-quantity-arrows-20261126-v1/routes/applicability'
const physicsId='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',k4='2569d84a-5bf1-542b-bc43-6ade1df971c4',arrow='b77a7e93-22f9-5722-a4cc-f18a149ab030'
const digest=(x:any)=>createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex')
export function validateArrowWarningDisposition(input:any) {
  const {entry,review,audit,goal,arrowGoal,currentFinding,expectedJurisdictions}=input
  const key=`APV-201|${physicsId}|${k4}|jurisdiction|`
  assert.equal(entry.code,'APV-201');assert.equal(entry.goalId,k4);assert.equal(entry.landscapeId,physicsId)
  assert.equal(entry.evidence.exactWarningKey,key)
  assert.equal(entry.evidence.rowPointer,'/decisions/0')
  assert.equal(expectedJurisdictions.length,14);assert(!expectedJurisdictions.includes('DE-HE'));assert(!expectedJurisdictions.includes('DE-BW'))
  assert.equal(entry.evidence.reviewFileSha256,digest(input.reviewBytes),'stale warning review bytes')
  assert.equal(entry.evidence.currentPreparationReviewSha256,digest(input.auditBytes),'stale current-offer evidence')
  assert.equal(entry.evidence.currentGoalJsonStringifySha256,digest(goal),'stale actual K4 goal')
  assert.equal(audit.reviewedGoals.find((g:any)=>g.goalId===arrow).canonicalGoalJsonStringifySha256,digest(arrowGoal),'stale arrow goal scope')
  assert.deepEqual(goal.extendedData.applicabilityOverrides.jurisdiction,expectedJurisdictions,'wrong current override scope')
  assert.equal(goal.extendedData.applicabilityMappingInheritance,'boundary')
  assert.deepEqual(entry.evidence.exactOverrideJurisdictions,expectedJurisdictions)
  assert.deepEqual(entry.evidence.compiledJurisdictions,expectedJurisdictions)
  assert.deepEqual(audit.compiledJurisdictions,expectedJurisdictions)
  assert.deepEqual(review.decisions[0].actualDiagnostic,currentFinding,'warning message or exact scope changed')
  assert.deepEqual(entry.evidence.offeredViewIds,audit.exactOfferedViewIds)
  assert.deepEqual(audit.exactOfferedViewIds,input.expectedOfferedViews,'wrong current target offer set')
  assert.equal(audit.counts.landTargetOffers,42);assert.equal(audit.counts.ownNationalTargetOffers,3)
  assert.equal(audit.counts.preparationViewsWithoutK4,45)
  assert.equal(review.decisions.length,1);assert.equal(review.decisions[0].exactWarningKey,key)
  assert.equal(review.humanApproval,false);assert.equal(entry.evidence.humanApproval,false)
  assert.equal(audit.countermodels.find((m:any)=>m.mode==='withoutOverride').offeredViewIdsAfterCompiledJurisdictionFilter.length,3)
  assert.equal(audit.countermodels.find((m:any)=>m.mode==='withoutBoundary').goal.compiledApplicability.jurisdiction.length,16)
}
export function loadAndVerifyArrowWarningDisposition(root:string) {
  const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8')),bytes=(p:string)=>readFileSync(resolve(root,p))
  const registry=read('docs/qa-ci/applicability-accepted-warnings.json'),predecessor=read(`${folder}/accepted-warnings.predecessor.json`)
  assert.deepEqual(registry.acceptedWarnings.slice(0,predecessor.acceptedWarnings.length),predecessor.acceptedWarnings,'preexisting warning rows changed')
  const entries=registry.acceptedWarnings.filter((r:any)=>r.code==='APV-201'&&r.landscapeId===physicsId&&r.goalId===k4)
  assert.equal(entries.length,1,'exactly one current K4 warning disposition required')
  const entry=entries[0],reviewBytes=bytes(entry.evidence.reviewPath),auditBytes=bytes(entry.evidence.currentPreparationReviewPath),review=JSON.parse(reviewBytes.toString()),audit=JSON.parse(auditBytes.toString())
  const sources=read(audit.sourceDecisions.path)
  assert.equal(digest(bytes(audit.sourceDecisions.path)),audit.sourceDecisions.sha256)
  assert.equal(digest(bytes(audit.compiler.path)),audit.compiler.sha256,'compiler changed after actual offer audit')
  for(const binding of audit.viewBindings)assert.equal(digest(bytes(binding.path)),binding.sha256,'actual view changed after audit '+binding.path)
  const expectedJurisdictions=sources.states.filter((s:any)=>s.decision==='lowerStageTargetOperationalisation').map((s:any)=>'DE-'+s.land).sort()
  assert.equal(expectedJurisdictions.length,14);assert(!expectedJurisdictions.includes('DE-HE'));assert(!expectedJurisdictions.includes('DE-BW'))
  const physics=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'),goal=physics.goals.find((g:any)=>g.id===k4),arrowGoal=physics.goals.find((g:any)=>g.id===arrow)
  const report=buildApplicabilityCompilation().reports.find(r=>r.landscapeId===physicsId)!
  const currentFinding=report.findings.find(f=>f.code==='APV-201'&&f.goalId===k4)
  assert(currentFinding,'review cannot accept an absent warning')
  const expectedOfferedViews=sources.views.filter((v:any)=>v.assessmentOffered).map((v:any)=>v.viewId).sort()
  const input={entry,review,audit,goal,arrowGoal,currentFinding,expectedJurisdictions,expectedOfferedViews,reviewBytes,auditBytes}
  validateArrowWarningDisposition(input)
  return input
}
