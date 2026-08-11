import { createHash } from 'node:crypto'
import { access, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type {
  GoalBookReviewBundleManifest,
  GoalBookReviewInput,
} from './exportGoalBookReviewBundle'
import {
  parseAndValidateGoalBookModel,
  stableGoalBookJson,
} from './goalBookModel'
import {
  buildGoalDescriptionReviewCampaign,
  buildGoalDescriptionReviewInput,
  serializeGoalDescriptionReviewBatchInput,
  validateGoalDescriptionReviewCampaign,
  type GoalDescriptionReviewCampaign,
} from './validateGoalDescriptionReviewCampaign'

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const sha256 = (value: Buffer | string) => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

const parseJson = <T>(value: Buffer | string, label: string): T => {
  try {
    return JSON.parse(value.toString()) as T
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const artifactDigest = (
  bundle: GoalBookReviewBundleManifest,
  role: GoalBookReviewBundleManifest['artifacts'][number]['role'],
) => bundle.artifacts.find((artifact) => artifact.role === role)?.digest
  ?? (() => { throw new Error(`Review bundle has no ${role} artifact`) })()

export const createGoalDescriptionReviewCampaignArtifacts = async ({
  bundleBytes,
  bookModelBytes,
  reviewInputBytes,
  outputDirectory,
  campaignOptions,
}: {
  bundleBytes: Buffer
  bookModelBytes: Buffer
  reviewInputBytes: Buffer
  outputDirectory: string
  campaignOptions: {
    campaignId: string
    roundId: string
    reviewerRole: GoalDescriptionReviewCampaign['reviewerRole']
    reviewPass: GoalDescriptionReviewCampaign['reviewPass']
    independenceGroupId: string
    blindToOtherReviews: boolean
    batchSize: number
  }
}) => {
  try {
    await access(outputDirectory)
    throw new Error(`Campaign output directory already exists: ${outputDirectory}`)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Campaign output directory already exists:')) {
      throw error
    }
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
      throw error
    }
  }
  const bundle = parseJson<GoalBookReviewBundleManifest>(bundleBytes, 'review-bundle manifest')
  if (sha256(bookModelBytes) !== artifactDigest(bundle, 'book_model')) {
    throw new Error('BookModel bytes do not match the review-bundle book_model artifact')
  }
  if (sha256(reviewInputBytes) !== artifactDigest(bundle, 'review_input_json')) {
    throw new Error('Review-input bytes do not match the review-bundle review_input_json artifact')
  }
  const model = parseAndValidateGoalBookModel(parseJson<unknown>(bookModelBytes, 'BookModel'))
  if (model.digest !== bundle.bookModelDigest) {
    throw new Error('BookModel digest does not match the review bundle')
  }
  const landscapePath = resolve(REPOSITORY_ROOT, model.source.landscapePath)
  const landscape = parseJson<unknown>(await readFile(landscapePath), model.source.landscapePath)
  if (sha256(stableGoalBookJson(landscape)) !== model.source.landscapeDigest) {
    throw new Error('Canonical landscape no longer matches the BookModel source digest')
  }
  const reviewInput = parseJson<GoalBookReviewInput>(reviewInputBytes, 'review input')
  const input = buildGoalDescriptionReviewInput({ bundle, reviewInput, landscape })
  const campaign = buildGoalDescriptionReviewCampaign({
    bundle,
    input,
    ...campaignOptions,
  })
  const result = await validateGoalDescriptionReviewCampaign({ bundle, input, campaign })
  if (result.errors.length > 0) {
    throw new Error(`Generated description-review campaign is invalid: ${result.errors.join(' | ')}`)
  }

  await mkdir(dirname(outputDirectory), { recursive: true })
  const temporaryDirectory = await mkdtemp(join(dirname(outputDirectory), '.goal-description-review-campaign-'))
  try {
    await mkdir(join(temporaryDirectory, 'batches'))
    await Promise.all([
      writeFile(join(temporaryDirectory, 'review-bundle-manifest.json'), bundleBytes),
      writeFile(join(temporaryDirectory, 'description-review-input.json'), `${JSON.stringify(input, null, 2)}\n`),
      writeFile(join(temporaryDirectory, 'description-review-campaign.json'), `${JSON.stringify(campaign, null, 2)}\n`),
      ...campaign.batches.map((batch) => {
        const offset = (batch.ordinal - 1) * campaign.batchSize
        const goals = input.goals.slice(offset, offset + batch.goalIds.length)
        return writeFile(
          join(temporaryDirectory, 'batches', `${batch.batchId}.input.jsonl`),
          serializeGoalDescriptionReviewBatchInput({
            bundleFingerprint: bundle.bundleFingerprint,
            bookDigest: bundle.bookModelDigest,
            reviewInputFingerprint: input.reviewInputFingerprint,
            batchId: batch.batchId,
            goalIds: batch.goalIds,
            goals,
          }),
        )
      }),
    ])
    await rename(temporaryDirectory, outputDirectory)
  } catch (error) {
    await rm(temporaryDirectory, { force: true, recursive: true })
    throw error
  }
  return { bundle, input, campaign }
}

const parseBoolean = (value: string, label: string) => {
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error(`${label} must be true or false`)
}

const parseArgs = (args: string[]) => {
  const values = new Map<string, string>()
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index]
    const value = args[index + 1]
    if (!key?.startsWith('--') || !value) throw new Error('Campaign options must be --key value pairs')
    if (values.has(key)) throw new Error(`Duplicate option ${key}`)
    values.set(key, value)
  }
  const required = [
    '--bundle',
    '--book-model',
    '--review-input',
    '--output-dir',
    '--campaign-id',
    '--round-id',
    '--reviewer-role',
    '--review-pass',
    '--independence-group-id',
    '--blind-to-other-reviews',
  ] as const
  required.forEach((key) => {
    if (!values.has(key)) throw new Error(`Missing ${key}`)
  })
  const batchSize = Number(values.get('--batch-size') ?? '20')
  const reviewerRole = values.get('--reviewer-role') as GoalDescriptionReviewCampaign['reviewerRole']
  const reviewPass = values.get('--review-pass') as GoalDescriptionReviewCampaign['reviewPass']
  return {
    bundlePath: resolve(values.get('--bundle')!),
    bookModelPath: resolve(values.get('--book-model')!),
    reviewInputPath: resolve(values.get('--review-input')!),
    outputDirectory: resolve(values.get('--output-dir')!),
    campaignOptions: {
      campaignId: values.get('--campaign-id')!,
      roundId: values.get('--round-id')!,
      reviewerRole,
      reviewPass,
      independenceGroupId: values.get('--independence-group-id')!,
      blindToOtherReviews: parseBoolean(
        values.get('--blind-to-other-reviews')!,
        '--blind-to-other-reviews',
      ),
      batchSize,
    },
  }
}

const main = async () => {
  const options = parseArgs(process.argv.slice(2))
  const [bundleBytes, bookModelBytes, reviewInputBytes] = await Promise.all([
    readFile(options.bundlePath),
    readFile(options.bookModelPath),
    readFile(options.reviewInputPath),
  ])
  const result = await createGoalDescriptionReviewCampaignArtifacts({
    bundleBytes,
    bookModelBytes,
    reviewInputBytes,
    outputDirectory: options.outputDirectory,
    campaignOptions: options.campaignOptions,
  })
  console.log(
    `Goal-description campaign created: ${result.campaign.goalCount} goals in ${result.campaign.batches.length} batches`,
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
