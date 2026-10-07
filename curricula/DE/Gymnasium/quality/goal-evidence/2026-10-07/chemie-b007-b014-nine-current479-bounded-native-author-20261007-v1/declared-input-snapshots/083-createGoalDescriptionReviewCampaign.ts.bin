import { createHash } from 'node:crypto'
import { access, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
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
  GOAL_DESCRIPTION_REVIEW_RECORD_SCHEMA_ARTIFACT_PATH,
  loadGoalDescriptionReviewRecordSchemaBytes,
  serializeGoalDescriptionReviewBatchInput,
  validateGoalDescriptionReviewCampaign,
  validateGoalBookReviewBundleManifestBindings,
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

type ReviewBundleArtifactRole = GoalBookReviewBundleManifest['artifacts'][number]['role']
type VerifiedReviewBundleArtifactBytes = ReadonlyMap<ReviewBundleArtifactRole, Buffer>

const CAMPAIGN_GUIDANCE_ARTIFACT_ROLES = ['review_prompt', 'review_criteria'] as const
const CAMPAIGN_RESERVED_FILES = [
  'review-bundle-manifest.json',
  'description-review-input.json',
  'description-review-campaign.json',
] as const
const CAMPAIGN_RESERVED_DIRECTORIES = ['batches', 'contracts'] as const

const isSameOrDescendantPath = (candidatePath: string, parentPath: string) => (
  candidatePath === parentPath || candidatePath.startsWith(`${parentPath}${sep}`)
)

const campaignGuidanceArtifactPlans = ({
  bundle,
  campaignDirectory,
  verifiedArtifactBytes,
}: {
  bundle: GoalBookReviewBundleManifest
  campaignDirectory: string
  verifiedArtifactBytes: VerifiedReviewBundleArtifactBytes
}) => {
  const manifestErrors = validateGoalBookReviewBundleManifestBindings(bundle)
  if (manifestErrors.length > 0) {
    throw new Error(`Invalid review-bundle provenance: ${manifestErrors.join(' | ')}`)
  }
  const resolvedCampaignDirectory = resolve(campaignDirectory)
  const reservedPaths = [
    ...CAMPAIGN_RESERVED_FILES,
    ...CAMPAIGN_RESERVED_DIRECTORIES,
  ].map((reservedPath) => resolve(resolvedCampaignDirectory, reservedPath))
  const plans = CAMPAIGN_GUIDANCE_ARTIFACT_ROLES.map((role) => {
    const artifact = bundle.artifacts.find((candidate) => candidate.role === role)
    if (!artifact) throw new Error(`Review bundle has no ${role} artifact`)
    const targetPath = resolve(resolvedCampaignDirectory, artifact.path)
    const relativePath = relative(resolvedCampaignDirectory, targetPath)
    if (
      relativePath === ''
      || relativePath === '..'
      || relativePath.startsWith(`..${sep}`)
    ) {
      throw new Error(`Review guidance artifact path escapes its campaign directory: ${artifact.path}`)
    }
    if (reservedPaths.some((reservedPath) => (
      isSameOrDescendantPath(targetPath, reservedPath)
      || isSameOrDescendantPath(reservedPath, targetPath)
    ))) {
      throw new Error(`Review guidance artifact path collides with a reserved campaign path: ${artifact.path}`)
    }
    const bytes = verifiedArtifactBytes.get(role)
    if (!bytes) throw new Error(`Verified review-bundle bytes are missing for ${role}`)
    if (bytes.length !== artifact.bytes || sha256(bytes) !== artifact.digest) {
      throw new Error(`Verified review-bundle bytes no longer match the ${role} artifact`)
    }
    return { artifact, bytes, targetPath }
  })
  for (let left = 0; left < plans.length; left += 1) {
    for (let right = left + 1; right < plans.length; right += 1) {
      if (
        isSameOrDescendantPath(plans[left].targetPath, plans[right].targetPath)
        || isSameOrDescendantPath(plans[right].targetPath, plans[left].targetPath)
      ) {
        throw new Error(
          `Review guidance artifact output paths collide: ${plans[left].artifact.path} and ${plans[right].artifact.path}`,
        )
      }
    }
  }
  return plans
}

export const verifyGoalBookReviewBundleArtifactBytes = async (
  bundle: GoalBookReviewBundleManifest,
  bundleDirectory: string,
) => {
  const manifestErrors = validateGoalBookReviewBundleManifestBindings(bundle)
  if (manifestErrors.length > 0) {
    throw new Error(`Invalid review-bundle provenance: ${manifestErrors.join(' | ')}`)
  }
  const resolvedBundleDirectory = resolve(bundleDirectory)
  const verifiedArtifacts = await Promise.all(bundle.artifacts.map(async (artifact) => {
    const artifactPath = resolve(resolvedBundleDirectory, artifact.path)
    const relativePath = relative(resolvedBundleDirectory, artifactPath)
    if (
      relativePath === ''
      || relativePath === '..'
      || relativePath.startsWith(`..${sep}`)
    ) {
      throw new Error(`Review-bundle artifact path escapes its bundle directory: ${artifact.path}`)
    }
    const bytes = await readFile(artifactPath)
    if (bytes.length !== artifact.bytes) {
      throw new Error(`Review-bundle artifact ${artifact.role} byte count does not match its manifest`)
    }
    if (sha256(bytes) !== artifact.digest) {
      throw new Error(`Review-bundle artifact ${artifact.role} bytes do not match its manifest digest`)
    }
    return [artifact.role, bytes] as const
  }))
  return new Map<ReviewBundleArtifactRole, Buffer>(verifiedArtifacts)
}

export const writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts = async ({
  bundle,
  campaignDirectory,
  verifiedArtifactBytes,
}: {
  bundle: GoalBookReviewBundleManifest
  campaignDirectory: string
  verifiedArtifactBytes: VerifiedReviewBundleArtifactBytes
}) => {
  const plans = campaignGuidanceArtifactPlans({
    bundle,
    campaignDirectory,
    verifiedArtifactBytes,
  })
  await Promise.all(plans.map(async ({ bytes, targetPath }) => {
    await mkdir(dirname(targetPath), { recursive: true })
    await writeFile(targetPath, bytes, { flag: 'wx' })
  }))
}

export const createGoalDescriptionReviewCampaignArtifacts = async ({
  bundleBytes,
  bookModelBytes,
  reviewInputBytes,
  bundleDirectory,
  outputDirectory,
  campaignOptions,
}: {
  bundleBytes: Buffer
  bookModelBytes: Buffer
  reviewInputBytes: Buffer
  bundleDirectory: string
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
  const verifiedArtifactBytes = await verifyGoalBookReviewBundleArtifactBytes(bundle, bundleDirectory)
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
  const recordSchemaBytes = await loadGoalDescriptionReviewRecordSchemaBytes()
  const recordSchemaDigest = sha256(recordSchemaBytes)
  const campaign = buildGoalDescriptionReviewCampaign({
    bundle,
    input,
    recordSchemaDigest,
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
    await mkdir(join(temporaryDirectory, 'contracts'))
    await writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts({
      bundle,
      campaignDirectory: temporaryDirectory,
      verifiedArtifactBytes,
    })
    await Promise.all([
      writeFile(join(temporaryDirectory, 'review-bundle-manifest.json'), bundleBytes),
      writeFile(join(temporaryDirectory, 'description-review-input.json'), `${JSON.stringify(input, null, 2)}\n`),
      writeFile(join(temporaryDirectory, 'description-review-campaign.json'), `${JSON.stringify(campaign, null, 2)}\n`),
      writeFile(
        join(temporaryDirectory, GOAL_DESCRIPTION_REVIEW_RECORD_SCHEMA_ARTIFACT_PATH),
        recordSchemaBytes,
      ),
      ...campaign.batches.map((batch) => {
        const offset = (batch.ordinal - 1) * campaign.batchSize
        const goals = input.goals.slice(offset, offset + batch.goalIds.length)
        return writeFile(
          join(temporaryDirectory, 'batches', `${batch.batchId}.input.jsonl`),
          serializeGoalDescriptionReviewBatchInput({
            bundleFingerprint: bundle.bundleFingerprint,
            bookDigest: bundle.bookModelDigest,
            reviewInputFingerprint: input.reviewInputFingerprint,
            inputSchemaVersion: input.schemaVersion,
            recordSchemaDigest: campaign.recordSchemaDigest,
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
    bundleDirectory: dirname(options.bundlePath),
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
