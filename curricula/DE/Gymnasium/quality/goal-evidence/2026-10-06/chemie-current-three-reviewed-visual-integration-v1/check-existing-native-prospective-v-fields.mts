import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { isGoalVisualizationAiApproved, normalizeGoalVisualizationAiReview } from '../../../../../../../app/scripts/goalVisualizationQaModel.ts'
import { hasCurrentExactByteAiQaEvidence } from '../../../../../../../app/scripts/reportGoalVisualizationRolloutStatus.ts'
import { hasCompletedDeepUnderstandingVisualizationReview } from '../../../../../../../app/scripts/reportDeepUnderstandingRollout.ts'

const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-three-reviewed-visual-integration-v1/'
const before = JSON.parse(await readFile(base + 'active-chemie-qa.before.snapshot.json', 'utf8'))
const proposed = JSON.parse(await readFile(base + 'prospective-current-active-path.chemie.qa.json', 'utf8'))
const bindings = JSON.parse(await readFile(base + 'selected-five-v6-current-goal-page-bindings.snapshot.json', 'utf8'))
const selected = ['b8d3b453-d638-5518-aab0-d84ec2e8567c', '973c12d9-d863-5292-8c68-9c80cdacf9e2', '363c5740-8a3c-50b8-8c3a-5548c80c36ea']
const results: unknown[] = []
for (const id of selected) {
  const r = proposed.records.find((x: any) => x.goalId === id)
  const old = before.records.find((x: any) => x.goalId === id)
  const goal = bindings.rows.find((x: any) => x.goalId === id).wholeGoal
  const link = goal.resourceLinks.find((x: any) => x.type === 'goal-visualization' && x.role === 'primary')
  assert.equal(isGoalVisualizationAiApproved(r), true)
  assert.equal(hasCompletedDeepUnderstandingVisualizationReview(r), true)
  assert.equal(r.description, goal.description)
  assert.equal(r.title, goal.title)
  assert.equal(r.landscapePath, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
  assert.equal(r.imageUrl, link.url)
  const nativeExact = hasCurrentExactByteAiQaEvidence({ goalId: id, url: link.url }, r, 'chemie', resolve(base + 'prospective-three-asset-check-layout'))
  assert.equal(nativeExact, true)
  assert.equal(normalizeGoalVisualizationAiReview(r, r.assetSha256).aiApproved, 'yes')
  assert.equal(isGoalVisualizationAiApproved({ ...r, assetSha256: old.assetSha256 }), false)
  assert.equal(normalizeGoalVisualizationAiReview(r, old.assetSha256).aiApproved, 'no')
  assert.equal(hasCurrentExactByteAiQaEvidence({ goalId: id, url: link.url }, { ...r, aiApprovedAssetSha256: old.assetSha256 }, 'chemie', resolve(base + 'prospective-three-asset-check-layout')), false)
  assert.deepEqual(Object.fromEntries(Object.entries(r).filter(([k]) => k.startsWith('human'))), Object.fromEntries(Object.entries(old).filter(([k]) => k.startsWith('human'))))
  results.push({ goalId: id, currentGoalDescriptionExact: true, realScratchCopiesMatchReviewedPng: nativeExact, existingNativeVFieldsAccepted: true, staleJulyRasterHashRejected: true, actualHumanFieldsUnchanged: true })
}
for (const id of ['3d3231f9-039d-5ce5-9e8e-af219c7fee08', '9decc36b-a69a-5599-a9f0-fcebdf0203d8']) {
  const r = proposed.records.find((x: any) => x.goalId === id)
  const old = before.records.find((x: any) => x.goalId === id)
  const goal = bindings.rows.find((x: any) => x.goalId === id).wholeGoal
  assert.equal(r.description, goal.description)
  assert.equal(isGoalVisualizationAiApproved(r), true)
  assert.deepEqual(Object.fromEntries(Object.entries(r).filter(([k]) => k !== 'description')), Object.fromEntries(Object.entries(old).filter(([k]) => k !== 'description')))
}
await writeFile(base + 'existing-native-prospective-v-check.actual.receipt.json', JSON.stringify({ schemaVersion: 1, checkedAtUTC: new Date().toISOString(), existingUnmodifiedNativeHelpers: ['goalVisualizationQaModel.ts', 'reportGoalVisualizationRolloutStatus.ts', 'reportDeepUnderstandingRollout.ts'], checks: results, exactExistingImageDescriptionOnlyBindings: 2, scope: 'Inert three-image path/hash/AI-field and two-description binding checks. No full central run, new scientific review, active approval, learner or human release claim.', activeWrites: false, newScientificClosures: 0, strictNetGain: 0 }, null, 2) + '\n')
console.log('PASS3 existing native actual-byte V checks +PASS2 description-only guards; old JPG hashes correctly rejected')
