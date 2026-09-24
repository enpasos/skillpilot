import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../../../../../../../../../../..')
const batchRoot = resolve(here, '..')
const sha256 = (value) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'))
const readJsonl = async (path) => (await readFile(path, 'utf8'))
  .split(/\r?\n/u)
  .filter((line) => line.trim())
  .map((line) => JSON.parse(line))

const bundle = await readJson(resolve(batchRoot, 'bundle/manifest.json'))
const bundleRoot = resolve(batchRoot, 'bundle')
const commonArtifacts = bundle.artifacts
  .filter(({ role }) => [
    'book_pdf', 'book_model', 'review_input_json', 'review_input_jsonl',
    'review_markdown', 'review_prompt', 'review_criteria',
  ].includes(role))
  .map(({ role, digest }) => ({ role, digest }))

for (const round of [
  {
    name: 'round-a', model: 'gpt-5.6-sol', provider: 'openai',
    sessionId: '01a0d1fa-71cf-76b1-b420-6087e655ec4d',
    startedAt: '2026-09-24T05:54:06.421Z', completedAt: '2026-09-24T05:56:12.374Z',
    rawPath: resolve(here, 'round-a.raw.ndjson'),
  },
  {
    name: 'round-b', model: 'gpt-6-sol', provider: 'openai',
    sessionId: '01a0d1fc-c8c1-7ea1-85e2-27cea4e59e7a',
    startedAt: '2026-09-24T05:56:39.753Z', completedAt: '2026-09-24T05:58:25.198Z',
    rawPath: resolve(here, 'round-b.raw.ndjson'),
  },
]) {
  const roundRoot = resolve(batchRoot, round.name)
  const campaign = await readJson(resolve(roundRoot, 'description-review-campaign.json'))
  const batch = campaign.batches[0]
  const inputLines = await readJsonl(resolve(roundRoot, 'batches', `${batch.batchId}.input.jsonl`))
  const judgments = await readJsonl(round.rawPath)
  if (judgments.length !== inputLines.length || judgments.length !== campaign.goalCount) {
    throw new Error(`${round.name}: expected ${campaign.goalCount} judgments, found ${judgments.length}`)
  }
  if (judgments.some((item, index) => item.goalId !== inputLines[index].goal.goalId)) {
    throw new Error(`${round.name}: raw judgment order/IDs do not match batch input`)
  }

  const runId = `${campaign.roundId}.run-001`
  const records = judgments.map((judgment, index) => {
    const source = inputLines[index].goal
    const record = {
      $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
      schemaVersion: 1,
      recordId: `${runId}.goal-${index + 1}`,
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
      decision: judgment.decision,
    }
    if (judgment.decision === 'revise') {
      record.proposedDescriptionDe = judgment.proposedDescriptionDe
      record.proposedDescriptionEn = judgment.proposedDescriptionEn
    }
    record.understandingEvidence = {
      essentialUnderstandingDe: judgment.essentialUnderstandingDe,
      essentialUnderstandingEn: judgment.essentialUnderstandingEn,
      observablePerformanceDe: judgment.observablePerformanceDe,
      observablePerformanceEn: judgment.observablePerformanceEn,
      transferExpectationDe: judgment.transferExpectationDe,
      transferExpectationEn: judgment.transferExpectationEn,
    }
    record.rationale = judgment.rationale
    record.evidenceProfileContract = 'positive-understanding-evidence-v2'
    record.evidenceProfileRecommendation = source.reviewContext.evidenceProfile === null ? 'create' : 'revise'
    record.recordStatus = 'candidate'
    record.reviewAuthority = 'ai_candidate'
    return record
  })
  const recordsBytes = Buffer.from(`${records.map((record) => JSON.stringify(record)).join('\n')}\n`)
  const knownRunSettings = {
    codexCliVersion: '0.155.0-alpha.16.3',
    model: round.model,
    reasoningEffort: 'xhigh',
    sandbox: 'danger-full-access',
    approval: 'never',
    ephemeral: true,
    providerManagedSamplingParameters: 'not_exposed',
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
    provider: round.provider,
    model: round.model,
    role: 'subject_reviewer',
    promptFamilyId: 'goal-description-understanding-evidence-review-v2',
    promptFingerprint: campaign.promptFingerprint,
    criteriaFingerprint: campaign.criteriaFingerprint,
    generationParametersFingerprint: sha256(JSON.stringify(knownRunSettings)),
    independenceGroupId: campaign.independenceGroupId,
    blindToOtherRuns: true,
    goalIds: batch.goalIds,
    inputArtifacts: [
      ...commonArtifacts,
      { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
    ],
    startedAt: round.startedAt,
    completedAt: round.completedAt,
    status: 'completed',
    outputDigest: sha256(recordsBytes),
    toolchainVersion: 'codex-cli-0.155.0-alpha.16.3',
  }

  const resultsDirectory = resolve(roundRoot, 'results')
  await mkdir(resultsDirectory, { recursive: true })
  await writeFile(resolve(resultsDirectory, `${batch.batchId}.records.jsonl`), recordsBytes)
  await writeFile(resolve(resultsDirectory, `${batch.batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`)
  console.log(`${round.name}: records=${records.length}, model=${round.model}, session=${round.sessionId}, output=${run.outputDigest}`)
}
