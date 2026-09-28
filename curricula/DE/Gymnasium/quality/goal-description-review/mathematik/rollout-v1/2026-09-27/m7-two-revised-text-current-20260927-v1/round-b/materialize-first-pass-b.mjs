#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const root = process.cwd()
const base = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/m7-two-revised-text-current-20260927-v1/'
const b = `${base}round-b/`
const read = (relative) => readFileSync(resolve(root, relative))
const json = (relative) => JSON.parse(read(relative).toString('utf8'))
const sha = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`

const bundle = json(`${base}bundle/manifest.json`)
const input = json(`${b}description-review-input.json`)
const campaign = json(`${b}description-review-campaign.json`)
const decisions = json(`${b}decisions.json`)
const disclosureBytes = read(`${b}runtime-disclosure.json`)
const disclosure = JSON.parse(disclosureBytes.toString('utf8'))
const batch = campaign.batches[0]
if (campaign.batches.length !== 1 || input.goals.length !== 2 || decisions.goals.length !== 2 || !batch) {
  throw new Error('Expected exactly one two-goal B batch')
}
if (sha(read(`${b}batches/${batch.batchId}.input.jsonl`)) !== batch.batchInputFingerprint) {
  throw new Error('Bound B batch-input bytes changed')
}
if (bundle.bundleFingerprint !== campaign.bundleFingerprint || bundle.bookModelDigest !== campaign.bookDigest) {
  throw new Error('Bundle/campaign identity mismatch')
}
const runId = 'codex-math-two-revised-current-20260927-b-01'
const records = decisions.goals.map((decision, index) => {
  const goal = input.goals[index]
  if (decision.goalId !== goal.goalId || goal.goalId !== batch.goalIds[index]) {
    throw new Error(`B decision order differs from bound input at index ${index}`)
  }
  const record = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${runId}-${index + 1}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: bundle.bundleFingerprint,
    bookDigest: bundle.bookModelDigest,
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
  if (decision.decision === 'revise') {
    record.proposedDescriptionDe = decision.proposedDescriptionDe
    record.proposedDescriptionEn = decision.proposedDescriptionEn
  }
  return record
})
const recordsBytes = Buffer.from(`${records.map((record) => JSON.stringify(record)).join('\n')}\n`)
const artifact = (role) => {
  const matches = bundle.artifacts.filter((item) => item.role === role)
  if (matches.length !== 1) throw new Error(`Expected exactly one ${role} artifact`)
  return { role, digest: matches[0].digest }
}
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
  startedAt: '2026-09-27T01:46:00.000Z',
  completedAt: '2026-09-27T01:53:41.000Z',
  status: 'completed',
  outputDigest: sha(recordsBytes),
  toolchainVersion: 'codex-math-d-v2',
}
const resultDir = resolve(root, `${b}results`)
const recordsPath = resolve(resultDir, `${batch.batchId}.records.jsonl`)
const runPath = resolve(resultDir, `${batch.batchId}.run.json`)
const runBytes = Buffer.from(`${JSON.stringify(run, null, 2)}\n`)
const mode = process.argv.slice(2).join(' ')
if (mode === '--write') {
  mkdirSync(dirname(recordsPath), { recursive: true })
  if (existsSync(recordsPath) || existsSync(runPath)) throw new Error('B result already exists; refusing overwrite')
  writeFileSync(recordsPath, recordsBytes, { flag: 'wx' })
  writeFileSync(runPath, runBytes, { flag: 'wx' })
  console.log(`Wrote ${recordsPath} and ${runPath}`)
} else if (mode === '') {
  if (!readFileSync(recordsPath).equals(recordsBytes) || !readFileSync(runPath).equals(runBytes)) {
    throw new Error('B result differs from bound decisions/runtime disclosure')
  }
  console.log(`Verified B result ${batch.batchId}`)
} else {
  throw new Error('Usage: node materialize-first-pass-b.mjs [--write]')
}
