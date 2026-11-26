#!/usr/bin/env node
// Author-side structural checks; no grading of free-text submissions.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const base = path.dirname(fileURLToPath(import.meta.url));
const read = rel => JSON.parse(readFileSync(path.join(base, rel), 'utf8'));
const candidate = read('candidate.goal.json');
const exam = candidate.examData;
const scoring = exam.scoring;
const scripts = read('blind/scripts.json').cases;
const expected = read('author/expectations.json').cases;
const manifest = read('author/manifest.json');
const scope = read('scope.json');
const required = '2d3f849e-20b1-5b3e-90d0-63d98c6b2b1b';

assert.equal(candidate.id, 'e0085acf-af64-5c73-8abf-85a5bbfbdaa6');
assert.equal(candidate.type, 'atomic');
assert.deepEqual(candidate.contains, []);
assert.deepEqual(candidate.requires, [required]);
assert.deepEqual(exam.coveredGoalIds, [required]);
assert.equal(exam.reviewStatus, 'needs_review');
assert.match(candidate.title, /^Prüfungsaufgabe: /u);
assert.match(candidate.description, /^Die lernende Person kann /u);
assert.equal(scoring.maxPoints, 12);
assert.equal(scoring.passingPoints, 10);
assert.ok(scoring.passingPoints / scoring.maxPoints <= 0.85);
assert.equal(scoring.steps.reduce((n, step) => n + step.points, 0), scoring.maxPoints);
assert.deepEqual(scoring.steps.map(step => step.id), ['A', 'B', 'C', 'D']);
for (const step of scoring.steps) {
  assert.equal(step.points, 3);
  assert.ok(step.points > scoring.maxPoints - scoring.passingPoints);
  assert.ok(step.description.length < 2000, `${step.id}: UTF-16 length`);
  assert.ok(step.description.includes(' / EN: '), `${step.id}: bilingual`);
}
for (const key of ['taskContent', 'taskContentEn', 'solutionContent', 'solutionContentEn']) {
  assert.ok(exam[key].length > 0 && exam[key].length < 2000, key);
}
assert.deepEqual(scoring, read('rubric.json'));
assert.equal(scope.regularTargetViewCount, 14);
assert.equal(scope.regularTargetViews.length, 14);
assert.equal(new Set(scope.regularTargetViews).size, 14);
assert.equal(scope.regularTargetViews.filter(view => view.startsWith('de-he-')).length, 8);
assert.equal(scope.regularTargetViews.filter(view => view.startsWith('de-sl-')).length, 4);
assert.equal(scope.regularTargetViews.filter(view => view.startsWith('de-sn-')).length, 2);
assert.ok(scope.regularTargetViews.filter(view => view.startsWith('de-sn-')).every(view => view.endsWith('-lk')));
assert.equal(scripts.length, 18);
assert.equal(new Set(scripts.map(s => s.id)).size, 18);
assert.deepEqual(scripts.map(s => s.id), expected.map(s => s.id));
assert.ok(scripts.every(s => Object.keys(s).sort().join(',') === 'id,responseDe,responseEn'));
assert.ok(scripts.every(s => s.responseDe.length > 0 && s.responseEn.length > 0));
assert.ok(expected.some(s => s.expectedTotal === 10));
assert.ok(expected.some(s => s.expectedTotal === 9.5));
assert.ok(expected.some(s => s.expectedTotal === 11.5));
for (const item of expected) {
  const sum = Object.values(item.expectedPoints).reduce((n, p) => n + p, 0);
  assert.equal(item.expectedTotal, sum, item.id);
  assert.equal(item.expectedPass, sum >= scoring.passingPoints, item.id);
  assert.ok(Object.values(item.expectedPoints).every(p => p >= 0 && p <= 3), item.id);
}
for (const item of manifest.files) {
  const digest = createHash('sha256').update(readFileSync(path.join(base, item.path))).digest('hex');
  assert.equal(digest, item.sha256, item.path);
}
const report = {
  status: 'pass',
  scope: 'author-side-structural-validation-only',
  candidateSha256: createHash('sha256').update(readFileSync(path.join(base, 'candidate.goal.json'))).digest('hex'),
  caseCount: scripts.length,
  carryingPerformances: scoring.steps.map(s => ({ id: s.id, points: s.points, utf16Units: s.description.length })),
  maxPoints: scoring.maxPoints,
  passingPoints: scoring.passingPoints,
  passingPercentage: 100 * scoring.passingPoints / scoring.maxPoints,
  intendedViewCount: scope.regularTargetViews.length,
  note: 'No independent grading, catalog activation, curriculum QA or CI result is asserted.'
};
writeFileSync(path.join(base, 'author/validation.actual.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
