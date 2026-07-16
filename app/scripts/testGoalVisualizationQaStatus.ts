import assert from 'node:assert/strict'

import {
  aiApprovalStatus,
  isAiApprovedForCurrentAsset,
} from '../src/utils/goalVisualizationQaStatus'

const hashA = 'a'.repeat(64)
const hashB = 'b'.repeat(64)

assert.equal(aiApprovalStatus({ assetSha256: hashA }), 'open')
assert.equal(aiApprovalStatus({ assetSha256: hashA, aiApproved: 'no' }), 'open')
assert.equal(aiApprovalStatus({
  assetSha256: hashA,
  aiApproved: 'no',
  aiApprovedAssetSha256: hashA,
  aiReviewedAt: '2026-07-16T11:30:00.000Z',
}), 'rejected')
assert.equal(aiApprovalStatus({
  assetSha256: hashB,
  aiApproved: 'no',
  aiApprovedAssetSha256: hashA,
  aiReviewedAt: '2026-07-16T11:30:00.000Z',
}), 'stale')
assert.equal(aiApprovalStatus({ assetSha256: hashA, aiApproved: 'yes' }), 'stale')
assert.equal(aiApprovalStatus({ aiApproved: 'yes', aiApprovedAssetSha256: hashA }), 'stale')
assert.equal(
  aiApprovalStatus({ assetSha256: hashA, aiApproved: 'yes', aiApprovedAssetSha256: hashB }),
  'stale',
)
assert.equal(
  aiApprovalStatus({ assetSha256: hashA, aiApproved: 'yes', aiApprovedAssetSha256: hashA.toUpperCase() }),
  'stale',
)
assert.equal(
  aiApprovalStatus({ assetSha256: hashA, aiApproved: 'yes', aiApprovedAssetSha256: hashA }),
  'approved',
)
assert.equal(
  aiApprovalStatus({ assetSha256: ` ${hashA} `, aiApproved: 'yes', aiApprovedAssetSha256: hashA }),
  'approved',
)
assert.equal(
  isAiApprovedForCurrentAsset({ assetSha256: hashA, aiApproved: 'yes', aiApprovedAssetSha256: hashA }),
  true,
)
assert.equal(
  isAiApprovedForCurrentAsset({ assetSha256: hashA, aiApproved: 'yes', aiApprovedAssetSha256: hashB }),
  false,
)
assert.equal(
  isAiApprovedForCurrentAsset({ assetSha256: hashA, aiApproved: 'no', aiApprovedAssetSha256: hashA }),
  false,
)

console.log('Goal-visualization AI approval status passed: 13 guarantees.')
