import assert from 'node:assert/strict'

import {
  hasCurrentGoalVisualizationApproval,
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

console.log('Goal-visualization approval coverage self-test passed: 5 approval guarantees.')
