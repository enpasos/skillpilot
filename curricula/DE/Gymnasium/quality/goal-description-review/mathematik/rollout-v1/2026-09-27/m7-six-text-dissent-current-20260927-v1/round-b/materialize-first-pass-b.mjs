#!/usr/bin/env node
// Materialize independently authored decisions with exact bound input fields.
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const root = process.cwd()
const base = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/m7-six-text-dissent-current-20260927-v1/'
const round = `${base}round-b/`
const readJson = (relative) => JSON.parse(readFileSync(resolve(root, relative), 'utf8'))
const digest = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`

const bundle = readJson(`${base}bundle/manifest.json`)
const input = readJson(`${round}description-review-input.json`)
const campaign = readJson(`${round}description-review-campaign.json`)
const authored = readJson(`${round}first-pass-b.decisions.json`)
const batch = campaign.batches[0]
const runId = 'math-m7-six-text-20260927-independent-review-b'
if (campaign.batches.length !== 1 || input.goals.length !== 6 || authored.decisions.length !== 6) {
  throw new Error('Expected exactly one six-goal round-B batch')
}
const decisionsById = new Map(authored.decisions.map((decision) => [decision.goalId, decision]))
if (decisionsById.size !== 6) throw new Error('Duplicate authored goal decision')
const records = input.goals.map((goal) => {
  const decision = decisionsById.get(goal.goalId)
  if (!decision) throw new Error(`Missing independently authored decision for ${goal.goalId}`)
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${runId}-${goal.goalId}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: input.bundleFingerprint,
    bookDigest: input.bookDigest,
    goalId: goal.goalId,
    goalFingerprint: goal.goalFingerprint,
    pageFingerprint: goal.pageFingerprint,
    currentTitleDe: goal.currentTitleDe,
    currentTitleEn: goal.currentTitleEn,
    currentDescriptionDe: goal.currentDescriptionDe,
    currentDescriptionEn: goal.currentDescriptionEn,
    decision: decision.decision,
    understandingEvidence: decision.understandingEvidence,
    rationale: decision.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: decision.evidenceProfileRecommendation,
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  }
})
if (records.some((record, index) => record.goalId !== batch.goalIds[index])) {
  throw new Error('Round-B records do not preserve batch order')
}
const outputBytes = Buffer.from(`${records.map((record) => JSON.stringify(record)).join('\n')}\n`)
const outputPath = resolve(root, `${round}results/${batch.batchId}.records.jsonl`)
const boundArtifact = (role) => {
  const artifact = bundle.artifacts.find((entry) => entry.role === role)
  if (!artifact) throw new Error(`Missing bound artifact ${role}`)
  return { role, digest: artifact.digest }
}
const manifest = {
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
  model: 'Codex model not exposed to reviewer',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: digest('Codex generation parameters not exposed to reviewer'),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: [...batch.goalIds],
  inputArtifacts: [
    boundArtifact('book_pdf'),
    boundArtifact('review_input_json'),
    boundArtifact('review_prompt'),
    boundArtifact('review_criteria'),
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
  ],
  startedAt: '2026-09-27T01:01:03.000Z',
  completedAt: '2026-09-27T01:03:39.000Z',
  status: 'completed',
  outputDigest: digest(outputBytes),
  toolchainVersion: 'codex-goal-description-review-20260927',
}
const runPath = resolve(root, `${round}results/${batch.batchId}.run.json`)
const runBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`)
if (process.argv.slice(2).join(' ') === '--write') {
  mkdirSync(dirname(runPath), { recursive: true })
  writeFileSync(outputPath, outputBytes, { flag: 'wx' })
  writeFileSync(runPath, runBytes, { flag: 'wx' })
  console.log(`Wrote ${outputPath} and ${runPath}`)
} else if (process.argv.length === 2) {
  if (!readFileSync(outputPath).equals(outputBytes) || !readFileSync(runPath).equals(runBytes)) {
    throw new Error('Materialized round-B bytes differ from authored decisions and exact bound input')
  }
  console.log(`Verified ${outputPath} and ${runPath}`)
} else {
  throw new Error('Usage: node materialize-first-pass-b.mjs [--write]')
}
