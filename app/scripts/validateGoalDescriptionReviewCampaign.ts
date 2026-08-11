import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import type {
  GoalBookReviewBundleManifest,
  GoalBookReviewInput,
} from './exportGoalBookReviewBundle'
import { stableGoalBookJson } from './goalBookModel'
import {
  validateGoalReviewRunBindings,
  type GoalEvidenceAiRunManifest,
} from './validateGoalEvidenceFindings'

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const BUNDLE_SCHEMA_PATH = 'contracts/goal-book/v1/goal-book-review-bundle.schema.json'
const RUN_SCHEMA_PATH = 'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json'
const INPUT_SCHEMA_PATH = 'contracts/goal-description-review/v1/goal-description-review-input.schema.json'
const CAMPAIGN_SCHEMA_PATH = 'contracts/goal-description-review/v1/goal-description-review-campaign.schema.json'
const RECORD_SCHEMA_PATH = 'contracts/goal-description-review/v1/goal-description-review-record.schema.json'

export type GoalDescriptionReviewInputGoal = {
  goalId: string
  goalFingerprint: string
  pageFingerprint: string
  currentTitleDe: string
  currentTitleEn: string
  currentDescriptionDe: string
  currentDescriptionEn: string
}

export type GoalDescriptionReviewInput = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-input.schema.json'
  schemaVersion: 1
  bundleFingerprint: string
  bookDigest: string
  goalCount: number
  goals: GoalDescriptionReviewInputGoal[]
  reviewInputFingerprint: string
}

export type GoalDescriptionReviewCampaignBatch = {
  batchId: string
  ordinal: number
  batchInputFingerprint: string
  goalIds: string[]
}

export type GoalDescriptionReviewCampaign = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-campaign.schema.json'
  schemaVersion: 1
  campaignId: string
  roundId: string
  bundleFingerprint: string
  bookDigest: string
  reviewInputFingerprint: string
  promptFingerprint: string
  criteriaFingerprint: string
  reviewerRole: 'internal_ai_reviewer' | 'external_ai_reviewer' | 'human_reviewer' | 'synthesizer'
  reviewPass: 'first_pass' | 'follow_up' | 'synthesis'
  independenceGroupId: string
  blindToOtherReviews: boolean
  batchSize: number
  goalCount: number
  batches: GoalDescriptionReviewCampaignBatch[]
  reviewPolicy: {
    humanApprovalRequired: true
    aiRecordsAreCandidatesOnly: true
  }
}

export type GoalDescriptionReviewRecord = {
  recordId: string
  runId: string
  campaignId: string
  roundId: string
  bundleFingerprint: string
  bookDigest: string
  goalId: string
  goalFingerprint: string
  pageFingerprint: string
  currentTitleDe: string
  currentTitleEn: string
  currentDescriptionDe: string
  currentDescriptionEn: string
  decision: 'keep' | 'revise' | 'split_review' | 'block'
  proposedDescriptionDe?: string
  proposedDescriptionEn?: string
  understandingEvidence: {
    essentialUnderstandingDe: string
    essentialUnderstandingEn: string
    observablePerformanceDe: string
    observablePerformanceEn: string
    transferExpectationDe: string
    transferExpectationEn: string
  }
  rationale: string
  evidenceProfileContract: 'positive-understanding-evidence-v2'
  evidenceProfileRecommendation: 'none' | 'create' | 'revise'
  recordStatus: 'candidate' | 'accepted' | 'rejected'
  reviewAuthority: 'ai_candidate' | 'human'
}

const repositoryPath = (configuredPath: string) => {
  const absolutePath = resolve(REPOSITORY_ROOT, configuredPath)
  const relativePath = relative(REPOSITORY_ROOT, absolutePath)
  if (relativePath === '..' || relativePath.startsWith(`..${sep}`) || relativePath === '') {
    throw new Error(`Contract path escapes the repository: ${configuredPath}`)
  }
  return absolutePath
}

const sha256 = (value: Buffer | string) => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

const stableDigest = (value: unknown) => sha256(stableGoalBookJson(value))

const parseJson = <T>(value: Buffer | string, label: string): T => {
  try {
    return JSON.parse(value.toString()) as T
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const parseJsonl = (value: Buffer, label: string) => value.toString('utf8')
  .split(/\r?\n/u)
  .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
  .filter(({ line }) => line !== '')
  .map(({ line, lineNumber }) => parseJson<GoalDescriptionReviewRecord>(line, `${label}:${lineNumber}`))

const sameOrderedValues = (left: readonly string[], right: readonly string[]) => (
  left.length === right.length && left.every((value, index) => value === right[index])
)

const reviewInputPayload = (
  input: Omit<GoalDescriptionReviewInput, 'reviewInputFingerprint'>,
) => ({
  schemaVersion: input.schemaVersion,
  bundleFingerprint: input.bundleFingerprint,
  bookDigest: input.bookDigest,
  goalCount: input.goalCount,
  goals: input.goals,
})

export const fingerprintGoalDescriptionReviewInput = (
  input: Omit<GoalDescriptionReviewInput, 'reviewInputFingerprint'>,
) => stableDigest(reviewInputPayload(input))

export const buildGoalDescriptionReviewInput = ({
  bundle,
  reviewInput,
  landscape,
}: {
  bundle: GoalBookReviewBundleManifest
  reviewInput: GoalBookReviewInput
  landscape: unknown
}): GoalDescriptionReviewInput => {
  const landscapeGoals = (landscape as { goals?: unknown }).goals
  if (!Array.isArray(landscapeGoals)) throw new Error('Canonical landscape goals must be an array')
  const canonicalGoalById = new Map(landscapeGoals.map((candidate) => {
    const goal = candidate as Record<string, unknown>
    if (typeof goal.id !== 'string') throw new Error('Canonical landscape goal is missing its id')
    return [goal.id, goal]
  }))
  if (reviewInput.modelDigest !== bundle.bookModelDigest) {
    throw new Error('Review input modelDigest does not match the review bundle')
  }
  const reviewPageById = new Map(reviewInput.pages.map(({ page }) => [page.goalId, page]))
  const goals = bundle.goals.map((bundleGoal) => {
    const page = reviewPageById.get(bundleGoal.goalId)
    const canonicalGoal = canonicalGoalById.get(bundleGoal.goalId)
    if (!page || !canonicalGoal) {
      throw new Error(`Cannot build bilingual description input for ${bundleGoal.goalId}`)
    }
    const currentTitleDe = String(canonicalGoal.title ?? '')
    const currentTitleEn = String(canonicalGoal.titleEn ?? '')
    const currentDescriptionDe = String(canonicalGoal.description ?? '')
    const currentDescriptionEn = String(canonicalGoal.descriptionEn ?? '')
    if (!currentTitleDe || !currentTitleEn || !currentDescriptionDe || !currentDescriptionEn) {
      throw new Error(`Canonical goal ${bundleGoal.goalId} is missing DE/EN title or description text`)
    }
    if (page.title !== currentTitleDe || page.description !== currentDescriptionDe) {
      throw new Error(`Canonical goal ${bundleGoal.goalId} disagrees with the bound GoalBook page text`)
    }
    if (
      page.goalFingerprint !== bundleGoal.goalFingerprint
      || page.pageFingerprint !== bundleGoal.pageFingerprint
    ) {
      throw new Error(`GoalBook page ${bundleGoal.goalId} disagrees with the bundle fingerprints`)
    }
    return {
      goalId: bundleGoal.goalId,
      goalFingerprint: bundleGoal.goalFingerprint,
      pageFingerprint: bundleGoal.pageFingerprint,
      currentTitleDe,
      currentTitleEn,
      currentDescriptionDe,
      currentDescriptionEn,
    }
  })
  const withoutFingerprint = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-input.schema.json' as const,
    schemaVersion: 1 as const,
    bundleFingerprint: bundle.bundleFingerprint,
    bookDigest: bundle.bookModelDigest,
    goalCount: goals.length,
    goals,
  }
  return {
    ...withoutFingerprint,
    reviewInputFingerprint: fingerprintGoalDescriptionReviewInput(withoutFingerprint),
  }
}

const batchInputPayload = ({
  bundleFingerprint,
  bookDigest,
  reviewInputFingerprint,
  batchId,
  goalIds,
  goals,
}: {
  bundleFingerprint: string
  bookDigest: string
  reviewInputFingerprint: string
  batchId: string
  goalIds: readonly string[]
  goals: readonly GoalDescriptionReviewInputGoal[]
}) => ({
  schemaVersion: 1,
  bundleFingerprint,
  bookDigest,
  reviewInputFingerprint,
  batchId,
  goalIds,
  goals,
})

export const serializeGoalDescriptionReviewBatchInput = (
  values: Parameters<typeof batchInputPayload>[0],
) => {
  const payload = batchInputPayload(values)
  return Buffer.from(`${payload.goals.map((goal, index) => stableGoalBookJson({
    schemaVersion: payload.schemaVersion,
    bundleFingerprint: payload.bundleFingerprint,
    bookDigest: payload.bookDigest,
    reviewInputFingerprint: payload.reviewInputFingerprint,
    batchId: payload.batchId,
    ordinal: index + 1,
    goal,
  })).join('\n')}\n`)
}

export const fingerprintGoalDescriptionReviewBatchInput = (
  values: Parameters<typeof batchInputPayload>[0],
) => sha256(serializeGoalDescriptionReviewBatchInput(values))

export const goalDescriptionReviewBatchId = (roundId: string, ordinal: number) => (
  `${roundId}.batch-${String(ordinal).padStart(3, '0')}`
)

export const buildGoalDescriptionReviewCampaign = ({
  bundle,
  input,
  campaignId,
  roundId,
  reviewerRole,
  reviewPass,
  independenceGroupId,
  blindToOtherReviews,
  batchSize = 20,
}: {
  bundle: GoalBookReviewBundleManifest
  input: GoalDescriptionReviewInput
  campaignId: string
  roundId: string
  reviewerRole: GoalDescriptionReviewCampaign['reviewerRole']
  reviewPass: GoalDescriptionReviewCampaign['reviewPass']
  independenceGroupId: string
  blindToOtherReviews: boolean
  batchSize?: number
}): GoalDescriptionReviewCampaign => {
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 20) {
    throw new Error('Description-review campaign batchSize must be an integer from 1 to 20')
  }
  const batches: GoalDescriptionReviewCampaignBatch[] = []
  for (let offset = 0; offset < input.goals.length; offset += batchSize) {
    const ordinal = batches.length + 1
    const goals = input.goals.slice(offset, offset + batchSize)
    const batchId = goalDescriptionReviewBatchId(roundId, ordinal)
    const goalIds = goals.map(({ goalId }) => goalId)
    batches.push({
      batchId,
      ordinal,
      goalIds,
      batchInputFingerprint: fingerprintGoalDescriptionReviewBatchInput({
        bundleFingerprint: bundle.bundleFingerprint,
        bookDigest: bundle.bookModelDigest,
        reviewInputFingerprint: input.reviewInputFingerprint,
        batchId,
        goalIds,
        goals,
      }),
    })
  }
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-campaign.schema.json',
    schemaVersion: 1,
    campaignId,
    roundId,
    bundleFingerprint: bundle.bundleFingerprint,
    bookDigest: bundle.bookModelDigest,
    reviewInputFingerprint: input.reviewInputFingerprint,
    promptFingerprint: bundle.promptFingerprint,
    criteriaFingerprint: bundle.criteriaFingerprint,
    reviewerRole,
    reviewPass,
    independenceGroupId,
    blindToOtherReviews,
    batchSize,
    goalCount: input.goals.length,
    batches,
    reviewPolicy: {
      humanApprovalRequired: true,
      aiRecordsAreCandidatesOnly: true,
    },
  }
}

const loadValidators = async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  addFormats(ajv)
  const schemas = await Promise.all([
    BUNDLE_SCHEMA_PATH,
    RUN_SCHEMA_PATH,
    INPUT_SCHEMA_PATH,
    CAMPAIGN_SCHEMA_PATH,
    RECORD_SCHEMA_PATH,
  ].map((path) => readFile(repositoryPath(path), 'utf8').then((value) => JSON.parse(value))))
  return {
    ajv,
    validateBundle: ajv.compile(schemas[0]),
    validateRun: ajv.compile(schemas[1]),
    validateInput: ajv.compile(schemas[2]),
    validateCampaign: ajv.compile(schemas[3]),
    validateRecord: ajv.compile(schemas[4]),
  }
}

const validateReviewInputBindings = ({
  bundle,
  input,
}: {
  bundle: GoalBookReviewBundleManifest
  input: GoalDescriptionReviewInput
}) => {
  const errors: string[] = []
  if (input.bundleFingerprint !== bundle.bundleFingerprint) {
    errors.push('Description-review input bundleFingerprint does not match the review bundle')
  }
  if (input.bookDigest !== bundle.bookModelDigest) {
    errors.push('Description-review input bookDigest does not match the review bundle')
  }
  if (input.goalCount !== input.goals.length || input.goalCount !== bundle.goals.length) {
    errors.push('Description-review input goalCount must match both its goals and the review bundle')
  }
  if (!sameOrderedValues(
    input.goals.map(({ goalId }) => goalId),
    bundle.goals.map(({ goalId }) => goalId),
  )) {
    errors.push('Description-review input goals must match all review-bundle goals exactly and in order')
  }
  const bundleGoalById = new Map(bundle.goals.map((goal) => [goal.goalId, goal]))
  input.goals.forEach((goal) => {
    const bundleGoal = bundleGoalById.get(goal.goalId)
    if (!bundleGoal) return
    if (
      goal.goalFingerprint !== bundleGoal.goalFingerprint
      || goal.pageFingerprint !== bundleGoal.pageFingerprint
    ) {
      errors.push(`Description-review input ${goal.goalId} cites stale or foreign goal/page fingerprints`)
    }
  })
  const expectedFingerprint = fingerprintGoalDescriptionReviewInput({
    $schema: input.$schema,
    schemaVersion: input.schemaVersion,
    bundleFingerprint: input.bundleFingerprint,
    bookDigest: input.bookDigest,
    goalCount: input.goalCount,
    goals: input.goals,
  })
  if (input.reviewInputFingerprint !== expectedFingerprint) {
    errors.push('Description-review input reviewInputFingerprint does not match its bilingual goal bytes')
  }
  return errors
}

export const validateGoalDescriptionReviewCampaign = async ({
  bundle,
  input,
  campaign,
}: {
  bundle: GoalBookReviewBundleManifest
  input: GoalDescriptionReviewInput
  campaign: GoalDescriptionReviewCampaign
}) => {
  const { ajv, validateBundle, validateInput, validateCampaign } = await loadValidators()
  const errors: string[] = []
  if (!validateBundle(bundle)) errors.push(`Bundle: ${ajv.errorsText(validateBundle.errors)}`)
  if (!validateInput(input)) errors.push(`Input: ${ajv.errorsText(validateInput.errors)}`)
  if (!validateCampaign(campaign)) errors.push(`Campaign: ${ajv.errorsText(validateCampaign.errors)}`)
  if (errors.length > 0) return { errors }

  errors.push(...validateReviewInputBindings({ bundle, input }))
  if (campaign.bundleFingerprint !== bundle.bundleFingerprint) {
    errors.push('Campaign bundleFingerprint does not match the review bundle')
  }
  if (campaign.bookDigest !== bundle.bookModelDigest) {
    errors.push('Campaign bookDigest does not match the review bundle')
  }
  if (campaign.reviewInputFingerprint !== input.reviewInputFingerprint) {
    errors.push('Campaign reviewInputFingerprint does not match the bilingual review input')
  }
  if (campaign.promptFingerprint !== bundle.promptFingerprint) {
    errors.push('Campaign promptFingerprint does not match the review bundle')
  }
  if (campaign.criteriaFingerprint !== bundle.criteriaFingerprint) {
    errors.push('Campaign criteriaFingerprint does not match the review bundle')
  }
  if (campaign.goalCount !== bundle.goals.length) {
    errors.push('Campaign goalCount must cover every review-bundle goal')
  }
  const expectedBatchCount = Math.ceil(input.goals.length / campaign.batchSize)
  if (campaign.batches.length !== expectedBatchCount) {
    errors.push(`Campaign must contain exactly ${expectedBatchCount} deterministic batches`)
  }
  campaign.batches.forEach((batch, index) => {
    const ordinal = index + 1
    const expectedBatchId = goalDescriptionReviewBatchId(campaign.roundId, ordinal)
    const goals = input.goals.slice(index * campaign.batchSize, (index + 1) * campaign.batchSize)
    const goalIds = goals.map(({ goalId }) => goalId)
    if (batch.ordinal !== ordinal) errors.push(`Campaign batch ${batch.batchId} has a non-deterministic ordinal`)
    if (batch.batchId !== expectedBatchId) {
      errors.push(`Campaign batch ${ordinal} must use deterministic batchId ${expectedBatchId}`)
    }
    if (!sameOrderedValues(batch.goalIds, goalIds)) {
      errors.push(`Campaign batch ${batch.batchId} does not contain the exact ordered goal slice`)
    }
    const expectedFingerprint = fingerprintGoalDescriptionReviewBatchInput({
      bundleFingerprint: bundle.bundleFingerprint,
      bookDigest: bundle.bookModelDigest,
      reviewInputFingerprint: input.reviewInputFingerprint,
      batchId: batch.batchId,
      goalIds,
      goals,
    })
    if (batch.batchInputFingerprint !== expectedFingerprint) {
      errors.push(`Campaign batch ${batch.batchId} has a stale or foreign batchInputFingerprint`)
    }
  })
  if (
    campaign.reviewerRole === 'external_ai_reviewer'
    && campaign.reviewPass === 'first_pass'
    && campaign.blindToOtherReviews !== true
  ) {
    errors.push('External first-pass campaigns must be blind to other reviews')
  }
  return { errors }
}

export const validateGoalDescriptionReviewBatch = async ({
  bundle,
  input,
  campaign,
  run,
  batchInputBytes,
  recordsBytes,
}: {
  bundle: GoalBookReviewBundleManifest
  input: GoalDescriptionReviewInput
  campaign: GoalDescriptionReviewCampaign
  run: GoalEvidenceAiRunManifest
  batchInputBytes: Buffer
  recordsBytes: Buffer
}) => {
  const campaignResult = await validateGoalDescriptionReviewCampaign({ bundle, input, campaign })
  const { ajv, validateRun, validateRecord } = await loadValidators()
  const errors = [...campaignResult.errors]
  if (!validateRun(run)) errors.push(`Run: ${ajv.errorsText(validateRun.errors)}`)
  const records = parseJsonl(recordsBytes, 'description-records.jsonl')
  records.forEach((record, index) => {
    if (!validateRecord(record)) {
      errors.push(`Record ${index + 1}: ${ajv.errorsText(validateRecord.errors)}`)
    }
  })
  if (errors.length > 0) return { errors, records }

  const batch = campaign.batches.find(({ batchId }) => batchId === run.batchId)
  if (!batch) {
    errors.push(`Run batchId ${run.batchId ?? '(missing)'} is absent from the campaign`)
    return { errors, records }
  }
  errors.push(...validateGoalReviewRunBindings({
    bundle,
    run,
    expectedGoalIds: batch.goalIds,
    expectedBatchInputFingerprint: batch.batchInputFingerprint,
  }))
  if (run.campaignId !== campaign.campaignId) errors.push('Run campaignId does not match the campaign')
  if (run.roundId !== campaign.roundId) errors.push('Run roundId does not match the campaign')
  if (run.independenceGroupId !== campaign.independenceGroupId) {
    errors.push('Run independenceGroupId does not match the campaign')
  }
  if (run.batchInputFingerprint !== batch.batchInputFingerprint) {
    errors.push('Run batchInputFingerprint does not match the campaign batch')
  }
  if (sha256(batchInputBytes) !== batch.batchInputFingerprint) {
    errors.push('Batch-input bytes do not match the campaign batchInputFingerprint')
  }
  if (campaign.reviewerRole !== 'synthesizer' && run.blindToOtherRuns !== true) {
    errors.push('Independent campaign runs must be blind to other runs')
  }
  if (run.outputDigest !== sha256(recordsBytes)) {
    errors.push('Run outputDigest does not match description-records.jsonl bytes')
  }

  const inputGoalById = new Map(input.goals.map((goal) => [goal.goalId, goal]))
  if (!sameOrderedValues(records.map(({ goalId }) => goalId), run.goalIds)) {
    errors.push('Description records must contain exactly one record per run goal and preserve batch order')
  }
  const recordIds = new Set<string>()
  records.forEach((record) => {
    if (recordIds.has(record.recordId)) errors.push(`Duplicate description recordId ${record.recordId}`)
    recordIds.add(record.recordId)
    const source = inputGoalById.get(record.goalId)
    if (!source) {
      errors.push(`Description record ${record.recordId} cites a goal outside the bilingual input`)
      return
    }
    if (record.runId !== run.runId) errors.push(`Description record ${record.recordId} cites a different runId`)
    if (record.campaignId !== campaign.campaignId) {
      errors.push(`Description record ${record.recordId} cites a different campaignId`)
    }
    if (record.roundId !== campaign.roundId) {
      errors.push(`Description record ${record.recordId} cites a different roundId`)
    }
    if (
      record.bundleFingerprint !== bundle.bundleFingerprint
      || record.bookDigest !== bundle.bookModelDigest
      || record.goalFingerprint !== source.goalFingerprint
      || record.pageFingerprint !== source.pageFingerprint
    ) {
      errors.push(`Description record ${record.recordId} cites stale or foreign bundle/goal/page fingerprints`)
    }
    if (
      record.currentTitleDe !== source.currentTitleDe
      || record.currentTitleEn !== source.currentTitleEn
      || record.currentDescriptionDe !== source.currentDescriptionDe
      || record.currentDescriptionEn !== source.currentDescriptionEn
    ) {
      errors.push(`Description record ${record.recordId} does not preserve the bound current bilingual text`)
    }
    if (record.decision === 'revise') {
      if (record.proposedDescriptionDe === record.currentDescriptionDe) {
        errors.push(`Description record ${record.recordId} has a no-op German revision`)
      }
      if (record.proposedDescriptionEn === record.currentDescriptionEn) {
        errors.push(`Description record ${record.recordId} has a no-op English revision`)
      }
    }
    if (record.recordStatus !== 'candidate' || record.reviewAuthority !== 'ai_candidate') {
      errors.push(`AI description record ${record.recordId} must remain candidate/ai_candidate`)
    }
  })
  return { errors, records }
}

const parseArgs = (args: string[]) => {
  const values = new Map<string, string>()
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index]
    const value = args[index + 1]
    if (!['--bundle', '--input', '--campaign', '--run', '--batch-input', '--records'].includes(key) || !value) {
      throw new Error('Usage: tsx scripts/validateGoalDescriptionReviewCampaign.ts --bundle <manifest.json> --input <input.json> --campaign <campaign.json> --run <run.json> --batch-input <batch.input.jsonl> --records <records.jsonl>')
    }
    if (values.has(key)) throw new Error(`Duplicate option ${key}`)
    values.set(key, value)
  }
  const required = ['--bundle', '--input', '--campaign', '--run', '--batch-input', '--records'] as const
  required.forEach((key) => {
    if (!values.has(key)) throw new Error(`Missing ${key}`)
  })
  return {
    bundle: resolve(values.get('--bundle')!),
    input: resolve(values.get('--input')!),
    campaign: resolve(values.get('--campaign')!),
    run: resolve(values.get('--run')!),
    batchInput: resolve(values.get('--batch-input')!),
    records: resolve(values.get('--records')!),
  }
}

const main = async () => {
  const paths = parseArgs(process.argv.slice(2))
  const [bundleBytes, inputBytes, campaignBytes, runBytes, batchInputBytes, recordsBytes] = await Promise.all([
    readFile(paths.bundle),
    readFile(paths.input),
    readFile(paths.campaign),
    readFile(paths.run),
    readFile(paths.batchInput),
    readFile(paths.records),
  ])
  const result = await validateGoalDescriptionReviewBatch({
    bundle: parseJson<GoalBookReviewBundleManifest>(bundleBytes, paths.bundle),
    input: parseJson<GoalDescriptionReviewInput>(inputBytes, paths.input),
    campaign: parseJson<GoalDescriptionReviewCampaign>(campaignBytes, paths.campaign),
    run: parseJson<GoalEvidenceAiRunManifest>(runBytes, paths.run),
    batchInputBytes,
    recordsBytes,
  })
  if (result.errors.length > 0) {
    result.errors.forEach((error) => console.error(error))
    process.exitCode = 1
    return
  }
  console.log(`Goal-description review batch valid: ${result.records.length}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
