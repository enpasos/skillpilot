import assert from 'node:assert/strict'

import {
  hasCurrentGoalVisualizationApproval,
  isExplicitOwnerPilotDisplayException,
  unapprovedActiveGoalVisualizations,
} from './checkGoalVisualizationQaApprovalCoverage'

const HASH_A = `sha256:${'a'.repeat(64)}`
const HASH_B = `sha256:${'b'.repeat(64)}`
const baseRecord = {
  goalId: 'goal-a',
  title: 'Example',
  visualizationState: 'available' as const,
  assetSha256: HASH_A,
}

assert.equal(hasCurrentGoalVisualizationApproval({
  ...baseRecord,
  humanApproved: 'yes',
  humanIssueIdentified: 'no',
}), true, 'Human=OK must approve an active image')

assert.equal(hasCurrentGoalVisualizationApproval({
  ...baseRecord,
  humanApproved: 'no',
  humanIssueIdentified: 'no',
  aiApproved: 'yes',
  aiApprovedAssetSha256: HASH_A,
}), true, 'Approved AI must be bound to the current asset hash')

assert.equal(hasCurrentGoalVisualizationApproval({
  ...baseRecord,
  humanApproved: 'no',
  humanIssueIdentified: 'no',
  aiApproved: 'yes',
  aiApprovedAssetSha256: HASH_B,
}), false, 'stale AI approval must not approve a replacement image')

assert.equal(hasCurrentGoalVisualizationApproval({
  ...baseRecord,
  humanApproved: 'yes',
  humanIssueIdentified: 'yes',
  aiApproved: 'yes',
  aiApprovedAssetSha256: HASH_A,
}), false, 'an explicit Human=NOK must override automated approval evidence')

assert.deepEqual(unapprovedActiveGoalVisualizations([
  {
    ...baseRecord,
    humanApproved: 'no',
    humanIssueIdentified: 'no',
  },
  {
    ...baseRecord,
    goalId: 'goal-b',
    visualizationState: 'missing',
    humanApproved: 'no',
    humanIssueIdentified: 'no',
  },
]), [{
  ...baseRecord,
  humanApproved: 'no',
  humanIssueIdentified: 'no',
}], 'missing/deferred goals are outside the active-image approval gate')

const ownerPilot = {
  ...baseRecord,
  goalId: '121e3fdf-54d2-4d46-bc2d-f6e725f10f41',
  assetSha256: 'sha256:9a388e26e0e16f2ade9a92f92545fe1e5457f90a35dd8e6eabecb37aa3b2a5c2',
  humanApproved: 'no',
  humanIssueIdentified: 'no',
  aiApproved: 'no',
  aiApprovedAssetSha256: 'sha256:9a388e26e0e16f2ade9a92f92545fe1e5457f90a35dd8e6eabecb37aa3b2a5c2',
  aiReviewedAt: '2026-09-26T09:45:05Z',
}
assert.equal(hasCurrentGoalVisualizationApproval(ownerPilot), false, 'owner pilot must not be an image approval')
assert.equal(isExplicitOwnerPilotDisplayException('mathematik', ownerPilot), true, 'exact owner pilot may be displayed')
assert.equal(isExplicitOwnerPilotDisplayException('physik', ownerPilot), false, 'exception must be subject-scoped')
assert.equal(isExplicitOwnerPilotDisplayException('mathematik', { ...ownerPilot, assetSha256: HASH_B }), false, 'replacement must be re-reviewed')
assert.equal(isExplicitOwnerPilotDisplayException('mathematik', { ...ownerPilot, humanIssueIdentified: 'yes' }), false, 'human NOK must block display exception')

console.log('Goal-visualization approval coverage self-test passed: strict approvals and one exact-hash display exception.')
