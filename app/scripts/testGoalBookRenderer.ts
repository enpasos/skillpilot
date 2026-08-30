import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import type { GoalBookModel } from './goalBookModel'
import {
  extractGoalBookPdfOutlineTitles,
  injectGoalBookPdfOutline,
  inspectGoalBookPdfArtifact,
  inspectGoalBookPdfOutline,
  goalBookFrontMatterPageCount,
  loadEmbeddedGoalBookVisualizations,
  renderGoalBookHtml,
  writeGoalBookHtml,
  writeGoalBookPdf,
  type GoalBookRenderManifest,
  type GoalBookRenderOptions,
} from './goalBookRenderer'

const GOAL_A = '11111111-1111-4111-8111-111111111111'
const GOAL_B = '22222222-2222-4222-8222-222222222222'
const GOAL_EXTERNAL = '33333333-3333-4333-8333-333333333333'
const GOAL_EXTERNAL_REVERSE = '44444444-4444-4444-8444-444444444444'
const LONG_CHAPTER_TITLE = 'Grundlagen zur sicheren Massenbestimmung in Doppelsternsystemen und Gravitationswellen deuten'
const ATLAS_BASE_URL = 'https://skillpilot.example/learning-goal-atlas'
const atlasUrl = (goalId: string) => (
  `${ATLAS_BASE_URL}?landscape=math-landscape&edition=curricular-atomic-v1#goal-${goalId}`
)
const IMAGE_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
const IMAGE_BYTES = Buffer.from(IMAGE_DATA_URL.split(',')[1], 'base64')
const IMAGE_DIGEST = `sha256:${createHash('sha256').update(IMAGE_BYTES).digest('hex')}`

const model = {
  schemaVersion: '1.1.0',
  book: {
    id: 'math-pilot',
    title: 'Lernzielbuch <Pilot>',
    locale: 'de-DE',
    landscapeId: 'math-landscape',
    viewId: 'math-view',
    scope: { stage: 'pilot' },
    pageCount: 2,
    projectedAtomicGoalCount: 2,
    excludedTargetAtomicGoalCount: 0,
    edition: 'curricular-atomic-v1',
    publicationMode: 'review',
    atlasBaseUrl: ATLAS_BASE_URL,
    oneGoalPerPage: true,
  },
  source: {
    landscapePath: 'curricula/math.json',
    compositionViewPath: 'curricula/math.view.json',
    semanticKindLedgerPath: 'curricula/math.semantic-kind.jsonl',
    goalVisualizationQaPath: 'curricula/math.visualization-qa.json',
    landscapeDigest: `sha256:${'a'.repeat(64)}`,
    compositionViewDigest: `sha256:${'b'.repeat(64)}`,
    semanticKindLedgerDigest: `sha256:${'f'.repeat(64)}`,
    goalVisualizationQaDigest: `sha256:${'0'.repeat(64)}`,
    evidenceReviewSources: [],
    goalFingerprintRuleVersion: 'goal-evidence-v1',
  },
  navigation: {
    schemaVersion: '1.0.0',
    canonicalProjectionSource: {
      path: 'curricula/math.view.json',
      viewId: 'math-view',
      title: 'Lernzielbuch <Pilot>',
      scope: { stage: 'pilot' },
      digest: `sha256:${'b'.repeat(64)}`,
      projectionFingerprint: `sha256:${'8'.repeat(64)}`,
    },
    goalGraph: {
      schemaVersion: '1.0.0',
      landscapeId: 'math-landscape',
      title: 'Mathematik',
      goals: [],
      digest: `sha256:${'7'.repeat(64)}`,
    },
  },
  chapters: [
    {
      chapterId: 'chapter-mathematik',
      label: 'Mathematik',
      parentChapterId: null,
      order: 0,
      treeOrder: 0,
      goalIds: [GOAL_A, GOAL_B],
      pageNumbers: [1, 2],
    },
    {
      chapterId: 'chapter-grundlagen',
      label: LONG_CHAPTER_TITLE,
      parentChapterId: 'chapter-mathematik',
      order: 1,
      treeOrder: 1,
      goalIds: [GOAL_A],
      pageNumbers: [1],
    },
    {
      chapterId: 'chapter-anwendungen',
      label: 'Anwendungen',
      parentChapterId: 'chapter-mathematik',
      order: 2,
      treeOrder: 3,
      goalIds: [GOAL_B],
      pageNumbers: [2],
    },
  ],
  pages: [
    {
      pageNumber: 1,
      navigationOrder: 0,
      treeOrder: 2,
      goalId: GOAL_A,
      anchor: `goal-${GOAL_A}`,
      title: 'Grundlage & Einstieg',
      description: 'Die lernende Person kann eine Grundlage sicher erklären.',
      breadcrumbs: ['Mathematik', LONG_CHAPTER_TITLE],
      chapterIds: ['chapter-mathematik', 'chapter-grundlagen'],
      requires: [],
      reverseRequires: [{
        goalId: GOAL_B,
        title: 'Anwendung <script>alert(1)</script>',
        anchor: `goal-${GOAL_B}`,
        pageNumber: 2,
      }],
      externalPrerequisites: [],
      externalReverseRequires: [{
        goalId: GOAL_EXTERNAL_REVERSE,
        title: 'Extern aufbauendes Ziel',
        canonicalUrl: atlasUrl(GOAL_EXTERNAL_REVERSE),
      }],
      visualization: {
        title: 'Die Grundlage im Überblick',
        url: '/assets/goal-a.png',
        altText: 'Schematische Darstellung der Grundlage',
        resourceType: 'image',
        originalDigest: IMAGE_DIGEST,
        qaStatus: 'review_candidate',
        approvedForPublication: false,
      },
      evidenceReview: null,
      goalFingerprint: `sha256:${'c'.repeat(64)}`,
      pageFingerprint: `sha256:${'1'.repeat(64)}`,
    },
    {
      pageNumber: 2,
      navigationOrder: 1,
      treeOrder: 4,
      goalId: GOAL_B,
      anchor: `goal-${GOAL_B}`,
      title: 'Anwendung <script>alert(1)</script>',
      description: 'Die lernende Person kann die Grundlage in einer neuen Situation anwenden.',
      breadcrumbs: ['Mathematik', 'Anwendungen'],
      chapterIds: ['chapter-mathematik', 'chapter-anwendungen'],
      requires: [{
        goalId: GOAL_A,
        title: 'Grundlage & Einstieg',
        anchor: `goal-${GOAL_A}`,
        pageNumber: 1,
      }],
      reverseRequires: [],
      externalPrerequisites: [{
        goalId: GOAL_EXTERNAL,
        title: 'Externes Ziel',
        canonicalUrl: atlasUrl(GOAL_EXTERNAL),
      }],
      externalReverseRequires: [],
      visualization: null,
      evidenceReview: null,
      goalFingerprint: `sha256:${'d'.repeat(64)}`,
      pageFingerprint: `sha256:${'2'.repeat(64)}`,
    },
  ],
  excludedTargetGoals: [],
  digest: `sha256:${'e'.repeat(64)}`,
} satisfies GoalBookModel

const manifestContractFixture = {
  schemaVersion: 2,
  rendererVersion: 'goal-book-renderer-v2',
  bookId: model.book.id,
  bookEdition: model.book.edition,
  publicationMode: model.book.publicationMode,
  atlasBaseUrl: model.book.atlasBaseUrl,
  feedbackBaseUrl: 'https://skillpilot.example/goal-feedback?source=book',
  modelDigest: model.digest,
  format: 'html',
  pageCount: model.pages.length,
  goalPageCount: model.pages.length,
  frontMatterPageCount: goalBookFrontMatterPageCount(model),
  physicalPageCount: model.pages.length + goalBookFrontMatterPageCount(model),
  chapters: model.chapters,
  pages: model.pages.map((page) => ({
    pageNumber: page.pageNumber,
    goalId: page.goalId,
    anchor: page.anchor,
    chapterIds: page.chapterIds,
    goalFingerprint: page.goalFingerprint,
    pageFingerprint: page.pageFingerprint,
  })),
  visualizationMode: 'root-relative-local-assets',
  printDerivativePolicy: {
    version: 'chromium-canvas-v1',
    maxWidthPixels: 1600,
    maxHeightPixels: 1200,
    jpegQuality: 0.82,
    webpQuality: 0.9,
    maxBytes: 1_500_000,
  },
  assets: [],
  artifactSha256: `sha256:${'9'.repeat(64)}`,
} satisfies GoalBookRenderManifest
const manifestSchemaPath = fileURLToPath(new URL(
  '../../contracts/goal-book/v1/goal-book-render-manifest-v2.schema.json',
  import.meta.url,
))
const legacyManifestSchemaPath = fileURLToPath(new URL(
  '../../contracts/goal-book/v1/goal-book-render-manifest.schema.json',
  import.meta.url,
))
const legacyManifestFixturePath = fileURLToPath(new URL(
  '../../curricula/DE/Gymnasium/quality/goal-description-review/mathematik/'
  + 'calibration-v2/2026-08-25/thales-current/bundle/book.pdf.render-manifest.json',
  import.meta.url,
))
const manifestSchema = JSON.parse(readFileSync(manifestSchemaPath, 'utf8')) as object
const validateManifest = new Ajv2020({ allErrors: true, strict: true }).compile(manifestSchema)
const legacyManifestSchema = JSON.parse(readFileSync(legacyManifestSchemaPath, 'utf8')) as object
const validateLegacyManifest = new Ajv2020({ allErrors: true, strict: true })
  .compile(legacyManifestSchema)
const legacyManifestFixture = JSON.parse(readFileSync(legacyManifestFixturePath, 'utf8'))
assert.equal(
  validateLegacyManifest(legacyManifestFixture),
  true,
  `archived v1 render manifest must remain valid: ${JSON.stringify(validateLegacyManifest.errors)}`,
)
assert.equal(validateManifest(legacyManifestFixture), false, 'v2 schema must reject a v1 manifest')
assert.equal(
  validateManifest(manifestContractFixture),
  true,
  `render manifest contract fixture must pass its closed schema: ${JSON.stringify(validateManifest.errors)}`,
)
assert.equal(
  validateLegacyManifest(manifestContractFixture),
  false,
  'legacy v1 schema must reject a current v2 manifest',
)
assert.equal(
  validateManifest({ ...manifestContractFixture, unknownField: true }),
  false,
  'render manifest schema rejects unknown fields',
)
assert.equal(
  validateManifest({
    ...manifestContractFixture,
    printDerivativePolicy: {
      version: 'chromium-canvas-bounded-atlas-v1',
      maxWidthPixels: 1200,
      maxHeightPixels: 800,
      jpegQuality: 0.76,
      webpQuality: 0.82,
      maxBytes: 100_000,
    },
    artifactSizeLimitBytes: 90 * 1024 * 1024,
  }),
  true,
  `bounded-atlas manifest profile must pass the closed schema: ${JSON.stringify(validateManifest.errors)}`,
)
assert.equal(
  validateManifest({
    ...manifestContractFixture,
    printDerivativePolicy: {
      version: 'chromium-canvas-bounded-atlas-v1',
      maxWidthPixels: 1200,
      maxHeightPixels: 800,
      jpegQuality: 0.76,
      webpQuality: 0.82,
      maxBytes: 100_000,
    },
    artifactSizeLimitBytes: 90 * 1024 * 1024,
    assets: [{
      publicPath: '/assets/goal-visualizations/oversized.webp',
      contentType: 'image/webp',
      sourceSha256: `sha256:${'1'.repeat(64)}`,
      renderedSha256: `sha256:${'2'.repeat(64)}`,
      sourceBytes: 200_000,
      renderedBytes: 100_001,
      sourceWidth: 1600,
      sourceHeight: 1200,
      renderedWidth: 1200,
      renderedHeight: 800,
    }],
  }),
  false,
  'bounded-atlas manifest fails closed when an image exceeds its selected profile',
)

const renderOptions: GoalBookRenderOptions = {
  feedbackBaseUrl: 'https://skillpilot.example/goal-feedback?source=book',
  embeddedVisualizationByGoalId: {
    [GOAL_A]: IMAGE_DATA_URL,
  },
}

const DEEP_CHAPTER_COUNT = 8
const deepChapterIds = Array.from(
  { length: DEEP_CHAPTER_COUNT },
  (_, index) => `chapter-depth-${index + 1}`,
)
const deepOutlineModel = {
  ...model,
  book: {
    ...model.book,
    title: 'Lernzielbuch – achtstufige Kapitelsicht',
    pageCount: 1,
    projectedAtomicGoalCount: 1,
  },
  chapters: deepChapterIds.map((chapterId, index) => ({
    chapterId,
    label: `Kapiteltiefe ${index + 1}`,
    parentChapterId: index === 0 ? null : deepChapterIds[index - 1],
    order: index,
    treeOrder: index,
    goalIds: [GOAL_A],
    pageNumbers: [1],
  })),
  pages: [{
    ...model.pages[0],
    pageNumber: 1,
    navigationOrder: 0,
    treeOrder: DEEP_CHAPTER_COUNT,
    title: 'Atomisches Ziel unter der tiefsten Kapitelstufe',
    breadcrumbs: deepChapterIds.map((_, index) => `Kapiteltiefe ${index + 1}`),
    chapterIds: deepChapterIds,
    requires: [],
    reverseRequires: [],
    externalPrerequisites: [],
    externalReverseRequires: [],
    visualization: null,
  }],
} satisfies GoalBookModel

type SyntheticSkiaPdfOptions = {
  catalogExtra?: string
  catalogType?: string
  creator?: string
  headerVersion?: string
  includeDestsReference?: boolean
  producer?: string
  trailerExtra?: string
}

const buildSyntheticSkiaPdf = (
  destinations: readonly string[],
  options: SyntheticSkiaPdfOptions = {},
) => {
  const info = `1 0 obj\n<</Creator (${options.creator ?? 'Chromium'})\n/Producer (${options.producer ?? 'Skia/PDF m147'})>>\nendobj\n`
  const pages = '2 0 obj\n<</Type /Pages /Count 0 /Kids []>>\nendobj\n'
  const destinationDictionary = destinations
    .map((destination) => `/${destination} [2 0 R /Fit]`)
    .join('\n')
  const dests = `3 0 obj\n<<${destinationDictionary ? `\n${destinationDictionary}\n` : ''}>>\nendobj\n`
  const structure = '4 0 obj\n<</Type /StructTreeRoot /K []>>\nendobj\n'
  const catalog = `5 0 obj\n<</Type /${options.catalogType ?? 'Catalog'}\n/Pages 2 0 R${options.includeDestsReference === false ? '' : '\n/Dests 3 0 R'}\n/MarkInfo <</Type /MarkInfo /Marked true>>\n/StructTreeRoot 4 0 R\n/Lang (de-DE)${options.catalogExtra ? `\n${options.catalogExtra}` : ''}>>\nendobj\n`
  const header = Buffer.from(`%PDF-${options.headerVersion ?? '1.4'}\n%\xd3\xeb\xe9\xe1\n`, 'latin1')
  const objectSources = [info, pages, dests, structure, catalog]
  const objectBuffers = objectSources.map((source) => Buffer.from(source, 'latin1'))
  let offset = header.length
  const offsets = objectBuffers.map((buffer) => {
    const objectOffset = offset
    offset += buffer.length
    return objectOffset
  })
  const xrefOffset = offset
  const xref = `xref\n0 6\n0000000000 65535 f \n${offsets.map((objectOffset) => (
    `${String(objectOffset).padStart(10, '0')} 00000 n \n`
  )).join('')}trailer\n<</Size 6\n/Root 5 0 R\n/Info 1 0 R${options.trailerExtra ? `\n${options.trailerExtra}` : ''}>>\nstartxref\n${xrefOffset}\n%%EOF\n`
  return Buffer.concat([header, ...objectBuffers, Buffer.from(xref, 'latin1')])
}

const testChapterAnchor = (chapterId: string) => (
  `chapter-${createHash('sha256').update(chapterId).digest('hex').slice(0, 24)}`
)
const deepOutlineDestinations = [
  'book-cover',
  'contents',
  ...deepOutlineModel.chapters.map(({ chapterId }) => testChapterAnchor(chapterId)),
  deepOutlineModel.pages[0].anchor,
]
const syntheticSkiaPdf = buildSyntheticSkiaPdf(deepOutlineDestinations)
const syntheticOutlinedPdf = injectGoalBookPdfOutline(syntheticSkiaPdf, deepOutlineModel)
assert.deepEqual(
  syntheticOutlinedPdf.subarray(0, syntheticSkiaPdf.length),
  syntheticSkiaPdf,
  'incremental outline injection preserves every original PDF byte as an exact prefix',
)
assert.doesNotMatch(
  syntheticOutlinedPdf.toString('latin1'),
  /endobj\d+\s+\d+\s+obj/u,
  'every appended indirect PDF object is separated by explicit whitespace',
)
const syntheticIncrementalSource = syntheticOutlinedPdf
  .subarray(syntheticSkiaPdf.length)
  .toString('latin1')
assert.equal(
  [...syntheticIncrementalSource.matchAll(/\/Count -1\b/gu)].length,
  DEEP_CHAPTER_COUNT,
  'every closed chapter counts only its one directly visible child when opened',
)
assert.equal(
  [...syntheticIncrementalSource.matchAll(/\/Count 1\b/gu)].length,
  1,
  'the open book exposes its one directly visible root chapter',
)
assert.equal(
  [...syntheticIncrementalSource.matchAll(/\/Count 2\b/gu)].length,
  1,
  'the outline root counts the open book and its one visible root chapter',
)
const syntheticOutlineInspection = inspectGoalBookPdfOutline(
  syntheticOutlinedPdf,
  deepOutlineModel,
)
const syntheticOutlineRows: Array<{ depth: number; title: string; destination: string }> = []
const collectSyntheticOutlineRows = (
  nodes: typeof syntheticOutlineInspection.outlineTree,
  depth = 0,
) => {
  nodes.forEach((node) => {
    syntheticOutlineRows.push({ depth, title: node.title, destination: node.destination })
    collectSyntheticOutlineRows(node.children, depth + 1)
  })
}
collectSyntheticOutlineRows(syntheticOutlineInspection.outlineTree)
assert.deepEqual(
  syntheticOutlineRows.map(({ depth }) => depth),
  Array.from({ length: DEEP_CHAPTER_COUNT + 2 }, (_, depth) => depth),
  'the native PDF outline preserves the book, eight chapter levels, and deepest goal hierarchy',
)
assert.equal(
  syntheticOutlineRows.at(-1)?.destination,
  deepOutlineModel.pages[0].anchor,
  'the goal appears exactly once directly below its deepest chapter destination',
)
assert.equal(
  syntheticOutlineRows.filter(({ destination }) => (
    destination === deepOutlineModel.pages[0].anchor
  )).length,
  1,
  'the exact outline contains every goal once and only once',
)
assert.deepEqual(
  extractGoalBookPdfOutlineTitles(syntheticOutlinedPdf.toString('latin1')),
  syntheticOutlineRows.map(({ title }) => title),
  'title extraction traverses only the current Catalog outline in exact tree order',
)

const corruptOutlineParent = Buffer.from(syntheticOutlinedPdf)
const corruptOutlineSource = corruptOutlineParent.toString('latin1')
const parentEdges = [...corruptOutlineSource.matchAll(/\/Parent\s+(\d+)\s+0\s+R/gu)]
assert.ok(parentEdges.length >= 3, 'deep outline fixture exposes a parent edge to corrupt')
const corruptParentEdge = parentEdges[2]
const originalParentObject = corruptParentEdge[1]
const replacementParentObject = String(Number(originalParentObject) - 1)
assert.equal(
  replacementParentObject.length,
  originalParentObject.length,
  'corruption fixture preserves every downstream xref byte offset',
)
corruptOutlineParent.write(
  replacementParentObject,
  corruptParentEdge.index! + corruptParentEdge[0].indexOf(originalParentObject),
  'ascii',
)
assert.throws(
  () => inspectGoalBookPdfOutline(corruptOutlineParent, deepOutlineModel),
  /wrong \/Parent edge/u,
  'outline inspection fails closed on a structurally corrupted parent edge',
)

const expectOutlinePreconditionFailure = (
  label: string,
  pdf: Buffer,
  expected: RegExp,
) => assert.throws(
  () => injectGoalBookPdfOutline(pdf, deepOutlineModel),
  expected,
  label,
)

expectOutlinePreconditionFailure(
  'outline injection rejects non-Skia PDF producers',
  buildSyntheticSkiaPdf(deepOutlineDestinations, { producer: 'Fake/PDF m147' }),
  /Skia\/PDF producer/u,
)
expectOutlinePreconditionFailure(
  'outline injection rejects a non-Chromium creator',
  buildSyntheticSkiaPdf(deepOutlineDestinations, { creator: 'OtherApp' }),
  /Chromium as the PDF creator/u,
)
expectOutlinePreconditionFailure(
  'outline injection rejects PDF versions outside the bound Skia PDF-1.4 contract',
  buildSyntheticSkiaPdf(deepOutlineDestinations, { headerVersion: '1.5' }),
  /exact Skia PDF-1\.4/u,
)
const malformedXrefPdf = buildSyntheticSkiaPdf(deepOutlineDestinations)
const malformedXrefSource = malformedXrefPdf.toString('latin1')
const malformedXrefOffset = Number(/startxref\s+(\d+)\s+%%EOF/u.exec(malformedXrefSource)?.[1])
malformedXrefPdf.write('xraf', malformedXrefOffset, 'ascii')
expectOutlinePreconditionFailure(
  'outline injection rejects non-classic xref input',
  malformedXrefPdf,
  /classic xref table/u,
)
expectOutlinePreconditionFailure(
  'outline injection rejects a non-Catalog root object',
  buildSyntheticSkiaPdf(deepOutlineDestinations, { catalogType: 'NotCatalog' }),
  /PDF Catalog/u,
)
expectOutlinePreconditionFailure(
  'outline injection rejects a Catalog without /Dests',
  buildSyntheticSkiaPdf(deepOutlineDestinations, { includeDestsReference: false }),
  /\/Dests reference/u,
)
expectOutlinePreconditionFailure(
  'outline injection rejects incomplete named destinations',
  buildSyntheticSkiaPdf(deepOutlineDestinations.slice(0, -1)),
  /missing named destinations/u,
)
expectOutlinePreconditionFailure(
  'outline injection rejects encrypted trailers',
  buildSyntheticSkiaPdf(deepOutlineDestinations, { trailerExtra: '/Encrypt 2 0 R' }),
  /encrypted/u,
)
expectOutlinePreconditionFailure(
  'outline injection rejects signatures',
  buildSyntheticSkiaPdf(deepOutlineDestinations, {
    catalogExtra: '/ByteRange [0 10 20 30]',
  }),
  /signed PDFs/u,
)
expectOutlinePreconditionFailure(
  'outline injection rejects an unpreserved document ID instead of dropping it silently',
  buildSyntheticSkiaPdf(deepOutlineDestinations, {
    trailerExtra: `/ID [<${'a'.repeat(32)}> <${'a'.repeat(32)}>]`,
  }),
  /unpreserved trailer \/ID/u,
)
expectOutlinePreconditionFailure(
  'outline injection rejects a pre-existing Chromium outline',
  buildSyntheticSkiaPdf(deepOutlineDestinations, { catalogExtra: '/Outlines 4 0 R' }),
  /outline:false/u,
)

const html = renderGoalBookHtml(model, renderOptions)

assert.equal(
  html.match(/<article class="goal-page"/gu)?.length,
  model.pages.length,
  'one and only one .goal-page is rendered for every model page',
)
assert.equal(
  html.match(/<section class="front-matter-page/gu)?.length,
  goalBookFrontMatterPageCount(model),
  'the cover and bounded chapter overview are separate deterministic front-matter pages',
)
assert.match(html, /id="book-cover"/u)
assert.match(html, /id="contents"/u)
assert.match(html, /Kanonische Kapitelsicht/u)
assert.match(html, /Die Gliederung dient der Navigation/u)
assert.equal(
  html.match(/class="toc-entry"/gu)?.length,
  model.chapters.length,
  'every model chapter appears exactly once in the visible contents tree',
)
assert.match(
  html,
  /<div class="toc-entry"[^>]*data-chapter-id="chapter-mathematik"[^>]*data-chapter-depth="0"[\s\S]*?<h2 class="toc-entry-heading"/u,
  'root chapters establish the second-level tagged heading below the book title',
)
assert.match(
  html,
  /<div class="toc-entry"[^>]*data-chapter-id="chapter-grundlagen"[^>]*data-chapter-depth="1"[\s\S]*?<h3 class="toc-entry-heading"/u,
  'child chapters preserve their hierarchy in the visible tree and tagged headings',
)
const tocHeadings = [...html.matchAll(/<h[2-6] class="toc-entry-heading"[^>]*>([\s\S]*?)<\/h[2-6]>/gu)]
assert.equal(tocHeadings.length, model.chapters.length)
tocHeadings.forEach(([, headingContents]) => {
  assert.doesNotMatch(
    headingContents,
    /toc-entry-meta/u,
    'chapter counts and page hints stay outside the semantic tagged headings',
  )
})
assert.match(html, /erste zugehörige Lernzielseite 1/u)
assert.match(
  html,
  new RegExp(`class="toc-entry"[\\s\\S]*href="#goal-${GOAL_A}"`, 'u'),
  'chapter entries link to an actual atomic goal destination instead of a fake page range',
)
assert.match(
  html,
  /<h2 class="goal-title"/u,
  'atomic titles remain tagged headings below the single book-level heading',
)
assert.match(html, /@page \{ size: A4 portrait; margin: 0; \}/u)
assert.match(
  html,
  /\.cover-page h1\s*\{[^}]*hyphens:\s*none;[^}]*word-break:\s*normal;/su,
  'the cover title wraps only between words instead of hyphenating Gymnasium',
)
assert.match(
  html,
  /\.goal-page\s*\{[^}]*width:\s*210mm;[^}]*height:\s*297mm;/su,
  'every goal owns one fixed A4 portrait page',
)
assert.match(html, /break-after: page;/u)
assert.match(html, /page-break-after: always;/u)
assert.match(html, /break-inside: avoid;/u)
assert.match(
  html,
  /--goal-visualization-row-height:\s*106mm;/u,
  'every goal page reserves the same fixed visualization height',
)
assert.match(
  html,
  /grid-template-rows:\s*var\(--goal-visualization-row-height\) auto minmax\(0, 1fr\);/u,
  'description and relations receive only the space remaining below the fixed visualization row',
)
assert.match(
  html,
  /\.goal-visualization\s*\{[^}]*height:\s*var\(--goal-visualization-row-height\);/su,
  'relation density cannot collapse the visualization box',
)
assert.match(
  html,
  /\.reference-list a code\s*\{[^}]*font-size:\s*4\.8pt;/su,
  'relation UUIDs use the compact identifier typography',
)
assert.match(
  html,
  /\.goal-visualization img\s*\{[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*object-fit:\s*contain;/su,
  'the fixed portrait visualization area is used fully without cropping',
)
assert.match(
  html,
  /\.goal-visualization\s*\{[^}]*padding:\s*0;[^}]*border:\s*0;[^}]*background:\s*#fff;/su,
  'the image is not surrounded by a wider tinted presentation box',
)
assert.doesNotMatch(
  html,
  /<figcaption[\s>]/u,
  'the page title makes a space-consuming visualization caption redundant',
)
assert.doesNotMatch(html, /transform:\s*scale/iu, 'print layout never shrinks a page to hide overflow')

for (const page of model.pages) {
  assert.match(html, new RegExp(`id="${page.anchor}"`, 'u'))
  assert.match(html, new RegExp(`<code>${page.goalId}</code>`, 'u'))
  assert.match(html, new RegExp(`data-chapter-ids="${page.chapterIds.join(' ')}"`, 'u'))
}
assert.match(html, new RegExp(`href="#goal-${GOAL_A}"`, 'u'))
assert.match(html, new RegExp(`href="#goal-${GOAL_B}"`, 'u'))
assert.doesNotMatch(
  html,
  new RegExp(`href="#goal-${GOAL_EXTERNAL}"`, 'u'),
  'out-of-book prerequisites are explicit text, never broken internal links',
)
assert.ok(
  html.includes(atlasUrl(GOAL_EXTERNAL).replaceAll('&', '&amp;')),
  'external prerequisites link to their versioned canonical atlas target',
)
assert.ok(
  html.includes(atlasUrl(GOAL_EXTERNAL_REVERSE).replaceAll('&', '&amp;')),
  'external reverse relations link to their versioned canonical atlas target',
)
assert.match(html, /Direkt aufbauende Ziele außerhalb dieses Buchs/u)

const denseExternalModel = {
  ...model,
  pages: model.pages.map((page, pageIndex) => pageIndex === 0
    ? {
        ...page,
        externalPrerequisites: Array.from({ length: 13 }, (_, index) => {
          const goalId = `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`
          return {
            goalId,
            title: `Externe Voraussetzung ${index + 1}`,
            canonicalUrl: atlasUrl(goalId),
          }
        }),
      }
    : page),
} satisfies GoalBookModel
const denseExternalHtml = renderGoalBookHtml(denseExternalModel, renderOptions)
assert.match(
  denseExternalHtml,
  new RegExp(`<article class="goal-page goal-page--dense-relations"[^>]*data-goal-id="${GOAL_A}"`, 'u'),
  'more than twelve total internal and external relations select the compact readable relation layout',
)
assert.match(
  denseExternalHtml,
  /\.goal-page--dense-relations \.external-references ul\s*\{[^}]*minmax\(30mm, 1fr\)\);[^}]*gap:\s*0\.4mm;/su,
  'dense external relations use the same compact grid as dense internal relations',
)
assert.match(
  denseExternalHtml,
  /\.goal-page--dense-relations \.external-references code\s*\{[^}]*font-size:\s*4\.1pt;[^}]*line-height:\s*1;/su,
  'dense external relation UUIDs remain visible in compact identifier typography',
)

const veryDenseExternalModel = {
  ...denseExternalModel,
  pages: denseExternalModel.pages.map((page, pageIndex) => pageIndex === 0
    ? {
        ...page,
        externalPrerequisites: Array.from({ length: 36 }, (_, index) => {
          const goalId = `00000000-0000-4000-8001-${String(index + 1).padStart(12, '0')}`
          return {
            goalId,
            title: `Sehr dichte externe Voraussetzung ${index + 1}`,
            canonicalUrl: atlasUrl(goalId),
          }
        }),
      }
    : page),
} satisfies GoalBookModel
const veryDenseExternalHtml = renderGoalBookHtml(veryDenseExternalModel, renderOptions)
assert.match(
  veryDenseExternalHtml,
  new RegExp(`<article class="goal-page goal-page--very-dense-relations"[^>]*data-goal-id="${GOAL_A}"`, 'u'),
  'more than thirty-five total internal and external relations select the very-dense layout',
)
assert.match(
  veryDenseExternalHtml,
  /\.goal-page--very-dense-relations \.external-references ul\s*\{[^}]*minmax\(25mm, 1fr\)\);[^}]*gap:\s*0\.3mm;/su,
  'very-dense external relations use the narrow bounded grid',
)
assert.match(
  veryDenseExternalHtml,
  /\.goal-page--very-dense-relations \.external-references code\s*\{[^}]*font-size:\s*3\.3pt;[^}]*line-height:\s*1;/su,
  'very-dense external relation UUIDs remain visible in the smallest bounded typography',
)
assert.ok(
  veryDenseExternalHtml.includes('Sehr dichte externe Voraussetzung 36'),
  'very-dense rendering retains every external relation instead of truncating the model',
)
assert.doesNotMatch(
  html,
  /<article class="goal-page goal-page--dense-relations"/u,
  'ordinary relation counts retain the standard relation layout',
)

const firstPageStart = html.indexOf(`data-goal-id="${GOAL_A}"`)
const secondPageStart = html.indexOf(`data-goal-id="${GOAL_B}"`)
const firstPageHtml = html.slice(firstPageStart, secondPageStart)
const titlePosition = firstPageHtml.indexOf('<h2 class="goal-title"')
const imagePosition = firstPageHtml.indexOf('<figure class="goal-visualization"')
const descriptionPosition = firstPageHtml.indexOf('<section class="goal-description"')
assert.ok(
  titlePosition >= 0 && titlePosition < imagePosition && imagePosition < descriptionPosition,
  'each page preserves the semantic title -> image -> description order',
)
assert.match(html, /alt="Schematische Darstellung der Grundlage"/u)
assert.doesNotMatch(
  html,
  /Review candidate \/ noch nicht öffentlich freigegeben|visualization-review-badge/u,
  'review-candidate image metadata does not produce a per-image release badge',
)
const englishHtml = renderGoalBookHtml(model, { ...renderOptions, language: 'en' })
assert.doesNotMatch(
  englishHtml,
  /Review candidate \/ not yet approved for public release|visualization-review-badge/u,
  'the removed badge is not emitted by the English renderer either',
)
assert.match(html, new RegExp(`data-original-digest="${IMAGE_DIGEST}"`, 'u'))
assert.match(
  html,
  /role="img" aria-label="Für dieses Lernziel liegt keine Visualisierung vor\."/u,
  'goals without an image receive an accessible placeholder',
)

assert.doesNotMatch(html, /<script[\s>]/iu)
assert.doesNotMatch(html, /<link[\s>]/iu)
assert.doesNotMatch(html, /@import/iu)
assert.doesNotMatch(html, /@font-face/iu)
assert.doesNotMatch(html, /src="https?:/iu)
assert.match(html, /Content-Security-Policy/u)
assert.match(html, /default-src &#39;none&#39;|default-src 'none'/u)
assert.match(html, /Anwendung &lt;script&gt;alert\(1\)&lt;\/script&gt;/u)
assert.doesNotMatch(html, /<title>Lernzielbuch <Pilot>/u)

const expectedFeedback = new URL(renderOptions.feedbackBaseUrl)
expectedFeedback.searchParams.set('bookId', model.book.id)
expectedFeedback.searchParams.set('edition', model.book.edition)
expectedFeedback.searchParams.set('goalId', GOAL_A)
expectedFeedback.searchParams.set('goalFingerprint', model.pages[0].goalFingerprint)
expectedFeedback.searchParams.set('pageFingerprint', model.pages[0].pageFingerprint)
expectedFeedback.searchParams.set('bookDigest', model.digest)
expectedFeedback.searchParams.set('page', '1')
assert.ok(
  html.includes(expectedFeedback.toString().replaceAll('&', '&amp;')),
  'German feedback links bind book, edition, goal, page and immutable fingerprints',
)
assert.ok(
  englishHtml.includes(expectedFeedback.toString().replaceAll('&', '&amp;')),
  'English feedback links preserve the same privacy-minimized publication binding',
)
assert.match(html, new RegExp(`Buch-Digest <code>${model.digest}</code>`, 'u'))

const applicabilityModel = {
  ...model,
  pages: [{
    ...model.pages[0],
    applicability: [
      {
        jurisdiction: 'DE-BY',
        scopes: [{ stage: 'SekI', durationModel: 'G9', courseProfile: null }],
      },
      {
        jurisdiction: 'DE-HE',
        scopes: [
          { stage: 'SekI', durationModel: 'G8', courseProfile: null },
          { stage: 'SekII', durationModel: null, courseProfile: 'GK' },
        ],
      },
      {
        jurisdiction: 'DE-NI',
        scopes: [{ stage: 'SekI', durationModel: 'G9', courseProfile: null }],
      },
    ],
  }, model.pages[1]],
} as GoalBookModel
const applicabilityHtml = renderGoalBookHtml(applicabilityModel, renderOptions)
assert.match(applicabilityHtml, /<p class="section-heading section-heading--small">Geltung<\/p>/u)
assert.match(
  applicabilityHtml,
  /<strong>BY, NI:<\/strong> Sek\. I · G9/u,
  'jurisdictions are grouped only when their complete exact scope tuples match',
)
assert.match(
  applicabilityHtml,
  /<strong>HE:<\/strong> Sek\. I · G8; Sek\. II · GK/u,
  'duration model and course profile stay coupled to their jurisdiction and stage',
)
assert.doesNotMatch(
  applicabilityHtml,
  /Sek\. I · G9 · GK/u,
  'compact rendering must not invent a Cartesian stage-duration-profile combination',
)
assert.match(applicabilityHtml, /Vollständige Geltungsmatrix im Online-Atlas/u)
assert.throws(
  () => renderGoalBookHtml({
    ...applicabilityModel,
    pages: [{
      ...applicabilityModel.pages[0],
      applicability: [
        {
          jurisdiction: 'DE-HE',
          scopes: [{ stage: 'SekI', durationModel: 'G8', courseProfile: null }],
        },
        {
          jurisdiction: 'DE-HE',
          scopes: [{ stage: 'SekII', durationModel: null, courseProfile: 'GK' }],
        },
      ],
    }, applicabilityModel.pages[1]],
  } as GoalBookModel, renderOptions),
  /repeats applicability jurisdiction DE-HE/u,
  'renderer fails closed when a state is split into ambiguous applicability entries',
)

const boundedAtlasHtml = renderGoalBookHtml(model, {
  ...renderOptions,
  printDerivativeProfile: 'bounded-atlas',
})
assert.match(boundedAtlasHtml, /chromium-canvas-bounded-atlas-v1/u)
assert.match(boundedAtlasHtml, /&quot;maxBytes&quot;:100000/u)

const remoteImageModel = {
  ...model,
  pages: [{
    ...model.pages[0],
    visualization: {
      ...model.pages[0].visualization!,
      url: 'https://example.invalid/remote.png',
    },
  }, ...model.pages.slice(1)],
} as GoalBookModel
assert.throws(
  () => renderGoalBookHtml(remoteImageModel, {
    feedbackBaseUrl: renderOptions.feedbackBaseUrl,
  }),
  /must use \/assets\/goal-visualizations\//u,
  'remote visualization URLs fail closed',
)

const brokenReferenceModel = {
  ...model,
  pages: [model.pages[0], {
    ...model.pages[1],
    requires: [{
      ...model.pages[1].requires[0],
      anchor: 'goal-does-not-exist',
    }],
  }],
} as GoalBookModel
assert.throws(
  () => renderGoalBookHtml(brokenReferenceModel, renderOptions),
  /does not resolve exactly to its in-book goal/u,
  'broken prerequisite links fail before rendering',
)

const generatedIdCollisionModel = {
  ...model,
  pages: [model.pages[0], {
    ...model.pages[1],
    goalId: `${GOAL_A}-title`,
    anchor: `goal-${GOAL_A}-title`,
  }],
} as GoalBookModel
assert.throws(
  () => renderGoalBookHtml(generatedIdCollisionModel, renderOptions),
  /Duplicate generated DOM ID/u,
  'generated heading IDs cannot collide with another canonical goal anchor',
)

assert.throws(
  () => renderGoalBookHtml(model, {
    ...renderOptions,
    feedbackBaseUrl: 'file:///tmp/feedback',
  }),
  /must use HTTPS/u,
)
for (const reservedParameter of ['bookId', 'edition']) {
  assert.throws(
    () => renderGoalBookHtml(model, {
      ...renderOptions,
      feedbackBaseUrl: `https://skillpilot.example/goal-feedback?${reservedParameter}=attacker-controlled`,
    }),
    new RegExp(`reserved or privacy-sensitive parameter ${reservedParameter}`, 'u'),
    `feedbackBaseUrl cannot manipulate the renderer-owned ${reservedParameter} binding`,
  )
}

const unsafePublicModel = {
  ...model,
  book: { ...model.book, publicationMode: 'public' as const },
} satisfies GoalBookModel
assert.throws(
  () => renderGoalBookHtml(unsafePublicModel, renderOptions),
  /Public goal book contains unapproved visualization/u,
  'public rendering fails closed when an unapproved image leaks through the model boundary',
)

const assetTestRoot = mkdtempSync(join(tmpdir(), 'skillpilot-goal-book-assets.'))
try {
  const publicUrl = '/assets/goal-visualizations/pilot/goal-a.png'
  const sourcePath = join(assetTestRoot, publicUrl.slice(1))
  mkdirSync(dirname(sourcePath), { recursive: true })
  writeFileSync(sourcePath, IMAGE_BYTES)
  const localAssetModel = {
    ...model,
    pages: [{
      ...model.pages[0],
      visualization: {
        ...model.pages[0].visualization!,
        url: publicUrl,
      },
    }, model.pages[1]],
  } as GoalBookModel
  const localEmbeddedVisualizations = await loadEmbeddedGoalBookVisualizations(
    localAssetModel,
    assetTestRoot,
  )
  assert.deepEqual(
    localEmbeddedVisualizations,
    { [GOAL_A]: IMAGE_DATA_URL },
    'root-relative public images are embedded byte-identically',
  )
  const staleDigestModel = {
    ...localAssetModel,
    pages: [{
      ...localAssetModel.pages[0],
      visualization: {
        ...localAssetModel.pages[0].visualization!,
        originalDigest: `sha256:${'f'.repeat(64)}`,
      },
    }, localAssetModel.pages[1]],
  } as GoalBookModel
  await assert.rejects(
    loadEmbeddedGoalBookVisualizations(staleDigestModel, assetTestRoot),
    /visualization digest mismatch/u,
    'legacy embedding also fails closed when local bytes drift from the QA-bound digest',
  )
  const escapingAssetModel = {
    ...localAssetModel,
    pages: [{
      ...localAssetModel.pages[0],
      visualization: {
        ...localAssetModel.pages[0].visualization!,
        url: '/assets/goal-visualizations/%2e%2e/%2e%2e/private.png',
      },
    }, localAssetModel.pages[1]],
  } as GoalBookModel
  await assert.rejects(
    loadEmbeddedGoalBookVisualizations(escapingAssetModel, assetTestRoot),
    /escapes the public asset prefix|must use \/assets\/goal-visualizations\//u,
    'encoded path traversal cannot escape the public visualization tree',
  )
} finally {
  rmSync(assetTestRoot, { force: true, recursive: true })
}

const runChromiumSmoke = async (required: boolean) => {
  const { chromium } = await import('playwright')
  const executablePath = chromium.executablePath()
  if (!existsSync(executablePath)) {
    if (required) {
      throw new Error(`Chromium is not installed at ${executablePath}`)
    }
    console.log(`Goal-book Chromium smoke skipped: no browser at ${executablePath}`)
    return
  }

  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'skillpilot-goal-book-renderer.'))
  try {
    const publicUrl = '/assets/goal-visualizations/pilot/goal-a.png'
    const publicRoot = join(temporaryDirectory, 'public')
    const sourcePath = join(publicRoot, publicUrl.slice(1))
    mkdirSync(dirname(sourcePath), { recursive: true })
    writeFileSync(sourcePath, IMAGE_BYTES)
    const localAssetModel = {
      ...model,
      pages: [{
        ...model.pages[0],
        visualization: {
          ...model.pages[0].visualization!,
          url: publicUrl,
        },
      }, model.pages[1]],
    } as GoalBookModel
    const localRenderOptions = {
      feedbackBaseUrl: renderOptions.feedbackBaseUrl,
      publicRoot,
      chromiumExecutablePath: executablePath,
    }
    const wrongDigestModel = {
      ...localAssetModel,
      pages: [{
        ...localAssetModel.pages[0],
        visualization: {
          ...localAssetModel.pages[0].visualization!,
          originalDigest: `sha256:${'f'.repeat(64)}`,
        },
      }, localAssetModel.pages[1]],
    } as GoalBookModel
    await assert.rejects(
      writeGoalBookHtml(
        wrongDigestModel,
        join(temporaryDirectory, 'digest-mismatch.html'),
        localRenderOptions,
      ),
      /visualization digest mismatch/u,
      'local bytes must match the QA-bound original visualization digest',
    )
    const htmlPath = join(temporaryDirectory, 'goal-book.html')
    const htmlManifest = await writeGoalBookHtml(localAssetModel, htmlPath, localRenderOptions)
    const writtenHtml = readFileSync(htmlPath, 'utf8')
    assert.match(
      writtenHtml,
      new RegExp(`id="goal-${GOAL_A}"`, 'u'),
      'the validated HTML writer publishes the same self-contained named destinations',
    )
    assert.match(writtenHtml, new RegExp(`src="${publicUrl}"`, 'u'))
    assert.doesNotMatch(
      writtenHtml,
      /src="data:image\//u,
      'deployable HTML keeps bounded root-relative asset URLs instead of base64 originals',
    )
    assert.equal(htmlManifest.rendererVersion, 'goal-book-renderer-v2')
    assert.match(htmlManifest.artifactSha256, /^sha256:[0-9a-f]{64}$/u)
    assert.equal(htmlManifest.bookId, localAssetModel.book.id)
    assert.equal(htmlManifest.publicationMode, 'review')
    assert.equal(htmlManifest.atlasBaseUrl, localAssetModel.book.atlasBaseUrl)
    assert.equal(htmlManifest.pageCount, localAssetModel.pages.length)
    assert.equal(htmlManifest.goalPageCount, localAssetModel.pages.length)
    assert.equal(
      htmlManifest.frontMatterPageCount,
      goalBookFrontMatterPageCount(localAssetModel),
    )
    assert.equal(
      htmlManifest.physicalPageCount,
      localAssetModel.pages.length + goalBookFrontMatterPageCount(localAssetModel),
    )
    assert.deepEqual(htmlManifest.chapters, localAssetModel.chapters)
    assert.deepEqual(
      htmlManifest.pages.map(({ pageNumber, goalId, chapterIds, pageFingerprint }) => ({
        pageNumber,
        goalId,
        chapterIds,
        pageFingerprint,
      })),
      localAssetModel.pages.map(({ pageNumber, goalId, chapterIds, pageFingerprint }) => ({
        pageNumber,
        goalId,
        chapterIds,
        pageFingerprint,
      })),
      'the manifest binds every logical goal page to the model goal and page fingerprint',
    )
    assert.equal(htmlManifest.printDerivativePolicy.maxWidthPixels, 1600)
    assert.equal(htmlManifest.printDerivativePolicy.jpegQuality, 0.82)
    assert.equal(htmlManifest.assets.length, 1)
    assert.ok(
      htmlManifest.assets[0].renderedBytes <= htmlManifest.printDerivativePolicy.maxBytes,
      'render manifest binds a bounded local print derivative',
    )

    const boundedHtmlPath = join(temporaryDirectory, 'goal-book-bounded-atlas.html')
    const boundedHtmlManifest = await writeGoalBookHtml(
      localAssetModel,
      boundedHtmlPath,
      { ...localRenderOptions, printDerivativeProfile: 'bounded-atlas' },
    )
    assert.match(
      readFileSync(boundedHtmlPath, 'utf8'),
      /data-render-profile="chromium-canvas-bounded-atlas-v1"/u,
      'bounded-atlas HTML binds every prepared visualization to the selected profile',
    )
    assert.equal(
      boundedHtmlManifest.printDerivativePolicy.version,
      'chromium-canvas-bounded-atlas-v1',
    )
    assert.equal(boundedHtmlManifest.printDerivativePolicy.maxBytes, 100_000)
    assert.equal(boundedHtmlManifest.artifactSizeLimitBytes, 90 * 1024 * 1024)
    assert.ok(
      boundedHtmlManifest.assets[0].renderedBytes <= 100_000,
      'bounded-atlas rendering enforces the per-image derivative budget',
    )

    const pdfPath = join(temporaryDirectory, 'goal-book.pdf')
    const pdfManifest = await writeGoalBookPdf(localAssetModel, pdfPath, localRenderOptions)
    const pdf = readFileSync(pdfPath)
    assert.ok(pdf.length > 1_000, 'Chromium produces a non-empty PDF')
    assert.equal(pdf.subarray(0, 5).toString('ascii'), '%PDF-', 'output has a PDF header')
    assert.equal(pdfManifest.pageCount, localAssetModel.pages.length)
    assert.equal(pdfManifest.goalPageCount, localAssetModel.pages.length)
    assert.equal(
      pdfManifest.frontMatterPageCount,
      goalBookFrontMatterPageCount(localAssetModel),
    )
    assert.equal(
      pdfManifest.physicalPageCount,
      localAssetModel.pages.length + goalBookFrontMatterPageCount(localAssetModel),
    )
    assert.match(pdfManifest.artifactSha256, /^sha256:[0-9a-f]{64}$/u)
    assert.equal(
      pdfManifest.artifactSha256,
      `sha256:${createHash('sha256').update(pdf).digest('hex')}`,
      'the render manifest hashes the final incrementally outlined PDF bytes',
    )
    assert.match(
      pdf.toString('latin1'),
      /%SKILLPILOT-GOAL-BOOK-OUTLINE-V1 source-bytes=\d+ source-sha256=[0-9a-f]{64}/u,
      'the published PDF contains its source-byte and source-digest outline binding',
    )
    const pdfInspection = await inspectGoalBookPdfArtifact(
      pdfPath,
      localAssetModel,
      localRenderOptions.feedbackBaseUrl,
    )
    localAssetModel.chapters.forEach((chapter) => {
      assert.ok(
        pdfInspection.normalizedOutlineTitles.includes(chapter.label),
        `exact PDF bookmark contains the pure chapter title ${JSON.stringify(chapter.label)}`,
      )
    })
    assert.equal(
      pdfInspection.normalizedOutlineTitles.some((title) => (
        /Lernziele?erste zugehörige Lernzielseite/u.test(title)
      )),
      false,
      'exact PDF bookmarks exclude visible chapter counts and first-page hints',
    )

    const overflowModel = {
      ...localAssetModel,
      pages: [{
        ...localAssetModel.pages[0],
        description: 'Absichtlich überlange Beschreibung. '.repeat(4_000),
      }, ...localAssetModel.pages.slice(1)],
    } as GoalBookModel
    const overflowHtmlPath = join(temporaryDirectory, 'overflow-must-stay-unchanged.html')
    writeFileSync(overflowHtmlPath, 'existing output')
    await assert.rejects(
      writeGoalBookHtml(overflowModel, overflowHtmlPath, localRenderOptions),
      /page overflow detected/u,
      'layout overflow aborts HTML publication',
    )
    assert.equal(
      readFileSync(overflowHtmlPath, 'utf8'),
      'existing output',
      'an overflowing book never replaces an existing HTML artifact',
    )
    const overflowPdfPath = join(temporaryDirectory, 'overflow-must-not-exist.pdf')
    await assert.rejects(
      writeGoalBookPdf(overflowModel, overflowPdfPath, localRenderOptions),
      /page overflow detected/u,
      'layout overflow aborts PDF generation',
    )
    assert.equal(
      existsSync(overflowPdfPath),
      false,
      'an overflowing book never replaces or creates the requested PDF',
    )
  } finally {
    rmSync(temporaryDirectory, { force: true, recursive: true })
  }
}

const chromiumRequired = process.argv.includes('--chromium')
const chromiumIfInstalled = process.argv.includes('--chromium-if-installed')
if (chromiumRequired || chromiumIfInstalled) {
  await runChromiumSmoke(chromiumRequired)
}

console.log(
  `Goal-book renderer self-test passed: ${model.pages.length} browser-free pages${chromiumRequired || chromiumIfInstalled ? ' plus Chromium smoke' : ''}.`,
)
