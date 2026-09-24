import assert from 'node:assert/strict'
import test from 'node:test'
import {
  classifyMathM7PartialPageOrImageBinding,
  validateMathM7PartialOpenReason,
  type MathM7PartialOpenGoal,
} from './mathM7PartialOpenReason'

const goalId = '5f90df42-8a71-534d-b995-b8f7dcaf1661'
const priorDissent: MathM7PartialOpenGoal = {
  goalId,
  reason: 'unresolved_prior_dissent',
  note: 'Earlier split objection remains unresolved despite current KEEP/KEEP.',
  priorDissent: {
    reviewRecordPath: 'earlier/round-b/results/earlier.records.jsonl',
    recordId: 'earlier-split-record',
  },
}
const record = { goalId, recordId: 'earlier-split-record', decision: 'split_review' }

test('prior-dissent exclusion requires current KEEP/KEEP and exact historical split or block record', () => {
  assert.equal(validateMathM7PartialOpenReason(priorDissent, 'keep', 'keep', record), null)
  assert.equal(validateMathM7PartialOpenReason(priorDissent, 'keep', 'keep', { ...record, decision: 'block' }), null)
  assert.match(validateMathM7PartialOpenReason(priorDissent, 'keep', 'revise', record) ?? '', /two current KEEP/)
  assert.match(validateMathM7PartialOpenReason(priorDissent, 'keep', 'keep') ?? '', /does not prove/)
  assert.match(validateMathM7PartialOpenReason(priorDissent, 'keep', 'keep', { ...record, goalId: 'other' }) ?? '', /does not prove/)
  assert.match(validateMathM7PartialOpenReason(priorDissent, 'keep', 'keep', { ...record, recordId: 'other' }) ?? '', /does not prove/)
  assert.match(validateMathM7PartialOpenReason(priorDissent, 'keep', 'keep', { ...record, decision: 'keep' }) ?? '', /does not prove/)
  assert.match(validateMathM7PartialOpenReason({ ...priorDissent, priorDissent: undefined }, 'keep', 'keep', record) ?? '', /exact historical/)
})

test('existing exclusion reason semantics remain unchanged', () => {
  assert.equal(validateMathM7PartialOpenReason({ goalId, reason: 'review_dissent', note: 'Current dissent.' }, 'keep', 'revise'), null)
  assert.match(validateMathM7PartialOpenReason({ goalId, reason: 'review_dissent', note: 'Wrong.' }, 'keep', 'keep') ?? '', /two KEEP/)
  assert.equal(validateMathM7PartialOpenReason({ goalId, reason: 'review_revision', note: 'Both rounds require a revision.' }, 'revise', 'revise'), null)
  assert.match(validateMathM7PartialOpenReason({ goalId, reason: 'review_revision', note: 'Wrong.' }, 'keep', 'revise') ?? '', /two REVISE/)
  assert.equal(validateMathM7PartialOpenReason({ goalId, reason: 'review_block', note: 'Current block.' }, 'block', 'block'), null)
  assert.match(validateMathM7PartialOpenReason({ goalId, reason: 'review_block', note: 'Wrong.' }, 'block', 'keep') ?? '', /two BLOCK/)
  assert.equal(validateMathM7PartialOpenReason({ goalId, reason: 'current_image_hold', note: 'Image hold.' }, 'keep', 'keep'), null)
  assert.match(validateMathM7PartialOpenReason({ goalId, reason: 'current_image_hold', note: 'Wrong.' }, 'keep', 'split_review') ?? '', /also has review dissent/)
})

test('claim-only preflight rejects claimed drift and records, not accepts, excluded drift', () => {
  assert.equal(classifyMathM7PartialPageOrImageBinding(goalId, true, true, 'GoalBook page'), 'exact')
  assert.equal(classifyMathM7PartialPageOrImageBinding(goalId, false, false, 'GoalBook page'), 'unclaimed_drift')
  assert.equal(classifyMathM7PartialPageOrImageBinding(goalId, false, false, 'image bytes'), 'unclaimed_drift')
  assert.throws(() => classifyMathM7PartialPageOrImageBinding(goalId, true, false, 'GoalBook page'), /claimed GoalBook page changed/)
  assert.throws(() => classifyMathM7PartialPageOrImageBinding(goalId, true, false, 'image bytes'), /claimed image bytes changed/)
})
