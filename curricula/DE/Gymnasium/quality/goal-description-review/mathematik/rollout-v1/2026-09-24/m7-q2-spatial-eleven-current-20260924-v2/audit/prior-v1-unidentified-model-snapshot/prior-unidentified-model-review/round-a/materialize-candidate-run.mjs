import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const digest = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const input = readJson(join(here, 'description-review-input.json'))
const campaign = readJson(join(here, 'description-review-campaign.json'))
const bundle = readJson(join(here, 'review-bundle-manifest.json'))
const decisions = readJson(join(here, 'candidate-decisions.json'))
const [batch] = campaign.batches
if (campaign.batches.length !== 1 || decisions.length !== batch.goalIds.length) {
  throw new Error('Expected exactly one complete 11-goal Round A batch')
}
const runId = 'mathematik-m7-q2-spatial-eleven-current-20260924-v1-run-a-1'
const records = decisions.map((decision, index) => {
  const source = input.goals[index]
  if (decision.goalId !== source?.goalId || decision.goalId !== batch.goalIds[index]) {
    throw new Error(`Decision ${index + 1} does not match the bound goal order`)
  }
  const record = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${runId}-goal-${index + 1}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: bundle.bundleFingerprint,
    bookDigest: bundle.bookModelDigest,
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
          proposedDescriptionDe: decision.proposedDescriptionDe,
          proposedDescriptionEn: decision.proposedDescriptionEn,
        }
      : {}),
    understandingEvidence: decision.understandingEvidence,
    rationale: decision.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: decision.evidenceProfileRecommendation,
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  }
  return record
})
const recordsBytes = Buffer.from(records.map((record) => JSON.stringify(record)).join('\n') + '\n')
const bundleArtifactByRole = new Map(bundle.artifacts.map((artifact) => [artifact.role, artifact.digest]))
const inputArtifacts = [
  'book_pdf',
  'book_pdf_render_manifest',
  'book_model',
  'review_input_json',
  'review_prompt',
  'review_criteria',
].map((role) => {
  const artifactDigest = bundleArtifactByRole.get(role)
  if (!artifactDigest) throw new Error(`Missing bound input artifact: ${role}`)
  return { role, digest: artifactDigest }
})
inputArtifacts.push({
  role: 'description_review_batch_input_jsonl',
  digest: batch.batchInputFingerprint,
})
const generationParametersFingerprint = digest(Buffer.from(JSON.stringify({
  method: 'independent evidence-grounded Codex subject review',
  outputs: 'candidate descriptions and bilingual understanding evidence',
  samplingParameters: 'not exposed',
})))
const recordedAt = new Date().toISOString()
const run = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  schemaVersion: 1,
  runId,
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  batchId: batch.batchId,
  batchInputFingerprint: batch.batchInputFingerprint,
  bundleFingerprint: bundle.bundleFingerprint,
  bookDigest: bundle.bookModelDigest,
  provider: 'OpenAI',
  model: 'Codex',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: bundle.promptFingerprint,
  criteriaFingerprint: bundle.criteriaFingerprint,
  generationParametersFingerprint,
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts,
  startedAt: recordedAt,
  completedAt: recordedAt,
  status: 'completed',
  outputDigest: digest(recordsBytes),
  toolchainVersion: 'skillpilot-goal-description-review-v2',
}
const resultsDirectory = join(here, 'results')
const recordsPath = join(resultsDirectory, `${batch.batchId}.records.jsonl`)
const runPath = join(resultsDirectory, `${batch.batchId}.run.json`)
if (existsSync(recordsPath) || existsSync(runPath)) {
  throw new Error('Round A result already exists; historical artifacts must not be overwritten')
}
mkdirSync(resultsDirectory, { recursive: true })
writeFileSync(recordsPath, recordsBytes)
writeFileSync(runPath, JSON.stringify(run, null, 2) + '\n')
console.log(`Materialized ${records.length} candidate records; output ${run.outputDigest}`)
