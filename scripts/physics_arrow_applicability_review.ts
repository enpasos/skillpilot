// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync, readdirSync} from 'node:fs'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {buildApplicabilityCompilation} from '../app/scripts/applicabilityCompiler'
import {prepareLandscapeEntries} from '../app/src/hooks/useLandscapes'
import {collectCompositionProjectionRoleGoalIds} from '../app/src/utils/authoring/compositionViewAuthoring'
import {applyCompositionViewProjection} from '../app/src/utils/compositionViewRuntime'
import {goalMatchesFilters} from '../app/src/utils/goalFilters'
const folder='curricula/DE/Gymnasium/quality/learning-units/physics-directed-quantity-arrows-20261126-v1/routes/applicability'
const physicsId='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',k4='2569d84a-5bf1-542b-bc43-6ade1df971c4',arrow='b77a7e93-22f9-5722-a4cc-f18a149ab030'
const digest=(x:any)=>createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex')
export const arrowWarningSuccessorPath = 'curricula/DE/Gymnasium/quality/learning-units/physics-e2-forces-20261126-w1/routes/applicability/k4-current-offer.v4.successor.actual.json'

/** Measure the same individual K4 disposition against the current authored offers. */
export function buildCurrentArrowWarningSuccessor(root: string) {
  const bytes = (file: string) => readFileSync(resolve(root, file))
  const read = (file: string) => JSON.parse(bytes(file).toString('utf8'))
  const pin = (file: string) => ({path: file, sha256: digest(bytes(file))})
  const registry = read('docs/qa-ci/applicability-accepted-warnings.json')
  const entry = registry.acceptedWarnings.find((row: any) => row.goalId === k4 && row.landscapeId === physicsId)
  assert(entry, 'Missing individual K4 warning disposition')
  const retainedRegistryPath = 'curricula/DE/Gymnasium/quality/learning-units/physics-e2-forces-20261126-w1/routes/applicability/accepted-warnings.predecessor.json'
  const retainedEntry = read(retainedRegistryPath).acceptedWarnings.find((row: any) => row.goalId === k4 && row.landscapeId === physicsId)
  assert.deepEqual(entry, retainedEntry, 'Historical individual K4 warning decision changed')
  const predecessor = read(entry.evidence.currentPreparationReviewPath)
  assert.equal(digest(bytes(entry.evidence.currentPreparationReviewPath)), entry.evidence.currentPreparationReviewSha256)
  const source = read(predecessor.sourceDecisions.path)
  assert.equal(digest(bytes(predecessor.sourceDecisions.path)), predecessor.sourceDecisions.sha256)
  const catalogPaths = readdirSync(resolve(root, 'curricula/DE/Gymnasium/canonical'))
    .filter(name => name.endsWith('.json')).sort().map(name => `curricula/DE/Gymnasium/canonical/${name}`)
  const catalog = catalogPaths.map(read)
  const physics = catalog.find(document => document.landscapeId === physicsId)
  const prepared = prepareLandscapeEntries(catalog)
  const goals = new Map<string, any>(prepared.flatMap(document => document.goals.map(goal => [goal.id, goal] as const)))
  const viewPaths = readdirSync(resolve(root, 'curricula/DE/Gymnasium/composition-views/physik'))
    .filter(name => name.endsWith('.view.json')).sort()
    .map(name => `curricula/DE/Gymnasium/composition-views/physik/${name}`)
  assert.equal(viewPaths.length, 90)
  const viewStates = viewPaths.map(file => {
    const view = read(file)
    const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, goals)
    const projected = applyCompositionViewProjection(prepared, view).find(document => document.meta.landscapeId === physicsId)!
    const visible = new Set(projected.goals.flatMap(goal => goal.contains ?? []))
    const filters = [view.scope.courseProfile, view.scope.jurisdiction, view.scope.durationModel].filter(Boolean)
    const role = (id: string) => roles.targetGoalIds.has(id) ? 'target'
      : roles.prerequisiteOnlyGoalIds.has(id) ? 'prerequisiteOnly' : 'absent'
    return {viewId: view.viewId, scope: view.scope, arrowRole: role(arrow), k4Role: role(k4),
      k4Visible: visible.has(k4), k4Offered: roles.targetGoalIds.has(k4) && visible.has(k4)
        && goalMatchesFilters(goals.get(k4), filters)}
  })
  const expectedOffers = source.views.filter((view: any) => view.assessmentOffered).map((view: any) => view.viewId).sort()
  const offeredViewIds = viewStates.filter(view => view.k4Offered).map(view => view.viewId).sort()
  assert.deepEqual(offeredViewIds, expectedOffers, 'Current K4 offer scope differs from the reviewed source decision')
  for (const state of viewStates) {
    const decision = source.views.find((view: any) => view.viewId === state.viewId)
    assert(decision, `Missing A2 source decision for ${state.viewId}`)
    assert.equal(state.arrowRole, decision.projectionRole)
    assert.equal(state.k4Role, decision.assessmentOffered ? 'target' : 'absent')
    assert.equal(state.k4Visible, decision.assessmentOffered)
  }
  const compile = (control: string) => {
    const documents = structuredClone(catalog)
    const goal = documents.find(document => document.landscapeId === physicsId).goals.find((item: any) => item.id === k4)
    if (control === 'withoutOverride') delete goal.extendedData.applicabilityOverrides
    if (control === 'withoutBoundary') delete goal.extendedData.applicabilityMappingInheritance
    if (control === 'explicitWidening') {
      goal.applicability.jurisdiction = [...goal.applicability.jurisdiction, 'DE-HE'].sort()
      goal.extendedData.applicabilityOverrides.jurisdiction = [...goal.extendedData.applicabilityOverrides.jurisdiction, 'DE-HE'].sort()
    }
    const report = buildApplicabilityCompilation(documents.map((landscape, index) => ({file: resolve(root, catalogPaths[index]), landscape})))
      .reports.find(item => item.landscapeId === physicsId)!
    const compiledGoal = report.goals.find(item => item.goalId === k4)!
    const compiledJurisdictions = compiledGoal.compiledApplicability.jurisdiction ?? []
    return {control, goalJsonStringifySha256: digest(goal), compiledJurisdictions,
      findings: report.findings.filter(item => item.goalId === k4),
      offeredViewIdsAfterCompiledJurisdictionFilter: viewStates.filter(view => view.k4Offered
        && (!view.scope.jurisdiction || view.scope.jurisdiction === 'DE' || compiledJurisdictions.includes(view.scope.jurisdiction)))
        .map(view => view.viewId).sort()}
  }
  const current = compile('current')
  const warnings = current.findings.filter(finding => finding.code === 'APV-201' && finding.severity === 'warning')
  assert.equal(warnings.length, 1, 'Expected the same individual current K4 APV-201')
  return {
    schemaVersion: 1,
    contract: 'physics-arrow-individual-k4-current-offer-successor-v1',
    predecessorAudit: pin(entry.evidence.currentPreparationReviewPath),
    retainedWarningDecision: {registry: pin(retainedRegistryPath), entryJsonStringifySha256: digest(entry),
      review: pin(entry.evidence.reviewPath)},
    sourceDecisions: pin(predecessor.sourceDecisions.path),
    compiler: pin('app/scripts/applicabilityCompiler.ts'),
    canonicalInputs: catalogPaths.map(pin),
    reviewedGoals: [arrow, k4].map(goalId => ({goalId,
      canonicalGoalJsonStringifySha256: digest(physics.goals.find((goal: any) => goal.id === goalId))})),
    exactWarning: warnings[0], compiledJurisdictions: current.compiledJurisdictions,
    offeredViewIds, viewBindings: viewPaths.map(pin), viewStates,
    counts: {landTargetOffers: viewStates.filter(view => view.k4Offered && (view.scope.jurisdiction ?? 'DE') !== 'DE').length,
      ownNationalTargetOffers: viewStates.filter(view => view.k4Offered && (view.scope.jurisdiction ?? 'DE') === 'DE').length,
      preparationViewsWithoutK4: viewStates.filter(view => view.arrowRole === 'prerequisiteOnly' && !view.k4Visible).length},
    countermodels: ['withoutOverride', 'withoutBoundary', 'explicitWidening'].map(compile),
    newWarningAcceptanceOrSourceAuthorityGranted: false,
  }
}
export function validateArrowWarningDisposition(input:any) {
  const {entry,review,audit,currentAudit,goal,arrowGoal,currentFinding,expectedJurisdictions}=input
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
  assert(currentAudit, 'A current individual K4 offer successor is required')
  assert.deepEqual(currentAudit.exactWarning, currentFinding, 'Current K4 diagnostic differs from its individual successor')
  assert.deepEqual(currentAudit.compiledJurisdictions, expectedJurisdictions)
  assert.deepEqual(currentAudit.offeredViewIds, input.expectedOfferedViews, 'Current K4 successor offer set differs from the reviewed views')
  assert.equal(currentAudit.reviewedGoals.find((row:any)=>row.goalId===k4).canonicalGoalJsonStringifySha256,digest(goal))
  assert.equal(currentAudit.reviewedGoals.find((row:any)=>row.goalId===arrow).canonicalGoalJsonStringifySha256,digest(arrowGoal))
  assert.equal(currentAudit.viewStates.length,90)
  assert.equal(new Set(currentAudit.viewStates.map((row:any)=>row.viewId)).size,90)
  assert.deepEqual(currentAudit.counts,{landTargetOffers:42,ownNationalTargetOffers:3,preparationViewsWithoutK4:45})
  assert.equal(currentAudit.newWarningAcceptanceOrSourceAuthorityGranted,false)
  const noOverride=currentAudit.countermodels.find((row:any)=>row.control==='withoutOverride')
  assert.equal(noOverride.offeredViewIdsAfterCompiledJurisdictionFilter.length,3)
  assert(noOverride.findings.some((finding:any)=>finding.code==='APV-203'))
  const noBoundary=currentAudit.countermodels.find((row:any)=>row.control==='withoutBoundary')
  assert.equal(noBoundary.compiledJurisdictions.length,16)
  const widening=currentAudit.countermodels.find((row:any)=>row.control==='explicitWidening')
  assert(widening.compiledJurisdictions.includes('DE-HE'))
  assert.notEqual(widening.goalJsonStringifySha256,digest(goal))
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
  const currentAudit = read(arrowWarningSuccessorPath)
  assert.deepEqual(buildCurrentArrowWarningSuccessor(root), currentAudit, 'Current individual K4 offer successor is stale')
  assert.equal(currentAudit.predecessorAudit.path, entry.evidence.currentPreparationReviewPath)
  assert.equal(currentAudit.predecessorAudit.sha256, entry.evidence.currentPreparationReviewSha256)
  assert.deepEqual(currentAudit.offeredViewIds, audit.exactOfferedViewIds)
  assert.deepEqual(currentAudit.compiledJurisdictions, audit.compiledJurisdictions)
  for (const field of ['landTargetOffers','ownNationalTargetOffers','preparationViewsWithoutK4']) {
    assert.equal(currentAudit.counts[field], audit.counts[field])
  }
  const expectedJurisdictions=sources.states.filter((s:any)=>s.decision==='lowerStageTargetOperationalisation').map((s:any)=>'DE-'+s.land).sort()
  assert.equal(expectedJurisdictions.length,14);assert(!expectedJurisdictions.includes('DE-HE'));assert(!expectedJurisdictions.includes('DE-BW'))
  const physics=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'),goal=physics.goals.find((g:any)=>g.id===k4),arrowGoal=physics.goals.find((g:any)=>g.id===arrow)
  const report=buildApplicabilityCompilation().reports.find(r=>r.landscapeId===physicsId)!
  const currentFinding=report.findings.find(f=>f.code==='APV-201'&&f.goalId===k4)
  assert(currentFinding,'review cannot accept an absent warning')
  const expectedOfferedViews=sources.views.filter((v:any)=>v.assessmentOffered).map((v:any)=>v.viewId).sort()
  const input={entry,review,audit,currentAudit,goal,arrowGoal,currentFinding,expectedJurisdictions,expectedOfferedViews,reviewBytes,auditBytes}
  validateArrowWarningDisposition(input)
  return input
}
