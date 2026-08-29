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
const ATLAS_BASE_URL = 'https://skillpilot.example/learning-goal-atlas'
const atlasUrl = (goalId: string) => (
  `${ATLAS_BASE_URL}?landscape=math-landscape&edition=curricular-atomic-v1#goal-${goalId}`
)
const IMAGE_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
const IMAGE_BYTES = Buffer.from(IMAGE_DATA_URL.split(',')[1], 'base64')
const IMAGE_DIGEST = `sha256:${createHash('sha256').update(IMAGE_BYTES).digest('hex')}`

const model = {
  schemaVersion: '1.0.0',
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
  chapters: [{
    chapterId: 'chapter-mathematik',
    label: 'Mathematik',
    parentChapterId: null,
    goalIds: [GOAL_A, GOAL_B],
    pageNumbers: [1, 2],
  }],
  pages: [
    {
      pageNumber: 1,
      goalId: GOAL_A,
      anchor: `goal-${GOAL_A}`,
      title: 'Grundlage & Einstieg',
      description: 'Die lernende Person kann eine Grundlage sicher erklären.',
      breadcrumbs: ['Mathematik', 'Grundlagen'],
      chapterIds: ['chapter-mathematik'],
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
      goalId: GOAL_B,
      anchor: `goal-${GOAL_B}`,
      title: 'Anwendung <script>alert(1)</script>',
      description: 'Die lernende Person kann die Grundlage in einer neuen Situation anwenden.',
      breadcrumbs: ['Mathematik', 'Anwendungen'],
      chapterIds: ['chapter-mathematik'],
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
  schemaVersion: 1,
  rendererVersion: 'goal-book-renderer-v1',
  bookId: model.book.id,
  bookEdition: model.book.edition,
  publicationMode: model.book.publicationMode,
  atlasBaseUrl: model.book.atlasBaseUrl,
  feedbackBaseUrl: 'https://skillpilot.example/goal-feedback?source=book',
  modelDigest: model.digest,
  format: 'html',
  pageCount: model.pages.length,
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
  '../../contracts/goal-book/v1/goal-book-render-manifest.schema.json',
  import.meta.url,
))
const manifestSchema = JSON.parse(readFileSync(manifestSchemaPath, 'utf8')) as object
const validateManifest = new Ajv2020({ allErrors: true, strict: true }).compile(manifestSchema)
assert.equal(
  validateManifest(manifestContractFixture),
  true,
  `render manifest contract fixture must pass its closed schema: ${JSON.stringify(validateManifest.errors)}`,
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

const html = renderGoalBookHtml(model, renderOptions)

assert.equal(
  html.match(/<article class="goal-page"/gu)?.length,
  model.pages.length,
  'one and only one .goal-page is rendered for every model page',
)
assert.match(html, /@page \{ size: A4 portrait; margin: 0; \}/u)
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
const titlePosition = firstPageHtml.indexOf('<h1')
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
    assert.equal(htmlManifest.rendererVersion, 'goal-book-renderer-v1')
    assert.match(htmlManifest.artifactSha256, /^sha256:[0-9a-f]{64}$/u)
    assert.equal(htmlManifest.bookId, localAssetModel.book.id)
    assert.equal(htmlManifest.publicationMode, 'review')
    assert.equal(htmlManifest.atlasBaseUrl, localAssetModel.book.atlasBaseUrl)
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
      'the manifest binds every physical page to the model goal and page fingerprint',
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
    assert.match(pdfManifest.artifactSha256, /^sha256:[0-9a-f]{64}$/u)

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
