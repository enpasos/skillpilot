#!/usr/bin/env node

// Targeted integrity check for a noncanonical AI candidate. It is not an
// assessment, source, projection, review, release, CQR or M7 approval.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(packageDir, '../../../../../../../');
const candidate = JSON.parse(readFileSync(resolve(packageDir, 'candidate-routes.json'), 'utf8'));
const tasks = readFileSync(resolve(packageDir, 'TASKS.md'), 'utf8');
const canonical = JSON.parse(readFileSync(resolve(
  root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
), 'utf8'));
const byId = new Map(canonical.goals.map((goal) => [goal.id, goal]));
const source = byId.get(candidate.sourceExamGoalId);
const triage = candidate.sourceExamCoverageTriage;

assert.match(candidate.status, /AI-candidate-only/);
assert.ok(source?.examData, 'Missing canonical Q2 source exam');
assert.equal(source.examData.reviewStatus, 'released', 'Historical source status changed; review first');
assert.equal(source.requires.length, candidate.baseline.requiresCount);
assert.equal(source.examData.coveredGoalIds.length, candidate.baseline.coveredGoalIdsCount);
assert.deepEqual(source.requires, source.examData.coveredGoalIds, 'Current Q2 lists differ');
assert.equal(source.examData.scoring.maxPoints, 20);
assert.deepEqual(source.examData.scoring.steps.map((step) => step.points), [4, 4, 6, 6]);
assert.equal(triage.safeInCurrentTask.length, 2);
const kept = [
  ...triage.safeInCurrentTask,
  triage.conditionalThirdInCurrentTask,
  triage.requiresRevisedScoredPartThree,
];
assert.deepEqual(kept, triage.proposedCoveredGoalIdsOnlyAfterTaskAndCoverageReview);
assert.equal(new Set(kept).size, 4);
for (const id of kept) assert.ok(source.requires.includes(id), `Proposed kept ID absent: ${id}`);
assert.equal(candidate.baseline.proposedRetainedCountAfterTaskRevision, kept.length);

const alreadyRemoved = candidate.removedAlreadyBeforeThisCandidate;
assert.deepEqual(alreadyRemoved, ['7d37513b-fa1a-54cc-9e2a-9279a381f0f0']);
assert.ok(!source.requires.includes(alreadyRemoved[0]), 'Already removed 7d reappeared as Q2 gate');
assert.ok(!source.examData.coveredGoalIds.includes(alreadyRemoved[0]), 'Already removed 7d reappeared as Q2 coverage');
const sevenD = byId.get(alreadyRemoved[0]);
assert.ok(sevenD?.tags?.includes('LK'), '7d no longer tagged LK; re-audit package');
assert.deepEqual(sevenD?.applicability?.jurisdiction, ['DE-HE'], '7d is no longer HE-only; re-audit package');

const removed = source.requires.filter((id) => !kept.includes(id));
assert.equal(removed.length, candidate.baseline.withdrawnDirectLinkCountAfterTaskRevision);
assert.equal(removed.length, 38);

const practiceClusters = [
  '28b45b93-11e1-5a96-97a1-4cfee171802b',
  'c25158fc-4860-59b2-8ef0-dca355f3a8b1',
  '14b19ee4-364e-50bd-b6a3-499471356ef3',
  '967d1863-1b9b-4798-8a35-ae4e9760e322',
  'f24096c6-6ca0-5c15-a2f5-7bdaec789a8d',
  '57f07e66-800c-5f7e-99ab-11dd6e520eb1',
  'd2560dc7-f29a-5e51-ba8c-ec2ca0fb8cc1',
  '6b0d2a97-cf9c-4778-9c68-16bb82b7afde',
];
const terminals = new Set(practiceClusters.flatMap((id) => byId.get(id)?.contains ?? [])
  .filter((id) => byId.get(id)?.examData));
const otherTerminals = [...terminals].filter((id) => id !== source.id);
const otherDirect = removed.filter((id) => otherTerminals.some((terminalId) =>
  byId.get(terminalId).requires?.includes(id)
  || byId.get(terminalId).examData?.coveredGoalIds?.includes(id)));
assert.deepEqual(otherDirect, [], 'A withdrawn goal gained other direct terminal coverage');

const successors = new Map();
for (const goal of canonical.goals) {
  const prerequisites = goal.id === source.id ? kept : goal.requires ?? [];
  for (const id of prerequisites) {
    if (!successors.has(id)) successors.set(id, new Set());
    successors.get(id).add(goal.id);
  }
}
const hasTerminalPath = (startId) => {
  const queue = [startId];
  const visited = new Set(queue);
  while (queue.length > 0) {
    const id = queue.shift();
    if (terminals.has(id)) return true;
    for (const next of successors.get(id) ?? []) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return false;
};
const noPath = removed.filter((id) => !hasTerminalPath(id));
assert.equal(noPath.length, candidate.baseline.withdrawnIdsWithoutAnyCurrentTerminalPath,
  'Unscoped terminal routes changed; refresh the candidate and its review table');

assert.equal(candidate.priorityTasks.length, 3);
const priorityIds = new Set();
for (const task of candidate.priorityTasks) {
  assert.ok(tasks.includes(`## \`${task.candidateId}\``), `Missing learner task: ${task.candidateId}`);
  assert.ok(Array.isArray(task.requiresProposal) && task.requiresProposal.length > 0);
  assert.ok(Array.isArray(task.coveredGoalIdsProposal) && task.coveredGoalIdsProposal.length > 0);
  assert.equal(task.stepPoints.reduce((sum, points) => sum + points, 0), task.maxPoints);
  assert.ok(task.reviewHold.length > 40, `Missing explicit review hold: ${task.candidateId}`);
  for (const id of [...task.requiresProposal, ...task.coveredGoalIdsProposal]) {
    assert.ok(byId.has(id), `Unknown proposed goal ${id}`);
    assert.ok(removed.includes(id), `Proposed goal was not withdrawn from source: ${id}`);
  }
  for (const id of task.coveredGoalIdsProposal) priorityIds.add(id);
}
assert.equal(priorityIds.size, 8, 'The three drafts no longer address eight unique withdrawn goals');
assert.ok([...priorityIds].every((id) => noPath.includes(id)), 'A priority task no longer repairs an orphan');

// Arithmetic and scoring facts used by the three complete draft tasks.
const dot = (a, b) => a.reduce((sum, value, index) => sum + value * b[index], 0);
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
assert.deepEqual([2 * 1 + 0, 2 * 2 + 1, 2 * 0 + 1], [2, 5, 1]);
assert.deepEqual(cross([0, 3, 0], [1, 0, 4]), [12, 0, -3]);
assert.equal(dot([2, 0, 0], cross([0, 3, 0], [1, 0, 4])), 24);
assert.equal((6 * 8 / 2) * 5, 120);
assert.equal(24 / 6, 4);
assert.equal(3 ** 2 * 10, 90);
assert.equal(3 ** 2 * 10 / 3, 30);
assert.equal(4 * 3 ** 3 / 3, 36);
assert.equal(4 * 6 ** 3 / 3, 288);
assert.deepEqual(cross([0, 2, 0], [1, 0, 5]), [10, 0, -2]);
assert.equal(dot([3, 1, 0], cross([0, 2, 0], [1, 0, 5])), 30);
assert.equal(dot([3, 1, 0], cross([1, 0, 5], [0, 2, 0])), -30);
assert.equal(30 / 6, 5);

console.log(`OK (candidate only): current Q2 ${source.requires.length}/${source.examData.coveredGoalIds.length}, hypothetical 4 kept + ${removed.length} withdrawn; ${noPath.length} unscoped route orphans, ${priorityIds.size} unique IDs in 3 unreleased drafts.`);
console.log('No canonical assessment, course projection, independent review, release, CQR or M7 approval performed.');
