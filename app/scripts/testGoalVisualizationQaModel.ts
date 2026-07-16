import assert from 'node:assert/strict'
import {
  emptyGoalVisualizationAiReview,
  isGoalVisualizationAiApproved,
  normalizeGoalVisualizationAiReview,
} from './goalVisualizationQaModel'

const HASH_A = `sha256:${'a'.repeat(64)}`
const HASH_B = `sha256:${'b'.repeat(64)}`

const currentApproval = normalizeGoalVisualizationAiReview({
  aiApproved: 'yes',
  aiApprovedAssetSha256: HASH_A,
  aiReviewedAt: '2026-07-16T10:00:00.000Z',
  aiReviewer: '  codex  ',
  aiNotes: 'Mathematics and visible text checked.',
}, HASH_A)

assert.deepEqual(currentApproval, {
  aiApproved: 'yes',
  aiApprovedAssetSha256: HASH_A,
  aiReviewedAt: '2026-07-16T10:00:00.000Z',
  aiReviewer: 'codex',
  aiNotes: 'Mathematics and visible text checked.',
})
assert.equal(isGoalVisualizationAiApproved({ assetSha256: HASH_A, ...currentApproval }), true)

const staleApproval = normalizeGoalVisualizationAiReview({
  aiApproved: 'yes',
  aiApprovedAssetSha256: HASH_A,
  aiReviewedAt: '2026-07-16T10:00:00.000Z',
  aiReviewer: 'codex',
  aiNotes: 'Review for an older image.',
}, HASH_B)

assert.deepEqual(staleApproval, emptyGoalVisualizationAiReview())
assert.equal(isGoalVisualizationAiApproved({ assetSha256: HASH_B, ...staleApproval }), false)

const currentRejection = normalizeGoalVisualizationAiReview({
  aiApproved: 'no',
  aiApprovedAssetSha256: HASH_A,
  aiReviewedAt: '2026-07-16T10:05:00.000Z',
  aiReviewer: 'codex',
  aiNotes: 'The diagram contains a mathematical error.',
}, HASH_A)

assert.deepEqual(currentRejection, {
  aiApproved: 'no',
  aiApprovedAssetSha256: HASH_A,
  aiReviewedAt: '2026-07-16T10:05:00.000Z',
  aiReviewer: 'codex',
  aiNotes: 'The diagram contains a mathematical error.',
})
assert.equal(isGoalVisualizationAiApproved({ assetSha256: HASH_A, ...currentRejection }), false)

const legacyChatGptTriage = normalizeGoalVisualizationAiReview({
  umlautsCorrectChatGpt: 'yes',
  contentApprovedChatGpt: 'yes',
}, HASH_A)

assert.deepEqual(legacyChatGptTriage, emptyGoalVisualizationAiReview())
assert.equal(isGoalVisualizationAiApproved({
  assetSha256: HASH_A,
  aiApproved: 'yes',
  aiApprovedAssetSha256: '',
}), false)

console.log('Goal-visualization AI approval model self-test passed: 4 hash-binding guarantees.')
