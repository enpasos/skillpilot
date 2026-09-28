import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const round = dirname(fileURLToPath(import.meta.url))
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const sha = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const campaign = readJson(join(round, 'description-review-campaign.json'))
const input = readJson(join(round, 'description-review-input.json'))
const bundle = readJson(join(round, 'review-bundle-manifest.json'))
const decisions = readJson(join(round, 'decisions.json'))
const batch = campaign.batches[0]
const batchBytes = readFileSync(join(round, 'batches', `${batch.batchId}.input.jsonl`))
const schemaBytes = readFileSync(join(round, 'contracts/goal-description-review-record.schema.json'))
const promptBytes = readFileSync(join(round, 'prompt.md'))
const criteriaBytes = readFileSync(join(round, 'criteria.md'))

assert.equal(campaign.goalCount, 2)
assert.equal(campaign.batches.length, 1)
assert.deepEqual(input.goals.map((goal) => goal.goalId), batch.goalIds)
assert.deepEqual(Object.keys(decisions), batch.goalIds)
assert.equal(sha(batchBytes), batch.batchInputFingerprint)
assert.equal(sha(schemaBytes), campaign.recordSchemaDigest)
assert.equal(sha(promptBytes), campaign.promptFingerprint)
assert.equal(sha(criteriaBytes), campaign.criteriaFingerprint)
assert.equal(campaign.bundleFingerprint, bundle.bundleFingerprint)
assert.equal(campaign.bookDigest, bundle.bookModelDigest)
assert.equal(campaign.reviewInputFingerprint, input.reviewInputFingerprint)

const runId = `${batch.batchId}.codex-current-review`
const records = input.goals.map((goal, index) => ({
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
  ...decisions[goal.goalId],
  evidenceProfileContract: 'positive-understanding-evidence-v2',
  evidenceProfileRecommendation: goal.reviewContext.evidenceProfile === null ? 'create' : 'revise',
  recordStatus: 'candidate',
  reviewAuthority: 'ai_candidate',
}))
const recordBytes = Buffer.from(`${records.map((record) => JSON.stringify(record)).join('\n')}\n`)
const runtime = {
  provider: 'OpenAI',
  model: 'GPT-6 Codex',
  generationParameters: 'not exposed in this interactive session',
  fingerprintMeaning: 'Digest of this disclosure, not a claim about hidden generation parameters',
}
const runtimeBytes = Buffer.from(`${JSON.stringify(runtime, null, 2)}\n`)
const timestamp = new Date().toISOString()
const artifact = (role) => {
  const entry = bundle.artifacts.find((item) => item.role === role)
  assert.ok(entry, `Missing bundle artifact ${role}`)
  return { role, digest: entry.digest }
}
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
  provider: runtime.provider,
  model: runtime.model,
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha(runtimeBytes),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [artifact('review_input_json'), artifact('review_prompt'), artifact('review_criteria'), {
    role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint,
  }],
  startedAt: timestamp,
  completedAt: timestamp,
  status: 'completed',
  outputDigest: sha(recordBytes),
  toolchainVersion: 'codex-math-description-review-current-a-v1',
}
const resultBase = join(round, 'results', batch.batchId)
writeFileSync(`${resultBase}.records.jsonl`, recordBytes, { flag: 'wx' })
writeFileSync(`${resultBase}.run.json`, `${JSON.stringify(run, null, 2)}\n`, { flag: 'wx' })
writeFileSync(join(round, 'runtime-disclosure.json'), runtimeBytes, { flag: 'wx' })
console.log(`Materialized ${records.length} current-text AI candidate records for ${batch.batchId}`)
