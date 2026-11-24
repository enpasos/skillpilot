// SPDX-License-Identifier: Apache-2.0
// Read-only final-scope successor. The historical task result gains no new meaning.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { checkUnitPlanningReleases, planningReleaseFingerprint, validateSectionAssessmentPolicy } from '../../../../../../app/scripts/checkUnitPlanningReleases'
import { fingerprintCurrentCurriculumDocument as digest, loadCurrentCurriculumCatalog } from '../../../../../../app/scripts/currentCurriculumCatalog'
import { liveVerificationInputs } from '../../../../../../app/scripts/lib/verificationInputSnapshot'
import { UnitGraph } from '../../../../../../app/scripts/lib/learningUnitContracts'
import { prepareLandscapeEntries } from '../../../../../../app/src/hooks/useLandscapes'
import { collectRenderedAtomicGoalIdsFromCompositionView, createRouteProfiles, evaluateRouteProfile } from '../../../../../../app/scripts/generateCurriculumQualityStatus'
import { buildApplicabilityCompilation } from '../../../../../../app/scripts/applicabilityCompiler'

const root = resolve(import.meta.dirname, '../../../../../..')
const base = 'curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-planning-release-2026-11-24'
const materialReview = 'curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-materials-2026-11-24/mp-retirement-policy-20261124-v1'
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const pin = (path: string) => ({ path, sha256: 'sha256:' + createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex') })
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const materialPath = 'curricula/DE/Gymnasium/materials/physics/he-e1-motion-practice.json'
const childPath = 'curricula/DE/Gymnasium/materials/physics/he-e1-accelerated-and-free-fall.json'
const canonical = read(canonicalPath), material = read(materialPath)
const prior = read(materialReview + '/inputs/current-parent.material.json')
const expected = structuredClone(prior)
delete expected.unit.sectionAssessmentPolicy.additionalVoluntaryAssessmentGoalIdsByView
assert.deepEqual(material, expected)
assert.deepEqual(material, read(materialReview + '/inputs/no-successor.parent.material.json'))
assert.deepEqual(read(childPath), read(materialReview + '/inputs/current-child.material.json'))
const old = '2b9e565f-d9b4-5e23-b5b7-b7977cecff06', successor = '05cfd298-cb80-54c4-a898-b521ef270843'
const oldGoal = canonical.goals.find((goal: any) => goal.id === old)
assert(oldGoal)
assert(!canonical.goals.some((goal: any) => goal.id === successor))
assert.deepEqual(canonical.goals.filter((goal: any) => goal.contains?.includes(old)).map((goal: any) => goal.id),
  ['151edbf8-eb68-5ef7-8786-43e56a281b0b'])
assert.equal(oldGoal.extendedData.applicabilityProjection, 'excluded')
const historical = read('curricula/DE/Gymnasium/quality/assessment-review/physik/e1-current-assessments-20261124-v1/mp-current/approved-current.goal.json')
const oldWithoutMetadata = structuredClone(oldGoal), historicalWithoutMetadata = structuredClone(historical)
delete oldWithoutMetadata.extendedData
delete historicalWithoutMetadata.extendedData
assert.deepEqual(oldWithoutMetadata, historicalWithoutMetadata)
assert.equal(oldGoal.examData.scoring.maxPoints, 30)
assert.equal(oldGoal.examData.scoring.passingPoints, 18)
assert.deepEqual(oldGoal.examData.coveredGoalIds, [])
const review = read(base + '/coverage-review.actual.json'), activation = read(base + '/activation.receipt.json')
for (const row of review.currentGoalPayloads) {
  assert.equal(digest(canonical.goals.find((goal: any) => goal.id === row.goalId)), row.normalizedSha256)
}
assert.deepEqual(material.unit.assessmentContract.parts, activation.requiredPartEditionDelta.after)
assert.deepEqual(material.unit.assessmentContract.planningCredits, [activation.credit])
assert.equal(material.unit.assessmentContract.parts.length, 4)
assert.equal(material.unit.assessmentContract.contentGoalIds.length, 12)
assert.equal(material.unit.sectionAssessmentPolicy.additionalVoluntaryAssessmentGoalIdsByView, undefined)
assert.equal(planningReleaseFingerprint(material.unit, activation.credit), activation.fingerprint)
assert.deepEqual(checkUnitPlanningReleases(), [activation.fingerprint])
const initial = read(base + '/final-current-inputs.json')
const owner = canonical.programUnits.find((unit: any) => unit.id === 'physics-constant-acceleration')
assert.equal(owner.revision, '2026-11-23-v4')
assert.deepEqual(canonical.goalPlacements.filter((placement: any) => placement.relation === 'own' && placement.unitId === owner.id), initial.ownPlacements)

const catalog = loadCurrentCurriculumCatalog(liveVerificationInputs).entries.map(row => row.landscape)
const graph = new UnitGraph(catalog as any), entries = prepareLandscapeEntries(catalog as any)
const viewDirectory = 'curricula/DE/Gymnasium/composition-views/physik'
const allViews = readdirSync(resolve(root, viewDirectory)).filter(name => name.endsWith('.view.json'))
const contractViews = new Map(), heViews: any[] = []
const childIds = ['physics-e1-uniform-motion', 'physics-e1-accelerated-and-free-fall', 'physics-e1-air-and-vacuum', 'physics-e1-two-motions']
const walk = (nodes: any[]): any[] => nodes.flatMap(node => [node, ...walk(node.children ?? [])])
for (const name of allViews) {
  const path = viewDirectory + '/' + name, view = read(path), nodes = walk(view.rootNodes)
  assert(!nodes.some(node => node.goalId === old || node.goalId === successor), 'Retired or unapproved task reference: ' + path)
  if (material.unit.assessmentContract.viewIds.includes(view.viewId)) contractViews.set(view.viewId, view)
  if (!/^de-he-(?:(?:gk|lk)(?:-g[89])?|sekii-(?:gk|lk))\.view\.json$/.test(name)) continue
  const e1 = nodes.filter(node => node.id === 'physics-e1-motion')
  assert.equal(e1.length, 1)
  const actualChildren = e1[0].children.filter((node: any) => childIds.includes(node.id)).map((node: any) => node.id)
  assert.deepEqual(actualChildren, childIds)
  const visible = collectRenderedAtomicGoalIdsFromCompositionView(canonical, resolve(root, path), [view.scope.courseProfile], false, undefined, [], catalog as any)
  assert(!visible.has(old) && !visible.has(successor))
  heViews.push({ ...pin(path), viewId: view.viewId, scope: view.scope, fourChildren: actualChildren,
    effectiveOldMpVisible: false, effectiveNewMpVisible: false })
}
assert.equal(heViews.length, 8)
assert.equal(contractViews.size, 6)
validateSectionAssessmentPolicy(material.unit, contractViews as any, graph, entries)
const originalLocations = read(base + '/mp-identity-preflight-20261124/review.actual.json').referenceInventory.activeViews
assert.equal(originalLocations.length, 64)
const removedPlaces = originalLocations.map((before: any) => {
  const view = read(before.path)
  const visibleAndSupport = collectRenderedAtomicGoalIdsFromCompositionView(canonical, resolve(root, before.path),
    [view.scope.courseProfile], true, undefined, [], catalog as any)
  assert(!visibleAndSupport.has(old) && !visibleAndSupport.has(successor), 'Historical identity still rendered: ' + before.path)
  return { path: before.path, historicalSha256: before.sha256, currentSha256: pin(before.path).sha256,
    oldRawAndEffectiveReferenceAbsent: true, unapprovedSuccessorAbsent: true }
})
const profile = createRouteProfiles(root).find(profile => profile.profileId === 'canonical-physics-sek2')!
const cqr203 = evaluateRouteProfile(canonical, profile, buildApplicabilityCompilation()).rules.find(rule => rule.id === 'CQR-203')!
assert.equal(cqr203.status, 'pass')
assert.equal(cqr203.metrics.terminalAutonomyGoals, 111)
assert.equal(cqr203.metrics.releasedCoverageCompleteExamData, 111)
console.log(JSON.stringify({ schema: 'e1-v5-no-successor-material-R2-planning-and-final-view-scope-supersession-v1',
  checkedAt: new Date().toISOString(), status: 'PASS_OLD_MP_RETIRED_NO_SUCCESSOR_BES_RELEASE_UNCHANGED',
  supersedesScopeOnly: pin(base + '/v4-mp-scope-supersession.actual.json'),
  materialActivation: pin(materialReview + '/material-activation.actual.json'),
  currentParentMaterial: pin(materialPath), unchangedChildMaterial: pin(childPath),
  materialOnlyDelta: '/unit/sectionAssessmentPolicy/additionalVoluntaryAssessmentGoalIdsByView removed',
  scope: { ownerUnitId: owner.id, ownerRevision: owner.revision, requiredParts: 4, contentGoals: 12,
    creditedGoalIds: review.creditedGoalIds, uncreditedGoalIds: review.uncreditedGoalIds,
    planningWitnessIds: activation.credit.requiredPartIds, undeclaredChildren: [1, 3, 4],
    commonVoluntaryIds: material.unit.sectionAssessmentPolicy.voluntaryAssessmentGoalIds,
    additionalVoluntaryIds: [], historicalOldAssessmentId: old, successorActivated: false },
  historicalResult: { currentGoalNormalizedSha256: digest(oldGoal), historicalSnapshot: pin('curricula/DE/Gymnasium/quality/assessment-review/physik/e1-current-assessments-20261124-v1/mp-current/approved-current.goal.json'),
    fullPayloadEqualExceptExclusionMetadata: true, maxPoints: 30, passingPoints: 18, coverage: [],
    learnerResultsWrittenOrTransferred: false },
  unchangedRelease: { fingerprint: activation.fingerprint, fullCreditBytesEqual: true, allFourPartRowsEqual: true,
    allEighteenReviewedGoalPayloadsEqual: true, ownPlacementsEqual: true,
    nativePlanningReleaseCheck: 'PASS', nativeSixViewPolicyCheck: 'PASS',
    review: pin(base + '/coverage-review.actual.json'), activation: pin(base + '/activation.receipt.json') },
  actualCQR203: cqr203, actualRatherThanCounterfactual: true, heViews, removedHistoricalPlaces: removedPlaces,
  allViewFilesCheckedForForbiddenRawReferences: allViews.length,
  currentInputPins: [canonicalPath, 'curricula/unit-learning-materials.json', 'scripts/generate_hessen_physics_stage_views.py',
    'scripts/generate_laender_physics_stage_views.py', 'scripts/generate_laender_physics_stage_views.sources.json',
    review.currentBinding.positiveEvidenceConfigPath, read(review.currentBinding.positiveEvidenceConfigPath).reviewPath].map(pin),
  limits: 'Current technical source/role/coverage and release proof only. The rejected new task is not approved or activated. No MOD credit, historical result reinterpretation, quality-rule change, human acceptance or broad CI completion is inferred.',
  sharedFilesWritten: [] }, null, 2))
