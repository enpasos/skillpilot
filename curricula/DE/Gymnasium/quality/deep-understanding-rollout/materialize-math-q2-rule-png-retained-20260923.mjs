// Preserve unchanged Q2 review records while two rule goals receive new PNG bindings.
// Historical resolution and positive-evidence source files remain untouched.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const mode = process.argv[2];
if (!['--write', '--check'].includes(mode) || process.argv.length !== 3) {
  throw new Error('Usage: node materialize-math-q2-rule-png-retained-20260923.mjs --write|--check (repository root)');
}

const changedGoalIds = new Set([
  'cf48c918-f6c1-5429-8da6-14df43f2f550',
  'ae5010cc-ea8d-5b14-aa4a-b0f2b5846a75',
]);
const retainedDescriptionIds = [
  '5dabf0b3-89b1-59a6-ae57-014f92becd3b',
  'dd6c5e08-0cc6-53c0-b317-ebaba277c776',
  '06ce2b1b-e888-5322-9ed9-dfc6d322956a',
  '04fe49bf-8c3e-5986-ae83-3c69c0c3e4c8',
  '8b3ce429-e6bb-5d33-b6aa-6ded41afc74c',
  'bf17cada-3ccd-5d9a-b9e3-42065cfdbb01',
  'd8f1fd06-785e-5d15-a8e5-7d8b36f91287',
];
const retainedEvidenceIds = [
  '5e893892-393e-5df0-b705-fb3b3458122f',
  '33c6e64c-5955-5b07-85d4-74a97b19dd56',
  '8d893e63-d7de-52d9-8bcb-f48f47d1ccbf',
  '4bc6cc77-3d20-5d27-a74a-8efb0a038d17',
];
const suffix = 'retained-before-q2-rule-png-20260923-v1';
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const readPinned = (path, expected) => {
  const bytes = readFileSync(resolve(path));
  if (sha(bytes) !== expected) throw new Error(path + ': source bytes changed');
  return bytes;
};
const sameIds = (actual, expected, label) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(label + ': goal IDs or order changed');
  }
};
const exactOutput = (path, bytes) => {
  const absolute = resolve(path);
  if (!existsSync(absolute)) {
    if (mode !== '--write') throw new Error(path + ': retained output missing');
    writeFileSync(absolute, bytes, { flag: 'wx' });
  } else if (!readFileSync(absolute).equals(bytes)) {
    throw new Error(path + ': retained output differs');
  }
};

const descriptionSource = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-20/m7-he-context-refresh-9-v1/resolution-index.json';
const descriptionSourceSha = '74cc2cbd126f6a2e1b5c56798f05e97a7868261c99dd8c274e520ecaa7ec130b';
const description = JSON.parse(readPinned(descriptionSource, descriptionSourceSha));
if (description.batchGoalIds.length !== 9 || description.resolutions.length !== 9 ||
    description.groups.length !== 1 || description.groups[0].resolvedGoalCount !== 9) {
  throw new Error(descriptionSource + ': expected nine resolved goals in one group');
}
sameIds(description.resolutions.map((record) => record.goalId), description.batchGoalIds, descriptionSource);
sameIds(description.batchGoalIds.filter((id) => !changedGoalIds.has(id)), retainedDescriptionIds, descriptionSource);
if ([...changedGoalIds].some((id) => description.batchGoalIds.filter((value) => value === id).length !== 1)) {
  throw new Error(descriptionSource + ': expected each changed goal exactly once');
}
const retainedResolutions = description.resolutions.filter((record) => !changedGoalIds.has(record.goalId));
// A standalone v2 index is inseparable from its full campaign goal list.
// The accepted partial-index v1 form keeps the original dual-round evidence
// and claims only the untouched resolution entries.
const curriculumAtomicDenominator = 797;
const retainedDescription = {
  schemaVersion: 1,
  artifactSetId: description.artifactSetId + '-' + suffix,
  subject: description.subject,
  semanticKind: description.semanticKind,
  strictDescriptionReviewCompleteCount: retainedResolutions.length,
  curriculumAtomicDenominator,
  descriptionReviewPercentage: Number((retainedResolutions.length * 100 / curriculumAtomicDenominator).toFixed(1)),
  groups: description.groups.map((group) => ({
    ...group,
    resolvedGoalCount: retainedResolutions.filter((record) => record.groupId === group.groupId).length,
  })),
  resolutions: retainedResolutions,
};
if (retainedDescription.groups[0].resolvedGoalCount !== 7) {
  throw new Error(descriptionSource + ': retained group count is not seven');
}
const descriptionOutput = descriptionSource.replace(/\.json$/, '.' + suffix + '.json');
exactOutput(descriptionOutput, Buffer.from(JSON.stringify(retainedDescription, null, 2) + '\n'));
console.log('D retained 7/9: ' + descriptionOutput);

const evidenceSourceConfig = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-045-current-keep7-v1.retained-before-m7-functions-20260920-v1.config.json';
const evidenceConfigSha = '4070daff5eaf55018d06f4e01b9a25e3e54da692bd4aea9bc92f6671bcf9811f';
const evidenceReviewSha = '761ee527c3b3d538b3fdf4416f92b4736d1c7c0e6f008af24bf0d66733779f2a';
const evidence = JSON.parse(readPinned(evidenceSourceConfig, evidenceConfigSha));
const evidenceSourceReview = evidenceSourceConfig.replace(/\.config\.json$/, '.review.jsonl');
if (evidence.reviewPath !== evidenceSourceReview || evidence.scope.goalIds.length !== 6) {
  throw new Error(evidenceSourceConfig + ': unexpected source review or scope');
}
const lines = readPinned(evidenceSourceReview, evidenceReviewSha).toString('utf8').trimEnd().split('\n');
if (lines.length !== 6) throw new Error(evidenceSourceReview + ': expected six review lines');
sameIds(lines.map((line) => JSON.parse(line).goalId), evidence.scope.goalIds, evidenceSourceReview);
sameIds(evidence.scope.goalIds.filter((id) => !changedGoalIds.has(id)), retainedEvidenceIds, evidenceSourceConfig);
if ([...changedGoalIds].some((id) => evidence.scope.goalIds.filter((value) => value === id).length !== 1)) {
  throw new Error(evidenceSourceConfig + ': expected each changed goal exactly once');
}
const evidenceOutputConfig = evidenceSourceConfig.replace(/\.config\.json$/, '.' + suffix + '.config.json');
const evidenceOutputReview = evidenceSourceConfig.replace(/\.config\.json$/, '.' + suffix + '.review.jsonl');
const retainedEvidence = {
  ...evidence,
  reviewPath: evidenceOutputReview,
  scope: {
    ...evidence.scope,
    label: evidence.scope.label + '; two Q2 rule goals moved to current PNG-bound review',
    goalIds: retainedEvidenceIds,
  },
};
const retainedLines = lines.filter((_, index) => !changedGoalIds.has(evidence.scope.goalIds[index]));
exactOutput(evidenceOutputConfig, Buffer.from(JSON.stringify(retainedEvidence, null, 2) + '\n'));
exactOutput(evidenceOutputReview, Buffer.from(retainedLines.join('\n') + '\n'));
console.log('P retained 4/6: ' + evidenceOutputConfig);
