// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  normalizeGoalVisualizationAiReview,
  isGoalVisualizationAiApproved,
  type GoalVisualizationAiReviewFields,
  type GoalVisualizationAssetStateFields,
  type GoalVisualizationQaYesNo,
} from '../stock-approval-host/app/scripts/goalVisualizationQaModel'
import {
  aiApprovalStatus, isAiApprovedForCurrentAsset,
} from '../stock-approval-host/app/src/utils/goalVisualizationQaStatus'
import {
  hasCurrentGoalVisualizationApproval, unapprovedActiveGoalVisualizations,
} from '../stock-approval-host/app/scripts/checkGoalVisualizationQaApprovalCoverage'

const ownRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(ownRoot, '../../../../../../..')
type QaRow = GoalVisualizationAiReviewFields & GoalVisualizationAssetStateFields & {
  goalId: string; assetSha256: string; canonicalAssetPath: string;
  humanApproved: GoalVisualizationQaYesNo; humanIssueIdentified: GoalVisualizationQaYesNo;
  humanIssueDescription: string; humanReviewedAt: string | null; humanReviewer: string;
  umlautsCorrectChatGpt: GoalVisualizationQaYesNo; contentApprovedChatGpt: GoalVisualizationQaYesNo;
}
const qa = JSON.parse(readFileSync(resolve(ownRoot, 'QA/five-original-PNG-current-whole-goal.V5-independent-b.actual.qa.json'), 'utf8')) as {schemaVersion: number; subject: string; records: QaRow[]}
assert.equal(qa.schemaVersion, 1)
assert.equal(qa.subject, 'chemie')
assert.equal(qa.records.length, 5)
assert.equal(new Set(qa.records.map(row => row.goalId)).size, 5)
const rows = qa.records.map(row => {
  for (const k of ['aiApproved', 'humanApproved', 'humanIssueIdentified', 'umlautsCorrectChatGpt', 'contentApprovedChatGpt'] as const) {
    assert.ok(row[k] === 'yes' || row[k] === 'no', `${row.goalId}:${k} must use stock yes/no type`)
  }
  assert.equal(row.humanApproved, 'no')
  assert.equal(row.humanIssueIdentified, 'no')
  assert.equal(row.humanIssueDescription, '')
  assert.equal(row.humanReviewedAt, null)
  assert.equal(row.humanReviewer, '')
  assert.equal(row.visualizationState, 'available')
  assert.equal(row.missingReason, '')
  assert.ok(row.aiReviewedAt && !Number.isNaN(Date.parse(row.aiReviewedAt)))
  assert.match(row.aiReviewer, /OpenAI GPT-6 Codex/)
  const actual = 'sha256:' + createHash('sha256').update(readFileSync(resolve(repoRoot, row.canonicalAssetPath))).digest('hex')
  assert.equal(actual, row.assetSha256)
  assert.equal(row.aiApprovedAssetSha256, actual)
  assert.deepEqual(normalizeGoalVisualizationAiReview(row, actual), {
    aiApproved: row.aiApproved, aiApprovedAssetSha256: row.aiApprovedAssetSha256,
    aiReviewedAt: row.aiReviewedAt, aiReviewer: row.aiReviewer.replace(/\s+/g, ' ').trim(),
    aiNotes: row.aiNotes.replace(/\s+/g, ' ').trim(),
  })
  assert.equal(aiApprovalStatus(row), 'approved')
  assert.equal(isAiApprovedForCurrentAsset(row), true)
  assert.equal(isGoalVisualizationAiApproved(row), true)
  assert.equal(hasCurrentGoalVisualizationApproval(row), true)
  return {goalId: row.goalId, exactActualOriginalHash: actual, stockAiApprovalStatus: aiApprovalStatus(row), currentStockApproval: hasCurrentGoalVisualizationApproval(row), humanApproval: false}
})
assert.deepEqual(unapprovedActiveGoalVisualizations(qa.records), [])
const receipt = {
  schemaVersion: 1, checkedAtUTC: new Date().toISOString(), status: 'PASS',
  scope: 'Five candidate exact-pixel QA rows only, using unmodified stock model, normalizer, status and approval functions.',
  typeCheck: 'Stock imported TypeScript field types plus runtime yes/no and null/empty human validation.',
  rows, normalAssetImportOrActiveStateProved: false, noHumanP_D_A_M_kindOrSourceGrant: true,
}
writeFileSync(resolve(ownRoot, 'checks/ACTUAL.five-typed-QA-stock-model-and-approval-functions.json'), JSON.stringify(receipt, null, 2) + '\n')
console.log('PASS: five typed V5-B QA candidate rows; exact original hashes; unmodified stock AI approval functions; no Human approval.')
