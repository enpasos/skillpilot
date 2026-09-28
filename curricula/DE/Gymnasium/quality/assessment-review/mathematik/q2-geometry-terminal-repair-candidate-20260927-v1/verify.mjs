#!/usr/bin/env node

// Structural check for the noncanonical candidate only. It is not an exam,
// source, D/P, applicability, or M7 quality approval.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(packageDir, '../../../../../../../');
const candidate = JSON.parse(readFileSync(resolve(packageDir, 'candidate-routes.json'), 'utf8'));
const tasksText = readFileSync(resolve(packageDir, 'TASKS.md'), 'utf8');
const readme = readFileSync(resolve(packageDir, 'README.md'), 'utf8');
const mathReview = readFileSync(resolve(packageDir, 'MATH-REVIEW.md'), 'utf8');
const canonical = JSON.parse(readFileSync(resolve(
  repoRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
), 'utf8'));
const byId = new Map(canonical.goals.map(goal => [goal.id, goal]));
const original = byId.get(candidate.sourceExamGoalId);

assert.ok(original?.examData, 'Source Q2 exam must exist in canonical baseline');
assert.equal(original.examData.coveredGoalIds.length, 43, 'Baseline Q2 exam changed: audit first');
assert.deepEqual(original.requires, original.examData.coveredGoalIds, 'Baseline lists differ');
assert.equal(original.examData.scoring.maxPoints, 20);
assert.deepEqual(original.examData.scoring.steps.map(step => step.points), [4, 4, 6, 6]);

const originalIds = new Set(original.requires);
const kept = candidate.sourceExamProposedRequiresAndCoveredGoalIds;
assert.equal(kept.length, 4);
assert.equal(new Set(kept).size, 4);
for (const id of kept) {
  assert.ok(originalIds.has(id), `Proposed kept ID not in baseline: ${id}`);
  assert.ok(byId.get(id)?.dimensionTags?.guidingIdeas?.includes('L3'), `Kept goal lacks L3: ${id}`);
}
assert.match(candidate.sourceExamFourthGoalCondition, /5f548596/);
assert.match(tasksText, /## Bestehende Aufgabe `1878f680…`: enger korrigieren/);
assert.match(tasksText, /20 BE bleiben in vier Rubrikschritten \*\*4\/4\/6\/6\*\*/);

const removed = candidate.removedDirectLinks;
assert.equal(removed.length, 39);
assert.equal(new Set(removed).size, 39);
assert.deepEqual(removed, original.requires.filter(id => !kept.includes(id)), 'Withdrawn IDs/order differ from canonical baseline');

const seen = new Set();
const ids = new Set();
for (const task of candidate.candidateTasks) {
  assert.ok(!ids.has(task.candidateId), `Duplicate task: ${task.candidateId}`);
  ids.add(task.candidateId);
  assert.equal(task.candidateId, task.taskSection);
  assert.ok(['GK_LK', 'LK'].includes(task.courseLevel));
  assert.ok(typeof task.requiresRationale === 'string' && task.requiresRationale.length > 70,
    `${task.candidateId}: no explicit gate rationale`);
  assert.ok(task.requires.length > 0, `${task.candidateId}: no local terminal gate`);
  assert.equal(new Set(task.requires).size, task.requires.length, `${task.candidateId}: duplicate requires ID`);
  for (const prerequisiteId of task.requires) {
    assert.ok(byId.has(prerequisiteId), `${task.candidateId}: unknown prerequisite ${prerequisiteId}`);
    if (task.courseLevel === 'GK_LK') assert.ok(!(
      byId.get(prerequisiteId).tags.includes('LK') && !byId.get(prerequisiteId).tags.includes('GK')
    ), `${task.candidateId}: LK-only prerequisite gates GK ${prerequisiteId}`);
  }
  assert.ok(task.coveredGoalIds.length > 0);
  assert.ok(task.stepPoints.every(points => Number.isInteger(points) && points > 0));
  assert.equal(task.stepPoints.reduce((a, b) => a + b, 0), task.maxPoints, `${task.candidateId}: BE do not add up`);

  for (const id of task.coveredGoalIds) {
    assert.ok(originalIds.has(id) && removed.includes(id), `${task.candidateId}: unwithdrawn or unknown original goal ${id}`);
    assert.ok(byId.has(id), `${task.candidateId}: nonexistent goal ${id}`);
    assert.ok(!seen.has(id), `Goal assigned twice: ${id}`);
    seen.add(id);
    if (task.courseLevel === 'LK') assert.ok(byId.get(id).tags.includes('LK'), `${task.candidateId}: not LK ${id}`);
    if (task.courseLevel === 'GK_LK') assert.ok(!(
      byId.get(id).tags.includes('LK') && !byId.get(id).tags.includes('GK')
    ), `${task.candidateId}: LK-only goal assigned to GK ${id}`);
    const expectedTableRow = `| \`${id}\` | ${byId.get(id).title} | \`${task.candidateId}\` |`;
    assert.ok(readme.includes(expectedTableRow), `${task.candidateId}: missing/wrong 39-ID README row ${id}`);
  }

  const sectionStart = tasksText.indexOf(`## ${task.taskSection}\n`);
  assert.ok(sectionStart >= 0, `Missing section ${task.taskSection}`);
  const nextSection = tasksText.indexOf('\n## ', sectionStart + 4);
  const section = tasksText.slice(sectionStart, nextSection < 0 ? undefined : nextSection);
  assert.ok(section.includes(`Aufgabe (${task.maxPoints} BE)`), `${task.candidateId}: section/maxPoints mismatch`);
  assert.match(section, /Lösung\/Rubrik:/, `${task.candidateId}: no solution/rubric`);
  const numberedParts = [...section.matchAll(/^\d+\. /gm)].length;
  assert.equal(numberedParts, task.stepPoints.length, `${task.candidateId}: task count differs from rubric parts`);
}
assert.deepEqual([...seen].sort(), [...removed].sort(), 'Candidate tasks do not assign exactly the 39 withdrawn direct links');
assert.equal([...readme.matchAll(/^\| `[a-f0-9-]{36}` \|/gm)].length, 39, 'README must list exactly 39 ID rows');
const originalReviewIds = [
  '075f1ef2-6860-4b20-9df2-878157eb395e',
  'aae119f2-925f-5fc1-b795-b52c9e980863',
  'd379e28b-d9d5-5cab-b383-318e0499c0c7',
  'b4fd63de-1e36-5efd-ae0a-6c5e7741b0d2',
  '636b3e2d-c687-5469-8850-e085df06878d',
  '4af3dfb9-7e15-5da5-8b86-0aac6c80e266',
  'b04bd2d6-21d4-5ac5-9a77-b5f950a41c24',
  'd6b74b15-1cbc-512b-a160-0f40aecafe8c',
  'ef1524f1-0b2f-59f7-a001-5ab3e3dececb',
];
const holdIds = candidate.coverageReviewHolds.map(hold => hold.goalId);
const repairedIds = candidate.taskLevelCoverageRepairs.map(repair => repair.goalId);
assert.deepEqual([...holdIds].sort(), [
  '075f1ef2-6860-4b20-9df2-878157eb395e',
  'd379e28b-d9d5-5cab-b383-318e0499c0c7',
].sort(), 'Only the two visual-stimulus-dependent holds may remain');
assert.equal(repairedIds.length, 7, 'Expected seven documented task-level gap repairs');
for (const id of [
  'b4fd63de-1e36-5efd-ae0a-6c5e7741b0d2',
  '4af3dfb9-7e15-5da5-8b86-0aac6c80e266',
]) {
  assert.ok(repairedIds.includes(id), `Text-repaired hold lacks explicit task-level disposition: ${id}`);
  assert.ok(!holdIds.includes(id), `Text-repaired hold still listed as visual-stimulus hold: ${id}`);
}
assert.deepEqual([...holdIds, ...repairedIds].sort(), [...originalReviewIds].sort(),
  'An original review concern disappeared without a documented disposition');
for (const hold of candidate.coverageReviewHolds) {
  assert.ok(seen.has(hold.goalId), `Review hold not assigned as candidate: ${hold.goalId}`);
  assert.ok(hold.reason.length > 50, `Review hold has no concrete reason: ${hold.goalId}`);
  assert.ok(readme.includes(hold.goalId.slice(0, 8)), `Review hold missing in README: ${hold.goalId}`);
  assert.ok(mathReview.includes(hold.goalId.slice(0, 8)), `Review hold missing in math review: ${hold.goalId}`);
}
for (const repair of candidate.taskLevelCoverageRepairs) {
  assert.ok(seen.has(repair.goalId), `Task-level repair not assigned as candidate: ${repair.goalId}`);
  assert.ok(ids.has(repair.taskSection), `Repair has no task section: ${repair.goalId}`);
  assert.ok(repair.evidence.length > 80, `Repair has no substantive evidence: ${repair.goalId}`);
  assert.match(repair.status, /human coverage and projection review pending/,
    `Repair incorrectly claims final approval: ${repair.goalId}`);
  assert.ok(readme.includes(repair.goalId.slice(0, 8)), `Repair missing in README: ${repair.goalId}`);
  assert.ok(mathReview.includes(repair.goalId.slice(0, 8)), `Repair missing in math review: ${repair.goalId}`);
}

// Spot-check the nontrivial new worked examples; this is not a human exam review.
const rectangle = [[0, 0], [4, 0], [4, 3], [0, 3]];
assert.deepEqual(rectangle.map(([x, y]) => [5 - y, 1 + x]),
  [[5, 1], [5, 5], [2, 5], [2, 1]]);
assert.deepEqual(rectangle.map(([x, y]) => [2 * x, 2 * y]),
  [[0, 0], [8, 0], [8, 6], [0, 6]]);
assert.equal(4 * 3 * 4, 48, 'Scaled rectangle area mismatch');
for (const [x, y] of [[0, 0], [4, 0], [4, 4], [0, 4]]) {
  assert.equal((2 - x) ** 2 + (2 - y) ** 2 + 3 ** 2, 17,
    'Square-pyramid lateral-edge length mismatch');
}
const triangleSidesSquared = [
  (4 - 0) ** 2 + (0 - 0) ** 2,
  (2 - 0) ** 2 + (3 - 0) ** 2,
  (2 - 4) ** 2 + (3 - 0) ** 2,
];
assert.deepEqual(triangleSidesSquared, [16, 13, 13], 'New triangle not isosceles/non-right');
const trapezoidEdges = [[5, 0], [-2, 2], [-2, 0], [-1, -2]];
const cross = ([x1, y1], [x2, y2]) => x1 * y2 - y1 * x2;
assert.equal(cross(trapezoidEdges[0], trapezoidEdges[2]), 0,
  'New trapezoid bases must be parallel');
assert.notEqual(cross(trapezoidEdges[1], trapezoidEdges[3]), 0,
  'New trapezoid must have exactly one parallel opposite pair');
const kite = [[0, 2], [2, 0], [0, -1], [-2, 0]];
const kiteSideSquares = kite.map(([x, y], index) => {
  const [nextX, nextY] = kite[(index + 1) % kite.length];
  return (nextX - x) ** 2 + (nextY - y) ** 2;
});
assert.deepEqual(kiteSideSquares, [8, 5, 5, 8], 'New kite side-pair pattern changed');
assert.match(tasksText, /Kreiszylinder und einen geraden Kreiskegel/,
  'Solid-symmetry family comparison missing');
assert.match(tasksText, /Drei weitere Figuren sind \*\*nur durch ihre Eckpunkte\*\*/,
  'Independent coordinate figure stimulus missing');

// Direct graph-path diagnostic only; it does not model composition views,
// applicability projection, or human approval.
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
const terminalIds = new Set(practiceClusters.flatMap(id => byId.get(id)?.contains ?? [])
  .filter(id => byId.get(id)?.examData));
assert.equal(terminalIds.size, 52, 'Terminal baseline changed: review diagnostic before quoting it');

const successorIds = new Map();
for (const goal of canonical.goals) {
  const prerequisiteIds = goal.id === original.id ? kept : goal.requires ?? [];
  for (const prerequisiteId of prerequisiteIds) {
    if (!successorIds.has(prerequisiteId)) successorIds.set(prerequisiteId, new Set());
    successorIds.get(prerequisiteId).add(goal.id);
  }
}
const directlyRetained = removed.filter(id => [...terminalIds].some(terminalId =>
  terminalId !== original.id && byId.get(terminalId).requires?.includes(id)));
assert.equal(directlyRetained.length, 0, 'Some withdrawn goals gained a different direct exam link');

function hasTerminalPath(startId) {
  const queue = [startId];
  const visited = new Set(queue);
  while (queue.length) {
    const id = queue.shift();
    if (terminalIds.has(id)) return true;
    for (const nextId of successorIds.get(id) ?? []) {
      if (!visited.has(nextId)) {
        visited.add(nextId);
        queue.push(nextId);
      }
    }
  }
  return false;
}
const noPath = removed.filter(id => !hasTerminalPath(id));
assert.equal(noPath.length, 17, 'Baseline graph route count changed: update README after diagnosis');

console.log(`OK: 43 original links = ${kept.length} proposed kept + ${removed.length} withdrawn; ${candidate.candidateTasks.length} candidate tasks assign all withdrawn IDs exactly once as proposals.`);
console.log(`OK: all task/solution sections, positive BE totals, LK-only assignment and individual gate rationales checked; ${repairedIds.length} task-level gaps repaired, ${holdIds.length} coverage claims remain on review hold; human approval still pending.`);
console.log(`Diagnostic only: ${directlyRetained.length}/39 other direct exam links; ${noPath.length}/39 no remaining requires path to ${terminalIds.size} current terminal exams after hypothetical reduction.`);
