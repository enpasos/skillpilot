// Binds already authored, individually reviewed decisions. Does not decide,
// rewrite goals, adopt evidence, or assert human review/model diversity.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';

const [roundArg] = process.argv.slice(2);
assert(roundArg, 'Provide an explicitly reviewed round directory');
const dir = resolve(roundArg);
assert(dir.includes('/quality/goal-description-review/'));
const read = async (name) => JSON.parse(await readFile(join(dir, name), 'utf8'));
const sha = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const fileSha = async (name) => sha(await readFile(join(dir, name)));
const campaign = await read('description-review-campaign.json');
const input = await read('description-review-input.json');
const authored = await read('review-authoring.json');
const inspection = await read('inspection-authoring.json');
assert.equal(campaign.batches.length, 1, 'Bound single reviewer batch only');
const batch = campaign.batches[0];
assert.deepEqual(authored.map((g) => g.goalId), batch.goalIds);
assert.deepEqual(input.goals.map((g) => g.goalId), batch.goalIds);
assert.equal(input.bundleFingerprint, campaign.bundleFingerprint);
assert.equal(input.bookDigest, campaign.bookDigest);
assert.equal(await fileSha(`batches/${batch.batchId}.input.jsonl`), batch.batchInputFingerprint);
assert.equal(await fileSha('prompt.md'), campaign.promptFingerprint);
assert.equal(await fileSha('criteria.md'), campaign.criteriaFingerprint);
assert.equal(await fileSha('contracts/goal-description-review-record.schema.json'), campaign.recordSchemaDigest);
assert.equal(inspection.blindToCurrentPeerRun, true);
assert.equal(inspection.reviewer, '/root');
assert(new Date(inspection.completedAt) >= new Date(inspection.startedAt));
assert(new Date(inspection.completedAt) <= new Date());
const generationParameters = {
  temperature: null, seed: null, exactModelIdentifier: null,
  note: 'Not exposed by this session; no inferred provider/model diversity or fabricated API usage.',
};
const receipts = [];
for (const g of input.goals) {
  const v = g.reviewContext.page.visualization;
  if (!v) { receipts.push({ goalId: g.goalId, visualization: null }); continue; }
  assert(v.url.startsWith('/assets/goal-visualizations/'));
  const canonicalPath = resolve('curricula/DE/Gymnasium/visualizations', v.url.slice('/assets/goal-visualizations/'.length));
  assert.equal(sha(await readFile(canonicalPath)), v.originalDigest, `${g.goalId}: reviewed image changed`);
  receipts.push({ goalId: g.goalId, visualization: { url: v.url, originalDigest: v.originalDigest, inspection: inspection.imageInspection } });
}
assert.equal(receipts.filter((r) => r.visualization).length, inspection.actualImageCount);
const records = input.goals.map((g, index) => {
  const a = authored[index];
  assert(['keep', 'block'].includes(a.decision), 'This binding helper does not generate revision proposals');
  assert(a.rationale.length > 80);
  assert.equal(Object.keys(a.understandingEvidence).length, 6);
  assert(Object.values(a.understandingEvidence).every((s) => typeof s === 'string' && s.length > 35));
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1, recordId: `${inspection.runId}.${g.goalId}`, runId: inspection.runId,
    campaignId: campaign.campaignId, roundId: campaign.roundId,
    bundleFingerprint: input.bundleFingerprint, bookDigest: input.bookDigest,
    goalId: g.goalId, goalFingerprint: g.goalFingerprint, pageFingerprint: g.pageFingerprint,
    currentTitleDe: g.currentTitleDe, currentTitleEn: g.currentTitleEn,
    currentDescriptionDe: g.currentDescriptionDe, currentDescriptionEn: g.currentDescriptionEn,
    decision: a.decision, understandingEvidence: a.understandingEvidence, rationale: a.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2', evidenceProfileRecommendation: 'create',
    recordStatus: 'candidate', reviewAuthority: 'ai_candidate',
  };
});
const outputBytes = records.map((r) => JSON.stringify(r)).join('\n') + '\n';
const run = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  schemaVersion: 1, runId: inspection.runId, campaignId: campaign.campaignId,
  roundId: campaign.roundId, batchId: batch.batchId,
  batchInputFingerprint: batch.batchInputFingerprint, bundleFingerprint: input.bundleFingerprint,
  bookDigest: input.bookDigest, provider: 'OpenAI',
  model: 'Codex (exact underlying model identifier unavailable)', role: 'disconfirming_reviewer',
  promptFamilyId: 'generic-goal-description-review-v2', promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha(JSON.stringify(generationParameters)),
  independenceGroupId: campaign.independenceGroupId, blindToOtherRuns: true, goalIds: batch.goalIds,
  inputArtifacts: [
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
    { role: 'review_prompt', digest: campaign.promptFingerprint },
    { role: 'review_criteria', digest: campaign.criteriaFingerprint },
  ],
  startedAt: inspection.startedAt, completedAt: inspection.completedAt, status: 'completed',
  outputDigest: sha(outputBytes), toolchainVersion: 'codex-native-review-and-exact-binding-v1',
};
const provenance = {
  schemaVersion: 1, ...inspection, model: run.model, generationParameters,
  authoringDigest: await fileSha('review-authoring.json'),
  inspectionAuthoringDigest: await fileSha('inspection-authoring.json'),
  visualizationReceipts: receipts,
  decisions: { keep: records.filter((r) => r.decision === 'keep').length, block: records.filter((r) => r.decision === 'block').length },
  authority: 'ai_candidate; no human approval or release authority asserted',
};
await mkdir(join(dir, 'results'), { recursive: true });
// Refuse all replacement of sealed artifacts.
for (const [name, bytes] of [
  [`results/${batch.batchId}.records.jsonl`, outputBytes],
  [`results/${batch.batchId}.run.json`, JSON.stringify(run, null, 2) + '\n'],
  ['review-provenance.json', JSON.stringify(provenance, null, 2) + '\n'],
]) await writeFile(join(dir, name), bytes, { flag: 'wx' });
console.log(JSON.stringify({ runId: run.runId, outputDigest: run.outputDigest, ...provenance.decisions, imageCount: inspection.actualImageCount }));
