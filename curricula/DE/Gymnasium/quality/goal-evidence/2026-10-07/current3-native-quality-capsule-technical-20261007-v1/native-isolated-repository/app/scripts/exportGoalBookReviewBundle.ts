import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import type { GoalEvidenceReviewRecord } from './goalEvidenceProfileModel'
import {
  parseAndValidateGoalBookModel,
  stableGoalBookJson,
  type GoalBookModel,
  type GoalBookPage,
} from './goalBookModel'
import {
  goalBookFrontMatterPageCount,
  type GoalBookRenderManifest,
} from './goalBookRenderer'

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const DEFAULT_PROMPT_PATH = 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-evidence-review-v1.md'
const DEFAULT_CRITERIA_PATH = 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-evidence-review-criteria-v1.md'
const RENDER_MANIFEST_SCHEMA_PATH = 'contracts/goal-book/v1/goal-book-render-manifest-v2.schema.json'
const BUNDLE_SCHEMA_PATH = 'contracts/goal-book/v1/goal-book-review-bundle.schema.json'
const FINDING_SCHEMA_PATH = 'contracts/goal-evidence/v1/goal-evidence-finding.schema.json'
const RUN_SCHEMA_PATH = 'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json'

type ArtifactRole =
  | 'book_pdf'
  | 'book_pdf_render_manifest'
  | 'book_html'
  | 'book_html_render_manifest'
  | 'book_model'
  | 'review_input_json'
  | 'review_input_jsonl'
  | 'review_markdown'
  | 'review_prompt'
  | 'review_criteria'
  | 'finding_schema'
  | 'run_manifest_schema'

type BundleArtifact = {
  role: ArtifactRole
  path: string
  digest: string
  bytes: number
}

export type GoalBookReviewBundleManifest = {
  $schema: 'https://skillpilot.com/schemas/goal-book/v1/goal-book-review-bundle.schema.json'
  schemaVersion: 1
  bundleFingerprint: string
  bookModelDigest: string
  bookModelSchemaVersion: '1.0.0' | '1.1.0'
  bookId: string
  bookEdition: string
  publicationMode: 'review' | 'public'
  feedbackBaseUrl: string
  locale: string
  selectedGoalCount: number
  goals: Array<{
    goalId: string
    pageNumber: number
    goalFingerprint: string
    pageFingerprint: string
    evidenceReview: GoalBookPage['evidenceReview']
  }>
  promptFingerprint: string
  criteriaFingerprint: string
  artifacts: BundleArtifact[]
  reviewPolicy: {
    blindIndependentFirstPass: true
    modelVotesGrantReleaseAuthority: false
    humanApprovalRequired: true
    learnerDataAllowed: false
  }
}

export type GoalBookReviewInput = {
  schemaVersion: 1
  book: GoalBookModel['book']
  modelDigest: string
  pages: Array<{
    page: GoalBookPage
    evidenceProfile: GoalEvidenceReviewRecord | null
  }>
}

export type ExportOptions = {
  modelPath: string
  pdfPath: string
  pdfRenderManifestPath: string
  htmlPath?: string
  htmlRenderManifestPath?: string
  outputDirectory: string
  promptPath: string
  criteriaPath: string
  goalIds: string[]
}

type PreparedFile = {
  role: ArtifactRole
  relativePath: string
  content: Buffer
}

const sha256 = (value: string | Buffer) => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

const repositoryPath = (configuredPath: string, label: string) => {
  const absolutePath = resolve(REPOSITORY_ROOT, configuredPath)
  const relativePath = relative(REPOSITORY_ROOT, absolutePath)
  if (
    relativePath === '..'
    || relativePath.startsWith(`..${sep}`)
    || relativePath === ''
  ) {
    throw new Error(`${label} must resolve to a file inside the repository: ${configuredPath}`)
  }
  return absolutePath
}

const parseJson = <T>(content: Buffer | string, label: string): T => {
  try {
    return JSON.parse(content.toString()) as T
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const parseEvidenceReviewJsonl = (content: string, label: string) => content
  .split(/\r?\n/u)
  .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
  .filter(({ line }) => line !== '')
  .map(({ line, lineNumber }) => parseJson<GoalEvidenceReviewRecord>(line, `${label}:${lineNumber}`))

const loadEvidenceRecords = async (model: GoalBookModel) => {
  const recordsByGoalId = new Map<string, GoalEvidenceReviewRecord>()
  for (const source of model.source.evidenceReviewSources) {
    const sourcePath = repositoryPath(source.path, 'evidence-review source')
    const text = await readFile(sourcePath, 'utf8')
    const records = parseEvidenceReviewJsonl(text, source.path)
    const actualDigest = sha256(stableGoalBookJson(records))
    if (actualDigest !== source.digest) {
      throw new Error(
        `Evidence-review source ${source.path} changed: ${actualDigest} != ${source.digest}`,
      )
    }
    for (const record of records) {
      if (recordsByGoalId.has(record.goalId)) {
        throw new Error(`Duplicate evidence-review record for ${record.goalId}`)
      }
      recordsByGoalId.set(record.goalId, record)
    }
  }
  return recordsByGoalId
}

const selectPages = (model: GoalBookModel, requestedGoalIds: string[]) => {
  if (requestedGoalIds.length === 0) return [...model.pages]
  const requested = new Set<string>()
  requestedGoalIds.forEach((goalId) => {
    if (requested.has(goalId)) throw new Error(`Duplicate --goal-id ${goalId}`)
    requested.add(goalId)
  })
  const pages = model.pages.filter(({ goalId }) => requested.has(goalId))
  const selectedIds = new Set(pages.map(({ goalId }) => goalId))
  const missing = requestedGoalIds.filter((goalId) => !selectedIds.has(goalId))
  if (missing.length > 0) throw new Error(`Requested goals are absent from the book: ${missing.join(', ')}`)
  return pages
}

const assertEvidenceRecordMatchesPage = (
  page: GoalBookPage,
  record: GoalEvidenceReviewRecord | undefined,
) => {
  if (page.evidenceReview === null) {
    if (record) throw new Error(`Goal ${page.goalId} has an unbound evidence-review record`)
    return null
  }
  if (!record) throw new Error(`Goal ${page.goalId} is missing its bound evidence-review record`)
  if (
    record.reviewId !== page.evidenceReview.reviewId
    || record.goalFingerprint !== page.goalFingerprint
    || record.reviewInputFingerprint !== page.evidenceReview.reviewInputFingerprint
    || record.profileFingerprint !== page.evidenceReview.profileFingerprint
    || record.status !== page.evidenceReview.status
    || record.evidenceLevel !== page.evidenceReview.evidenceLevel
    || record.maximumClaimScope !== page.evidenceReview.maximumClaimScope
  ) {
    throw new Error(`Goal ${page.goalId} evidence-review record does not match the BookModel`)
  }
  return record
}

const markdownList = (
  references: GoalBookPage['requires'] | GoalBookPage['externalPrerequisites'],
) => references.length === 0
  ? '- None'
  : references.map((reference) => (
    `- ${reference.title} — \`${reference.goalId}\`${reference.pageNumber ? ` (page ${reference.pageNumber})` : ' (outside this book)'}`
  )).join('\n')

export const renderGoalBookReviewMarkdown = (input: GoalBookReviewInput) => {
  const sections = input.pages.map(({ page, evidenceProfile }) => {
    const profile = evidenceProfile?.profile
    const profileSection = profile
      ? [
          '### Evidence-profile candidate',
          '',
          `Status: \`${evidenceProfile.status}\`; profile fingerprint: \`${evidenceProfile.profileFingerprint}\``,
          '',
          '**Facets**',
          '',
          ...profile.facets.map((facet) => `- \`${facet.id}\`: ${facet.criterionDe} / ${facet.criterionEn}`),
          '',
          '**Coverage requirements**',
          '',
          `- all facets: ${profile.coverageRequirements.allOf.map((id) => `\`${id}\``).join(', ') || 'None'}`,
          `- alternative facet groups: ${profile.coverageRequirements.anyOf.map((ids) => ids.map((id) => `\`${id}\``).join(' or ')).join('; ') || 'None'}`,
          `- minimum independent checks: ${profile.coverageRequirements.minimumIndependentChecks}`,
          `- changed case required: ${profile.coverageRequirements.requireChangedCase}`,
          `- cue-free transfer required: ${profile.coverageRequirements.requireCueFreeTransfer}`,
          '',
          '**Variation axes**',
          '',
          ...profile.variationAxes.map((axis) => `- \`${axis.id}\`: ${axis.textDe} / ${axis.textEn}`),
          '',
          '**Misconceptions and shallow evidence**',
          '',
          ...profile.misconceptions.map((item) => `- \`${item.id}\`: ${item.signalDe} / ${item.signalEn}`),
          ...profile.nonEvidence.map((item) => `- \`${item.id}\`: ${item.textDe} / ${item.textEn}`),
          '',
          '**Contrast cases**',
          '',
          ...profile.contrastCaseBriefs.map((item) => (
            `- \`${item.id}\`: ${item.purposeDe} — ${item.strengthDe} (${item.whyAlternativesUnderperformDe})`
          )),
          '',
          '**Out of scope**',
          '',
          ...(profile.outOfScope.length > 0
            ? profile.outOfScope.map((item) => `- \`${item.id}\`: ${item.textDe} / ${item.textEn}`)
            : ['- None']),
        ].join('\n')
      : '### Evidence-profile candidate\n\nNo evidence-profile record is bound to this page.'
    const visualization = page.visualization
      ? `${page.visualization.url}\n\n- original digest: \`${page.visualization.originalDigest}\`\n- QA status: \`${page.visualization.qaStatus}\`\n- approved for public publication: \`${page.visualization.approvedForPublication}\``
      : 'No visualization is bound to this page.'
    return [
      `## Page ${page.pageNumber}: ${page.title}`,
      '',
      `- Full learning-goal ID: \`${page.goalId}\``,
      `- Goal fingerprint: \`${page.goalFingerprint}\``,
      `- Page fingerprint: \`${page.pageFingerprint}\``,
      `- Topic path: ${page.breadcrumbs.join(' > ') || 'None'}`,
      '',
      '### Canonical description',
      '',
      page.description,
      '',
      '### Visualization',
      '',
      visualization,
      '',
      '### Direct prerequisites',
      '',
      markdownList(page.requires),
      '',
      '### Direct reverse prerequisites',
      '',
      markdownList(page.reverseRequires),
      '',
      '### Prerequisites outside this book',
      '',
      markdownList(page.externalPrerequisites),
      '',
      '### Direct reverse prerequisites outside this book',
      '',
      markdownList(page.externalReverseRequires),
      '',
      profileSection,
    ].join('\n')
  })
  return [
    `# AI review input: ${input.book.title}`,
    '',
    `- Book ID: \`${input.book.id}\``,
    `- Book edition: \`${input.book.edition}\``,
    `- Publication mode: \`${input.book.publicationMode}\``,
    `- BookModel digest: \`${input.modelDigest}\``,
    `- Selected goals: ${input.pages.length}`,
    '',
    'The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.',
    '',
    ...sections,
    '',
  ].join('\n')
}

const forbiddenPublicationKeys = new Set([
  'learnerId',
  'skillpilotId',
  'learningSessionId',
  'sessionId',
  'mastery',
  'transcript',
  'credential',
  'accessToken',
  'refreshToken',
])

const assertNoLearnerDataKeys = (value: unknown, path = '$') => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoLearnerDataKeys(item, `${path}[${index}]`))
    return
  }
  if (!value || typeof value !== 'object') return
  Object.entries(value as Record<string, unknown>).forEach(([key, nested]) => {
    if (forbiddenPublicationKeys.has(key)) {
      throw new Error(`Review bundle contains forbidden learner/private field ${path}.${key}`)
    }
    assertNoLearnerDataKeys(nested, `${path}.${key}`)
  })
}

const artifact = (file: PreparedFile): BundleArtifact => ({
  role: file.role,
  path: file.relativePath,
  digest: sha256(file.content),
  bytes: file.content.length,
})

const assertRenderManifestBindsArtifact = (
  manifest: GoalBookRenderManifest,
  model: GoalBookModel,
  format: GoalBookRenderManifest['format'],
  artifactBytes: Buffer,
) => {
  const frontMatterPageCount = goalBookFrontMatterPageCount(model)
  if (
    manifest.bookId !== model.book.id
    || manifest.bookEdition !== model.book.edition
    || manifest.publicationMode !== model.book.publicationMode
    || manifest.atlasBaseUrl !== model.book.atlasBaseUrl
    || manifest.modelDigest !== model.digest
    || manifest.format !== format
    || manifest.pageCount !== model.pages.length
    || manifest.goalPageCount !== model.pages.length
    || manifest.frontMatterPageCount !== frontMatterPageCount
    || manifest.physicalPageCount !== model.pages.length + frontMatterPageCount
    || manifest.artifactSha256 !== sha256(artifactBytes)
    || manifest.pages.length !== model.pages.length
    || stableGoalBookJson(manifest.chapters) !== stableGoalBookJson(model.chapters)
  ) {
    throw new Error(`${format.toUpperCase()} render manifest does not bind the supplied model and ${format.toUpperCase()} bytes`)
  }
  model.pages.forEach((page, index) => {
    const boundPage = manifest.pages[index]
    if (
      boundPage?.pageNumber !== page.pageNumber
      || boundPage.goalId !== page.goalId
      || boundPage.anchor !== page.anchor
      || stableGoalBookJson(boundPage.chapterIds) !== stableGoalBookJson(page.chapterIds)
      || boundPage.goalFingerprint !== page.goalFingerprint
      || boundPage.pageFingerprint !== page.pageFingerprint
    ) {
      throw new Error(`${format.toUpperCase()} render manifest page ${index + 1} does not bind the BookModel page`)
    }
  })
}

export const buildGoalBookReviewBundle = async (
  model: GoalBookModel,
  options: ExportOptions,
) => {
  const validatedModel = parseAndValidateGoalBookModel(model)
  if (stableGoalBookJson(validatedModel) !== stableGoalBookJson(model)) {
    throw new Error('Validated BookModel differs from the model supplied to the bundle builder')
  }
  const selectedPages = selectPages(model, options.goalIds)
  if (options.goalIds.length > 0 && selectedPages.length !== model.pages.length) {
    throw new Error(
      'A filtered review bundle requires a dedicated subset BookModel and matching subset HTML/PDF; refusing to pair filtered JSON with full-book artifacts',
    )
  }
  const evidenceRecordsByGoalId = await loadEvidenceRecords(model)
  const input: GoalBookReviewInput = {
    schemaVersion: 1,
    book: model.book,
    modelDigest: model.digest,
    pages: selectedPages.map((page) => ({
      page,
      evidenceProfile: assertEvidenceRecordMatchesPage(
        page,
        evidenceRecordsByGoalId.get(page.goalId),
      ),
    })),
  }
  assertNoLearnerDataKeys(input)

  const [
    modelBytes,
    pdf,
    pdfManifestBytes,
    html,
    htmlManifestBytes,
    prompt,
    criteria,
    findingSchema,
    runSchema,
  ] = await Promise.all([
    readFile(options.modelPath),
    readFile(options.pdfPath),
    readFile(options.pdfRenderManifestPath),
    options.htmlPath ? readFile(options.htmlPath) : Promise.resolve<Buffer | null>(null),
    options.htmlRenderManifestPath
      ? readFile(options.htmlRenderManifestPath)
      : Promise.resolve<Buffer | null>(null),
    readFile(options.promptPath),
    readFile(options.criteriaPath),
    readFile(repositoryPath(FINDING_SCHEMA_PATH, 'finding schema')),
    readFile(repositoryPath(RUN_SCHEMA_PATH, 'run-manifest schema')),
  ])
  const diskModel = parseAndValidateGoalBookModel(parseJson<unknown>(modelBytes, options.modelPath))
  if (stableGoalBookJson(diskModel) !== stableGoalBookJson(model)) {
    throw new Error('BookModel bytes do not match the model supplied to the bundle builder')
  }
  if (!pdf.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
    throw new Error(`Book artifact is not a PDF: ${options.pdfPath}`)
  }
  if (html && !/^<!doctype html>/iu.test(html.toString('utf8', 0, 80))) {
    throw new Error(`Book artifact is not HTML: ${options.htmlPath}`)
  }
  const renderManifestSchema = parseJson<Record<string, unknown>>(
    await readFile(repositoryPath(RENDER_MANIFEST_SCHEMA_PATH, 'render-manifest schema')),
    RENDER_MANIFEST_SCHEMA_PATH,
  )
  const validateRenderManifest = new Ajv2020({ allErrors: true, strict: true }).compile(
    renderManifestSchema,
  )
  const pdfManifest = parseJson<GoalBookRenderManifest>(
    pdfManifestBytes,
    options.pdfRenderManifestPath,
  )
  if (!validateRenderManifest(pdfManifest)) {
    throw new Error(`Invalid PDF render manifest: ${JSON.stringify(validateRenderManifest.errors)}`)
  }
  assertRenderManifestBindsArtifact(pdfManifest, model, 'pdf', pdf)
  if (html !== null) {
    if (!htmlManifestBytes || !options.htmlRenderManifestPath) {
      throw new Error('HTML artifact requires its render manifest')
    }
    const htmlManifest = parseJson<GoalBookRenderManifest>(
      htmlManifestBytes,
      options.htmlRenderManifestPath,
    )
    if (!validateRenderManifest(htmlManifest)) {
      throw new Error(`Invalid HTML render manifest: ${JSON.stringify(validateRenderManifest.errors)}`)
    }
    assertRenderManifestBindsArtifact(htmlManifest, model, 'html', html)
    if (htmlManifest.feedbackBaseUrl !== pdfManifest.feedbackBaseUrl) {
      throw new Error('HTML and PDF render manifests bind different feedback targets')
    }
  }

  const reviewJson = Buffer.from(`${JSON.stringify(input, null, 2)}\n`)
  const reviewJsonl = Buffer.from(`${input.pages.map((page) => JSON.stringify({
    schemaVersion: 1,
    bookId: model.book.id,
    bookDigest: model.digest,
    ...page,
  })).join('\n')}\n`)
  const markdown = Buffer.from(renderGoalBookReviewMarkdown(input))
  const files: PreparedFile[] = [
    { role: 'book_model', relativePath: 'book-model.json', content: modelBytes },
    { role: 'book_pdf', relativePath: 'book.pdf', content: pdf },
    {
      role: 'book_pdf_render_manifest',
      relativePath: 'book.pdf.render-manifest.json',
      content: pdfManifestBytes,
    },
    ...(html && htmlManifestBytes ? [
      { role: 'book_html' as const, relativePath: 'book.html', content: html },
      {
        role: 'book_html_render_manifest' as const,
        relativePath: 'book.html.render-manifest.json',
        content: htmlManifestBytes,
      },
    ] : []),
    { role: 'review_input_json', relativePath: 'review-input.json', content: reviewJson },
    { role: 'review_input_jsonl', relativePath: 'review-input.jsonl', content: reviewJsonl },
    { role: 'review_markdown', relativePath: 'review.md', content: markdown },
    { role: 'review_prompt', relativePath: 'prompt.md', content: prompt },
    { role: 'review_criteria', relativePath: 'criteria.md', content: criteria },
    { role: 'finding_schema', relativePath: 'contracts/goal-evidence-finding.schema.json', content: findingSchema },
    { role: 'run_manifest_schema', relativePath: 'contracts/goal-evidence-ai-run-manifest.schema.json', content: runSchema },
  ]
  const manifestWithoutFingerprint = {
    $schema: 'https://skillpilot.com/schemas/goal-book/v1/goal-book-review-bundle.schema.json' as const,
    schemaVersion: 1 as const,
    bookModelDigest: model.digest,
    bookModelSchemaVersion: model.schemaVersion,
    bookId: model.book.id,
    bookEdition: model.book.edition,
    publicationMode: model.book.publicationMode,
    feedbackBaseUrl: pdfManifest.feedbackBaseUrl,
    locale: model.book.locale,
    selectedGoalCount: selectedPages.length,
    goals: selectedPages.map((page) => ({
      goalId: page.goalId,
      pageNumber: page.pageNumber,
      goalFingerprint: page.goalFingerprint,
      pageFingerprint: page.pageFingerprint,
      evidenceReview: page.evidenceReview,
    })),
    promptFingerprint: sha256(prompt),
    criteriaFingerprint: sha256(criteria),
    artifacts: files.map(artifact),
    reviewPolicy: {
      blindIndependentFirstPass: true as const,
      modelVotesGrantReleaseAuthority: false as const,
      humanApprovalRequired: true as const,
      learnerDataAllowed: false as const,
    },
  }
  const manifest: GoalBookReviewBundleManifest = {
    ...manifestWithoutFingerprint,
    bundleFingerprint: sha256(stableGoalBookJson(manifestWithoutFingerprint)),
  }
  const schema = parseJson<Record<string, unknown>>(
    await readFile(repositoryPath(BUNDLE_SCHEMA_PATH, 'bundle schema')),
    BUNDLE_SCHEMA_PATH,
  )
  const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema)
  if (!validate(manifest)) {
    throw new Error(`Invalid review-bundle manifest: ${JSON.stringify(validate.errors)}`)
  }
  return { manifest, files, input }
}

const parseArgs = (args: string[]): ExportOptions => {
  const values = new Map<string, string>()
  const goalIds: string[] = []
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index]
    if (key === '--goal-id') {
      const value = args[index + 1]
      if (!value) throw new Error('--goal-id requires a value')
      goalIds.push(value)
      index += 1
      continue
    }
    if (!key.startsWith('--')) throw new Error(`Unexpected argument: ${key}`)
    const value = args[index + 1]
    if (!value) throw new Error(`${key} requires a value`)
    values.set(key, value)
    index += 1
  }
  const modelPath = values.get('--model')
  const pdfPath = values.get('--pdf')
  const outputDirectory = values.get('--output')
  if (!modelPath || !pdfPath || !outputDirectory) {
    throw new Error('Usage: tsx scripts/exportGoalBookReviewBundle.ts --model <book-model.json> --pdf <book.pdf> [--html <book.html>] --output <new-directory> [--goal-id <id>]')
  }
  const knownOptions = new Set([
    '--model', '--pdf', '--html', '--output', '--prompt', '--criteria',
  ])
  values.forEach((_value, key) => {
    if (!knownOptions.has(key)) throw new Error(`Unknown option: ${key}`)
  })
  return {
    modelPath: resolve(modelPath),
    pdfPath: resolve(pdfPath),
    pdfRenderManifestPath: resolve(`${pdfPath}.render-manifest.json`),
    ...(values.get('--html') ? { htmlPath: resolve(values.get('--html')!) } : {}),
    ...(values.get('--html')
      ? { htmlRenderManifestPath: resolve(`${values.get('--html')!}.render-manifest.json`) }
      : {}),
    outputDirectory: resolve(outputDirectory),
    promptPath: repositoryPath(values.get('--prompt') ?? DEFAULT_PROMPT_PATH, 'prompt'),
    criteriaPath: repositoryPath(values.get('--criteria') ?? DEFAULT_CRITERIA_PATH, 'criteria'),
    goalIds,
  }
}

const main = async () => {
  const options = parseArgs(process.argv.slice(2))
  const model = parseAndValidateGoalBookModel(
    parseJson<unknown>(await readFile(options.modelPath), options.modelPath),
  )
  const { manifest, files } = await buildGoalBookReviewBundle(model, options)
  await mkdir(dirname(options.outputDirectory), { recursive: true })
  const temporaryDirectory = await mkdtemp(join(dirname(options.outputDirectory), '.goal-book-review-bundle-'))
  try {
    for (const file of files) {
      const outputPath = join(temporaryDirectory, file.relativePath)
      await mkdir(dirname(outputPath), { recursive: true })
      await writeFile(outputPath, file.content, { flag: 'wx' })
    }
    await writeFile(
      join(temporaryDirectory, 'manifest.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
      { flag: 'wx' },
    )
    await rename(temporaryDirectory, options.outputDirectory)
  } catch (error) {
    await rm(temporaryDirectory, { force: true, recursive: true })
    throw error
  }
  console.log(`Goal-book AI review bundle written: ${options.outputDirectory}`)
  console.log(`Goals: ${manifest.selectedGoalCount}; fingerprint: ${manifest.bundleFingerprint}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
