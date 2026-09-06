import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import {
  loadGoalBookBuildInputs,
  parseAndValidateGoalBookModel,
  stableGoalBookJson,
  type GoalBookConfigFile,
  type GoalBookModel,
} from './goalBookModel'
import {
  goalBookFrontMatterPageCount,
  inspectGoalBookPdfArtifact,
} from './goalBookRenderer'
import { buildGoalBookOriginalSources, serializeGoalBookOriginalSources } from './goalBookOriginalSources'
import { checkGoalBookSourceAtlasInputs, readGoalBookSourceAtlasInputConfig, type GoalBookSourceAtlasInputConfig } from './goalBookSourceAtlasInputs'
import { MAX_GOAL_BOOK_ORIGINAL_SOURCES_BYTES, parseGoalBookOriginalSources } from '../src/utils/goalBookOriginalSources'
import {
  DEFAULT_GOAL_BOOK_ID,
  GOAL_BOOK_PUBLICATION_REGISTRY,
  goalBookDefinitionById,
  goalBookModelUrl,
  goalBookPdfUrl,
  goalBookRenderManifestUrl,
  type GoalBookPublicationDefinition,
} from '../src/utils/goalBookPublicationRegistry'

const APP_ROOT = fileURLToPath(new URL('../', import.meta.url))
const REPOSITORY_ROOT = resolve(APP_ROOT, '..')
const PUBLICATION_ROOT = resolve(APP_ROOT, 'public', 'lernzielbuch')
const RENDER_MANIFEST_SCHEMA_PATH = resolve(
  REPOSITORY_ROOT,
  'contracts/goal-book/v1/goal-book-render-manifest-v2.schema.json',
)

const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/u
const MAX_MODEL_BYTES = 8 * 1024 * 1024
const MAX_PDF_BYTES = 90 * 1024 * 1024
const BOUNDED_ATLAS_PRINT_PROFILE = 'chromium-canvas-bounded-atlas-v1'
const PUBLIC_ORIGIN = 'https://skillpilot.com'
const FEEDBACK_URL = `${PUBLIC_ORIGIN}/lernziel-feedback`
const FORBIDDEN_MODEL_KEYS = new Set([
  'skillpilotId',
  'learnerId',
  'learningSessionId',
  'mastery',
  'accessToken',
  'refreshToken',
  'transcript',
])

export type GoalBookPublicationIndex = {
  schemaVersion: 1
  books: Array<{
    bookId: string
    title: string
    locale: string
    publicationMode: 'review' | 'public'
    pageCount: number
    model: {
      url: string
      sha256: string
      modelDigest: string
    }
    pdf: {
      url: string
      sha256: string
      renderManifestUrl: string
      renderManifestSha256: string
    }
  }>
}

export type GoalBookPublicationPaths = {
  bookId: string
  indexPath: string
  modelPath: string
  originalSourcesPath: string
  pdfPath: string
  renderManifestPath: string
  configPath: string
  renderManifestSchemaPath: string
}

export const goalBookPublicationPaths = (
  definition: GoalBookPublicationDefinition,
  publicationRoot = PUBLICATION_ROOT,
): GoalBookPublicationPaths => ({
  bookId: definition.bookId,
  indexPath: resolve(publicationRoot, 'index.json'),
  modelPath: resolve(publicationRoot, `${definition.artifactStem}.book-model.json`),
  originalSourcesPath: resolve(publicationRoot, `${definition.artifactStem}.original-sources.json`),
  pdfPath: resolve(publicationRoot, `${definition.artifactStem}.pdf`),
  renderManifestPath: resolve(
    publicationRoot,
    `${definition.artifactStem}.pdf.render-manifest.json`,
  ),
  configPath: resolve(APP_ROOT, definition.configPath),
  renderManifestSchemaPath: RENDER_MANIFEST_SCHEMA_PATH,
})

const defaultGoalBookDefinition = goalBookDefinitionById(DEFAULT_GOAL_BOOK_ID)
if (!defaultGoalBookDefinition) throw new Error('Default goal-book publication is not registered')

export const defaultGoalBookPublicationPaths = Object.freeze(
  goalBookPublicationPaths(defaultGoalBookDefinition),
) satisfies GoalBookPublicationPaths

const fail = (message: string): never => {
  throw new Error(`Published goal book: ${message}`)
}

const parseJson = (raw: string, label: string): unknown => {
  try {
    return JSON.parse(raw)
  } catch (error) {
    fail(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(`${label} must be an object`)
  }
  return value as Record<string, unknown>
}

const exactKeys = (
  record: Record<string, unknown>,
  expectedKeys: readonly string[],
  label: string,
) => {
  const actual = Object.keys(record).sort()
  const expected = [...expectedKeys].sort()
  if (stableGoalBookJson(actual) !== stableGoalBookJson(expected)) {
    fail(`${label} keys must be exactly ${expected.join(', ')}; received ${actual.join(', ')}`)
  }
}

const requiredString = (record: Record<string, unknown>, key: string, label: string): string => {
  const value = record[key]
  if (typeof value === 'string' && value.trim()) return value
  return fail(`${label}.${key} must be a non-empty string`)
}

const requiredSha256 = (record: Record<string, unknown>, key: string, label: string): string => {
  const value = requiredString(record, key, label)
  if (!SHA256_PATTERN.test(value)) fail(`${label}.${key} must be a sha256: digest`)
  return value
}

const sha256 = (bytes: Uint8Array): string => (
  `sha256:${createHash('sha256').update(bytes).digest('hex')}`
)

export const parseGoalBookPublicationIndex = (raw: string): GoalBookPublicationIndex => {
  const index = asRecord(parseJson(raw, 'index.json'), 'index.json')
  exactKeys(index, ['schemaVersion', 'books'], 'index.json')
  if (index.schemaVersion !== 1) fail('index.json.schemaVersion must be 1')
  const books = index.books
  if (
    !Array.isArray(books)
    || books.length !== GOAL_BOOK_PUBLICATION_REGISTRY.length
  ) {
    fail('index.json.books must contain exactly the complete publication registry')
  }
  const seenBookIds = new Set<string>()
  let previousRegistryIndex = -1
  for (const [indexPosition, item] of (books as unknown[]).entries()) {
    const label = `index.json.books[${indexPosition}]`
    const book = asRecord(item, label)
    exactKeys(
      book,
      ['bookId', 'title', 'locale', 'publicationMode', 'pageCount', 'model', 'pdf'],
      label,
    )
    const bookId = requiredString(book, 'bookId', label)
    const definition = goalBookDefinitionById(bookId)
    if (!definition) fail(`${label}.bookId is not in the closed publication registry`)
    const registryIndex = GOAL_BOOK_PUBLICATION_REGISTRY.findIndex(
      (candidate) => candidate.bookId === definition.bookId,
    )
    if (seenBookIds.has(bookId)) fail(`${label}.bookId is duplicated`)
    if (registryIndex <= previousRegistryIndex) {
      fail(`${label}.bookId is outside the canonical registry order`)
    }
    previousRegistryIndex = registryIndex
    seenBookIds.add(bookId)

    const model = asRecord(book.model, `${label}.model`)
    exactKeys(model, ['url', 'sha256', 'modelDigest'], `${label}.model`)
    const pdf = asRecord(book.pdf, `${label}.pdf`)
    exactKeys(
      pdf,
      ['url', 'sha256', 'renderManifestUrl', 'renderManifestSha256'],
      `${label}.pdf`,
    )

    const publicationMode = requiredString(book, 'publicationMode', label)
    if (publicationMode !== 'review' && publicationMode !== 'public') {
      fail(`${label}.publicationMode must be review or public`)
    }
    if (!Number.isInteger(book.pageCount) || Number(book.pageCount) < 1) {
      fail(`${label}.pageCount must be a positive integer`)
    }
    const expectedModelUrl = goalBookModelUrl(definition)
    const expectedPdfUrl = goalBookPdfUrl(definition)
    const expectedRenderManifestUrl = goalBookRenderManifestUrl(definition)
    if (requiredString(model, 'url', `${label}.model`) !== expectedModelUrl) {
      fail(`${label}.model.url must be exactly ${expectedModelUrl}`)
    }
    if (requiredString(pdf, 'url', `${label}.pdf`) !== expectedPdfUrl) {
      fail(`${label}.pdf.url must be exactly ${expectedPdfUrl}`)
    }
    if (requiredString(pdf, 'renderManifestUrl', `${label}.pdf`) !== expectedRenderManifestUrl) {
      fail(`${label}.pdf.renderManifestUrl must be exactly ${expectedRenderManifestUrl}`)
    }
    requiredSha256(model, 'sha256', `${label}.model`)
    requiredSha256(model, 'modelDigest', `${label}.model`)
    requiredSha256(pdf, 'sha256', `${label}.pdf`)
    requiredSha256(pdf, 'renderManifestSha256', `${label}.pdf`)
    requiredString(book, 'title', label)
    requiredString(book, 'locale', label)
  }
  return index as GoalBookPublicationIndex
}

const expectedPageBindings = (model: GoalBookModel) => model.pages.map((page) => ({
  pageNumber: page.pageNumber,
  goalId: page.goalId,
  anchor: page.anchor,
  chapterIds: page.chapterIds,
  goalFingerprint: page.goalFingerprint,
  pageFingerprint: page.pageFingerprint,
}))

const verifyPdfHeaderAndTrailer = (pdf: Buffer) => {
  if (
    pdf.length < 1_000
    || pdf.length > MAX_PDF_BYTES
    || pdf.subarray(0, 5).toString('ascii') !== '%PDF-'
  ) {
    fail('PDF artifact has no valid PDF header or is outside the approved size budget')
  }
  const trailer = pdf.subarray(Math.max(0, pdf.length - 1_024)).toString('latin1')
  if (!trailer.includes('%%EOF')) fail('PDF artifact has no EOF marker')
  const source = pdf.toString('latin1')
  for (const forbiddenToken of ['/JavaScript', '/JS ', '/AcroForm', '/EmbeddedFile', '/Encrypt']) {
    if (source.includes(forbiddenToken)) fail(`PDF contains forbidden active token ${forbiddenToken}`)
  }
}

const assertNoLearnerDataKeys = (value: unknown, path = '$') => {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertNoLearnerDataKeys(entry, `${path}[${index}]`))
    return
  }
  if (!value || typeof value !== 'object') return
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_MODEL_KEYS.has(key)) fail(`learner-private key ${path}.${key} is forbidden`)
    assertNoLearnerDataKeys(entry, `${path}.${key}`)
  }
}

export const assertCanonicalRelationUrls = (model: GoalBookModel) => {
  const externalReferences = model.pages.flatMap((page) => [
    ...page.externalPrerequisites,
    ...page.externalReverseRequires,
  ])
  for (const reference of externalReferences) {
    if (reference.canonicalUrl === null) continue
    const url = new URL(reference.canonicalUrl)
    const parameterKeys = [...url.searchParams.keys()]
    if (
      url.origin !== PUBLIC_ORIGIN
      || url.pathname !== '/lernzielbuch'
      || url.username !== ''
      || url.password !== ''
      || url.hash !== `#goal-${reference.goalId}`
      || parameterKeys.length !== 2
      || new Set(parameterKeys).size !== 2
      || !parameterKeys.includes('landscape')
      || !parameterKeys.includes('edition')
      || url.searchParams.get('landscape') !== model.book.landscapeId
      || url.searchParams.get('edition') !== model.book.edition
    ) {
      fail(`external relation ${reference.goalId} has an unsafe canonical URL`)
    }
  }
}

export const assertGoalBookSourceAtlasConfigBinding = (
  source: Pick<GoalBookSourceAtlasInputConfig, 'bookId' | 'landscapePath' | 'semanticKindLedgerPath' | 'manifestPath'>,
  config: Pick<GoalBookConfigFile, 'bookId' | 'landscapePath' | 'semanticKindLedgerPath' | 'compositionViewManifestPath'>,
): void => {
  if (source.bookId !== config.bookId
    || source.landscapePath !== config.landscapePath
    || source.semanticKindLedgerPath !== config.semanticKindLedgerPath
    || source.manifestPath !== config.compositionViewManifestPath) {
    fail('source-derived atlas input companion does not match the native book config')
  }
}

export const verifyPublishedGoalBook = async (
  paths: GoalBookPublicationPaths = defaultGoalBookPublicationPaths,
) => {
  const sourceAtlasDefinition = goalBookDefinitionById(paths.bookId)
  const needsSourceAtlasInputs = sourceAtlasDefinition?.subject === 'chemistry'
    || sourceAtlasDefinition?.subject === 'biology'
  if (needsSourceAtlasInputs && !paths.configPath.endsWith('.json')) {
    fail('source-derived atlas config must have a JSON input companion')
  }
  const companionPath = relative(REPOSITORY_ROOT, paths.configPath).replace(/\.json$/u, '.inputs.json')
  const sourceAtlasConfig = needsSourceAtlasInputs
    ? readGoalBookSourceAtlasInputConfig(companionPath, REPOSITORY_ROOT) : null
  const sourceAtlasInputs = sourceAtlasConfig
    ? checkGoalBookSourceAtlasInputs(companionPath, REPOSITORY_ROOT) : null
  if (sourceAtlasInputs && sourceAtlasInputs.receipt.bookId !== paths.bookId) {
    fail('source-derived atlas input companion belongs to a different book')
  }
  const [
    indexRaw,
    publishedModelRaw,
    pdf,
    renderManifestRaw,
    renderManifestSchemaRaw,
    currentBuild,
  ] = await Promise.all([
    readFile(paths.indexPath, 'utf8'),
    readFile(paths.modelPath, 'utf8'),
    readFile(paths.pdfPath),
    readFile(paths.renderManifestPath, 'utf8'),
    readFile(paths.renderManifestSchemaPath, 'utf8'),
    loadGoalBookBuildInputs(paths.configPath),
  ])
  if (sourceAtlasInputs && sourceAtlasConfig) {
    assertGoalBookSourceAtlasConfigBinding(sourceAtlasConfig, currentBuild.config)
    const checkedPaths = new Set(Object.keys(sourceAtlasInputs.outputs))
    const source = currentBuild.model.source
    if ([source.compositionViewManifestPath, source.navigationViewPath,
      ...(source.compositionViewSources ?? []).map(({ path }) => path),
    ].some((path) => !path || !checkedPaths.has(path))) {
      fail('published atlas projection is not bound to its checked source inputs')
    }
  }

  const index = parseGoalBookPublicationIndex(indexRaw)
  const indexBook = index.books.find(({ bookId }) => bookId === paths.bookId)
  if (!indexBook) fail(`registered book ${paths.bookId} is missing from index.json`)
  const definition = goalBookDefinitionById(paths.bookId)
  if (!definition) fail(`book ${paths.bookId} is missing from the publication registry`)
  if (Buffer.byteLength(publishedModelRaw, 'utf8') > MAX_MODEL_BYTES) {
    fail('published BookModel exceeds the browser runtime size budget')
  }
  const publishedModel = parseAndValidateGoalBookModel(publishedModelRaw)
  if (publishedModel.book.landscapeId !== definition.landscapeId) {
    fail('BookModel landscapeId differs from the closed publication registry')
  }
  if (publishedModel.book.edition !== definition.edition) {
    fail('BookModel edition differs from the closed publication registry')
  }
  assertNoLearnerDataKeys(publishedModel)
  assertCanonicalRelationUrls(publishedModel)
  const expectedSerializedModel = `${JSON.stringify(currentBuild.model, null, 2)}\n`
  if (publishedModelRaw !== expectedSerializedModel) {
    fail('published BookModel is stale relative to its canonical config and inputs')
  }
  if (stableGoalBookJson(publishedModel) !== stableGoalBookJson(currentBuild.model)) {
    fail('published BookModel semantics differ from the current canonical build')
  }

  // The supplement contains evidence only. It cannot alter the shared goal,
  // applicability, PDF or feedback model, and must match current source inputs.
  const originalSources = await buildGoalBookOriginalSources(publishedModel)
  const originalSourcesRaw = await readFile(paths.originalSourcesPath, 'utf8')
  if (Buffer.byteLength(originalSourcesRaw) > MAX_GOAL_BOOK_ORIGINAL_SOURCES_BYTES) {
    fail('original sources exceed the browser runtime size budget')
  }
  if (originalSourcesRaw !== serializeGoalBookOriginalSources(originalSources)) {
    fail('original sources are stale; run npm run build:goal-book-original-sources')
  }
  parseGoalBookOriginalSources(originalSources, publishedModel)

  const modelSha256 = sha256(Buffer.from(publishedModelRaw, 'utf8'))
  const pdfSha256 = sha256(pdf)
  const renderManifestSha256 = sha256(Buffer.from(renderManifestRaw, 'utf8'))
  if (indexBook.model.sha256 !== modelSha256) fail('BookModel byte digest does not match index.json')
  if (indexBook.pdf.sha256 !== pdfSha256) fail('PDF byte digest does not match index.json')
  if (indexBook.pdf.renderManifestSha256 !== renderManifestSha256) {
    fail('render-manifest byte digest does not match index.json')
  }
  verifyPdfHeaderAndTrailer(pdf)
  await inspectGoalBookPdfArtifact(paths.pdfPath, publishedModel, FEEDBACK_URL)

  const renderManifest = parseJson(renderManifestRaw, 'PDF render manifest')
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  addFormats(ajv)
  const renderManifestSchema = asRecord(
    parseJson(renderManifestSchemaRaw, 'goal-book render-manifest schema'),
    'goal-book render-manifest schema',
  )
  const validateRenderManifest = ajv.compile(renderManifestSchema)
  if (!validateRenderManifest(renderManifest)) {
    fail(`PDF render manifest violates its closed schema: ${ajv.errorsText(
      validateRenderManifest.errors,
      { separator: '; ' },
    )}`)
  }
  const manifest = renderManifest as Record<string, unknown>
  if (manifest.format !== 'pdf') fail('render manifest must describe the PDF artifact')
  if (manifest.artifactSha256 !== pdfSha256) fail('render manifest PDF digest is stale')
  if (manifest.modelDigest !== publishedModel.digest) fail('render manifest model digest is stale')
  if (manifest.bookId !== publishedModel.book.id) fail('render manifest bookId is stale')
  if (manifest.bookEdition !== publishedModel.book.edition) {
    fail('render manifest bookEdition is stale')
  }
  if (manifest.atlasBaseUrl !== publishedModel.book.atlasBaseUrl) {
    fail('render manifest atlasBaseUrl is stale')
  }
  if (manifest.feedbackBaseUrl !== FEEDBACK_URL) fail('render manifest feedbackBaseUrl is unsafe')
  if (manifest.publicationMode !== publishedModel.book.publicationMode) {
    fail('render manifest publicationMode is stale')
  }
  if (manifest.pageCount !== publishedModel.pages.length) fail('render manifest pageCount is stale')
  if (manifest.goalPageCount !== publishedModel.pages.length) {
    fail('render manifest goalPageCount is stale')
  }
  const expectedFrontMatterPageCount = goalBookFrontMatterPageCount(publishedModel)
  if (manifest.frontMatterPageCount !== expectedFrontMatterPageCount) {
    fail('render manifest frontMatterPageCount is stale')
  }
  if (
    manifest.physicalPageCount
    !== publishedModel.pages.length + expectedFrontMatterPageCount
  ) {
    fail('render manifest physicalPageCount is stale')
  }
  if (manifest.artifactSizeLimitBytes !== MAX_PDF_BYTES) {
    fail('render manifest artifact-size budget is not the nationwide atlas budget')
  }
  const printDerivativePolicy = asRecord(
    manifest.printDerivativePolicy,
    'PDF render manifest printDerivativePolicy',
  )
  if (printDerivativePolicy.version !== BOUNDED_ATLAS_PRINT_PROFILE) {
    fail('render manifest does not use the bounded nationwide-atlas print profile')
  }
  if (stableGoalBookJson(manifest.chapters) !== stableGoalBookJson(publishedModel.chapters)) {
    fail('render manifest chapter bindings are stale')
  }
  if (stableGoalBookJson(manifest.pages) !== stableGoalBookJson(expectedPageBindings(publishedModel))) {
    fail('render manifest page bindings are stale')
  }

  if (indexBook.bookId !== publishedModel.book.id) fail('index bookId is stale')
  if (indexBook.title !== publishedModel.book.title) fail('index title is stale')
  if (indexBook.locale !== publishedModel.book.locale) fail('index locale is stale')
  if (indexBook.publicationMode !== publishedModel.book.publicationMode) {
    fail('index publicationMode is stale')
  }
  if (indexBook.pageCount !== publishedModel.pages.length) fail('index pageCount is stale')
  if (indexBook.model.modelDigest !== publishedModel.digest) fail('index modelDigest is stale')

  return {
    index,
    model: publishedModel,
    modelSha256,
    pdfSha256,
    renderManifestSha256,
  }
}

export const verifyPublishedGoalBooks = async (): Promise<Awaited<
  ReturnType<typeof verifyPublishedGoalBook>
>[]> => {
  const index = parseGoalBookPublicationIndex(
    await readFile(defaultGoalBookPublicationPaths.indexPath, 'utf8'),
  )
  return Promise.all(index.books.map((book) => {
    const definition = goalBookDefinitionById(book.bookId)
    if (!definition) return fail(`registered book ${book.bookId} has no publication definition`)
    return verifyPublishedGoalBook(goalBookPublicationPaths(definition))
  }))
}

const isMain = process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href

if (isMain) {
  verifyPublishedGoalBooks().then((verifiedBooks) => {
    for (const { model, pdfSha256 } of verifiedBooks) {
      console.log(
        `Published goal book verified: ${model.book.id}; ${model.pages.length} pages; ${pdfSha256}`,
      )
    }
  }).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
