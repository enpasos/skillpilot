import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const roundDir = dirname(fileURLToPath(import.meta.url))
const packageDir = dirname(roundDir)
const campaign = JSON.parse(readFileSync(join(roundDir, 'description-review-campaign.json'), 'utf8'))
const bundle = JSON.parse(readFileSync(join(packageDir, 'bundle/manifest.json'), 'utf8'))
const decisions = JSON.parse(readFileSync(join(roundDir, 'first-pass-b.decisions.json'), 'utf8'))
const [batch] = campaign.batches
if (!batch || campaign.batches.length !== 1) throw new Error('Expected one bound Round B batch')
const inputPath = join(roundDir, 'batches', batch.batchId + '.input.jsonl')
const input = readFileSync(inputPath, 'utf8').trim().split('\n').map((line) => JSON.parse(line))
const sha256 = (value) => 'sha256:' + createHash('sha256').update(value).digest('hex')
if (sha256(readFileSync(inputPath)) !== batch.batchInputFingerprint) {
  throw new Error('Batch input fingerprint changed')
}
if (
  decisions.length !== input.length
  || decisions.some((decision, index) => decision.goalId !== input[index].goal.goalId)
  || decisions.some((decision) => !['keep', 'revise', 'split_review', 'block'].includes(decision.decision))
) {
  throw new Error('Decisions must cover every bound goal exactly once and in order')
}
if (
  bundle.bundleFingerprint !== campaign.bundleFingerprint
  || bundle.bookModelDigest !== campaign.bookDigest
  || bundle.promptFingerprint !== campaign.promptFingerprint
  || bundle.criteriaFingerprint !== campaign.criteriaFingerprint
) {
  throw new Error('Campaign no longer matches the bound bundle')
}

const runId = campaign.roundId + '-run-001'
const records = decisions.map((decision, index) => {
  const source = input[index].goal
  const record = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: runId + '-record-' + String(index + 1).padStart(3, '0'),
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: campaign.bundleFingerprint,
    bookDigest: campaign.bookDigest,
    goalId: source.goalId,
    goalFingerprint: source.goalFingerprint,
    pageFingerprint: source.pageFingerprint,
    currentTitleDe: source.currentTitleDe,
    currentTitleEn: source.currentTitleEn,
    currentDescriptionDe: source.currentDescriptionDe,
    currentDescriptionEn: source.currentDescriptionEn,
    decision: decision.decision,
    ...(decision.decision === 'revise'
      ? {
          proposedDescriptionDe: decision.proposedDe,
          proposedDescriptionEn: decision.proposedEn,
        }
      : {}),
    understandingEvidence: {
      essentialUnderstandingDe: decision.essentialDe,
      essentialUnderstandingEn: decision.essentialEn,
      observablePerformanceDe: decision.performanceDe,
      observablePerformanceEn: decision.performanceEn,
      transferExpectationDe: decision.transferDe,
      transferExpectationEn: decision.transferEn,
    },
    rationale: decision.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: source.reviewContext.evidenceProfile ? 'revise' : 'create',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  }
  if (
    Object.values(record.understandingEvidence).some((value) => typeof value !== 'string' || !value.trim())
    || !record.rationale?.trim()
    || (record.decision === 'revise' && (!record.proposedDescriptionDe?.trim() || !record.proposedDescriptionEn?.trim()))
  ) {
    throw new Error('Missing substantive review field for ' + source.goalId)
  }
  return record
})
const recordBytes = records.map((record) => JSON.stringify(record)).join('\n') + '\n'
const artifact = (role) => {
  const found = bundle.artifacts.find((item) => item.role === role)
  if (!found) throw new Error('Missing bundle artifact: ' + role)
  return { role, digest: found.digest }
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
  provider: 'OpenAI',
  model: 'Codex model not exposed to reviewer',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha256(JSON.stringify({
    client: 'Codex agent',
    model: 'not exposed to reviewer',
    generationParameters: 'not exposed to reviewer',
    blindToOtherRuns: true,
  })),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    artifact('book_pdf'),
    artifact('review_input_json'),
    artifact('review_prompt'),
    artifact('review_criteria'),
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
  ],
  startedAt: '2026-09-27T01:10:00.000Z',
  completedAt: new Date().toISOString(),
  status: 'completed',
  outputDigest: sha256(recordBytes),
  toolchainVersion: 'skillpilot-description-review-v2',
}
const resultDir = join(roundDir, 'results')
const recordPath = join(resultDir, batch.batchId + '.records.jsonl')
const runPath = join(resultDir, batch.batchId + '.run.json')
if (existsSync(recordPath) || existsSync(runPath)) {
  throw new Error('Round B output already exists; refusing to overwrite')
}
mkdirSync(resultDir, { recursive: true })
writeFileSync(recordPath, recordBytes, { flag: 'wx' })
writeFileSync(runPath, JSON.stringify(run, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({
  recordPath,
  runPath,
  count: records.length,
  decisions: records.reduce((acc, record) => {
    acc[record.decision] = (acc[record.decision] ?? 0) + 1
    return acc
  }, {}),
  outputDigest: run.outputDigest,
}, null, 2))
