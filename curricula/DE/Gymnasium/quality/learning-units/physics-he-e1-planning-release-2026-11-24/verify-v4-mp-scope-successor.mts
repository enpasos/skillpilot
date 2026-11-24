// SPDX-License-Identifier: Apache-2.0
// Read-only scope successor. The MP offer never expands the independently reviewed BES credit.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { checkUnitPlanningReleases, planningReleaseFingerprint } from '../../../../../../app/scripts/checkUnitPlanningReleases'
import { fingerprintCurrentCurriculumDocument as digest } from '../../../../../../app/scripts/currentCurriculumCatalog'
import { collectRenderedAtomicGoalIdsFromCompositionView } from '../../../../../../app/scripts/generateCurriculumQualityStatus'
const root = resolve(import.meta.dirname, '../../../../../..')
const base = 'curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-planning-release-2026-11-24'
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const rawHash = (bytes: string | Buffer) => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const pin = (path: string) => ({ path, sha256: rawHash(readFileSync(resolve(root, path))) })
const predecessor = '77cd98398d'
const historicalBytes = (path: string) => execFileSync('git', ['show', `${predecessor}:${path}`], { cwd: root, maxBuffer: 32 * 1024 * 1024 })
const historical = (path: string) => JSON.parse(historicalBytes(path).toString('utf8'))
const materialPath = 'curricula/DE/Gymnasium/materials/physics/he-e1-motion-practice.json'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const childPath = 'curricula/DE/Gymnasium/materials/physics/he-e1-accelerated-and-free-fall.json'
const material = read(materialPath), prior = historical(materialPath), canonical = read(canonicalPath), oldCanonical = historical(canonicalPath)
const receiptPath = base + '/activation.receipt.json', reviewPath = base + '/coverage-review.actual.json'
const receipt = read(receiptPath), review = read(reviewPath)
const mp = '2b9e565f-d9b4-5e23-b5b7-b7977cecff06'
const childIds = ['physics-e1-uniform-motion', 'physics-e1-accelerated-and-free-fall', 'physics-e1-air-and-vacuum', 'physics-e1-two-motions']
const lkViews = ['de-he-gym-physics-lk-g8', 'de-he-gym-physics-lk-g9', 'de-he-gym-sekii-physics-lk']
const additional = Object.fromEntries(lkViews.map(id => [id, [mp]]))
assert.equal(prior.unit.sectionAssessmentPolicy.additionalVoluntaryAssessmentGoalIdsByView, undefined)
const expected = structuredClone(prior)
expected.unit.sectionAssessmentPolicy.additionalVoluntaryAssessmentGoalIdsByView = additional
assert.deepEqual(material, expected, 'Only the exact three-view voluntary MP policy may change the reviewed material')
assert.deepEqual(material.unit.assessmentContract.planningCredits, [receipt.credit])
assert.deepEqual(material.unit.assessmentContract.parts, receipt.requiredPartEditionDelta.after)
assert.deepEqual(material.unit.assessmentContract.contentGoalIds, prior.unit.assessmentContract.contentGoalIds)
assert.equal(material.unit.assessmentContract.parts.length, 4)
assert.equal(material.unit.assessmentContract.contentGoalIds.length, 12)
assert.equal(material.unit.sectionAssessmentPolicy.requiredPartsFingerprint, receipt.requiredPartEditionDelta.resultingPolicyFingerprint)
assert.deepEqual(readFileSync(resolve(root, childPath)), historicalBytes(childPath))
const credit = material.unit.assessmentContract.planningCredits[0]
assert.equal(planningReleaseFingerprint(material.unit, credit), receipt.fingerprint)
assert.equal(receipt.fingerprint, 'sha256:efb05e6c680bd40abe5a947fcce45e638f41c35909762c7f429b0016b75bb94d')
assert.deepEqual(checkUnitPlanningReleases(), [receipt.fingerprint])
assert.equal(pin(reviewPath).sha256, credit.release.review.sha256)
const owner = canonical.programUnits.find((row: any) => row.id === credit.release.ownerUnitId)
assert.deepEqual(owner, oldCanonical.programUnits.find((row: any) => row.id === owner.id))
assert.equal(owner.revision, '2026-11-23-v4')
for (const row of review.currentGoalPayloads) assert.equal(digest(canonical.goals.find((goal: any) => goal.id === row.goalId)), row.normalizedSha256)
assert.deepEqual(canonical.goals.find((goal: any) => goal.id === mp), oldCanonical.goals.find((goal: any) => goal.id === mp), 'No proposed MP payload is activated by this scope record')
const locate = (nodes: any[], pred: (node: any) => boolean, ancestors: string[] = []): any[] => nodes.flatMap(node => [
  ...(pred(node) ? [{ node, parent: ancestors.at(-1), ancestors }] : []),
  ...locate(node.children ?? [], pred, [...ancestors, node.id ?? node.goalId]),
])
const directory = 'curricula/DE/Gymnasium/composition-views/physik'
const views = []
for (const name of readdirSync(resolve(root, directory)).filter(name => /^de-he-(?:(?:gk|lk)(?:-g[89])?|sekii-(?:gk|lk))\.view\.json$/.test(name)).sort()) {
  const path = directory + '/' + name, view = read(path), oldView = historical(path)
  const e1 = locate(view.rootNodes, node => node.id === 'physics-e1-motion')
  assert.equal(e1.length, 1)
  const children = e1[0].node.children, indexes = childIds.map(id => children.findIndex((node: any) => node.id === id))
  assert(indexes.every(index => index >= 0))
  assert.deepEqual(indexes, [...indexes].sort((a, b) => a - b))
  const references = locate(view.rootNodes, node => node.goalId === mp)
  assert.equal(references.length, 1)
  assert.equal(references[0].parent, 'physics-e1-motion')
  assert.equal(children.findIndex((node: any) => node.goalId === mp), Math.max(...indexes) + 1)
  const course = view.scope.courseProfile
  const visible = collectRenderedAtomicGoalIdsFromCompositionView(canonical, resolve(root, path), [course], false)
  assert.equal(visible.has(mp), course === 'LK')
  const oldReferences = locate(oldView.rootNodes, node => node.goalId === mp)
  assert.equal(oldReferences.length, 1)
  assert.equal(oldReferences[0].parent, 'he-physics-topic-287739a3-6143-55d0-abe7-1a08889e9b49')
  views.push({ ...pin(path), viewId: view.viewId, scope: view.scope, historicalSha256: rawHash(historicalBytes(path)),
    previousParent: oldReferences[0].parent, currentParent: references[0].parent,
    childIndexes: Object.fromEntries(childIds.map((id, index) => [id, indexes[index]])),
    mpIndex: children.findIndex((node: any) => node.goalId === mp), effectiveMpVisible: visible.has(mp),
    contractView: material.unit.assessmentContract.viewIds.includes(view.viewId),
    declaredVoluntary: (additional[view.viewId] ?? []).includes(mp) })
}
assert.equal(views.length, 8)
assert.equal(views.filter(view => view.effectiveMpVisible).length, 4)
assert.deepEqual(views.filter(view => view.contractView && view.effectiveMpVisible).map(view => view.viewId).sort(), lkViews.sort())
console.log(JSON.stringify({ schema: 'e1-v4-planning-and-coverage-scope-supersession-after-authorized-mp-return-v1',
  checkedAt: new Date().toISOString(), status: 'PASS_SCOPE_SUCCESSOR_BES_RELEASE_UNCHANGED',
  authority: 'Parent transmitted the explicit binding Product Owner decision to restore MP as voluntary LK examination directly after the four E.1 children; parent applied the shared generator and view changes before this read-only review.',
  historicalCheckpoint: predecessor, historicalMaterial: { path: materialPath, sha256: rawHash(historicalBytes(materialPath)) },
  currentMaterial: pin(materialPath), currentChildMaterial: pin(childPath),
  onlyMaterialDelta: { path: '/unit/sectionAssessmentPolicy/additionalVoluntaryAssessmentGoalIdsByView', before: null, after: additional },
  scope: { ownerUnitId: owner.id, ownerRevision: owner.revision, requiredParts: 4, targetContentGoals: 12,
    creditedGoals: review.creditedGoalIds, uncreditedGoals: review.uncreditedGoalIds, planningWitnessIds: credit.requiredPartIds,
    childUnits1_3_4: 'undeclared', mpRole: 'voluntary LK offering at E.1 parent; no required part, planning credit or own ordinary content claim',
    currentMpPayloadUnchangedFromCheckpoint: true, noNewMpPayloadProposalActivated: true },
  currentMpGoal: { id: mp, normalizedSha256: digest(canonical.goals.find((goal: any) => goal.id === mp)) },
  unchangedRelease: { fingerprint: receipt.fingerprint, release: credit.release, allCreditBytesEqual: true,
    allFourPartRowsEqual: true, ownerDeclarationEqual: true, contentGoalSetEqual: true,
    nativeCheckUnitPlanningReleases: 'PASS', review: pin(reviewPath), activation: pin(receiptPath) },
  currentInputPins: [canonicalPath, 'curricula/unit-learning-materials.json', 'scripts/generate_hessen_physics_stage_views.py',
    review.currentBinding.positiveEvidenceConfigPath, read(review.currentBinding.positiveEvidenceConfigPath).reviewPath].map(pin), views,
  supersession: 'This successor binds the changed offering role/placement and current view hashes only. The original b268 coverage review and efb0 release retain their exact task, P, owner and credit inputs; predecessor records are preserved. No independent MP whole-goal coverage, human acceptance or learner result is inferred.',
  sharedFilesWritten: [] }, null, 2))
