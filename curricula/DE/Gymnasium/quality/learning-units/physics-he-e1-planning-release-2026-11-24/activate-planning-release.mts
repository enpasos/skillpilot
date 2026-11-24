// SPDX-License-Identifier: Apache-2.0
// Narrow R2/R5 activation: current-input P is a precondition, never a hash-only substitute.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { isDeepStrictEqual } from 'node:util'
import { checkUnitPlanningReleases, planningGoalDefinition, planningReleaseFingerprint, validatePlanningRelease } from '../../../../../../app/scripts/checkUnitPlanningReleases'
import { fingerprintCurrentCurriculumDocument, loadCurrentCurriculumCatalog } from '../../../../../../app/scripts/currentCurriculumCatalog'
import { liveVerificationInputs } from '../../../../../../app/scripts/lib/verificationInputSnapshot'
import { UnitGraph, assessmentReviewRevisions } from '../../../../../../app/scripts/lib/learningUnitContracts'
import { fingerprintPositiveGoalEvidenceProfile } from '../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../app/scripts/positiveGoalEvidenceReview'

const root = resolve(import.meta.dirname, '../../../../../..')
const directory = 'curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-planning-release-2026-11-24'
const reviewPath = directory + '/coverage-review.actual.json'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const materialPath = 'curricula/DE/Gymnasium/materials/physics/he-e1-motion-practice.json'
const registryPath = 'curricula/unit-learning-materials.json'
const rolloutPath = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const ownerId = 'physics-constant-acceleration'
const ownerRevision = '2026-11-23-v4'
const bes = 'e4b38061-1f28-43ad-8371-a3e7c0e81856'
const d = 'f13ca187-b680-5f47-b4ad-76bd474bd8a2'
const dPrime = 'a8dc0290-9f80-5763-8943-e16b8d2aa860'
const views = ['de-he-gym-physics-gk-g8', 'de-he-gym-physics-lk-g8', 'de-he-gym-physics-gk-g9',
  'de-he-gym-physics-lk-g9', 'de-he-gym-sekii-physics-gk', 'de-he-gym-sekii-physics-lk']
const bytes = (path: string) => readFileSync(resolve(root, path))
const json = (path: string) => JSON.parse(bytes(path).toString('utf8'))
const hash = (path: string) => 'sha256:' + createHash('sha256').update(bytes(path)).digest('hex')
const write = process.argv.includes('--write')
const beforeWritePins = [canonicalPath, materialPath, registryPath].map(path => ({ path, sha256: hash(path) }))
assert(process.argv.slice(2).every(arg => arg === '--write'), 'Only --write is supported')
const decision = json(reviewPath)
assert.equal(decision.status, 'APPROVED_BES_ONLY_CURRENT_INPUTS')
assert.deepEqual(decision.creditedGoalIds, [bes])
assert.deepEqual(decision.candidateCredit, { requiredPartIds: [d], goalIds: [bes], ownerUnitId: ownerId, ownerRevision })
for (const pin of decision.evidencePins) assert.equal(hash(pin.path), pin.sha256, 'Changed independent evidence: ' + pin.path)
const canonical = json(canonicalPath)
for (const pin of decision.currentGoalPayloads) {
  const actual = canonical.goals.find((row: any) => row.id === pin.goalId)
  assert(actual, 'Missing current reviewed goal: ' + pin.goalId)
  assert.equal(fingerprintCurrentCurriculumDocument(actual), pin.normalizedSha256, 'Current reviewed payload differs: ' + pin.goalId)
}
if (decision.dSuccessor) {
  const previousD = json(decision.dSuccessor.previousInputCapsulePath).currentParts.find((row: any) => row.id === d)
  const currentD = json(decision.dSuccessor.currentInputCapsulePath).currentParts.find((row: any) => row.id === d)
  assert.deepEqual(currentD, canonical.goals.find((row: any) => row.id === d), 'Exact independently reviewed D successor differs')
  const delta = json(decision.dSuccessor.deltaPath)
  assert.deepEqual(delta.changedFields.map((row: any) => row.path), [
    'examData.solutionContent', 'examData.solutionContentEn', 'examData.scoring.steps[0].description',
  ], 'Only the independently reviewed three-field D clarification is permitted')
  for (const change of delta.changedFields) {
    const keys = change.path.replace(/\[(\d+)\]/g, '.$1').split('.')
    let parent = previousD
    for (const key of keys.slice(0, -1)) parent = parent[key]
    assert.deepEqual(parent[keys.at(-1)!], change.before)
    parent[keys.at(-1)!] = change.after
  }
  assert.deepEqual(previousD, currentD, 'D successor has an unreviewed field delta')
}
const goal = canonical.goals.find((row: any) => row.id === bes)
const owner = canonical.programUnits.filter((row: any) => row.id === ownerId)
assert.equal(owner.length, 1)
assert.equal(owner[0].revision, ownerRevision)
assert.deepEqual(canonical.goalPlacements.filter((row: any) => row.relation === 'own' && row.unitId === ownerId)
  .map((row: any) => row.goalId).sort(), [bes, d, dPrime, 'b4e95dce-8537-5e38-8aa6-0d9cfaa2b19e'].sort())
assert.equal(planningGoalDefinition(goal), decision.currentBinding.goalDefinition)
const rollout = json(rolloutPath).subjects.find((row: any) => row.landscapePath === canonicalPath)
const activeConfigs = rollout.positiveEvidenceConfigPaths.map((path: string) => ({ path, config: json(path) }))
  .filter(({ config }: any) => config.landscapeId === canonical.landscapeId && config.scope.goalIds.includes(bes))
assert.equal(activeConfigs.length, 1, 'Exactly one active current BES profile is required')
const active = activeConfigs[0]
assert.equal(active.path, decision.currentBinding.positiveEvidenceConfigPath)
assert.equal(hash(active.path), decision.currentBinding.positiveEvidenceConfigSha256)
// Strict current-input validation is deliberate. BES has no V9 transfer, and no stale peer row
// in the newly scoped config can be used to make this release appear current.
const reviewed = reviewPositiveGoalEvidenceConfig(active.path)
assert.deepEqual(reviewed.errors, [], 'Current-input positive evidence has unresolved errors')
const profileRows = reviewed.records.filter((row: any) => row.goalId === bes)
assert.equal(profileRows.length, 1)
const profile = profileRows[0]
assert.notEqual(profile.status, 'rejected')
assert.equal(profile.reviewInputFingerprint, decision.currentBinding.reviewInputFingerprint)
assert.equal(profile.profileFingerprint, fingerprintPositiveGoalEvidenceProfile(profile.profile))
assert.equal(profile.profileFingerprint, decision.currentBinding.profileFingerprint)
assert.equal(hash(active.config.reviewPath), decision.currentBinding.positiveEvidenceReviewSha256)
const material = json(materialPath)
const registry = json(registryPath)
assert.equal(material.unit.assessmentContract.revision, '2026-11-23-e1-v3')
assert.deepEqual(material.unit.assessmentContract.viewIds, views)
assert.equal(material.unit.assessmentContract.parts.length, 4)
assert.equal(material.unit.assessmentContract.contentGoalIds.length, 12)
const oldParts = structuredClone(material.unit.assessmentContract.parts)
assert.equal(material.unit.sectionAssessmentPolicy.requiredPartsFingerprint, fingerprintCurrentCurriculumDocument(oldParts),
  'Current four-part policy is not bound to the actual material rows')
for (const pin of decision.requiredPartBindings) {
  const actual = material.unit.assessmentContract.parts.find((row: any) => row.goalId === pin.goalId)
  assert(actual, 'Missing existing required assignment part')
  if (pin.goalId === d && decision.dSuccessor && !isDeepStrictEqual(actual, pin)) {
    assert.deepEqual(actual.material, decision.dSuccessor.previousMaterialBinding,
      'D differs from both the exact historical and reviewed successor edition')
    actual.material = pin.material
  }
  assert.deepEqual(actual, pin)
}
material.unit.sectionAssessmentPolicy.requiredPartsFingerprint = fingerprintCurrentCurriculumDocument(material.unit.assessmentContract.parts)
assert.equal(material.unit.sectionAssessmentPolicy.requiredPartsFingerprint, decision.requiredPartsFingerprint)
for (const id of [d, dPrime]) {
  const assessment = canonical.goals.find((row: any) => row.id === id)
  const coverage = owner[0].coverageReviews.filter((row: any) => row.assessmentGoalId === id)
  assert.equal(coverage.length, 1)
  assert.deepEqual(coverage[0].goalIds, [bes])
  const actualRevisions = assessmentReviewRevisions(assessment)
  const qualified = decision.ownAssessmentBindings.find((row: any) => row.assessmentGoalId === id)
  assert(qualified, 'No current independent coverage binding for own assessment')
  assert.deepEqual(actualRevisions, qualified.currentRevisions)
  const observedRevisions = { taskRevision: coverage[0].taskRevision, rubricRevision: coverage[0].rubricRevision }
  assert(isDeepStrictEqual(observedRevisions, qualified.previousRevisions)
    || isDeepStrictEqual(observedRevisions, qualified.currentRevisions), 'Unexpected own coverage edition')
  coverage[0].taskRevision = actualRevisions.taskRevision
  coverage[0].rubricRevision = actualRevisions.rubricRevision
  coverage[0].reference = reviewPath
}
const credit = {
  requiredPartIds: [d], goalIds: [bes],
  release: { schemaVersion: 1, revision: '2026-11-24-e1-bes-v1', ownerUnitId: ownerId, ownerRevision,
    viewIds: views, review: { path: reviewPath, sha256: hash(reviewPath) },
    goalDefinitions: { [bes]: { definition: planningGoalDefinition(goal), profileFingerprint: profile.profileFingerprint } },
    fingerprint: '' },
}
credit.release.fingerprint = planningReleaseFingerprint(material.unit, credit)
const oldCredits = material.unit.assessmentContract.planningCredits
assert(oldCredits.length === 0 || (oldCredits.length === 1 && oldCredits[0].release.fingerprint === credit.release.fingerprint),
  'Refuse to replace another live planning release')
material.unit.assessmentContract.planningCredits = [credit]
const approved = { ...registry.reviewedPlanningReleases, [credit.release.fingerprint]: hash(reviewPath) }
const { entries } = loadCurrentCurriculumCatalog(liveVerificationInputs)
const graph = new UnitGraph(entries.map(({ landscape }) => landscape as any))
validatePlanningRelease(material.unit, credit, { landscape: canonical, graph, approved,
  currentProfile: id => { assert.equal(id, bes); return profile.profileFingerprint }, reviewHash: hash })
const receipt = { schema: 'current-e1-bes-only-planning-release-activation-v1', status: write ? 'ACTIVATED' : 'VERIFIED_WITHOUT_WRITE',
  review: credit.release.review, fingerprint: credit.release.fingerprint, credit,
  requiredPartEditionDelta: { before: oldParts, after: material.unit.assessmentContract.parts,
    resultingPolicyFingerprint: material.unit.sectionAssessmentPolicy.requiredPartsFingerprint },
  strictCurrentPositiveEvidence: { configPath: active.path, errors: reviewed.errors, counts: reviewed.counts },
  scope: { ownOrdinaryGoals: 1, creditedContentGoals: 1, uncreditedContentGoals: 11, requiredAssignmentParts: 4,
    planningWitnesses: 1, childUnits1_3_4: 'undeclared', individualMasteryWritten: false, historicalReceiptsRebound: false } }
if (write) {
  assert(!existsSync(resolve(root, directory, 'activation.receipt.json')), 'Activation receipt is immutable; run without --write to verify an existing activation')
  for (const pin of beforeWritePins) assert.equal(hash(pin.path), pin.sha256, 'Concurrent input edit; retry from latest bytes: ' + pin.path)
  registry.reviewedPlanningReleases = approved
  writeFileSync(resolve(root, canonicalPath), JSON.stringify(canonical, null, 2) + '\n')
  writeFileSync(resolve(root, materialPath), JSON.stringify(material, null, 2) + '\n')
  writeFileSync(resolve(root, registryPath), JSON.stringify(registry, null, 2) + '\n')
  const verified = checkUnitPlanningReleases()
  assert(verified.includes(credit.release.fingerprint))
  writeFileSync(resolve(root, directory, 'activation.receipt.json'), JSON.stringify({ ...receipt,
    verification: { nativePlanningReleaseCheck: 'PASS', activeReleaseCount: verified.length },
    inputPinsBeforeActivation: beforeWritePins,
    outputPins: [canonicalPath, materialPath, registryPath].map(path => ({ path, sha256: hash(path) })) }, null, 2) + '\n')
}
console.log(JSON.stringify(receipt, null, 2))
