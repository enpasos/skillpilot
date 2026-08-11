import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import {
  loadGoalBookBuildInputs,
  parseAndValidateGoalBookModel,
  stableGoalBookJson,
  type GoalBookModel,
} from './goalBookModel'

const APP_ROOT = fileURLToPath(new URL('../', import.meta.url))
const REPOSITORY_ROOT = resolve(APP_ROOT, '..')
const PUBLICATION_ROOT = resolve(APP_ROOT, 'public', 'lernzielbuch')
const CONFIG_PATH = resolve(
  APP_ROOT,
  'scripts/config/goal-books/de-gym-math-national-atlas.json',
)
const RENDER_MANIFEST_SCHEMA_PATH = resolve(
  REPOSITORY_ROOT,
  'contracts/goal-book/v1/goal-book-render-manifest.schema.json',
)

const BOOK_FILE_STEM = 'de-gym-mathematik-bundesweit'
const MODEL_URL = `/lernzielbuch/${BOOK_FILE_STEM}.book-model.json`
const PDF_URL = `/lernzielbuch/${BOOK_FILE_STEM}.pdf`
const RENDER_MANIFEST_URL = `${PDF_URL}.render-manifest.json`
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
  indexPath: string
  modelPath: string
  pdfPath: string
  renderManifestPath: string
  configPath: string
  renderManifestSchemaPath: string
}

export const defaultGoalBookPublicationPaths = Object.freeze({
  indexPath: resolve(PUBLICATION_ROOT, 'index.json'),
  modelPath: resolve(PUBLICATION_ROOT, `${BOOK_FILE_STEM}.book-model.json`),
  pdfPath: resolve(PUBLICATION_ROOT, `${BOOK_FILE_STEM}.pdf`),
  renderManifestPath: resolve(
    PUBLICATION_ROOT,
    `${BOOK_FILE_STEM}.pdf.render-manifest.json`,
  ),
  configPath: CONFIG_PATH,
  renderManifestSchemaPath: RENDER_MANIFEST_SCHEMA_PATH,
}) satisfies GoalBookPublicationPaths

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

const parsePublicationIndex = (raw: string): GoalBookPublicationIndex => {
  const index = asRecord(parseJson(raw, 'index.json'), 'index.json')
  exactKeys(index, ['schemaVersion', 'books'], 'index.json')
  if (index.schemaVersion !== 1) fail('index.json.schemaVersion must be 1')
  const books = index.books
  if (!Array.isArray(books) || books.length !== 1) {
    fail('index.json.books must contain exactly the published nationwide mathematics atlas')
  }
  const book = asRecord((books as unknown[])[0], 'index.json.books[0]')
  exactKeys(
    book,
    ['bookId', 'title', 'locale', 'publicationMode', 'pageCount', 'model', 'pdf'],
    'index.json.books[0]',
  )
  const model = asRecord(book.model, 'index.json.books[0].model')
  exactKeys(model, ['url', 'sha256', 'modelDigest'], 'index.json.books[0].model')
  const pdf = asRecord(book.pdf, 'index.json.books[0].pdf')
  exactKeys(
    pdf,
    ['url', 'sha256', 'renderManifestUrl', 'renderManifestSha256'],
    'index.json.books[0].pdf',
  )

  const publicationMode = requiredString(book, 'publicationMode', 'index.json.books[0]')
  if (publicationMode !== 'review' && publicationMode !== 'public') {
    fail('index.json.books[0].publicationMode must be review or public')
  }
  if (!Number.isInteger(book.pageCount) || Number(book.pageCount) < 1) {
    fail('index.json.books[0].pageCount must be a positive integer')
  }
  if (requiredString(model, 'url', 'index.json.books[0].model') !== MODEL_URL) {
    fail(`model URL must be exactly ${MODEL_URL}`)
  }
  if (requiredString(pdf, 'url', 'index.json.books[0].pdf') !== PDF_URL) {
    fail(`PDF URL must be exactly ${PDF_URL}`)
  }
  if (
    requiredString(pdf, 'renderManifestUrl', 'index.json.books[0].pdf')
    !== RENDER_MANIFEST_URL
  ) {
    fail(`render-manifest URL must be exactly ${RENDER_MANIFEST_URL}`)
  }
  requiredSha256(model, 'sha256', 'index.json.books[0].model')
  requiredSha256(model, 'modelDigest', 'index.json.books[0].model')
  requiredSha256(pdf, 'sha256', 'index.json.books[0].pdf')
  requiredSha256(pdf, 'renderManifestSha256', 'index.json.books[0].pdf')
  requiredString(book, 'bookId', 'index.json.books[0]')
  requiredString(book, 'title', 'index.json.books[0]')
  requiredString(book, 'locale', 'index.json.books[0]')

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

const assertCanonicalRelationUrls = (model: GoalBookModel) => {
  const externalReferences = model.pages.flatMap((page) => [
    ...page.externalPrerequisites,
    ...page.externalReverseRequires,
  ])
  for (const reference of externalReferences) {
    if (reference.canonicalUrl === null) continue
    const url = new URL(reference.canonicalUrl)
    if (
      url.origin !== PUBLIC_ORIGIN
      || url.pathname !== '/lernzielbuch'
      || url.hash !== `#goal-${reference.goalId}`
    ) {
      fail(`external relation ${reference.goalId} has an unsafe canonical URL`)
    }
  }
}

export const verifyPublishedGoalBook = async (
  paths: GoalBookPublicationPaths = defaultGoalBookPublicationPaths,
) => {
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

  const index = parsePublicationIndex(indexRaw)
  const indexBook = index.books[0]
  if (Buffer.byteLength(publishedModelRaw, 'utf8') > MAX_MODEL_BYTES) {
    fail('published BookModel exceeds the browser runtime size budget')
  }
  const publishedModel = parseAndValidateGoalBookModel(publishedModelRaw)
  assertNoLearnerDataKeys(publishedModel)
  assertCanonicalRelationUrls(publishedModel)
  const expectedSerializedModel = `${JSON.stringify(currentBuild.model, null, 2)}\n`
  if (publishedModelRaw !== expectedSerializedModel) {
    fail('published BookModel is stale relative to its canonical config and inputs')
  }
  if (stableGoalBookJson(publishedModel) !== stableGoalBookJson(currentBuild.model)) {
    fail('published BookModel semantics differ from the current canonical build')
  }

  const modelSha256 = sha256(Buffer.from(publishedModelRaw, 'utf8'))
  const pdfSha256 = sha256(pdf)
  const renderManifestSha256 = sha256(Buffer.from(renderManifestRaw, 'utf8'))
  if (indexBook.model.sha256 !== modelSha256) fail('BookModel byte digest does not match index.json')
  if (indexBook.pdf.sha256 !== pdfSha256) fail('PDF byte digest does not match index.json')
  if (indexBook.pdf.renderManifestSha256 !== renderManifestSha256) {
    fail('render-manifest byte digest does not match index.json')
  }
  verifyPdfHeaderAndTrailer(pdf)

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

const isMain = process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href

if (isMain) {
  verifyPublishedGoalBook().then(({ model, pdfSha256 }) => {
    console.log(
      `Published goal book verified: ${model.book.id}; ${model.pages.length} pages; ${pdfSha256}`,
    )
  }).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
