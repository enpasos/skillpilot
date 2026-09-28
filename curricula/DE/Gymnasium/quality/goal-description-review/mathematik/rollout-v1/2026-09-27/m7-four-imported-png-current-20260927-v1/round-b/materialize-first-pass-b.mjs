import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = dirname(here);
const read = (path) => JSON.parse(readFileSync(path, 'utf8'));
const sha = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const campaign = read(join(here, 'description-review-campaign.json'));
const input = read(join(here, 'description-review-input.json'));
const bundle = read(join(here, 'review-bundle-manifest.json'));
const decisions = read(join(here, 'decisions.json'));
const batch = campaign.batches[0];
const batchBytes = readFileSync(join(here, 'batches', `${batch.batchId}.input.jsonl`));

assert.equal(campaign.goalCount, 4);
assert.equal(campaign.batches.length, 1);
assert.equal(input.goals.length, 4);
assert.deepEqual(input.goals.map((goal) => goal.goalId), batch.goalIds);
assert.deepEqual(Object.keys(decisions), batch.goalIds);
assert.equal(sha(batchBytes), batch.batchInputFingerprint);
assert.equal(sha(readFileSync(join(here, 'contracts/goal-description-review-record.schema.json'))), campaign.recordSchemaDigest);
assert.equal(sha(readFileSync(join(here, 'prompt.md'))), campaign.promptFingerprint);
assert.equal(sha(readFileSync(join(here, 'criteria.md'))), campaign.criteriaFingerprint);
assert.equal(campaign.bundleFingerprint, bundle.bundleFingerprint);
assert.equal(campaign.bookDigest, bundle.bookModelDigest);
assert.equal(campaign.reviewInputFingerprint, input.reviewInputFingerprint);

for (const goal of input.goals) {
  const visual = goal.reviewContext.page.visualization;
  assert.equal(visual?.resourceType, 'image');
  const imagePath = join(root, '../../../../../../visualizations/mathematik', goal.goalId, `${goal.goalId}.png`);
  // Bundle and canonical image are both fingerprint-bound; the visual cannot be
  // replaced between the blind assessment and output materialization.
  assert.equal(sha(readFileSync(imagePath)), visual.originalDigest, goal.goalId);
  assert.equal(goal.reviewContext.evidenceProfile, null, goal.goalId);
}

const runId = 'codex-math-four-imported-png-current-20260927-b-01';
const records = input.goals.map((goal, index) => {
  const decision = decisions[goal.goalId];
  assert.ok(decision);
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${campaign.campaignId}.${String(index + 1).padStart(3, '0')}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: campaign.bundleFingerprint,
    bookDigest: campaign.bookDigest,
    goalId: goal.goalId,
    goalFingerprint: goal.goalFingerprint,
    pageFingerprint: goal.pageFingerprint,
    currentTitleDe: goal.currentTitleDe,
    currentTitleEn: goal.currentTitleEn,
    currentDescriptionDe: goal.currentDescriptionDe,
    currentDescriptionEn: goal.currentDescriptionEn,
    ...decision,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  };
});

const recordBytes = Buffer.from(`${records.map((record) => JSON.stringify(record)).join('\n')}\n`);
const disclosure = {
  provider: 'OpenAI',
  model: 'Codex (exact model not exposed)',
  generationParameters: 'not exposed in this interactive session',
  fingerprintMeaning: 'Digest of this disclosure, not a claim that hidden generation parameters are known',
};
const disclosureBytes = Buffer.from(`${JSON.stringify(disclosure, null, 2)}\n`);
const artifact = (role) => {
  const item = bundle.artifacts.find((entry) => entry.role === role);
  assert.ok(item, `Missing bundle artifact ${role}`);
  return { role, digest: item.digest };
};
const timestamp = new Date().toISOString();
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
  provider: disclosure.provider,
  model: disclosure.model,
  role: 'subject_reviewer',
  promptFamilyId: 'skillpilot-goal-description-understanding-evidence-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha(disclosureBytes),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    artifact('book_pdf'),
    artifact('review_prompt'),
    artifact('review_criteria'),
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
  ],
  startedAt: timestamp,
  completedAt: timestamp,
  status: 'completed',
  outputDigest: sha(recordBytes),
  toolchainVersion: 'codex-math-four-png-d-round-b-v1',
};

mkdirSync(join(here, 'results'), { recursive: true });
writeFileSync(join(here, 'results', `${batch.batchId}.records.jsonl`), recordBytes);
writeFileSync(join(here, 'results', `${batch.batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`);
writeFileSync(join(here, 'runtime-disclosure.json'), disclosureBytes);
console.log(`Materialized ${records.length} independent round-b candidate records`);
