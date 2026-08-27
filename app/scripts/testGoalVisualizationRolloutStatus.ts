import assert from 'node:assert/strict'

import {
  coverageGateFailure,
  isAcceptedDecision,
  isReviewDecision,
  parseReviewDecisionRow,
  splitMarkdownTableRow,
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

assert.deepEqual(
  splitMarkdownTableRow('| `1801c759-d92d-5bfb-a44f-cfd2455d207b` | Titel | `deferred_provider_limitation` | Punkt `B(3|6)` statt `B(2|5)` |'),
  [
    '`1801c759-d92d-5bfb-a44f-cfd2455d207b`',
    'Titel',
    '`deferred_provider_limitation`',
    'Punkt `B(3|6)` statt `B(2|5)`',
  ],
  'pipes inside inline-code evidence must not split a review-ledger row',
)

assert.deepEqual(
  splitMarkdownTableRow('| `id` | Hinweis ``B(3|6)`` statt ``B(2|5)`` |'),
  ['`id`', 'Hinweis ``B(3|6)`` statt ``B(2|5)``'],
  'pipes inside multi-backtick code spans must not split a review-ledger row',
)

assert.deepEqual(
  parseReviewDecisionRow(
    '| `1801c759-d92d-5bfb-a44f-cfd2455d207b` | Funktionsgleichungen aus Graphen bestimmen | `deferred_provider_limitation` | Punkt `B(3|6)` statt `B(2|5)` |',
    '207',
  ),
  {
    batch: '207',
    goalId: '1801c759-d92d-5bfb-a44f-cfd2455d207b',
    title: 'Funktionsgleichungen aus Graphen bestimmen',
    decision: 'deferred_provider_limitation',
    notes: 'Punkt `B(3|6)` statt `B(2|5)`',
  },
)

assert.deepEqual(
  parseReviewDecisionRow(
    '| `05946a6a-aaaa-bbbb-cccc-123456789abc` | `deferred_provider_limitation` | Kanonischer Titel | drei Versuche |',
    'shard-1',
  ),
  {
    batch: 'shard-1',
    goalId: '05946a6a-aaaa-bbbb-cccc-123456789abc',
    title: 'Kanonischer Titel',
    decision: 'deferred_provider_limitation',
    notes: 'drei Versuche',
  },
  'review ledgers may put the decision before the title',
)

assert.deepEqual(
  parseReviewDecisionRow(
    '| `99ef0fc2-150a-51e8-bac8-7e40e46917b` | Legacy stable goal ID | `accepted_pilot_after_regeneration` | hashgebunden geprüft |',
    '210',
  ),
  {
    batch: '210',
    goalId: '99ef0fc2-150a-51e8-bac8-7e40e46917b',
    title: 'Legacy stable goal ID',
    decision: 'accepted_pilot_after_regeneration',
    notes: 'hashgebunden geprüft',
  },
  'stable legacy UUID-like IDs with an 11-character final segment must remain reviewable',
)

assert.equal(
  parseReviewDecisionRow(
    '| Candidate | `tmp/goal-visualizations/1801c759-d92d-5bfb-a44f-cfd2455d207b/generated/candidate.jpg` | `rejected_regenerated` |',
    '207',
  ),
  null,
  'a UUID embedded in a candidate path must not be parsed as a goal identity',
)

console.log('Goal-visualization rollout status passed: accepted vocabulary, coverage gate, and ledger parsing verified.')
