import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { GoalBookReviewBundleManifest } from './exportGoalBookReviewBundle'
import type { GoalEvidenceAiRunManifest } from './validateGoalEvidenceFindings'
import {
  validateGoalDescriptionReviewBatch,
  validateGoalDescriptionReviewCampaign,
  type GoalDescriptionReviewCampaign,
  type GoalDescriptionReviewInput,
  type GoalDescriptionReviewRecord,
} from './validateGoalDescriptionReviewCampaign'

export type GoalDescriptionReviewCampaignResultPair = {
  batchId: string
  run: GoalEvidenceAiRunManifest
  batchInputBytes: Buffer
  recordsBytes: Buffer
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
  return [...duplicates]
}

export const validateGoalDescriptionReviewCampaignResults = async ({
  bundle,
  input,
  campaign,
  resultPairs,
}: {
  bundle: GoalBookReviewBundleManifest
  input: GoalDescriptionReviewInput
  campaign: GoalDescriptionReviewCampaign
  resultPairs: GoalDescriptionReviewCampaignResultPair[]
}) => {
  const campaignResult = await validateGoalDescriptionReviewCampaign({ bundle, input, campaign })
  const errors = [...campaignResult.errors]
  const expectedBatchIds = campaign.batches.map(({ batchId }) => batchId)
  const actualBatchIds = resultPairs.map(({ batchId }) => batchId)
  const expectedBatchIdSet = new Set(expectedBatchIds)

  duplicateValues(actualBatchIds).forEach((batchId) => {
    errors.push(`Duplicate result pair for campaign batch ${batchId}`)
  })
  actualBatchIds.forEach((batchId) => {
    if (!expectedBatchIdSet.has(batchId)) errors.push(`Extra result pair for unknown campaign batch ${batchId}`)
  })
  expectedBatchIds.forEach((batchId) => {
    if (!actualBatchIds.includes(batchId)) errors.push(`Missing result pair for campaign batch ${batchId}`)
  })
  if (!sameOrderedValues(actualBatchIds, expectedBatchIds)) {
    errors.push('Campaign result pairs must occur exactly once in deterministic campaign batch order')
  }

  const firstPairByBatchId = new Map<string, GoalDescriptionReviewCampaignResultPair>()
  resultPairs.forEach((pair) => {
    if (!firstPairByBatchId.has(pair.batchId)) firstPairByBatchId.set(pair.batchId, pair)
  })
  const records: GoalDescriptionReviewRecord[] = []
  const runIds: string[] = []
  for (const batch of campaign.batches) {
    const pair = firstPairByBatchId.get(batch.batchId)
    if (!pair) continue
    if (pair.run.batchId !== pair.batchId) {
      errors.push(`Result pair ${pair.batchId} contains run for batch ${pair.run.batchId ?? '(missing)'}`)
    }
    runIds.push(pair.run.runId)
    try {
      const batchResult = await validateGoalDescriptionReviewBatch({
        bundle,
        input,
        campaign,
        run: pair.run,
        batchInputBytes: pair.batchInputBytes,
        recordsBytes: pair.recordsBytes,
      })
      batchResult.errors.forEach((error) => errors.push(`${batch.batchId}: ${error}`))
      records.push(...batchResult.records)
    } catch (error) {
      errors.push(
        `${batch.batchId}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  duplicateValues(runIds).forEach((runId) => {
    errors.push(`Duplicate runId across campaign result pairs: ${runId}`)
  })
  duplicateValues(records.map(({ recordId }) => recordId)).forEach((recordId) => {
    errors.push(`Duplicate recordId across campaign result pairs: ${recordId}`)
  })
  duplicateValues(records.map(({ goalId }) => goalId)).forEach((goalId) => {
    errors.push(`Duplicate goalId across campaign description records: ${goalId}`)
  })

  const expectedGoalIds = input.goals.map(({ goalId }) => goalId)
  const actualGoalIds = records.map(({ goalId }) => goalId)
  if (records.length !== campaign.goalCount) {
    errors.push(
      `Campaign records must contain exactly ${campaign.goalCount} records; found ${records.length}`,
    )
  }
  if (!sameOrderedValues(actualGoalIds, expectedGoalIds)) {
    errors.push('Campaign records must cover every input goal exactly once and in deterministic campaign order')
  }

  return { errors, records }
}

const expectedDirectoryFiles = (campaign: GoalDescriptionReviewCampaign) => ({
  batchFiles: campaign.batches.map(({ batchId }) => `${batchId}.input.jsonl`),
  resultFiles: campaign.batches.flatMap(({ batchId }) => [
    `${batchId}.run.json`,
    `${batchId}.records.jsonl`,
  ]),
})

const inspectDirectory = async (
  directory: string,
  expectedNames: readonly string[],
  label: string,
) => {
  const entries = await readdir(directory, { withFileTypes: true })
  const actualNames = entries.map(({ name }) => name).sort()
  const expectedNameSet = new Set(expectedNames)
  const actualNameSet = new Set(actualNames)
  const errors: string[] = []
  actualNames.forEach((name) => {
    if (!expectedNameSet.has(name)) errors.push(`Extra ${label} artifact: ${name}`)
  })
  expectedNames.forEach((name) => {
    if (!actualNameSet.has(name)) errors.push(`Missing ${label} artifact: ${name}`)
  })
  entries.forEach((entry) => {
    if (expectedNameSet.has(entry.name) && !entry.isFile()) {
      errors.push(`${label} artifact is not a regular file: ${entry.name}`)
    }
  })
  return { errors, actualNameSet }
}

const parseJson = <T>(value: Buffer | string, label: string): T => {
  try {
    return JSON.parse(value.toString()) as T
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export const loadGoalDescriptionReviewCampaignResultDirectories = async ({
  campaign,
  batchesDirectory,
  resultsDirectory,
}: {
  campaign: GoalDescriptionReviewCampaign
  batchesDirectory: string
  resultsDirectory: string
}) => {
  const expected = expectedDirectoryFiles(campaign)
  const [batchInspection, resultInspection] = await Promise.all([
    inspectDirectory(batchesDirectory, expected.batchFiles, 'batch-input'),
    inspectDirectory(resultsDirectory, expected.resultFiles, 'campaign-result'),
  ])
  const errors = [...batchInspection.errors, ...resultInspection.errors]
  const resultPairs: GoalDescriptionReviewCampaignResultPair[] = []
  for (const batch of campaign.batches) {
    const batchFile = `${batch.batchId}.input.jsonl`
    const runFile = `${batch.batchId}.run.json`
    const recordsFile = `${batch.batchId}.records.jsonl`
    if (
      !batchInspection.actualNameSet.has(batchFile)
      || !resultInspection.actualNameSet.has(runFile)
      || !resultInspection.actualNameSet.has(recordsFile)
    ) continue
    try {
      const [batchInputBytes, runBytes, recordsBytes] = await Promise.all([
        readFile(resolve(batchesDirectory, batchFile)),
        readFile(resolve(resultsDirectory, runFile)),
        readFile(resolve(resultsDirectory, recordsFile)),
      ])
      resultPairs.push({
        batchId: batch.batchId,
        run: parseJson<GoalEvidenceAiRunManifest>(runBytes, runFile),
        batchInputBytes,
        recordsBytes,
      })
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
    }
  }
  return { errors, resultPairs }
}

export const validateGoalDescriptionReviewCampaignResultDirectories = async ({
  bundle,
  input,
  campaign,
  batchesDirectory,
  resultsDirectory,
}: {
  bundle: GoalBookReviewBundleManifest
  input: GoalDescriptionReviewInput
  campaign: GoalDescriptionReviewCampaign
  batchesDirectory: string
  resultsDirectory: string
}) => {
  const loaded = await loadGoalDescriptionReviewCampaignResultDirectories({
    campaign,
    batchesDirectory,
    resultsDirectory,
  })
  const validation = await validateGoalDescriptionReviewCampaignResults({
    bundle,
    input,
    campaign,
    resultPairs: loaded.resultPairs,
  })
  return { errors: [...loaded.errors, ...validation.errors], records: validation.records }
}

const parseArgs = (args: string[]) => {
  const values = new Map<string, string>()
  const allowed = new Set([
    '--bundle',
    '--input',
    '--campaign',
    '--batches-dir',
    '--results-dir',
  ])
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index]
    const value = args[index + 1]
    if (!allowed.has(key) || !value) {
      throw new Error('Usage: tsx scripts/validateGoalDescriptionReviewCampaignResults.ts --bundle <manifest.json> --input <input.json> --campaign <campaign.json> --batches-dir <batches> --results-dir <results>')
    }
    if (values.has(key)) throw new Error(`Duplicate option ${key}`)
    values.set(key, value)
  }
  allowed.forEach((key) => {
    if (!values.has(key)) throw new Error(`Missing ${key}`)
  })
  return {
    bundle: resolve(values.get('--bundle')!),
    input: resolve(values.get('--input')!),
    campaign: resolve(values.get('--campaign')!),
    batchesDirectory: resolve(values.get('--batches-dir')!),
    resultsDirectory: resolve(values.get('--results-dir')!),
  }
}

const main = async () => {
  const paths = parseArgs(process.argv.slice(2))
  const [bundleBytes, inputBytes, campaignBytes] = await Promise.all([
    readFile(paths.bundle),
    readFile(paths.input),
    readFile(paths.campaign),
  ])
  const result = await validateGoalDescriptionReviewCampaignResultDirectories({
    bundle: parseJson<GoalBookReviewBundleManifest>(bundleBytes, paths.bundle),
    input: parseJson<GoalDescriptionReviewInput>(inputBytes, paths.input),
    campaign: parseJson<GoalDescriptionReviewCampaign>(campaignBytes, paths.campaign),
    batchesDirectory: paths.batchesDirectory,
    resultsDirectory: paths.resultsDirectory,
  })
  if (result.errors.length > 0) {
    result.errors.forEach((error) => console.error(error))
    process.exitCode = 1
    return
  }
  console.log(`Goal-description review campaign results valid: ${result.records.length}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
