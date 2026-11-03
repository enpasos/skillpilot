import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { normalizeCanonicalLandscape } from '../../../app/src/utils/authoring/canonicalAuthoring'
import {
  collectCompositionProjectionRoleGoalIds,
  compileCompositionView,
  normalizeCompositionView,
} from '../../../app/src/utils/authoring/compositionViewAuthoring'
import { fingerprintSemanticKindSourceGoal } from '../../../app/scripts/goalBookModel'
import { intersectApplicabilityJurisdictions } from '../../../app/scripts/applicabilityCompiler'

const root = process.cwd()
const out = resolve(root, 'tmp/approach-review-20261101/route-actions-batch2-placement')
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const local = (name: string) => JSON.parse(readFileSync(resolve(out, name), 'utf8'))
const save = (name: string, data: unknown) => writeFileSync(resolve(out, name), JSON.stringify(data, null, 2) + '\n')
const digest = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')
const baseline = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
const candidate = local('candidate.goal.json')
const parent = local('parent-before-after.json')
const weights = local('ancestor-weight-deltas.json')
const viewProposal = local('view-reference-proposal.json')
const expectations = local('expected-offerings.json')
const before = normalizeCanonicalLandscape(baseline)
const modified = structuredClone(baseline)
modified.goals.push(candidate)
for (const goal of modified.goals) {
  if (goal.id === parent.goalId) Object.assign(goal, parent.after)
  const weight = weights.deltas.find((e: any) => e.goalId === goal.id)
  if (weight) goal.weight = weight.proposedWeightAfter
}
const after = normalizeCanonicalLandscape(modified)
const beforeMap = new Map(before.goals.map((g) => [g.id, g]))
const afterMap = new Map(after.goals.map((g) => [g.id, g]))
const rootByLandscape = new Map([[before.landscapeId, 'c01b1ce9-a667-4a46-b251-ec33ae602b15']])
const views = new Map<string, any>()
const findings: any[] = []
for (const file of readdirSync(resolve(root, 'curricula/DE/Gymnasium/composition-views/mathematik')).filter((p) => p.endsWith('.view.json')).sort()) {
  const path = 'curricula/DE/Gymnasium/composition-views/mathematik/' + file
  const original = read(path)
  const withEntry = structuredClone(original)
  const operation = viewProposal.operations.find((e: any) => e.viewId === original.viewId)
  if (operation) {
    assert.equal(digest(resolve(root, path)), operation.beforeSha256)
    let array = withEntry
    for (const part of operation.childrenPath) array = array[part]
    assert.equal(array.length, operation.beforeChildCount)
    array.push(operation.afterNode)
  }
  const normalized = normalizeCompositionView(original)
  const proposed = normalizeCompositionView(withEntry)
  const beforeRoles = collectCompositionProjectionRoleGoalIds(normalized.rootNodes, beforeMap, rootByLandscape)
  const parentOnlyRoles = collectCompositionProjectionRoleGoalIds(normalized.rootNodes, afterMap, rootByLandscape)
  const afterRoles = collectCompositionProjectionRoleGoalIds(proposed.rootNodes, afterMap, rootByLandscape)
  const added = [...afterRoles.targetGoalIds].filter((id) => !beforeRoles.targetGoalIds.has(id))
  const removed = [...beforeRoles.targetGoalIds].filter((id) => !afterRoles.targetGoalIds.has(id))
  assert(added.every((id) => id === candidate.id), original.viewId + ': other target imported')
  assert.deepEqual(removed, [], original.viewId + ': existing target removed')
  assert.deepEqual([...afterRoles.prerequisiteOnlyGoalIds].sort(), [...beforeRoles.prerequisiteOnlyGoalIds].sort(), original.viewId + ': support role changed')
  const beforeCompilation = compileCompositionView(normalized, before)
  const afterCompilation = compileCompositionView(proposed, after)
  const beforeErrors = beforeCompilation.findings.filter((f) => f.severity === 'error')
  const afterErrors = afterCompilation.findings.filter((f) => f.severity === 'error')
  assert.deepEqual(afterErrors, beforeErrors, original.viewId + ': new native view errors')
  assert.deepEqual(afterErrors, [], original.viewId + ': native source view errors')
  const result = { viewId: original.viewId, path, addedTargetGoalIds: added,
    removedTargetGoalIds: removed, prerequisiteOnlyUnchanged: true,
    newAssessmentViaParentOnly: parentOnlyRoles.targetGoalIds.has(candidate.id),
    newAssessmentAfterFourEntries: afterRoles.targetGoalIds.has(candidate.id),
    nativeBeforeErrors: beforeErrors, nativeAfterErrors: afterErrors }
  views.set(original.viewId, result)
  findings.push(result)
}
const offerResults = expectations.offers.map((offer: any) => {
  const ids = offer.compositionViewIds.flatMap((id: string) => id.replace(/^merged:/u, '').split('+'))
  const actual = ids.some((id: string) => views.get(id).newAssessmentAfterFourEntries)
  const parentOnly = ids.some((id: string) => views.get(id).newAssessmentViaParentOnly)
  assert.equal(actual, offer.expectedNewAssessmentTarget, offer.offerId + ': expected offering mismatch')
  assert.equal(parentOnly, offer.transportByParentOnly)
  return { offerId: offer.offerId, expectedNewAssessmentTarget: actual,
    parentOnly, prerequisiteOnlyUnchanged: true, existingTargetsUnchanged: true }
})
assert.equal(offerResults.filter((e: any) => e.expectedNewAssessmentTarget).length, 132)
assert.equal(offerResults.filter((e: any) => e.parentOnly).length, 126)
const baselineGoals = new Map(baseline.goals.map((g: any) => [g.id, g]))
const derivedApplicability = intersectApplicabilityJurisdictions(candidate.requires.map((id: string) => (baselineGoals.get(id) as any).applicability))
assert.deepEqual(candidate.applicability, { jurisdiction: derivedApplicability })
assert.equal(derivedApplicability.length, 16)
const ledger = read('curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json')
const parentDecision = ledger.decisions.find((d: any) => d.goalId === parent.goalId)
assert.equal(parentDecision.sourceFingerprint, fingerprintSemanticKindSourceGoal(parent.before))
const parentDecisionAfter = { ...parentDecision, sourceFingerprint: fingerprintSemanticKindSourceGoal(parent.after) }
const newDecision = { goalId: candidate.id, sourceFingerprint: fingerprintSemanticKindSourceGoal(candidate),
  semanticKind: 'practiceAssessment', decisionStatus: 'authoritative',
  decisionBasis: 'reviewed-current-pilot-practice-assessment' }
save('practice-assessment-ledger-proposal.json', {
  status: 'PROPOSED_ONLY_PENDING_PLACEMENT_DECISION_NOT_AUTHORITATIVE_WRITTEN_STATE',
  targetPath: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  beforeSha256: digest(resolve(root, 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json')),
  newDecisionBefore: null, newDecisionAfter: newDecision,
  parentDecisionBefore: parentDecision, parentDecisionAfter,
  countDeltas: { practiceAssessment: { before: ledger.counts.practiceAssessment, after: ledger.counts.practiceAssessment + 1 },
    total: { before: ledger.counts.total, after: ledger.counts.total + 1 } },
  unchangedExistingDecisionCount: ledger.decisions.length - 1,
  note: 'One new practiceAssessment classification; preserve every existing classification. Only parent contains changes its fingerprint. Ancestor weight is excluded by the pinned source-fingerprint contract. The proposed authoritative row remains inert pending independent placement decision.'
})
for (const weight of weights.deltas.filter((d: any) => d.goalId !== parent.goalId)) {
  const oldGoal = baselineGoals.get(weight.goalId) as any
  assert.equal(fingerprintSemanticKindSourceGoal(oldGoal), fingerprintSemanticKindSourceGoal({ ...oldGoal, weight: weight.proposedWeightAfter }))
}
save('native-authoring-validation.json', {
  status: 'NATIVE_AUTHORING_PROOF_NOT_ACTUAL154_RUNTIME_OR_M7_ACCEPTANCE',
  candidateGoalSha256: digest(resolve(out, 'candidate.goal.json')),
  sourceViewCount: findings.length, sourceViewsWithNewCompilerErrors: 0,
  expectedOfferedScopeCount: 154, expectedNewTargetOffers: 132, parentOnlyTargetOffers: 126,
  insertedAuthoredReferences: 4, additionalOrdinaryTargets: 0, changedSupportRoles: 0,
  existingTargetsAndPrerequisiteOnlyPreserved: true,
  derivedJurisdictionCache: derivedApplicability,
  applicabilityEvidenceBoundary: 'Native all-of intersection helper applied to current prerequisite caches; full compiler/source re-review and actual154 remain separate. No new mapping/provenance entries.',
  singleMasteryDecision: true, draftRuntimeReleaseUnchanged: true,
  sourceViews: findings, offeredExpectations: offerResults,
})
console.log(JSON.stringify({ sourceViews: findings.length, errors: 0, parentOnly: 126, proposedNewTargetOffers: 132, newOrdinaryTargets: 0, supportPromotions: 0 }))
