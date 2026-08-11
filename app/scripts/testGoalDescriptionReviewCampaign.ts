import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { GoalBookReviewBundleManifest } from './exportGoalBookReviewBundle'
import { createGoalDescriptionReviewCampaignArtifacts } from './createGoalDescriptionReviewCampaign'
import {
  buildGoalDescriptionReviewCampaign,
  fingerprintGoalDescriptionReviewInput,
  serializeGoalDescriptionReviewBatchInput,
  validateGoalDescriptionReviewBatch,
  validateGoalDescriptionReviewCampaign,
  type GoalDescriptionReviewInput,
  type GoalDescriptionReviewRecord,
} from './validateGoalDescriptionReviewCampaign'

const digest = (character: string) => `sha256:${character.repeat(64)}`
const sha256 = (value: Buffer) => `sha256:${createHash('sha256').update(value).digest('hex')}`

const bundleGoals = Array.from({ length: 25 }, (_, index) => ({
  goalId: `goal-${String(index + 1).padStart(2, '0')}`,
  pageNumber: index + 1,
  goalFingerprint: digest(((index + 1) % 10).toString()),
  pageFingerprint: digest(((index + 2) % 10).toString()),
  evidenceReview: null,
}))

const promptFingerprint = digest('a')
const criteriaFingerprint = digest('b')
const bookDigest = digest('c')
const bundleFingerprint = digest('d')
const bundle: GoalBookReviewBundleManifest = {
  $schema: 'https://skillpilot.com/schemas/goal-book/v1/goal-book-review-bundle.schema.json',
  schemaVersion: 1,
  bundleFingerprint,
  bookModelDigest: bookDigest,
  bookModelSchemaVersion: '1.0.0',
  bookId: 'fixture-description-review-book',
  bookEdition: 'curricular-atomic-v1',
  publicationMode: 'review',
  feedbackBaseUrl: 'https://skillpilot.example/goal-feedback',
  locale: 'de-DE',
  selectedGoalCount: bundleGoals.length,
  goals: bundleGoals,
  promptFingerprint,
  criteriaFingerprint,
  artifacts: [
    ['book_pdf', digest('e')],
    ['book_pdf_render_manifest', digest('f')],
    ['book_model', bookDigest],
    ['review_input_json', digest('1')],
    ['review_input_jsonl', digest('2')],
    ['review_markdown', digest('3')],
    ['review_prompt', promptFingerprint],
    ['review_criteria', criteriaFingerprint],
    ['finding_schema', digest('4')],
    ['run_manifest_schema', digest('5')],
  ].map(([role, artifactDigest], index) => ({
    role: role as GoalBookReviewBundleManifest['artifacts'][number]['role'],
    path: `artifact-${index}.json`,
    digest: artifactDigest,
    bytes: 1,
  })),
  reviewPolicy: {
    blindIndependentFirstPass: true,
    modelVotesGrantReleaseAuthority: false,
    humanApprovalRequired: true,
    learnerDataAllowed: false,
  },
}

const inputWithoutFingerprint = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-input.schema.json' as const,
  schemaVersion: 1 as const,
  bundleFingerprint,
  bookDigest,
  goalCount: bundleGoals.length,
  goals: bundleGoals.map((goal) => ({
    goalId: goal.goalId,
    goalFingerprint: goal.goalFingerprint,
    pageFingerprint: goal.pageFingerprint,
    currentTitleDe: `Titel ${goal.goalId}`,
    currentTitleEn: `Title ${goal.goalId}`,
    currentDescriptionDe: `Die lernende Person kann ${goal.goalId} erklären und auf einen veränderten Fall übertragen.`,
    currentDescriptionEn: `The learner can explain ${goal.goalId} and transfer it to a changed case.`,
  })),
}
const input: GoalDescriptionReviewInput = {
  ...inputWithoutFingerprint,
  reviewInputFingerprint: fingerprintGoalDescriptionReviewInput(inputWithoutFingerprint),
}

const campaign = buildGoalDescriptionReviewCampaign({
  bundle,
  input,
  campaignId: 'math-description-round-one',
  roundId: 'math-description-round-one-codex',
  reviewerRole: 'external_ai_reviewer',
  reviewPass: 'first_pass',
  independenceGroupId: 'math-description-blind-a',
  blindToOtherReviews: true,
  batchSize: 20,
})
assert.equal(campaign.batches.length, 2)
assert.equal(campaign.batches[0].goalIds.length, 20)
assert.equal(campaign.batches[1].goalIds.length, 5)
assert.equal(campaign.batches[0].batchId, 'math-description-round-one-codex.batch-001')
assert.deepEqual(
  (await validateGoalDescriptionReviewCampaign({ bundle, input, campaign })).errors,
  [],
)

const nonBlindCampaign = {
  ...campaign,
  blindToOtherReviews: false,
}
assert.match(
  (await validateGoalDescriptionReviewCampaign({ bundle, input, campaign: nonBlindCampaign })).errors.join('\n'),
  /blindToOtherReviews|blind to other reviews/u,
)

const staleBatchCampaign = {
  ...campaign,
  batches: campaign.batches.map((batch, index) => index === 0
    ? { ...batch, batchInputFingerprint: digest('9') }
    : batch),
}
assert.match(
  (await validateGoalDescriptionReviewCampaign({ bundle, input, campaign: staleBatchCampaign })).errors.join('\n'),
  /batchInputFingerprint/u,
)

const batch = campaign.batches[0]
const batchInputBytes = serializeGoalDescriptionReviewBatchInput({
  bundleFingerprint,
  bookDigest,
  reviewInputFingerprint: input.reviewInputFingerprint,
  batchId: batch.batchId,
  goalIds: batch.goalIds,
  goals: input.goals.slice(0, batch.goalIds.length),
})
const makeRecord = (goalId: string, index: number): GoalDescriptionReviewRecord => {
  const source = input.goals.find((goal) => goal.goalId === goalId)!
  const revise = index === 0
  return {
    recordId: `record-${String(index + 1).padStart(2, '0')}`,
    runId: 'description-run-001',
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint,
    bookDigest,
    goalId,
    goalFingerprint: source.goalFingerprint,
    pageFingerprint: source.pageFingerprint,
    currentTitleDe: source.currentTitleDe,
    currentTitleEn: source.currentTitleEn,
    currentDescriptionDe: source.currentDescriptionDe,
    currentDescriptionEn: source.currentDescriptionEn,
    decision: revise ? 'revise' : 'keep',
    ...(revise ? {
      proposedDescriptionDe: `${source.currentDescriptionDe} Die Begründung bezieht sich auf die wesentlichen fachlichen Zusammenhänge.`,
      proposedDescriptionEn: `${source.currentDescriptionEn} The justification addresses the essential subject-specific relationships.`,
    } : {}),
    understandingEvidence: {
      essentialUnderstandingDe: `Die lernende Person erklärt den fachlichen Zusammenhang von ${goalId} in eigenen Worten.`,
      essentialUnderstandingEn: `The learner explains the subject-specific relationship of ${goalId} in their own words.`,
      observablePerformanceDe: `Die lernende Person begründet eine passende Lösung zu ${goalId} nachvollziehbar.`,
      observablePerformanceEn: `The learner gives a traceable justification for a suitable solution to ${goalId}.`,
      transferExpectationDe: `Die lernende Person wendet das Verständnis von ${goalId} auf eine veränderte Situation an.`,
      transferExpectationEn: `The learner applies their understanding of ${goalId} to a changed situation.`,
    },
    rationale: revise
      ? 'The proposed wording makes the subject-specific justification and transfer expectation explicit.'
      : 'The current wording already states observable explanation and transfer expectations.',
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: revise ? 'create' : 'none',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  }
}
const records = batch.goalIds.map(makeRecord)
const recordsBytes = Buffer.from(`${records.map((record) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
})).join('\n')}\n`)
const run = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  schemaVersion: 1,
  runId: 'description-run-001',
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  batchId: batch.batchId,
  batchInputFingerprint: batch.batchInputFingerprint,
  bundleFingerprint,
  bookDigest,
  provider: 'Example external provider',
  model: 'Example reviewer model',
  role: 'didactic_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-v2',
  promptFingerprint,
  criteriaFingerprint,
  generationParametersFingerprint: digest('6'),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    { role: 'review_input_jsonl', digest: digest('2') },
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
    { role: 'review_prompt', digest: promptFingerprint },
    { role: 'review_criteria', digest: criteriaFingerprint },
  ],
  startedAt: '2026-08-11T06:00:00.000Z',
  completedAt: '2026-08-11T06:02:00.000Z',
  status: 'completed',
  outputDigest: sha256(recordsBytes),
  toolchainVersion: 'goal-description-review-v1',
}

const validBatch = await validateGoalDescriptionReviewBatch({
  bundle,
  input,
  campaign,
  run,
  batchInputBytes,
  recordsBytes,
})
assert.deepEqual(validBatch.errors, [])
assert.equal(validBatch.records.length, 20)

assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: { ...run, independenceGroupId: 'foreign-independent-group' },
    batchInputBytes,
    recordsBytes,
  })).errors.join('\n'),
  /independenceGroupId does not match the campaign/u,
)

assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run,
    batchInputBytes: Buffer.concat([batchInputBytes, Buffer.from('tampered')]),
    recordsBytes,
  })).errors.join('\n'),
  /Batch-input bytes do not match the campaign batchInputFingerprint/u,
)

assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: {
      ...run,
      inputArtifacts: run.inputArtifacts.filter(({ role }) => role !== 'description_review_batch_input_jsonl'),
    },
    batchInputBytes,
    recordsBytes,
  })).errors.join('\n'),
  /must include the bound description_review_batch_input_jsonl/u,
)

assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: {
      ...run,
      inputArtifacts: run.inputArtifacts.map((artifact) => (
        artifact.role === 'description_review_batch_input_jsonl'
          ? { ...artifact, digest: digest('9') }
          : artifact
      )),
    },
    batchInputBytes,
    recordsBytes,
  })).errors.join('\n'),
  /description_review_batch_input_jsonl digest does not match the campaign batch/u,
)

const staleEvidenceContractBytes = Buffer.from(`${records.map((record, index) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
  ...(index === 0 ? { evidenceProfileContract: 'positive-understanding-evidence-v1' } : {}),
})).join('\n')}\n`)
assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: { ...run, outputDigest: sha256(staleEvidenceContractBytes) },
    batchInputBytes,
    recordsBytes: staleEvidenceContractBytes,
  })).errors.join('\n'),
  /evidenceProfileContract|positive-understanding-evidence-v2/u,
)

const unexpectedRecordFieldBytes = Buffer.from(`${records.map((record, index) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
  ...(index === 0 ? { unexpectedField: 'not allowed' } : {}),
})).join('\n')}\n`)
assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: { ...run, outputDigest: sha256(unexpectedRecordFieldBytes) },
    batchInputBytes,
    recordsBytes: unexpectedRecordFieldBytes,
  })).errors.join('\n'),
  /unexpectedField|additional properties/u,
)

const incompleteUnderstandingEvidenceBytes = Buffer.from(`${records.map((record, index) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
  ...(index === 0 ? {
    understandingEvidence: {
      essentialUnderstandingDe: record.understandingEvidence.essentialUnderstandingDe,
      essentialUnderstandingEn: record.understandingEvidence.essentialUnderstandingEn,
      observablePerformanceDe: record.understandingEvidence.observablePerformanceDe,
      observablePerformanceEn: record.understandingEvidence.observablePerformanceEn,
      transferExpectationDe: record.understandingEvidence.transferExpectationDe,
    },
  } : {}),
})).join('\n')}\n`)
assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: { ...run, outputDigest: sha256(incompleteUnderstandingEvidenceBytes) },
    batchInputBytes,
    recordsBytes: incompleteUnderstandingEvidenceBytes,
  })).errors.join('\n'),
  /transferExpectationEn|required property/u,
)

const missingRecordBytes = Buffer.from(`${records.slice(0, -1).map((record) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
})).join('\n')}\n`)
assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: { ...run, outputDigest: sha256(missingRecordBytes) },
    batchInputBytes,
    recordsBytes: missingRecordBytes,
  })).errors.join('\n'),
  /exactly one record per run goal/u,
)

const foreignCurrentTextBytes = Buffer.from(`${records.map((record, index) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
  ...(index === 0 ? { currentTitleEn: 'Foreign title' } : {}),
})).join('\n')}\n`)
assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: { ...run, outputDigest: sha256(foreignCurrentTextBytes) },
    batchInputBytes,
    recordsBytes: foreignCurrentTextBytes,
  })).errors.join('\n'),
  /bound current bilingual text/u,
)

assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: { ...run, promptFingerprint: digest('7') },
    batchInputBytes,
    recordsBytes,
  })).errors.join('\n'),
  /promptFingerprint/u,
)

const keepWithProposalBytes = Buffer.from(`${records.map((record, index) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
  ...(index === 1 ? { proposedDescriptionDe: 'Unzulässiger Vorschlag.' } : {}),
})).join('\n')}\n`)
assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: { ...run, outputDigest: sha256(keepWithProposalBytes) },
    batchInputBytes,
    recordsBytes: keepWithProposalBytes,
  })).errors.join('\n'),
  /Record 2/u,
)

const noOpEnglishRevisionBytes = Buffer.from(`${records.map((record, index) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
  ...(index === 0 ? { proposedDescriptionEn: record.currentDescriptionEn } : {}),
})).join('\n')}\n`)
assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: { ...run, outputDigest: sha256(noOpEnglishRevisionBytes) },
    batchInputBytes,
    recordsBytes: noOpEnglishRevisionBytes,
  })).errors.join('\n'),
  /no-op English revision/u,
)

const existingOutputParent = await mkdtemp(join(tmpdir(), 'goal-description-review-existing-'))
try {
  await assert.rejects(
    () => createGoalDescriptionReviewCampaignArtifacts({
      bundleBytes: Buffer.from('{}'),
      bookModelBytes: Buffer.from('{}'),
      reviewInputBytes: Buffer.from('{}'),
      outputDirectory: existingOutputParent,
      campaignOptions: {
        campaignId: campaign.campaignId,
        roundId: campaign.roundId,
        reviewerRole: campaign.reviewerRole,
        reviewPass: campaign.reviewPass,
        independenceGroupId: campaign.independenceGroupId,
        blindToOtherReviews: campaign.blindToOtherReviews,
        batchSize: campaign.batchSize,
      },
    }),
    /Campaign output directory already exists/u,
  )
} finally {
  await rm(existingOutputParent, { force: true, recursive: true })
}

console.log('Goal-description review campaign tests passed.')
