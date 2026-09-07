// Execute the unmodified native generator with filesystem writes captured in memory.
// --write-receipt stores only this exact bounded comparison, never generated views.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { syncBuiltinESMExports } from 'node:module';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const directory = dirname(fileURLToPath(import.meta.url));
const repo = resolve(directory, '../../../../../../../../..');
const save = process.argv.includes('--write-receipt');
assert(process.argv.slice(2).every(arg => arg === '--write-receipt'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => fs.readFileSync(resolve(repo, path), 'utf8');
const json = path => JSON.parse(read(path));
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json';
const canonical = json(canonicalPath), goalById = new Map(canonical.goals.map(goal => [goal.id, goal]));
const { collectCompositionProjectionRoleGoalIds } = await import(pathToFileURL(resolve(repo, 'app/src/utils/authoring/compositionViewAuthoring.ts')));
const viewDirectory = resolve(repo, 'curricula/DE/Gymnasium/composition-views/mathematik');
const expected = ['de-he-seki-g9.view.json', 'de-he-gk-g9.view.json', 'de-he-lk-g9.view.json'].map(name => resolve(viewDirectory, name));
const captured = new Map();
const originalWrite = fs.writeFileSync, originalArgs = process.argv;
try {
  fs.writeFileSync = (path, data) => {
    const target = resolve(String(path));
    assert(expected.includes(target), 'Unexpected native write, not performed: ' + target);
    assert(!captured.has(target), 'Repeated native write: ' + target);
    captured.set(target, String(data));
  };
  syncBuiltinESMExports();
  process.argv = [process.execPath, resolve(repo, 'app/scripts/generateMathDurationCompositionViews.ts'), '--write'];
  await import(pathToFileURL(process.argv[1]));
} finally {
  fs.writeFileSync = originalWrite;
  syncBuiltinESMExports();
  process.argv = originalArgs;
}
assert.deepEqual([...captured.keys()].sort(), expected.sort(), 'Native changed file set differs from v3');
const adoption = JSON.parse(fs.readFileSync(resolve(directory, 'adoption-he-g9-exponential-scope-v3.receipt.json')));
const seven = adoption.rawG9ProjectionDelta.removed;
const additions = adoption.rawG9ProjectionDelta.added;
const examId = 'af7905d0-e684-5ea3-99ac-8a045455370e';
const roles = view => collectCompositionProjectionRoleGoalIds(view.rootNodes, goalById);
const delta = (before, after) => ({ removed: [...before].filter(id => !after.has(id)).sort(), added: [...after].filter(id => !before.has(id)).sort() });
const views = [...captured].map(([path, nextBytes]) => {
  const oldBytes = fs.readFileSync(path, 'utf8'), before = JSON.parse(oldBytes), after = JSON.parse(nextBytes);
  const beforeRoles = roles(before), afterRoles = roles(after);
  const targets = delta(beforeRoles.targetGoalIds, afterRoles.targetGoalIds);
  const prerequisites = delta(beforeRoles.prerequisiteOnlyGoalIds, afterRoles.prerequisiteOnlyGoalIds);
  assert.deepEqual(targets.added, [...additions, examId].sort());
  assert.deepEqual(targets.removed, path.endsWith('de-he-seki-g9.view.json') ? seven : []);
  assert.deepEqual(prerequisites.removed, [examId]);
  assert.deepEqual(prerequisites.added, []);
  const exam = goalById.get(examId);
  assert.deepEqual(exam.requires, exam.examData.coveredGoalIds);
  const missingExamPrerequisites = exam.requires.filter(id => !afterRoles.targetGoalIds.has(id));
  assert.deepEqual(missingExamPrerequisites, []);
  const newlyMissingRequires = [...afterRoles.targetGoalIds].flatMap(id => (goalById.get(id)?.requires ?? []).filter(required => !afterRoles.targetGoalIds.has(required) && !afterRoles.prerequisiteOnlyGoalIds.has(required) && (beforeRoles.targetGoalIds.has(required) || additions.includes(id))).map(required => ({ goalId: id, requiredGoalId: required })));
  assert.deepEqual(newlyMissingRequires, []);
  return {
    path: relative(repo, path), beforeSha256: sha(oldBytes), afterSha256: sha(nextBytes),
    targetDelta: targets, prerequisiteOnlyDelta: prerequisites,
    currentTargetCount: afterRoles.targetGoalIds.size,
    exam: { goalId: examId, beforeRole: 'prerequisiteOnly', afterRole: 'target', missingPrerequisites: missingExamPrerequisites, requires: exam.requires, examDataSha256: sha(JSON.stringify(exam.examData)), note: 'Existing released J10 task; no assessment content or release authority changed. All actual covered goals now target, so the unchanged native assessment filter no longer suppresses this task.' },
    newlyMissingRequires,
    openInverseProjection: ['c15fe32d-1c83-4127-b1a4-9125af3d8f5d', 'dbc13bb0-963b-49a8-a441-2183f4b64c8e'].filter(id => afterRoles.targetGoalIds.has(id) && !afterRoles.targetGoalIds.has('71cec9fb-3751-4d61-8b34-c5adbbf6e5f2')),
  };
});
const report = {
  schemaVersion: 1, status: 'NATIVE_GENERATOR_PREVIEW_CAPTURED_NO_VIEW_WRITES', generatedAt: '2026-09-06',
  generatorPath: 'app/scripts/generateMathDurationCompositionViews.ts', generatorSha256: sha(read('app/scripts/generateMathDurationCompositionViews.ts')),
  canonicalSha256: sha(read(canonicalPath)), scopeReceiptSha256: sha(fs.readFileSync(resolve(directory, 'duration-scope-adjudication-v3.json'))),
  generatorOutputs: 18, changedOutputs: views.length, unchangedOutputs: 15, views,
  scope: 'Exact v3 source changes plus existing native exam target eligibility; all old seven targets retained in cross-stage Sek II, not duplicated into Sek I.',
  authority: 'AI graph/source comparison, not full goal acceptance. c15/dbc Sek-I orientation remains HOLD.',
};
if (save) fs.writeFileSync(resolve(directory, 'native-duration-preview-v3.receipt.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(report, null, 2));
