import { createHash } from 'node:crypto'
import { access, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import {
  buildGoalBookReviewBundle,
  type GoalBookReviewBundleManifest,
} from './exportGoalBookReviewBundle'
import {
  GOAL_BOOK_EDITION,
  GOAL_BOOK_MODEL_SCHEMA_VERSION,
  loadGoalBookBuildInputs,
  parseAndValidateGoalBookModel,
  stableGoalBookJson,
  writeGoalBookModel,
  type GoalBookExternalReference,
  type GoalBookModel,
  type GoalBookPage,
} from './goalBookModel'
import {
  writeGoalBookHtml,
  writeGoalBookPdf,
  writeGoalBookRenderManifest,
  type GoalBookPrintDerivativeProfile,
} from './goalBookRenderer'
import {
  createGoalDescriptionReviewCampaignArtifacts,
  verifyGoalBookReviewBundleArtifactBytes,
} from './createGoalDescriptionReviewCampaign'
import {
  extractGoalDescriptionDualRoundResolutionSource,
  fingerprintGoalDescriptionReviewCampaign,
  validateGoalDescriptionDualRoundResolution,
  type GoalDescriptionDualRoundResolution,
} from './validateGoalDescriptionDualRoundResolution'
import {
  buildGoalDescriptionRolloutSynthesisRoundBinding,
  validateGoalDescriptionRolloutSynthesisDecisionManifestStructure,
  type GoalDescriptionRolloutSynthesisDecisionManifest,
} from './validateGoalDescriptionRolloutSynthesisDecisionManifest'
import {
  validateGoalDescriptionReviewCampaign,
  type GoalDescriptionReviewCampaign,
  type GoalDescriptionReviewInput,
} from './validateGoalDescriptionReviewCampaign'
import { loadGoalDescriptionReviewCampaignResultDirectories } from './validateGoalDescriptionReviewCampaignResults'
import {
  validateGoalDescriptionReviewDualRound,
  type GoalDescriptionReviewRoundArtifacts,
} from './validateGoalDescriptionReviewDualRound'
import {
  generateDeepUnderstandingRollout,
  loadDeepUnderstandingRolloutConfig,
} from './reportDeepUnderstandingRollout'

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const DEFAULT_PUBLIC_ROOT = 'app/public'
const CONFIG_SCHEMA_PATH = resolve(
  REPOSITORY_ROOT,
  'contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',
)
const MANIFEST_SCHEMA_PATH = resolve(
  REPOSITORY_ROOT,
  'contracts/goal-description-review/v1/goal-description-rollout-batch-manifest.schema.json',
)
const INDEX_SCHEMA_PATH = resolve(
  REPOSITORY_ROOT,
  'contracts/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json',
)

type Digest = `sha256:${string}`

export type GoalDescriptionRolloutBatchConfig = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json'
  schemaVersion: 1
  batchId: string
  subject: string
  subjectLabel: string
  bookId: string
  title: string
  baseGoalBookConfigPath: string
  goalIds: string[]
  outputDirectory: string
  feedbackBaseUrl: string
  promptPath: string
  criteriaPath: string
  publicRoot?: string
  printDerivativeProfile?: GoalBookPrintDerivativeProfile
}

type PreparedRoundBinding = {
  directory: 'round-a' | 'round-b'
  campaignId: string
  campaignDigest: Digest
  roundId: string
  independenceGroupId: string
  batchId: string
  batchInputFingerprint: Digest
}

export type GoalDescriptionRolloutBatchManifest = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-manifest.schema.json'
  schemaVersion: 1
  validationContract: 'goal-description-rollout-batch-v1'
  batchId: string
  subject: string
  subjectLabel: string
  configPath: string
  configDigest: Digest
  goalIds: string[]
  curriculumAtomicDenominatorAtPreparation: number
  source: {
    baseGoalBookConfigPath: string
    landscapePath: string
    landscapeId: string
    baseBookDigest: Digest
  }
  artifacts: {
    bundleDirectory: 'bundle'
    bookModelPath: 'bundle/book-model.json'
    bookModelDigest: Digest
    bundleManifestPath: 'bundle/manifest.json'
    bundleFingerprint: Digest
    reviewInputFingerprint: Digest
    rounds: {
      first: PreparedRoundBinding
      second: PreparedRoundBinding
    }
  }
  reviewPolicy: {
    oneBatchPerRound: true
    blindIndependentFirstPass: true
    aiRecordsAreCandidatesOnly: true
    automaticAcceptance: false
  }
}

export type StandaloneBatchResolutionIndex = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json'
  schemaVersion: 2
  indexContract: 'goal-description-standalone-batch-resolution-index-v1'
  artifactSetId: string
  subject: string
  semanticKind: 'curricularAtomic'
  batchGoalIds: string[]
  groups: Array<{
    groupId: string
    artifactDirectory: '.'
    dualSummaryPath: 'dual-summary.json'
    dualSummaryDigest: Digest
    campaignGoalCount: number
    resolvedGoalCount: number
  }>
  resolutions: Array<{
    goalId: string
    titleDe: string
    groupId: string
    decision: GoalDescriptionDualRoundResolution['decision']
    resolutionPath: string
    resolutionDigest: Digest
    resolutionFingerprint: Digest
    strictDescriptionComplete: true
  }>
}

type PreparedRound = Omit<GoalDescriptionReviewRoundArtifacts, 'resultPairs'> & {
  roundDirectory: string
}

type PreparedBatch = {
  config: GoalDescriptionRolloutBatchConfig
  configBytes: Buffer
  configPath: string
  outputDirectory: string
  manifest: GoalDescriptionRolloutBatchManifest
  model: GoalBookModel
  bundle: GoalBookReviewBundleManifest
  first: PreparedRound
  second: PreparedRound
}

const sha256 = (value: Buffer | string): Digest => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

const stableDigest = (value: unknown): Digest => sha256(stableGoalBookJson(value))
const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)

const parseJson = <T>(value: Buffer | string, label: string): T => {
  try {
    return JSON.parse(value.toString()) as T
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const repositoryPath = (configuredPath: string, label: string) => {
  const absolutePath = resolve(REPOSITORY_ROOT, configuredPath)
  const relativePath = relative(REPOSITORY_ROOT, absolutePath)
  if (
    relativePath === ''
    || relativePath === '..'
    || relativePath.startsWith(`..${sep}`)
  ) {
    throw new Error(`${label} must resolve below the repository root: ${configuredPath}`)
  }
  return absolutePath
}

const relativeRepositoryPath = (absolutePath: string, label: string) => {
  const relativePath = relative(REPOSITORY_ROOT, resolve(absolutePath))
  if (
    relativePath === ''
    || relativePath === '..'
    || relativePath.startsWith(`..${sep}`)
  ) {
    throw new Error(`${label} must resolve below the repository root: ${absolutePath}`)
  }
  return relativePath.split(sep).join('/')
}

const artifactPath = (root: string, configuredPath: string, label: string) => {
  const absolutePath = resolve(root, configuredPath)
  const relativePath = relative(root, absolutePath)
  if (
    relativePath === ''
    || relativePath === '..'
    || relativePath.startsWith(`..${sep}`)
  ) {
    throw new Error(`${label} must resolve below its batch root: ${configuredPath}`)
  }
  return absolutePath
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

const validatorsPromise = Promise.all([
  readFile(CONFIG_SCHEMA_PATH, 'utf8'),
  readFile(MANIFEST_SCHEMA_PATH, 'utf8'),
  readFile(INDEX_SCHEMA_PATH, 'utf8'),
]).then(([config, manifest, index]) => {
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  return {
    ajv,
    config: ajv.compile(parseJson<Record<string, unknown>>(config, CONFIG_SCHEMA_PATH)),
    manifest: ajv.compile(parseJson<Record<string, unknown>>(manifest, MANIFEST_SCHEMA_PATH)),
    index: ajv.compile(parseJson<Record<string, unknown>>(index, INDEX_SCHEMA_PATH)),
  }
})

export const loadGoalDescriptionRolloutBatchConfig = async (
  configuredPath: string,
) => {
  const configPath = repositoryPath(configuredPath, 'batch config')
  const configBytes = await readFile(configPath)
  const raw = parseJson<unknown>(configBytes, configPath)
  const validators = await validatorsPromise
  if (!validators.config(raw)) {
    throw new Error(`Invalid goal-description rollout batch config: ${validators.ajv.errorsText(validators.config.errors, { separator: '; ' })}`)
  }
  const config = raw as GoalDescriptionRolloutBatchConfig
  return {
    config,
    configBytes,
    configPath,
    outputDirectory: repositoryPath(config.outputDirectory, 'batch outputDirectory'),
  }
}

const canonicalGoalUrl = (model: GoalBookModel, goalId: string) => {
  if (!model.book.atlasBaseUrl) return null
  const url = new URL(model.book.atlasBaseUrl)
  url.searchParams.set('landscape', model.book.landscapeId)
  url.searchParams.set('edition', model.book.edition)
  url.hash = `goal-${goalId}`
  return url.toString()
}

const externalizedReference = (
  model: GoalBookModel,
  reference: GoalBookPage['requires'][number],
): GoalBookExternalReference => ({
  goalId: reference.goalId,
  title: reference.title,
  canonicalUrl: canonicalGoalUrl(model, reference.goalId),
})

const uniqueExternalReferences = (references: GoalBookExternalReference[]) => {
  const seen = new Set<string>()
  return references.filter(({ goalId }) => {
    if (seen.has(goalId)) return false
    seen.add(goalId)
    return true
  })
}

export const buildGoalDescriptionRolloutSubsetModel = ({
  baseModel: rawBaseModel,
  goalIds,
  bookId,
  title,
}: {
  baseModel: GoalBookModel
  goalIds: string[]
  bookId: string
  title: string
}): GoalBookModel => {
  const baseModel = parseAndValidateGoalBookModel(rawBaseModel)
  if (baseModel.book.publicationMode !== 'review') {
    throw new Error('Standalone description-review batches require a review-mode base GoalBook')
  }
  if (goalIds.length < 1 || goalIds.length > 20) {
    throw new Error(`Standalone description-review batches require 1-20 goals; received ${goalIds.length}`)
  }
  const duplicates = duplicateValues(goalIds)
  if (duplicates.length > 0) throw new Error(`Duplicate batch goalIds: ${duplicates.join(', ')}`)
  const basePageByGoalId = new Map(baseModel.pages.map((page) => [page.goalId, page]))
  const missing = goalIds.filter((goalId) => !basePageByGoalId.has(goalId))
  if (missing.length > 0) throw new Error(`Batch goals are absent from the current base GoalBook: ${missing.join(', ')}`)
  const selected = new Set(goalIds)
  const pageNumberByGoalId = new Map(goalIds.map((goalId, index) => [goalId, index + 1]))

  goalIds.forEach((goalId, index) => {
    const page = basePageByGoalId.get(goalId)!
    const forwardPrerequisites = page.requires
      .filter(({ goalId: prerequisiteId }) => selected.has(prerequisiteId))
      .filter(({ goalId: prerequisiteId }) => (pageNumberByGoalId.get(prerequisiteId) ?? 0) >= index + 1)
      .map(({ goalId: prerequisiteId }) => prerequisiteId)
    if (forwardPrerequisites.length > 0) {
      throw new Error(
        `Configured goalIds are not in prerequisite-safe order: ${goalId} precedes ${forwardPrerequisites.join(', ')}`,
      )
    }
  })

  const pagesWithoutFingerprints = goalIds.map((goalId, index) => {
    const basePage = basePageByGoalId.get(goalId)!
    const internalReference = (reference: GoalBookPage['requires'][number]) => {
      const target = basePageByGoalId.get(reference.goalId)!
      return {
        goalId: target.goalId,
        title: target.title,
        anchor: target.anchor,
        pageNumber: pageNumberByGoalId.get(target.goalId)!,
      }
    }
    const requires = basePage.requires
      .filter(({ goalId: referenceId }) => selected.has(referenceId))
      .map(internalReference)
    const reverseRequires = basePage.reverseRequires
      .filter(({ goalId: referenceId }) => selected.has(referenceId))
      .map(internalReference)
    const externalPrerequisites = uniqueExternalReferences([
      ...basePage.externalPrerequisites,
      ...basePage.requires
        .filter(({ goalId: referenceId }) => !selected.has(referenceId))
        .map((reference) => externalizedReference(baseModel, reference)),
    ])
    const externalReverseRequires = uniqueExternalReferences([
      ...basePage.externalReverseRequires,
      ...basePage.reverseRequires
        .filter(({ goalId: referenceId }) => !selected.has(referenceId))
        .map((reference) => externalizedReference(baseModel, reference)),
    ])
    const page = Object.fromEntries(
      Object.entries(basePage).filter(([key]) => key !== 'pageFingerprint'),
    ) as Omit<GoalBookPage, 'pageFingerprint'>
    return {
      ...page,
      pageNumber: index + 1,
      requires,
      reverseRequires,
      externalPrerequisites,
      externalReverseRequires,
    }
  })
  const pages: GoalBookPage[] = pagesWithoutFingerprints.map((page) => ({
    ...page,
    pageFingerprint: stableDigest({
      modelSchemaVersion: GOAL_BOOK_MODEL_SCHEMA_VERSION,
      edition: GOAL_BOOK_EDITION,
      page,
    }),
  }))
  const chapters = baseModel.chapters.flatMap((chapter) => {
    const chapterPages = pages.filter((page) => page.chapterIds.includes(chapter.chapterId))
    return chapterPages.length === 0 ? [] : [{
      ...chapter,
      goalIds: chapterPages.map(({ goalId }) => goalId),
      pageNumbers: chapterPages.map(({ pageNumber }) => pageNumber),
    }]
  })
  const baseWithoutDigest = Object.fromEntries(
    Object.entries(baseModel).filter(([key]) => key !== 'digest'),
  ) as Omit<GoalBookModel, 'digest'>
  const withoutDigest = {
    ...baseWithoutDigest,
    book: {
      ...baseModel.book,
      id: bookId,
      title,
      pageCount: pages.length,
      projectedAtomicGoalCount: pages.length,
      excludedTargetAtomicGoalCount: 0,
    },
    source: structuredClone(baseModel.source),
    chapters,
    pages,
    excludedTargetGoals: [],
  }
  const model = {
    ...withoutDigest,
    digest: stableDigest(withoutDigest),
  }
  return parseAndValidateGoalBookModel(model)
}

const writeBundleDirectory = async ({
  model,
  modelPath,
  htmlPath,
  pdfPath,
  outputDirectory,
  promptPath,
  criteriaPath,
}: {
  model: GoalBookModel
  modelPath: string
  htmlPath: string
  pdfPath: string
  outputDirectory: string
  promptPath: string
  criteriaPath: string
}) => {
  const built = await buildGoalBookReviewBundle(model, {
    modelPath,
    htmlPath,
    htmlRenderManifestPath: `${htmlPath}.render-manifest.json`,
    pdfPath,
    pdfRenderManifestPath: `${pdfPath}.render-manifest.json`,
    outputDirectory,
    promptPath,
    criteriaPath,
    goalIds: [],
  })
  await mkdir(outputDirectory, { recursive: true })
  for (const file of built.files) {
    const outputPath = artifactPath(outputDirectory, file.relativePath, `bundle artifact ${file.role}`)
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, file.content, { flag: 'wx' })
  }
  await writeFile(join(outputDirectory, 'manifest.json'), jsonBytes(built.manifest), { flag: 'wx' })
  return built
}

const roundOptions = (
  batchId: string,
  suffix: 'a' | 'b',
): Parameters<typeof createGoalDescriptionReviewCampaignArtifacts>[0]['campaignOptions'] => ({
  campaignId: `${batchId}-${suffix}`,
  roundId: `${batchId}-first-pass-${suffix}`,
  reviewerRole: 'internal_ai_reviewer',
  reviewPass: 'first_pass',
  independenceGroupId: `${batchId}-independent-${suffix}`,
  blindToOtherReviews: true,
  batchSize: 20,
})

const manifestRound = (
  directory: 'round-a' | 'round-b',
  campaign: GoalDescriptionReviewCampaign,
): PreparedRoundBinding => {
  if (campaign.batches.length !== 1) {
    throw new Error(`${directory} must contain exactly one campaign batch; found ${campaign.batches.length}`)
  }
  const batch = campaign.batches[0]
  return {
    directory,
    campaignId: campaign.campaignId,
    campaignDigest: fingerprintGoalDescriptionReviewCampaign(campaign),
    roundId: campaign.roundId,
    independenceGroupId: campaign.independenceGroupId,
    batchId: batch.batchId,
    batchInputFingerprint: batch.batchInputFingerprint as Digest,
  }
}

const assertCurrentFullAtomicBase = async (
  base: Awaited<ReturnType<typeof loadGoalBookBuildInputs>>,
) => {
  const ledgerPath = repositoryPath(base.config.semanticKindLedgerPath, 'semantic-kind ledger')
  const ledger = parseJson<{
    counts?: { curricularAtomic?: number }
    decisions?: Array<{ goalId: string; semanticKind: string; decisionStatus: string }>
  }>(await readFile(ledgerPath), ledgerPath)
  const atomicGoalIds = (ledger.decisions ?? [])
    .filter(({ semanticKind, decisionStatus }) => (
      semanticKind === 'curricularAtomic' && decisionStatus === 'authoritative'
    ))
    .map(({ goalId }) => goalId)
  const baseGoalIds = base.model.pages.map(({ goalId }) => goalId)
  const atomicSet = new Set(atomicGoalIds)
  const baseSet = new Set(baseGoalIds)
  const missing = atomicGoalIds.filter((goalId) => !baseSet.has(goalId))
  const unexpected = baseGoalIds.filter((goalId) => !atomicSet.has(goalId))
  if (
    atomicGoalIds.length === 0
    || atomicSet.size !== atomicGoalIds.length
    || baseSet.size !== baseGoalIds.length
    || missing.length > 0
    || unexpected.length > 0
    || ledger.counts?.curricularAtomic !== atomicGoalIds.length
  ) {
    throw new Error(
      `Base GoalBook must cover the exact current curricularAtomic scope; atomic=${atomicGoalIds.length}, pages=${baseGoalIds.length}, missing=${missing.length}, unexpected=${unexpected.length}`,
    )
  }
  return atomicGoalIds.length
}

export const prepareGoalDescriptionRolloutBatch = async (configuredPath: string) => {
  const loaded = await loadGoalDescriptionRolloutBatchConfig(configuredPath)
  try {
    await access(loaded.outputDirectory)
    throw new Error(`Batch output directory already exists: ${loaded.outputDirectory}`)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Batch output directory already exists:')) throw error
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
  }
  const base = await loadGoalBookBuildInputs(loaded.config.baseGoalBookConfigPath)
  const denominator = await assertCurrentFullAtomicBase(base)
  const landscapePath = repositoryPath(base.config.landscapePath, 'canonical landscape')
  const landscape = parseJson<Record<string, unknown>>(await readFile(landscapePath), landscapePath)
  if (
    landscape.subject !== loaded.config.subjectLabel
    || String(landscape.subject).toLocaleLowerCase('de-DE') !== loaded.config.subject
  ) {
    throw new Error(
      `Batch subject ${loaded.config.subject}/${loaded.config.subjectLabel} does not match canonical ${String(landscape.subject)}`,
    )
  }
  const model = buildGoalDescriptionRolloutSubsetModel({
    baseModel: base.model,
    goalIds: loaded.config.goalIds,
    bookId: loaded.config.bookId,
    title: loaded.config.title,
  })
  await mkdir(dirname(loaded.outputDirectory), { recursive: true })
  const temporaryDirectory = await mkdtemp(join(dirname(loaded.outputDirectory), '.goal-description-rollout-batch-'))
  try {
    const renderDirectory = join(temporaryDirectory, '.render-source')
    const bundleDirectory = join(temporaryDirectory, 'bundle')
    const modelPath = join(renderDirectory, 'book-model.json')
    const htmlPath = join(renderDirectory, 'book.html')
    const pdfPath = join(renderDirectory, 'book.pdf')
    await mkdir(renderDirectory)
    await writeGoalBookModel(model, modelPath)
    const renderOptions = {
      feedbackBaseUrl: loaded.config.feedbackBaseUrl,
      publicRoot: repositoryPath(loaded.config.publicRoot ?? DEFAULT_PUBLIC_ROOT, 'publicRoot'),
      printDerivativeProfile: loaded.config.printDerivativeProfile,
    }
    const htmlManifest = await writeGoalBookHtml(model, htmlPath, renderOptions)
    await writeGoalBookRenderManifest(htmlManifest, `${htmlPath}.render-manifest.json`)
    const pdfManifest = await writeGoalBookPdf(model, pdfPath, renderOptions)
    await writeGoalBookRenderManifest(pdfManifest, `${pdfPath}.render-manifest.json`)
    const bundle = await writeBundleDirectory({
      model,
      modelPath,
      htmlPath,
      pdfPath,
      outputDirectory: bundleDirectory,
      promptPath: repositoryPath(loaded.config.promptPath, 'description-review prompt'),
      criteriaPath: repositoryPath(loaded.config.criteriaPath, 'subject criteria'),
    })
    const bundleBytes = jsonBytes(bundle.manifest)
    const bookModelBytes = await readFile(join(bundleDirectory, 'book-model.json'))
    const reviewInputBytes = await readFile(join(bundleDirectory, 'review-input.json'))
    const [first, second] = await Promise.all([
      createGoalDescriptionReviewCampaignArtifacts({
        bundleBytes,
        bookModelBytes,
        reviewInputBytes,
        bundleDirectory,
        outputDirectory: join(temporaryDirectory, 'round-a'),
        campaignOptions: roundOptions(loaded.config.batchId, 'a'),
      }),
      createGoalDescriptionReviewCampaignArtifacts({
        bundleBytes,
        bookModelBytes,
        reviewInputBytes,
        bundleDirectory,
        outputDirectory: join(temporaryDirectory, 'round-b'),
        campaignOptions: roundOptions(loaded.config.batchId, 'b'),
      }),
    ])
    await Promise.all([
      mkdir(join(temporaryDirectory, 'round-a', 'results')),
      mkdir(join(temporaryDirectory, 'round-b', 'results')),
      mkdir(join(temporaryDirectory, 'resolutions')),
    ])
    const manifest: GoalDescriptionRolloutBatchManifest = {
      $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-manifest.schema.json',
      schemaVersion: 1,
      validationContract: 'goal-description-rollout-batch-v1',
      batchId: loaded.config.batchId,
      subject: loaded.config.subject,
      subjectLabel: loaded.config.subjectLabel,
      configPath: relativeRepositoryPath(loaded.configPath, 'configPath'),
      configDigest: sha256(loaded.configBytes),
      goalIds: [...loaded.config.goalIds],
      curriculumAtomicDenominatorAtPreparation: denominator,
      source: {
        baseGoalBookConfigPath: loaded.config.baseGoalBookConfigPath,
        landscapePath: base.config.landscapePath,
        landscapeId: model.book.landscapeId,
        baseBookDigest: base.model.digest as Digest,
      },
      artifacts: {
        bundleDirectory: 'bundle',
        bookModelPath: 'bundle/book-model.json',
        bookModelDigest: model.digest as Digest,
        bundleManifestPath: 'bundle/manifest.json',
        bundleFingerprint: bundle.manifest.bundleFingerprint as Digest,
        reviewInputFingerprint: first.input.reviewInputFingerprint as Digest,
        rounds: {
          first: manifestRound('round-a', first.campaign),
          second: manifestRound('round-b', second.campaign),
        },
      },
      reviewPolicy: {
        oneBatchPerRound: true,
        blindIndependentFirstPass: true,
        aiRecordsAreCandidatesOnly: true,
        automaticAcceptance: false,
      },
    }
    const validators = await validatorsPromise
    if (!validators.manifest(manifest)) {
      throw new Error(`Generated batch manifest is invalid: ${validators.ajv.errorsText(validators.manifest.errors, { separator: '; ' })}`)
    }
    await writeFile(join(temporaryDirectory, 'batch-manifest.json'), jsonBytes(manifest), { flag: 'wx' })
    await rm(renderDirectory, { recursive: true, force: true })
    await rename(temporaryDirectory, loaded.outputDirectory)
    return { manifest, model, bundle: bundle.manifest }
  } catch (error) {
    await rm(temporaryDirectory, { recursive: true, force: true })
    throw error
  }
}

const loadPreparedRound = async ({
  outputDirectory,
  binding,
  bundle,
  goalIds,
}: {
  outputDirectory: string
  binding: PreparedRoundBinding
  bundle: GoalBookReviewBundleManifest
  goalIds: string[]
}) => {
  const roundDirectory = artifactPath(outputDirectory, binding.directory, `${binding.directory} directory`)
  const [roundBundleBytes, inputBytes, campaignBytes] = await Promise.all([
    readFile(join(roundDirectory, 'review-bundle-manifest.json')),
    readFile(join(roundDirectory, 'description-review-input.json')),
    readFile(join(roundDirectory, 'description-review-campaign.json')),
  ])
  const roundBundle = parseJson<GoalBookReviewBundleManifest>(roundBundleBytes, `${binding.directory} bundle`)
  const input = parseJson<GoalDescriptionReviewInput>(inputBytes, `${binding.directory} input`)
  const campaign = parseJson<GoalDescriptionReviewCampaign>(campaignBytes, `${binding.directory} campaign`)
  const validation = await validateGoalDescriptionReviewCampaign({ bundle: roundBundle, input, campaign })
  if (validation.errors.length > 0) {
    throw new Error(`${binding.directory} campaign is invalid: ${validation.errors.join(' | ')}`)
  }
  if (stableGoalBookJson(roundBundle) !== stableGoalBookJson(bundle)) {
    throw new Error(`${binding.directory} does not bind the exact prepared review bundle`)
  }
  if (
    campaign.batches.length !== 1
    || !sameOrderedValues(campaign.batches[0].goalIds, goalIds)
    || campaign.goalCount !== goalIds.length
    || campaign.batchSize !== 20
    || campaign.reviewPass !== 'first_pass'
    || campaign.reviewerRole === 'synthesizer'
    || campaign.blindToOtherReviews !== true
  ) {
    throw new Error(`${binding.directory} is not a complete blind one-batch first-pass campaign`)
  }
  const expectedBinding = manifestRound(binding.directory, campaign)
  if (stableGoalBookJson(expectedBinding) !== stableGoalBookJson(binding)) {
    throw new Error(`${binding.directory} campaign bindings disagree with batch-manifest.json`)
  }
  return { bundle: roundBundle, input, campaign, roundDirectory }
}

export const validatePreparedGoalDescriptionRolloutBatch = async (
  configuredPath: string,
): Promise<PreparedBatch> => {
  const loaded = await loadGoalDescriptionRolloutBatchConfig(configuredPath)
  const manifestPath = join(loaded.outputDirectory, 'batch-manifest.json')
  const manifest = parseJson<GoalDescriptionRolloutBatchManifest>(
    await readFile(manifestPath),
    manifestPath,
  )
  const validators = await validatorsPromise
  if (!validators.manifest(manifest)) {
    throw new Error(`Invalid prepared batch manifest: ${validators.ajv.errorsText(validators.manifest.errors, { separator: '; ' })}`)
  }
  if (
    manifest.configPath !== relativeRepositoryPath(loaded.configPath, 'configPath')
    || manifest.configDigest !== sha256(loaded.configBytes)
    || manifest.batchId !== loaded.config.batchId
    || manifest.subject !== loaded.config.subject
    || manifest.subjectLabel !== loaded.config.subjectLabel
    || manifest.source.baseGoalBookConfigPath !== loaded.config.baseGoalBookConfigPath
    || !sameOrderedValues(manifest.goalIds, loaded.config.goalIds)
  ) {
    throw new Error('Prepared batch manifest disagrees with its exact current configuration')
  }
  const bundleDirectory = artifactPath(
    loaded.outputDirectory,
    manifest.artifacts.bundleDirectory,
    'bundleDirectory',
  )
  const [modelBytes, bundleBytes] = await Promise.all([
    readFile(artifactPath(loaded.outputDirectory, manifest.artifacts.bookModelPath, 'bookModelPath')),
    readFile(artifactPath(loaded.outputDirectory, manifest.artifacts.bundleManifestPath, 'bundleManifestPath')),
  ])
  const model = parseAndValidateGoalBookModel(parseJson<unknown>(modelBytes, 'prepared subset BookModel'))
  const bundle = parseJson<GoalBookReviewBundleManifest>(bundleBytes, 'prepared bundle manifest')
  await verifyGoalBookReviewBundleArtifactBytes(bundle, bundleDirectory)
  if (
    model.digest !== manifest.artifacts.bookModelDigest
    || model.source.landscapePath !== manifest.source.landscapePath
    || model.book.landscapeId !== manifest.source.landscapeId
    || bundle.bookModelDigest !== model.digest
    || bundle.bundleFingerprint !== manifest.artifacts.bundleFingerprint
    || !sameOrderedValues(model.pages.map(({ goalId }) => goalId), manifest.goalIds)
    || !sameOrderedValues(bundle.goals.map(({ goalId }) => goalId), manifest.goalIds)
  ) {
    throw new Error('Prepared subset BookModel or bundle disagrees with batch-manifest.json')
  }
  const [first, second] = await Promise.all([
    loadPreparedRound({
      outputDirectory: loaded.outputDirectory,
      binding: manifest.artifacts.rounds.first,
      bundle,
      goalIds: manifest.goalIds,
    }),
    loadPreparedRound({
      outputDirectory: loaded.outputDirectory,
      binding: manifest.artifacts.rounds.second,
      bundle,
      goalIds: manifest.goalIds,
    }),
  ])
  if (
    stableGoalBookJson(first.input) !== stableGoalBookJson(second.input)
    || first.input.reviewInputFingerprint !== manifest.artifacts.reviewInputFingerprint
    || first.campaign.campaignId === second.campaign.campaignId
    || first.campaign.roundId === second.campaign.roundId
    || first.campaign.independenceGroupId === second.campaign.independenceGroupId
  ) {
    throw new Error('Prepared rounds are not two distinct blind campaigns over the identical exact input')
  }
  return {
    config: loaded.config,
    configBytes: loaded.configBytes,
    configPath: loaded.configPath,
    outputDirectory: loaded.outputDirectory,
    manifest,
    model,
    bundle,
    first,
    second,
  }
}

const loadCompletedRound = async (
  prepared: PreparedBatch,
  round: PreparedBatch['first'],
): Promise<GoalDescriptionReviewRoundArtifacts> => {
  const loaded = await loadGoalDescriptionReviewCampaignResultDirectories({
    campaign: round.campaign,
    batchesDirectory: join(round.roundDirectory, 'batches'),
    resultsDirectory: join(round.roundDirectory, 'results'),
  })
  if (loaded.errors.length > 0) {
    throw new Error(loaded.errors.join(' | '))
  }
  return {
    bundle: prepared.bundle,
    input: round.input,
    campaign: round.campaign,
    resultPairs: loaded.resultPairs,
  }
}

const loadValidatedDualSummary = async (prepared: PreparedBatch) => {
  const [first, second] = await Promise.all([
    loadCompletedRound(prepared, prepared.first),
    loadCompletedRound(prepared, prepared.second),
  ])
  const dual = await validateGoalDescriptionReviewDualRound({ first, second })
  if (dual.errors.length > 0) throw new Error(dual.errors.join(' | '))
  if (!sameOrderedValues(dual.summary.goals.map(({ goalId }) => goalId), prepared.manifest.goalIds)) {
    throw new Error('Dual-round summary does not cover the exact configured batch goalIds in order')
  }
  return { first, second, summary: dual.summary, bytes: jsonBytes(dual.summary) }
}

const readOptional = async (path: string) => {
  try {
    return await readFile(path)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}

const writeNewOrRequireExact = async (path: string, expected: Buffer, write: boolean) => {
  const current = await readOptional(path)
  if (current) {
    if (!current.equals(expected)) throw new Error(`Existing generated artifact is stale: ${relativeRepositoryPath(path, 'generated artifact')}`)
    return
  }
  if (!write) throw new Error(`Missing generated artifact: ${relativeRepositoryPath(path, 'generated artifact')}`)
  await writeFile(path, expected, { flag: 'wx' })
}

export const materializeGoalDescriptionRolloutBatchDualSummary = async (
  configuredPath: string,
  write: boolean,
) => {
  const prepared = await validatePreparedGoalDescriptionRolloutBatch(configuredPath)
  const dual = await loadValidatedDualSummary(prepared)
  await writeNewOrRequireExact(join(prepared.outputDirectory, 'dual-summary.json'), dual.bytes, write)
  return { prepared, ...dual }
}

export const materializeGoalDescriptionRolloutBatchResolutionIndex = async (
  configuredPath: string,
  write: boolean,
) => {
  const dual = await materializeGoalDescriptionRolloutBatchDualSummary(configuredPath, write)
  const landscapePath = repositoryPath(dual.prepared.manifest.source.landscapePath, 'current canonical landscape')
  const landscapeBytes = await readFile(landscapePath)
  const landscape = parseJson<{ subject?: string; goals?: Array<Record<string, unknown>> }>(
    landscapeBytes,
    landscapePath,
  )
  const batchManifestBytes = await readFile(join(dual.prepared.outputDirectory, 'batch-manifest.json'))
  if (
    landscape.subject !== dual.prepared.manifest.subjectLabel
    || !Array.isArray(landscape.goals)
  ) {
    throw new Error('Current canonical landscape identity or goals array disagrees with the prepared batch')
  }
  const resolutionsDirectory = join(dual.prepared.outputDirectory, 'resolutions')
  const resolutionFileNames = (await readdir(resolutionsDirectory))
    .filter((name) => name.endsWith('.resolution.json'))
    .sort()
  const expectedFileNames = dual.prepared.manifest.goalIds
    .map((goalId) => `${goalId}.resolution.json`)
    .sort()
  if (!sameOrderedValues(resolutionFileNames, expectedFileNames)) {
    throw new Error(
      `A complete standalone batch requires exactly one resolution file per goal; expected ${expectedFileNames.length}, found ${resolutionFileNames.length}`,
    )
  }
  const completedAtValues = [...dual.first.resultPairs, ...dual.second.resultPairs]
    .map(({ run }) => Date.parse(run.completedAt))
  if (completedAtValues.length === 0 || completedAtValues.some((value) => !Number.isFinite(value))) {
    throw new Error('Completed review runs must provide valid completedAt timestamps')
  }
  const expectedSynthesizedAt = new Date(Math.max(...completedAtValues) + 1000).toISOString()
  const entries: StandaloneBatchResolutionIndex['resolutions'] = []
  let synthesisManifestArtifact: {
    path: string
    bytes: Buffer
    manifest: GoalDescriptionRolloutSynthesisDecisionManifest
  } | null = null
  for (const goalId of dual.prepared.manifest.goalIds) {
    const path = join(resolutionsDirectory, `${goalId}.resolution.json`)
    const bytes = await readFile(path)
    const resolution = parseJson<GoalDescriptionDualRoundResolution>(bytes, path)
    if (
      resolution.goal.goalId !== goalId
      || resolution.synthesis.authority !== 'ai_synthesis'
      || resolution.synthesis.humanAttestation !== null
      || !resolution.synthesisDecisionManifest
    ) {
      throw new Error(`${goalId}: standalone AI rollout batches require a manifest-bound AI synthesis without human attestation`)
    }
    const synthesisBinding = resolution.synthesisDecisionManifest
    const synthesisManifestPath = artifactPath(
      dual.prepared.outputDirectory,
      synthesisBinding.manifestPath,
      'synthesisDecisionManifest.manifestPath',
    )
    if (synthesisManifestArtifact && synthesisManifestArtifact.path !== synthesisManifestPath) {
      throw new Error(`${goalId}: every standalone resolution must bind the same batch synthesis manifest`)
    }
    if (!synthesisManifestArtifact) {
      const synthesisManifestBytes = await readFile(synthesisManifestPath)
      const synthesisManifest = parseJson<GoalDescriptionRolloutSynthesisDecisionManifest>(
        synthesisManifestBytes,
        synthesisManifestPath,
      )
      const structure = await validateGoalDescriptionRolloutSynthesisDecisionManifestStructure(
        synthesisManifest,
      )
      if (structure.errors.length > 0) {
        throw new Error(structure.errors.join(' | '))
      }
      if (!sameOrderedValues(
        synthesisManifest.decisions.map(({ goalId: decisionGoalId }) => decisionGoalId),
        dual.prepared.manifest.goalIds,
      )) {
        throw new Error('Standalone synthesis manifest must contain exactly the configured goal decisions in order')
      }
      if (synthesisManifest.synthesizedAt !== expectedSynthesizedAt) {
        throw new Error(`Standalone synthesis manifest synthesizedAt must be ${expectedSynthesizedAt}`)
      }
      const expectedBatchBinding: GoalDescriptionRolloutSynthesisDecisionManifest['batch'] = {
        batchId: dual.prepared.manifest.batchId,
        batchManifestDigest: sha256(batchManifestBytes),
        configDigest: dual.prepared.manifest.configDigest,
        bundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
        bookDigest: dual.first.input.bookDigest as Digest,
        reviewInputFingerprint: dual.first.input.reviewInputFingerprint as Digest,
        dualSummaryDigest: sha256(dual.bytes),
        canonicalLandscapeDigest: sha256(landscapeBytes),
      }
      if (stableGoalBookJson(synthesisManifest.batch) !== stableGoalBookJson(expectedBatchBinding)) {
        throw new Error('Standalone synthesis manifest batch and canonical digests are stale or foreign')
      }
      synthesisManifestArtifact = {
        path: synthesisManifestPath,
        bytes: synthesisManifestBytes,
        manifest: synthesisManifest,
      }
    }
    const synthesisManifest = synthesisManifestArtifact.manifest
    if (
      synthesisBinding.manifestId !== synthesisManifest.manifestId
      || synthesisBinding.manifestDigest !== sha256(synthesisManifestArtifact.bytes)
      || synthesisBinding.manifestFingerprint !== synthesisManifest.manifestFingerprint
    ) {
      throw new Error(`${goalId}: resolution does not bind the exact synthesis-manifest bytes and fingerprint`)
    }
    const firstSourceResult = extractGoalDescriptionDualRoundResolutionSource({
      artifacts: dual.first,
      goalId,
      label: 'First',
    })
    const secondSourceResult = extractGoalDescriptionDualRoundResolutionSource({
      artifacts: dual.second,
      goalId,
      label: 'Second',
    })
    if (
      firstSourceResult.errors.length > 0
      || secondSourceResult.errors.length > 0
      || !firstSourceResult.source
      || !secondSourceResult.source
    ) {
      throw new Error([
        ...firstSourceResult.errors,
        ...secondSourceResult.errors,
      ].join(' | ') || `${goalId}: missing exact source records`)
    }
    const expectedRoundBindings = {
      first: buildGoalDescriptionRolloutSynthesisRoundBinding(
        firstSourceResult.source.binding,
        dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint,
      ),
      second: buildGoalDescriptionRolloutSynthesisRoundBinding(
        secondSourceResult.source.binding,
        dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint,
      ),
    }
    if (stableGoalBookJson(synthesisManifest.rounds) !== stableGoalBookJson(expectedRoundBindings)) {
      throw new Error(`${goalId}: synthesis manifest does not bind the exact current review runs`)
    }
    const synthesisDecisions = synthesisManifest.decisions.filter((decision) => decision.goalId === goalId)
    if (synthesisDecisions.length !== 1) {
      throw new Error(`${goalId}: synthesis manifest must contain exactly one decision; found ${synthesisDecisions.length}`)
    }
    const synthesisDecision = synthesisDecisions[0]
    const expectedDecisionBinding = {
      goalId,
      effectiveSemanticKind: resolution.goal.effectiveSemanticKind,
      goalFingerprint: resolution.goal.goalFingerprint,
      pageFingerprint: resolution.goal.pageFingerprint,
      goalReviewContextFingerprint: resolution.goal.goalReviewContextFingerprint,
      finalText: resolution.goal.finalText,
      resolutionDecision: resolution.decision,
      records: {
        first: {
          recordId: resolution.rounds.first.recordId,
          recordDigest: resolution.rounds.first.recordDigest,
        },
        second: {
          recordId: resolution.rounds.second.recordId,
          recordDigest: resolution.rounds.second.recordDigest,
        },
      },
      rationaleDe: resolution.synthesis.rationaleDe,
      rationaleEn: resolution.synthesis.rationaleEn,
    }
    const actualDecisionBinding = {
      goalId: synthesisDecision.goalId,
      effectiveSemanticKind: synthesisDecision.effectiveSemanticKind,
      goalFingerprint: synthesisDecision.goalFingerprint,
      pageFingerprint: synthesisDecision.pageFingerprint,
      goalReviewContextFingerprint: synthesisDecision.goalReviewContextFingerprint,
      finalText: synthesisDecision.finalText,
      resolutionDecision: synthesisDecision.resolutionDecision,
      records: synthesisDecision.records,
      rationaleDe: synthesisDecision.rationaleDe,
      rationaleEn: synthesisDecision.rationaleEn,
    }
    if (
      synthesisBinding.decisionId !== synthesisDecision.decisionId
      || stableGoalBookJson(actualDecisionBinding) !== stableGoalBookJson(expectedDecisionBinding)
      || resolution.synthesis.synthesizedBy !== synthesisManifest.synthesizedBy
      || resolution.synthesis.synthesizedAt !== synthesisManifest.synthesizedAt
    ) {
      throw new Error(`${goalId}: resolution text, decision, records, rationale, or synthesis identity disagrees with the manifest`)
    }
    const selectedSource = synthesisDecision.evidenceRound === 'first'
      ? firstSourceResult.source
      : secondSourceResult.source
    const otherSource = synthesisDecision.evidenceRound === 'first'
      ? secondSourceResult.source
      : firstSourceResult.source
    const selectedReviseAllowed = (
      synthesisDecision.resolutionDecision === 'keep_current'
      && selectedSource.decision === 'revise'
      && otherSource.decision === 'keep'
      && synthesisDecision.revisionDissent?.sourceRound === synthesisDecision.evidenceRound
      && synthesisDecision.revisionDissent.disposition === 'rejected_keep_current'
    )
    if (
      !selectedSource.record
      || (selectedSource.decision !== 'keep' && !selectedReviseAllowed)
      || stableGoalBookJson(resolution.synthesis.understandingEvidence)
        !== stableGoalBookJson(selectedSource.record.understandingEvidence)
    ) {
      throw new Error(`${goalId}: resolution understanding evidence does not match the selected allowed current keep/revise record`)
    }
    const validation = await validateGoalDescriptionDualRoundResolution({
      resolution,
      dualSummary: dual.summary,
      dualSummaryBytes: dual.bytes,
      currentInput: dual.first.input,
      landscape,
      first: dual.first,
      second: dual.second,
      synthesisDecisionManifestArtifact: {
        manifest: synthesisManifest,
        manifestBytes: synthesisManifestArtifact.bytes,
        manifestPath: synthesisBinding.manifestPath,
      },
    })
    if (validation.errors.length > 0) {
      throw new Error(`${goalId}: ${validation.errors.join(' | ')}`)
    }
    if (!validation.strictDescriptionComplete) {
      throw new Error(`${goalId}: resolution is not strict current-context keep/keep or explicitly rejected keep/revise completion`)
    }
    entries.push({
      goalId,
      titleDe: resolution.goal.finalText.titleDe,
      groupId: dual.prepared.manifest.batchId,
      decision: resolution.decision,
      resolutionPath: `resolutions/${goalId}.resolution.json`,
      resolutionDigest: sha256(bytes),
      resolutionFingerprint: resolution.resolutionFingerprint,
      strictDescriptionComplete: true,
    })
  }
  const index: StandaloneBatchResolutionIndex = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json',
    schemaVersion: 2,
    indexContract: 'goal-description-standalone-batch-resolution-index-v1',
    artifactSetId: `${dual.prepared.manifest.batchId}-strict-resolutions`,
    subject: dual.prepared.manifest.subjectLabel,
    semanticKind: 'curricularAtomic',
    batchGoalIds: [...dual.prepared.manifest.goalIds],
    groups: [{
      groupId: dual.prepared.manifest.batchId,
      artifactDirectory: '.',
      dualSummaryPath: 'dual-summary.json',
      dualSummaryDigest: sha256(dual.bytes),
      campaignGoalCount: dual.summary.goalCount,
      resolvedGoalCount: entries.length,
    }],
    resolutions: entries,
  }
  const validators = await validatorsPromise
  if (!validators.index(index)) {
    throw new Error(`Generated standalone resolution index is invalid: ${validators.ajv.errorsText(validators.index.errors, { separator: '; ' })}`)
  }
  await writeNewOrRequireExact(
    join(dual.prepared.outputDirectory, 'resolution-index.json'),
    jsonBytes(index),
    write,
  )
  return { ...dual, index }
}

export type GoalDescriptionRolloutSelectionStrategy = 'landscape-order' | 'coherent-area-phase'

type SelectionGoalMetadata = {
  titleEn?: unknown
  dimensionTags?: {
    phase?: unknown
    area?: unknown
    topicCode?: unknown
  }
}

export const selectGoalDescriptionRolloutCandidates = ({
  model,
  completedGoalIds,
  metadataByGoalId,
  maximumGoalCount,
  strategy,
}: {
  model: GoalBookModel
  completedGoalIds: ReadonlySet<string>
  metadataByGoalId: ReadonlyMap<string, SelectionGoalMetadata>
  maximumGoalCount: number
  strategy: GoalDescriptionRolloutSelectionStrategy
}) => {
  if (!Number.isInteger(maximumGoalCount) || maximumGoalCount < 1 || maximumGoalCount > 20) {
    throw new Error(`maximumGoalCount must be an integer from 1 to 20; received ${maximumGoalCount}`)
  }
  const remaining = model.pages.filter(({ goalId }) => !completedGoalIds.has(goalId))
  const text = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : null
  const coherenceKey = (page: GoalBookPage) => {
    const tags = metadataByGoalId.get(page.goalId)?.dimensionTags
    return `${text(tags?.phase) ?? '(no-phase)'}\u0000${text(tags?.area) ?? '(no-area)'}`
  }
  let selected: GoalBookPage[]
  if (strategy === 'landscape-order' || remaining.length === 0) {
    selected = remaining.slice(0, maximumGoalCount)
  } else {
    const firstCoherenceKey = coherenceKey(remaining[0])
    selected = []
    for (const page of remaining) {
      if (coherenceKey(page) !== firstCoherenceKey) break
      selected.push(page)
      if (selected.length === maximumGoalCount) break
    }
  }
  return selected.map((page) => {
    const metadata = metadataByGoalId.get(page.goalId)
    return {
      goalId: page.goalId,
      titleDe: page.title,
      titleEn: text(metadata?.titleEn),
      phase: text(metadata?.dimensionTags?.phase),
      area: text(metadata?.dimensionTags?.area),
      topicCode: text(metadata?.dimensionTags?.topicCode),
      goalFingerprint: page.goalFingerprint,
      pageFingerprint: page.pageFingerprint,
      basePageNumber: page.pageNumber,
      coherenceKey: coherenceKey(page).replace('\u0000', ' / '),
    }
  })
}

export const selectGoalDescriptionRolloutBatch = async ({
  rolloutConfigPath,
  baseGoalBookConfigPath,
  subject,
  maximumGoalCount,
  strategy,
  excludeConfigPaths = [],
}: {
  rolloutConfigPath: string
  baseGoalBookConfigPath: string
  subject: string
  maximumGoalCount: number
  strategy: GoalDescriptionRolloutSelectionStrategy
  excludeConfigPaths?: string[]
}) => {
  const [report, base, excludeConfigs] = await Promise.all([
    generateDeepUnderstandingRollout(rolloutConfigPath),
    loadGoalBookBuildInputs(baseGoalBookConfigPath),
    Promise.all(excludeConfigPaths.map((configPath) => loadGoalDescriptionRolloutBatchConfig(configPath))),
  ])
  if (report.blockingIssueCount > 0) {
    throw new Error(`Cannot select from a rollout report with ${report.blockingIssueCount} blocking issues`)
  }
  const subjectReport = report.subjects.find((candidate) => candidate.subject === subject)
  if (!subjectReport || subjectReport.denominator === null) {
    throw new Error(`Rollout report has no authoritative live subject ${subject}`)
  }
  const rolloutSubjectConfig = loadDeepUnderstandingRolloutConfig(rolloutConfigPath)
    .subjects.find((candidate) => candidate.subject === subject)
  if (!rolloutSubjectConfig) {
    throw new Error(`Rollout config has no subject binding for ${subject}`)
  }
  if (
    base.config.landscapePath !== rolloutSubjectConfig.landscapePath
    || base.config.semanticKindLedgerPath !== rolloutSubjectConfig.semanticKindLedgerPath
  ) {
    throw new Error(
      `Selection base config is not bound to rollout subject ${subject}: `
      + `landscape=${base.config.landscapePath}, semanticKinds=${base.config.semanticKindLedgerPath}`,
    )
  }
  for (const excluded of excludeConfigs) {
    if (
      excluded.config.subject !== subject
      || excluded.config.baseGoalBookConfigPath !== baseGoalBookConfigPath
    ) {
      throw new Error(
        `Excluded batch ${excluded.configPath} is not bound to ${subject} and ${baseGoalBookConfigPath}`,
      )
    }
  }
  const denominator = await assertCurrentFullAtomicBase(base)
  if (subjectReport.denominator !== denominator) {
    throw new Error(
      `Rollout denominator ${subjectReport.denominator} disagrees with full atomic base ${denominator}`,
    )
  }
  const landscapePath = repositoryPath(base.config.landscapePath, 'selection landscape')
  const landscape = parseJson<{ subject?: string; goals?: Array<Record<string, unknown>> }>(
    await readFile(landscapePath),
    landscapePath,
  )
  if (
    landscape.subject !== subjectReport.label
    || String(landscape.subject).toLocaleLowerCase('de-DE') !== subject
    || !Array.isArray(landscape.goals)
  ) {
    throw new Error('Selection landscape identity or goals array disagrees with the rollout subject')
  }
  const metadataByGoalId = new Map(landscape.goals.map((goal) => [String(goal.id), goal]))
  const explicitlyExcludedGoalIds = [...new Set(excludeConfigs.flatMap(({ config }) => config.goalIds))]
  const completedOrExcludedGoalIds = new Set([
    ...subjectReport.strictCompleteGoalIds,
    ...explicitlyExcludedGoalIds,
  ])
  const goals = selectGoalDescriptionRolloutCandidates({
    model: base.model,
    completedGoalIds: completedOrExcludedGoalIds,
    metadataByGoalId,
    maximumGoalCount,
    strategy,
  })
  return {
    schemaVersion: 1,
    selectionContract: 'goal-description-rollout-selection-v1',
    selectionOnly: true,
    grantsProgress: false,
    reportId: report.reportId,
    subject,
    subjectLabel: subjectReport.label,
    landscapePath: base.config.landscapePath,
    landscapeId: base.model.book.landscapeId,
    baseGoalBookConfigPath,
    baseBookDigest: base.model.digest,
    liveCurricularAtomicDenominator: denominator,
    strictCompleteCount: subjectReport.strictComplete,
    explicitlyExcludedGoalCount: explicitlyExcludedGoalIds.length,
    explicitlyExcludedGoalIds,
    remainingBeforeSelection: denominator - subjectReport.strictComplete,
    strategy,
    maximumGoalCount,
    selectedGoalCount: goals.length,
    goalIds: goals.map(({ goalId }) => goalId),
    goals,
  }
}

type CliMode = 'prepare' | 'check' | 'summarize' | 'finalize'

const parseArgs = (args: string[]) => {
  const mode = args[0] as CliMode | undefined
  if (!mode || !['prepare', 'check', 'summarize', 'finalize'].includes(mode)) {
    throw new Error('Usage: tsx scripts/materializeGoalDescriptionRolloutBatch.ts prepare|check|summarize|finalize --config <config.json> [--write]')
  }
  let configPath = ''
  let write = false
  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--write') {
      if (write) throw new Error('Duplicate --write')
      write = true
      continue
    }
    if (arg === '--config') {
      if (configPath || !args[index + 1]) throw new Error('--config requires exactly one path')
      configPath = args[index + 1]
      index += 1
      continue
    }
    throw new Error(`Unknown argument: ${arg}`)
  }
  if (!configPath) throw new Error('--config is required')
  if ((mode === 'prepare' || mode === 'check') && write) {
    throw new Error(`--write is not valid for ${mode}`)
  }
  return { mode, configPath, write }
}

const parseSelectionArgs = (args: string[]) => {
  const values = new Map<string, string>()
  const excludeConfigPaths: string[] = []
  const allowed = new Set([
    '--rollout-config',
    '--base-config',
    '--subject',
    '--max-goals',
    '--strategy',
    '--exclude-config',
  ])
  for (let index = 1; index < args.length; index += 2) {
    const key = args[index]
    const value = args[index + 1]
    if (!allowed.has(key) || !value) {
      throw new Error('Usage: tsx scripts/materializeGoalDescriptionRolloutBatch.ts select --rollout-config <config.json> --base-config <goal-book-config.json> --subject <id> [--max-goals 20] [--strategy landscape-order|coherent-area-phase]')
    }
    if (key === '--exclude-config') {
      excludeConfigPaths.push(value)
    } else {
      if (values.has(key)) throw new Error(`Duplicate option ${key}`)
      values.set(key, value)
    }
  }
  const rolloutConfigPath = values.get('--rollout-config')
  const baseGoalBookConfigPath = values.get('--base-config')
  const subject = values.get('--subject')
  if (!rolloutConfigPath || !baseGoalBookConfigPath || !subject) {
    throw new Error('--rollout-config, --base-config, and --subject are required for select')
  }
  const maximumGoalCount = Number(values.get('--max-goals') ?? '20')
  const strategy = values.get('--strategy') ?? 'coherent-area-phase'
  if (strategy !== 'landscape-order' && strategy !== 'coherent-area-phase') {
    throw new Error('--strategy must be landscape-order or coherent-area-phase')
  }
  return {
    rolloutConfigPath,
    baseGoalBookConfigPath,
    subject,
    maximumGoalCount,
    strategy: strategy as GoalDescriptionRolloutSelectionStrategy,
    excludeConfigPaths,
  }
}

const main = async () => {
  const argv = process.argv.slice(2)
  if (argv[0] === 'select') {
    const selection = await selectGoalDescriptionRolloutBatch(parseSelectionArgs(argv))
    console.log(`${JSON.stringify(selection, null, 2)}\n`)
    return
  }
  const args = parseArgs(argv)
  if (args.mode === 'prepare') {
    const prepared = await prepareGoalDescriptionRolloutBatch(args.configPath)
    console.log(
      `Standalone goal-description batch prepared: ${prepared.manifest.batchId}; goals=${prepared.manifest.goalIds.length}; model=${prepared.model.digest}; bundle=${prepared.bundle.bundleFingerprint}`,
    )
    return
  }
  if (args.mode === 'check') {
    const prepared = await validatePreparedGoalDescriptionRolloutBatch(args.configPath)
    console.log(`Standalone goal-description batch valid: ${prepared.manifest.batchId}; goals=${prepared.manifest.goalIds.length}`)
    return
  }
  if (args.mode === 'summarize') {
    const result = await materializeGoalDescriptionRolloutBatchDualSummary(args.configPath, args.write)
    console.log(
      `Standalone dual summary ${args.write ? 'materialized' : 'valid'}: ${result.prepared.manifest.batchId}; goals=${result.summary.goalCount}; requiresSynthesis=${result.summary.counts.requiresSynthesis}`,
    )
    return
  }
  const result = await materializeGoalDescriptionRolloutBatchResolutionIndex(args.configPath, args.write)
  console.log(
    `Standalone resolution index ${args.write ? 'materialized' : 'valid'}: ${result.prepared.manifest.batchId}; strict=${result.index.resolutions.length}/${result.index.batchGoalIds.length}; live denominator owned by central report`,
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
