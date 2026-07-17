import assert from 'node:assert/strict'

import {
  coverageGateFailure,
  isAcceptedDecision,
  isReviewDecision,
} from './reportGoalVisualizationRolloutStatus'

const acceptedDecisions = [
  'accepted',
  'accepted_current',
  'accepted_corrected_candidate',
  'accepted_pilot',
  'accepted_pilot_after_fresh_ai_review_correction',
  'accepted_user_supplied_replacement',
]

acceptedDecisions.forEach((decision) => {
  assert.equal(isReviewDecision(decision), true, `${decision} should be parsed as a review decision`)
  assert.equal(isAcceptedDecision(decision), true, `${decision} should count as accepted`)
})

const nonAcceptedDecisions = [
  'deferred_provider_limitation',
  'rejected_regenerated',
  'blocked_provider_quota',
  'not_attempted_after_quota_block',
  'correction_open_provider_credit_exhausted',
]

nonAcceptedDecisions.forEach((decision) => {
  assert.equal(isReviewDecision(decision), true, `${decision} should be parsed as a review decision`)
  assert.equal(isAcceptedDecision(decision), false, `${decision} must not count as accepted`)
})

assert.equal(isReviewDecision('sha256:d9599bbad18ea11df1bfdaff26807625bba94bf222e3a514e1f0a8646ec73cd6'), false)
assert.equal(isAcceptedDecision(null), false)

assert.equal(coverageGateFailure({
  request: { subject: 'physik' },
  summary: { regularUnlinkedGoals: 0 },
}), null, 'documented provider-deferred gaps must be allowed by the coverage gate')

assert.match(coverageGateFailure({
  request: { subject: 'chemie' },
  summary: { regularUnlinkedGoals: 3 },
}) ?? '', /chemie.*3 ordinary atomic goal/u)

console.log('Goal-visualization rollout status passed: accepted vocabulary and coverage gate verified.')
