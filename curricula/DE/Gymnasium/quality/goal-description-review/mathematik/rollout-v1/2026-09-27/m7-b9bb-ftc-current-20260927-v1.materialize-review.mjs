import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Run only after two genuinely independent agents have authored decisions.json
// from their respective, current blind round inputs. This script binds and
// validates provenance; it does not create a fachliches review decision.
const roundName = process.argv[2]
assert.ok(roundName === 'a' || roundName === 'b', 'Usage: node <script> a|b')

const root = dirname(fileURLToPath(import.meta.url))
const round = join(root, 'm7-b9bb-ftc-current-20260927-v1', `round-${roundName}`)
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const sha = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const campaign = readJson(join(round, 'description-review-campaign.json'))
const input = readJson(join(round, 'description-review-input.json'))
const bundle = readJson(join(round, 'review-bundle-manifest.json'))
const decisions = readJson(join(round, 'decisions.json'))
const batch = campaign.batches[0]
const goalId = 'b9bbd2a8-1379-5ffb-817f-41467d48abef'
const batchBytes = readFileSync(join(round, 'batches', `${batch.batchId}.input.jsonl`))
const schemaBytes = readFileSync(join(round, 'contracts/goal-description-review-record.schema.json'))
const promptBytes = readFileSync(join(round, 'prompt.md'))
const criteriaBytes = readFileSync(join(round, 'criteria.md'))

assert.equal(campaign.goalCount, 1)
assert.equal(campaign.batches.length, 1)
assert.deepEqual(batch.goalIds, [goalId])
assert.deepEqual(input.goals.map((goal) => goal.goalId), [goalId])
assert.deepEqual(Object.keys(decisions), [goalId])
assert.equal(sha(batchBytes), batch.batchInputFingerprint)
assert.equal(sha(schemaBytes), campaign.recordSchemaDigest)
assert.equal(sha(promptBytes), campaign.promptFingerprint)
assert.equal(sha(criteriaBytes), campaign.criteriaFingerprint)
assert.equal(campaign.bundleFingerprint, bundle.bundleFingerprint)
assert.equal(campaign.bookDigest, bundle.bookModelDigest)
assert.equal(campaign.reviewInputFingerprint, input.reviewInputFingerprint)

const goal = input.goals[0]
const runId = `${batch.batchId}.codex-independent-review`
const record = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  recordId: `${campaign.campaignId}.001`,
  runId,
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  bundleFingerprint: campaign.bundleFingerprint,
  bookDigest: campaign.bookDigest,
  goalId,
  goalFingerprint: goal.goalFingerprint,
  pageFingerprint: goal.pageFingerprint,
  currentTitleDe: goal.currentTitleDe,
  currentTitleEn: goal.currentTitleEn,
  currentDescriptionDe: goal.currentDescriptionDe,
  currentDescriptionEn: goal.currentDescriptionEn,
  ...decisions[goalId],
  evidenceProfileContract: 'positive-understanding-evidence-v2',
  evidenceProfileRecommendation: goal.reviewContext.evidenceProfile === null ? 'create' : 'revise',
  recordStatus: 'candidate',
  reviewAuthority: 'ai_candidate',
}
const recordBytes = Buffer.from(`${JSON.stringify(record)}\n`)
const runtime = {
  provider: 'OpenAI',
  model: 'Codex interactive model; exact identifier not exposed',
  generationParameters: 'not exposed in this interactive session',
  reviewProcess: `separate blind Codex subject-review agent, round ${roundName}`,
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
  goalIds: [goalId],
  inputArtifacts: [
    artifact('review_input_json'),
    artifact('review_prompt'),
    artifact('review_criteria'),
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
  ],
  startedAt: timestamp,
  completedAt: timestamp,
  status: 'completed',
  outputDigest: sha(recordBytes),
  toolchainVersion: 'codex-math-b9bb-current-review-v1',
}

const resultBase = join(round, 'results', batch.batchId)
mkdirSync(join(round, 'results'), { recursive: true })
writeFileSync(`${resultBase}.records.jsonl`, recordBytes, { flag: 'wx' })
writeFileSync(`${resultBase}.run.json`, `${JSON.stringify(run, null, 2)}\n`, { flag: 'wx' })
writeFileSync(join(round, 'runtime-disclosure.json'), runtimeBytes, { flag: 'wx' })
console.log(`Materialized independent current-image D review round ${roundName} for ${goalId}`)
