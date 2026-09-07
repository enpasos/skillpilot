import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Audit only: all profile/task bytes were counterreviewed by root before import;
// the four affected full bilingual profiles were checked again against the final
// images. Native candidate-set timestamps record completion of this input audit,
// not twenty-two newly performed independent/human reviews.
const base = 'curricula/DE/Gymnasium/quality/goal-visualization-review/math-b039-methods-and-physics-torque-v1';
const entries = [
  ['math', 'canonical-math-positive-understanding-evidence-rollout-v1-batch-039-function-combinations-equations-and-sequences-20-v1', [
    '70a21623-6c87-55ae-b534-ab45a3b9b1d2',
    '12a8dffc-dea7-5f2c-b490-2a1a2bb6901b',
    'c61af0a9-7d56-5505-a70d-ee097c3b747f',
  ]],
  ['physics', 'canonical-physics-positive-understanding-evidence-rollout-v1-batch-039r-energy-and-mean-torque-2-v1', [
    'c2c3cdc5-3e87-47c4-89fd-4eb2c5c2f2ea',
  ]],
];
const read = (path) => readFileSync(path, 'utf8');
const digest = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const parseLines = (bytes) => bytes.trim().split('\n').map(JSON.parse);
const omitAudit = ({ reviewedAt, reviewer, ...rest }) => rest;
const receipts = [];
for (const [label, stem, changedIds] of entries) {
  const prefix = `curricula/DE/Gymnasium/quality/goal-evidence/${stem}`;
  const oldCandidateBytes = read(`${base}/pre-current-evidence/${label}.candidates.json.snapshot`);
  const oldReviewBytes = read(`${base}/pre-current-evidence/${label}.review.jsonl`);
  const candidateBytes = read(`${prefix}.candidates.json`);
  const reviewBytes = read(`${prefix}.review.jsonl`);
  const candidate = JSON.parse(candidateBytes);
  assert.deepEqual(omitAudit(candidate), omitAudit(JSON.parse(oldCandidateBytes)));
  assert.equal(candidate.reviewedAt, '2026-09-06T23:45:57Z');
  const before = parseLines(oldReviewBytes);
  const after = parseLines(reviewBytes);
  assert.equal(after.length, before.length);
  const changed = [];
  after.forEach((record, index) => {
    const { reviewInputFingerprint: oldInput, ...oldBody } = omitAudit(before[index]);
    const { reviewInputFingerprint: currentInput, ...body } = omitAudit(record);
    assert.deepEqual(body, oldBody, `${label}: profile or authority changed`);
    assert.equal(record.status, 'needs_human_review');
    assert.equal(record.reviewAuthority, 'ai_candidate');
    assert.equal(record.evidenceLevel, 'E1');
    assert.equal(record.maximumClaimScope, 'G1');
    assert.deepEqual(record.reviewRunIds, []);
    assert.equal(record.reviewedAt, candidate.reviewedAt);
    assert.equal(record.reviewer, candidate.reviewer);
    if (oldInput !== currentInput) changed.push(record.goalId);
  });
  assert.deepEqual(changed, changedIds);
  receipts.push({ label, profilesPreserved: after.length, changedInputGoalIds: changed,
    oldCandidateDigest: digest(oldCandidateBytes), oldReviewDigest: digest(oldReviewBytes),
    currentCandidateDigest: digest(candidateBytes), currentReviewDigest: digest(reviewBytes) });
}
console.log(JSON.stringify({ status: 'PASS', checkedAt: new Date().toISOString(),
  humanApprovalClaimed: false, newIndependentReviewClaimed: false, receipts }, null, 2));
