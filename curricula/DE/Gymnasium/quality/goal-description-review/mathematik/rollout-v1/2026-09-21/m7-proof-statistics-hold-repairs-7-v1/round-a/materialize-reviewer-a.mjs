import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

// Mechanical binding only. All substantive decisions and all six evidence
// fields were individually authored in reviewer-a-authored.json.
const directory = resolve(process.argv[2]);
const allowed = [
  'm7-proof-statistics-hold-repairs-7-v1',
  'm7-proof-statistics-context-delta-5-v1',
].map((name) => resolve('curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-21', name, 'round-a'));
assert(allowed.includes(directory), 'Only the two assigned round-a directories are permitted');
const readJson = (name) => JSON.parse(readFileSync(join(directory, name), 'utf8'));
const sha256 = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const input = readJson('description-review-input.json');
const campaign = readJson('description-review-campaign.json');
const authored = readJson('reviewer-a-authored.json');
assert.equal(campaign.batches.length, 1);
const batch = campaign.batches[0];
const batchBytes = readFileSync(join(directory, 'batches', `${batch.batchId}.input.jsonl`));
const rows = batchBytes.toString().trim().split('\n').map(JSON.parse);
assert.equal(sha256(batchBytes), batch.batchInputFingerprint);
assert.deepEqual(input.goals.map((goal) => goal.goalId), batch.goalIds);
assert.deepEqual(authored.goals.map((goal) => goal.goalId), batch.goalIds);
rows.forEach((row, i) => assert.deepEqual(row.goal, input.goals[i]));
assert.equal(sha256(readFileSync(join(directory, 'prompt.md'))), campaign.promptFingerprint);
assert.equal(sha256(readFileSync(join(directory, 'criteria.md'))), campaign.criteriaFingerprint);
assert.equal(sha256(readFileSync(join(directory, 'contracts/goal-description-review-record.schema.json'))), campaign.recordSchemaDigest);
const visualInspections = input.goals.map((goal) => {
  const visualization = goal.reviewContext.page.visualization;
  const path = `app/public${visualization.url}`;
  const digest = sha256(readFileSync(path));
  assert.equal(digest, visualization.originalDigest);
  return { goalId: goal.goalId, path, digest, inspectedWith: 'view_image', reviewScope: 'Description context, not a separate V-gate or human approval' };
});
const runId = `${batch.batchId}.codex-a`;
const evidenceKeys = [
  'essentialUnderstandingDe', 'essentialUnderstandingEn',
  'observablePerformanceDe', 'observablePerformanceEn',
  'transferExpectationDe', 'transferExpectationEn',
];
const textBindings = [
  'goalId', 'goalFingerprint', 'pageFingerprint',
  'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn',
];
const records = input.goals.map((goal, index) => {
  const review = authored.goals[index];
  assert.equal(goal.reviewContext.evidenceProfile, null);
  for (const key of evidenceKeys) assert.equal(typeof review[key], 'string');
  assert.equal(review.decision, 'keep');
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${runId}.record-${String(index + 1).padStart(3, '0')}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: campaign.bundleFingerprint,
    bookDigest: campaign.bookDigest,
    ...Object.fromEntries(textBindings.map((key) => [key, goal[key]])),
    decision: review.decision,
    understandingEvidence: Object.fromEntries(evidenceKeys.map((key) => [key, review[key]])),
    rationale: review.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: 'create',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  };
});
const recordsBytes = records.map((record) => JSON.stringify(record)).join('\n') + '\n';
const parametersBytes = JSON.stringify(authored.generationParameters, null, 2) + '\n';
const completedAt = new Date().toISOString();
const run = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  schemaVersion: 1,
  runId,
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  batchId: batch.batchId,
  batchInputFingerprint: batch.batchInputFingerprint,
  bundleFingerprint: campaign.bundleFingerprint,
  bookDigest: campaign.bookDigest,
  provider: 'OpenAI',
  model: authored.model,
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha256(parametersBytes),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
    { role: 'review_prompt', digest: campaign.promptFingerprint },
    { role: 'review_criteria', digest: campaign.criteriaFingerprint },
  ],
  startedAt: authored.startedAt,
  completedAt,
  status: 'completed',
  outputDigest: sha256(recordsBytes),
  toolchainVersion: 'goal-description-review-v1',
};
mkdirSync(join(directory, 'results'), { recursive: true });
// Never silently replace an existing completed run.
writeFileSync(join(directory, 'results', `${batch.batchId}.records.jsonl`), recordsBytes, { flag: 'wx' });
writeFileSync(join(directory, 'results', `${batch.batchId}.run.json`), JSON.stringify(run, null, 2) + '\n', { flag: 'wx' });
writeFileSync(join(directory, 'reviewer-a-generation-parameters.json'), parametersBytes, { flag: 'wx' });
writeFileSync(join(directory, 'reviewer-a-scope-and-image-inspection.json'), JSON.stringify({
  reviewer: authored.reviewer,
  model: authored.model,
  runId,
  startedAt: authored.startedAt,
  completedAt,
  scopeNotes: authored.scopeNotes,
  visualInspections,
}, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ directory, runId, goalCount: records.length, keep: records.length, holds: 0, outputDigest: run.outputDigest, completedAt }));
