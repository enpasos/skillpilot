import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { GoalBookReviewBundleManifest } from './exportGoalBookReviewBundle'
import { stableGoalBookJson } from './goalBookModel'
import type { GoalEvidenceAiRunManifest } from './validateGoalEvidenceFindings'
import type {
  GoalDescriptionReviewCampaign,
  GoalDescriptionReviewInput,
  GoalDescriptionReviewRecord,
} from './validateGoalDescriptionReviewCampaign'
import {
  loadGoalDescriptionReviewCampaignResultDirectories,
  validateGoalDescriptionReviewCampaignResults,
  type GoalDescriptionReviewCampaignResultPair,
} from './validateGoalDescriptionReviewCampaignResults'

export type GoalDescriptionDualRoundDiversityPolicy =
  | 'report_only'
  | 'require_distinct_provider_or_model'

export type GoalDescriptionReviewRoundArtifacts = {
  bundle: GoalBookReviewBundleManifest
  input: GoalDescriptionReviewInput
  campaign: GoalDescriptionReviewCampaign
  resultPairs: GoalDescriptionReviewCampaignResultPair[]
}

type RoundSummary = {
  campaignId: string
  roundId: string
  independenceGroupId: string
  runIds: string[]
  providers: string[]
  modelIdentities: string[]
}

type GoalComparison = {
  goalId: string
  firstRecordId: string | null
  secondRecordId: string | null
  firstRunId: string | null
  secondRunId: string | null
  firstDecision: GoalDescriptionReviewRecord['decision'] | null
  secondDecision: GoalDescriptionReviewRecord['decision'] | null
  agreement: 'exact_agreement' | 'disagreement' | 'unavailable'
  disagreementFields: string[]
  requiresSynthesis: boolean
  automaticAcceptance: false
}

export type GoalDescriptionDualRoundSummary = {
  schemaVersion: 1
  validationContract: 'goal-description-dual-round-v1'
  automaticAcceptance: false
  bundleFingerprint: string
  reviewInputFingerprint: string
  goalCount: number
  rounds: {
    first: RoundSummary
    second: RoundSummary
  }
  diversity: {
    policy: GoalDescriptionDualRoundDiversityPolicy
    sharedProviders: string[]
    sharedModelIdentities: string[]
    distinctProviderOrModel: boolean
    policySatisfied: boolean
  }
  counts: {
    exactAgreement: number
    disagreement: number
    unavailable: number
    requiresSynthesis: number
  }
  goals: GoalComparison[]
}

const sameOrderedValues = (left: readonly string[], right: readonly string[]) => (
  left.length === right.length && left.every((value, index) => value === right[index])
)

const duplicateValues = (values: readonly string[]) => {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  })
  return [...duplicates].sort()
}

const intersection = (left: readonly string[], right: readonly string[]) => {
  const rightValues = new Set(right)
  return [...new Set(left.filter((value) => rightValues.has(value)))].sort()
}

const modelIdentity = (run: GoalEvidenceAiRunManifest) => (
  `${run.provider}::${run.model}::${run.modelVersion ?? '(unspecified-version)'}`
)

const roundSummary = (
  campaign: GoalDescriptionReviewCampaign,
  resultPairs: GoalDescriptionReviewCampaignResultPair[],
): RoundSummary => ({
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  independenceGroupId: campaign.independenceGroupId,
  runIds: resultPairs.map(({ run }) => run.runId),
  providers: [...new Set(resultPairs.map(({ run }) => run.provider))].sort(),
  modelIdentities: [...new Set(resultPairs.map(({ run }) => modelIdentity(run)))].sort(),
})

const comparisonFields = (record: GoalDescriptionReviewRecord) => ({
  decision: record.decision,
  proposedDescriptionDe: record.proposedDescriptionDe ?? null,
  proposedDescriptionEn: record.proposedDescriptionEn ?? null,
  understandingEvidence: record.understandingEvidence,
  rationale: record.rationale,
  evidenceProfileRecommendation: record.evidenceProfileRecommendation,
})

const disagreementFields = (
  first: GoalDescriptionReviewRecord,
  second: GoalDescriptionReviewRecord,
) => {
  const firstFields = comparisonFields(first)
  const secondFields = comparisonFields(second)
  return Object.keys(firstFields).filter((field) => (
    stableGoalBookJson(firstFields[field as keyof typeof firstFields])
    !== stableGoalBookJson(secondFields[field as keyof typeof secondFields])
  ))
}

export const validateGoalDescriptionReviewDualRound = async ({
  first,
  second,
  diversityPolicy = 'report_only',
}: {
  first: GoalDescriptionReviewRoundArtifacts
  second: GoalDescriptionReviewRoundArtifacts
  diversityPolicy?: GoalDescriptionDualRoundDiversityPolicy
}) => {
  const [firstValidation, secondValidation] = await Promise.all([
    validateGoalDescriptionReviewCampaignResults(first),
    validateGoalDescriptionReviewCampaignResults(second),
  ])
  const errors = [
    ...firstValidation.errors.map((error) => `First round: ${error}`),
    ...secondValidation.errors.map((error) => `Second round: ${error}`),
  ]

  if (stableGoalBookJson(first.bundle) !== stableGoalBookJson(second.bundle)) {
    errors.push('Dual rounds must bind the identical complete review-bundle manifest')
  }
  if (stableGoalBookJson(first.input) !== stableGoalBookJson(second.input)) {
    errors.push('Dual rounds must bind the identical complete description-review input')
  }
  if (!sameOrderedValues(
    first.input.goals.map(({ goalId }) => goalId),
    second.input.goals.map(({ goalId }) => goalId),
  )) {
    errors.push('Dual rounds must cover identical goals in the same deterministic order')
  }
  if (first.campaign.campaignId === second.campaign.campaignId) {
    errors.push('Dual rounds must use different campaignId values')
  }
  if (first.campaign.roundId === second.campaign.roundId) {
    errors.push('Dual rounds must use different roundId values')
  }
  if (first.campaign.independenceGroupId === second.campaign.independenceGroupId) {
    errors.push('Dual rounds must use different independenceGroupId values')
  }
  const roundCampaigns: Array<[string, GoalDescriptionReviewCampaign]> = [
    ['First', first.campaign],
    ['Second', second.campaign],
  ]
  roundCampaigns.forEach(([label, campaign]) => {
    if (campaign.reviewPass !== 'first_pass') {
      errors.push(`${label} dual-review campaign must be a first_pass`)
    }
    if (campaign.reviewerRole === 'synthesizer') {
      errors.push(`${label} dual-review campaign must use an independent AI reviewer role`)
    }
    if (campaign.blindToOtherReviews !== true) {
      errors.push(`${label} dual-review campaign must be blind to other reviews`)
    }
  })

  const firstRound = roundSummary(first.campaign, first.resultPairs)
  const secondRound = roundSummary(second.campaign, second.resultPairs)
  const allRunIds = [...firstRound.runIds, ...secondRound.runIds]
  duplicateValues(allRunIds).forEach((runId) => {
    errors.push(`Dual rounds must use globally unique runIds; duplicate ${runId}`)
  })
  duplicateValues([
    ...firstValidation.records.map(({ recordId }) => recordId),
    ...secondValidation.records.map(({ recordId }) => recordId),
  ]).forEach((recordId) => {
    errors.push(`Dual rounds must use globally unique recordIds; duplicate ${recordId}`)
  })

  const sharedProviders = intersection(firstRound.providers, secondRound.providers)
  const sharedModelIdentities = intersection(
    firstRound.modelIdentities,
    secondRound.modelIdentities,
  )
  const distinctProviderOrModel = (
    sharedProviders.length === 0 || sharedModelIdentities.length === 0
  )
  const policySatisfied = (
    diversityPolicy === 'report_only' || distinctProviderOrModel
  )
  if (!policySatisfied) {
    errors.push(
      'Dual-round provider/model diversity policy requires disjoint providers or disjoint exact model identities',
    )
  }

  const firstRecordByGoal = new Map(firstValidation.records.map((record) => [record.goalId, record]))
  const secondRecordByGoal = new Map(secondValidation.records.map((record) => [record.goalId, record]))
  const goals = first.input.goals.map(({ goalId }): GoalComparison => {
    const firstRecord = firstRecordByGoal.get(goalId)
    const secondRecord = secondRecordByGoal.get(goalId)
    if (!firstRecord || !secondRecord) {
      return {
        goalId,
        firstRecordId: firstRecord?.recordId ?? null,
        secondRecordId: secondRecord?.recordId ?? null,
        firstRunId: firstRecord?.runId ?? null,
        secondRunId: secondRecord?.runId ?? null,
        firstDecision: firstRecord?.decision ?? null,
        secondDecision: secondRecord?.decision ?? null,
        agreement: 'unavailable',
        disagreementFields: ['missingReviewRecord'],
        requiresSynthesis: true,
        automaticAcceptance: false,
      }
    }
    const fields = disagreementFields(firstRecord, secondRecord)
    const exactAgreement = fields.length === 0
    const requiresSynthesis = (
      !exactAgreement
      || firstRecord.decision === 'split_review'
      || firstRecord.decision === 'block'
      || secondRecord.decision === 'split_review'
      || secondRecord.decision === 'block'
    )
    return {
      goalId,
      firstRecordId: firstRecord.recordId,
      secondRecordId: secondRecord.recordId,
      firstRunId: firstRecord.runId,
      secondRunId: secondRecord.runId,
      firstDecision: firstRecord.decision,
      secondDecision: secondRecord.decision,
      agreement: exactAgreement ? 'exact_agreement' : 'disagreement',
      disagreementFields: fields,
      requiresSynthesis,
      automaticAcceptance: false,
    }
  })
  const counts = {
    exactAgreement: goals.filter(({ agreement }) => agreement === 'exact_agreement').length,
    disagreement: goals.filter(({ agreement }) => agreement === 'disagreement').length,
    unavailable: goals.filter(({ agreement }) => agreement === 'unavailable').length,
    requiresSynthesis: goals.filter(({ requiresSynthesis }) => requiresSynthesis).length,
  }
  const summary: GoalDescriptionDualRoundSummary = {
    schemaVersion: 1,
    validationContract: 'goal-description-dual-round-v1',
    automaticAcceptance: false,
    bundleFingerprint: first.bundle.bundleFingerprint,
    reviewInputFingerprint: first.input.reviewInputFingerprint,
    goalCount: first.input.goals.length,
    rounds: { first: firstRound, second: secondRound },
    diversity: {
      policy: diversityPolicy,
      sharedProviders,
      sharedModelIdentities,
      distinctProviderOrModel,
      policySatisfied,
    },
    counts,
    goals,
  }
  return { errors, summary }
}

const parseJson = <T>(value: Buffer | string, label: string): T => {
  try {
    return JSON.parse(value.toString()) as T
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const parseArgs = (args: string[]) => {
  const values = new Map<string, string>()
  const roundSuffixes = [
    'bundle',
    'input',
    'campaign',
    'batches-dir',
    'results-dir',
  ] as const
  const required = (['first', 'second'] as const).flatMap((round) => (
    roundSuffixes.map((suffix) => `--${round}-${suffix}`)
  ))
  const allowed = new Set([...required, '--diversity-policy'])
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index]
    const value = args[index + 1]
    if (!allowed.has(key) || !value) {
      throw new Error(
        `Usage: tsx scripts/validateGoalDescriptionReviewDualRound.ts ${required.map((key) => `${key} <path>`).join(' ')} [--diversity-policy report_only|require_distinct_provider_or_model]`,
      )
    }
    if (values.has(key)) throw new Error(`Duplicate option ${key}`)
    values.set(key, value)
  }
  required.forEach((key) => {
    if (!values.has(key)) throw new Error(`Missing ${key}`)
  })
  const diversityPolicy = values.get('--diversity-policy') ?? 'report_only'
  if (!['report_only', 'require_distinct_provider_or_model'].includes(diversityPolicy)) {
    throw new Error(`Unsupported --diversity-policy ${diversityPolicy}`)
  }
  const paths = (round: 'first' | 'second') => ({
    bundle: resolve(values.get(`--${round}-bundle`)!),
    input: resolve(values.get(`--${round}-input`)!),
    campaign: resolve(values.get(`--${round}-campaign`)!),
    batchesDirectory: resolve(values.get(`--${round}-batches-dir`)!),
    resultsDirectory: resolve(values.get(`--${round}-results-dir`)!),
  })
  return {
    first: paths('first'),
    second: paths('second'),
    diversityPolicy: diversityPolicy as GoalDescriptionDualRoundDiversityPolicy,
  }
}

const loadRound = async (paths: ReturnType<typeof parseArgs>['first']) => {
  const [bundleBytes, inputBytes, campaignBytes] = await Promise.all([
    readFile(paths.bundle),
    readFile(paths.input),
    readFile(paths.campaign),
  ])
  const campaign = parseJson<GoalDescriptionReviewCampaign>(campaignBytes, paths.campaign)
  const loaded = await loadGoalDescriptionReviewCampaignResultDirectories({
    campaign,
    batchesDirectory: paths.batchesDirectory,
    resultsDirectory: paths.resultsDirectory,
  })
  return {
    errors: loaded.errors,
    artifacts: {
      bundle: parseJson<GoalBookReviewBundleManifest>(bundleBytes, paths.bundle),
      input: parseJson<GoalDescriptionReviewInput>(inputBytes, paths.input),
      campaign,
      resultPairs: loaded.resultPairs,
    },
  }
}

const main = async () => {
  const options = parseArgs(process.argv.slice(2))
  const [first, second] = await Promise.all([
    loadRound(options.first),
    loadRound(options.second),
  ])
  const result = await validateGoalDescriptionReviewDualRound({
    first: first.artifacts,
    second: second.artifacts,
    diversityPolicy: options.diversityPolicy,
  })
  console.log(`${JSON.stringify(result.summary, null, 2)}\n`)
  const errors = [
    ...first.errors.map((error) => `First round: ${error}`),
    ...second.errors.map((error) => `Second round: ${error}`),
    ...result.errors,
  ]
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error))
    process.exitCode = 1
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
