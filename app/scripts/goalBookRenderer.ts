import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { promisify } from 'node:util'
import type { Browser, Page } from 'playwright'
import type {
  GoalBookApplicabilityScope,
  GoalBookExternalReference,
  GoalBookModel,
  GoalBookPage,
  GoalBookReference,
} from './goalBookModel'

const execFileAsync = promisify(execFile)

const SAFE_ANCHOR_PATTERN = /^goal-[A-Za-z0-9][A-Za-z0-9._:-]*$/u
const PUBLIC_VISUALIZATION_PREFIX = '/assets/goal-visualizations/'
const MAX_EMBEDDED_VISUALIZATION_BYTES = 64 * 1024 * 1024
const MAX_PRINT_DERIVATIVE_BYTES = 1_500_000
const MAX_DIRECT_EMBEDDED_VISUALIZATION_BYTES = 4 * 1024 * 1024
const MAX_DIRECT_EMBEDDED_TOTAL_BYTES = 64 * 1024 * 1024
const GOAL_BOOK_VIRTUAL_ORIGIN = 'https://goal-book.skillpilot.invalid'
const GOAL_BOOK_VISUALIZATION_HEIGHT_MM = 106
const GOAL_BOOK_VISUALIZATION_HEIGHT_CSS_PX = GOAL_BOOK_VISUALIZATION_HEIGHT_MM * 96 / 25.4
const GOAL_BOOK_LAYOUT_TOLERANCE_PX = 1

export const GOAL_BOOK_RENDERER_VERSION = 'goal-book-renderer-v1' as const
export const GOAL_BOOK_PRINT_DERIVATIVE_POLICY = Object.freeze({
  version: 'chromium-canvas-v1',
  maxWidthPixels: 1600,
  maxHeightPixels: 1200,
  jpegQuality: 0.82,
  webpQuality: 0.9,
  maxBytes: MAX_PRINT_DERIVATIVE_BYTES,
})

export const GOAL_BOOK_BOUNDED_ATLAS_PRINT_DERIVATIVE_POLICY = Object.freeze({
  version: 'chromium-canvas-bounded-atlas-v1',
  maxWidthPixels: 1200,
  maxHeightPixels: 800,
  jpegQuality: 0.76,
  webpQuality: 0.82,
  maxBytes: 100_000,
})

export type GoalBookPrintDerivativeProfile = 'standard' | 'bounded-atlas'
export type GoalBookPrintDerivativePolicy =
  | typeof GOAL_BOOK_PRINT_DERIVATIVE_POLICY
  | typeof GOAL_BOOK_BOUNDED_ATLAS_PRINT_DERIVATIVE_POLICY

const printDerivativePolicyForProfile = (
  profile: GoalBookPrintDerivativeProfile | undefined,
): GoalBookPrintDerivativePolicy => profile === 'bounded-atlas'
  ? GOAL_BOOK_BOUNDED_ATLAS_PRINT_DERIVATIVE_POLICY
  : GOAL_BOOK_PRINT_DERIVATIVE_POLICY

const printDerivativeTotalLimitForProfile = (
  profile: GoalBookPrintDerivativeProfile | undefined,
) => profile === 'bounded-atlas' ? 78 * 1024 * 1024 : 128 * 1024 * 1024

const artifactSizeLimitForProfile = (
  profile: GoalBookPrintDerivativeProfile | undefined,
) => profile === 'bounded-atlas' ? 90 * 1024 * 1024 : 50 * 1024 * 1024

export type GoalBookRenderOptions = {
  feedbackBaseUrl: string
  embeddedVisualizationByGoalId?: Readonly<Record<string, string>>
  embeddedVisualizationByUrl?: Readonly<Record<string, string>>
  renderedVisualizationByUrl?: Readonly<Record<string, {
    digest: string
    profile: string
  }>>
  language?: string
  printDerivativeProfile?: GoalBookPrintDerivativeProfile
}

export type GoalBookPdfOptions = GoalBookRenderOptions & {
  chromiumExecutablePath?: string
  publicRoot?: string
  allowNoSandbox?: boolean
}

export type GoalBookVisualizationLoadOptions = {
  optimizeForPrint?: boolean
  chromiumExecutablePath?: string
  maxWidthPixels?: number
  maxHeightPixels?: number
  jpegQuality?: number
}

export type GoalBookPageOverflow = {
  goalId: string
  anchor: string
  scrollWidth: number
  clientWidth: number
  scrollHeight: number
  clientHeight: number
}

type OptimizedVisualization = {
  dataUrl: string
  sourceWidth: number
  sourceHeight: number
  width: number
  height: number
  bytes: number
}

type PreparedGoalBookAsset = {
  publicPath: string
  contentType: 'image/jpeg' | 'image/png' | 'image/webp'
  body: Buffer
  sourceSha256: string
  renderedSha256: string
  sourceBytes: number
  renderedBytes: number
  sourceWidth: number
  sourceHeight: number
  renderedWidth: number
  renderedHeight: number
}

export type GoalBookRenderManifest = {
  schemaVersion: 1
  rendererVersion: typeof GOAL_BOOK_RENDERER_VERSION
  bookId: string
  bookEdition: GoalBookModel['book']['edition']
  publicationMode: GoalBookModel['book']['publicationMode']
  atlasBaseUrl: string | null
  feedbackBaseUrl: string
  modelDigest: string
  format: 'html' | 'pdf'
  pageCount: number
  chapters: GoalBookModel['chapters']
  pages: Array<{
    pageNumber: number
    goalId: string
    anchor: string
    chapterIds: string[]
    goalFingerprint: string
    pageFingerprint: string
  }>
  visualizationMode: 'root-relative-local-assets'
  printDerivativePolicy: GoalBookPrintDerivativePolicy
  artifactSizeLimitBytes?: number
  assets: Array<{
    publicPath: string
    contentType: PreparedGoalBookAsset['contentType']
    sourceSha256: string
    renderedSha256: string
    sourceBytes: number
    renderedBytes: number
    sourceWidth: number
    sourceHeight: number
    renderedWidth: number
    renderedHeight: number
  }>
  artifactSha256: `sha256:${string}`
}

type GoalBookCopy = {
  goalId: string
  missingVisualization: string
  visualizationAlt: (title: string) => string
  topicPath: string
  description: string
  directPrerequisites: string
  reversePrerequisites: string
  externalPrerequisites: string
  externalReversePrerequisites: string
  none: string
  page: (page: number, total: number) => string
  bookDigest: string
  goalFingerprint: string
  feedback: string
  applicability: string
  moreApplicabilityGroups: (count: number) => string
  moreApplicabilityScopes: (count: number) => string
  applicabilityDetails: string
  stageLabel: (stage: string) => string
}

const copyForLocale = (locale: string): GoalBookCopy => {
  const language = locale.trim().toLowerCase().split(/[-_]/u)[0]
  if (language === 'de') {
    return {
      goalId: 'Lernziel-ID',
      missingVisualization: 'Für dieses Lernziel liegt keine Visualisierung vor.',
      visualizationAlt: (title) => `Visualisierung zum Lernziel „${title}“`,
      topicPath: 'Themenpfad',
      description: 'Lernzielbeschreibung',
      directPrerequisites: 'Direkte Vorbedingungen',
      reversePrerequisites: 'Wird direkt vorausgesetzt von',
      externalPrerequisites: 'Vorbedingungen außerhalb dieses Buchs',
      externalReversePrerequisites: 'Direkt aufbauende Ziele außerhalb dieses Buchs',
      none: 'Keine',
      page: (page, total) => `Seite ${page} von ${total}`,
      bookDigest: 'Buch-Digest',
      goalFingerprint: 'Ziel-Fingerprint',
      feedback: 'Feedback zu diesem Lernziel',
      applicability: 'Geltung',
      moreApplicabilityGroups: (count) => `+ ${count} weitere Ländergruppen`,
      moreApplicabilityScopes: (count) => `+ ${count} weitere Kombinationen`,
      applicabilityDetails: 'Vollständige Geltungsmatrix im Online-Atlas',
      stageLabel: (stage) => ({
        SekI: 'Sek. I',
        SekII: 'Sek. II',
        CrossStage: 'Sek. I–II',
      }[stage] ?? stage),
    }
  }
  if (language === 'en') {
    return {
      goalId: 'Learning-goal ID',
      missingVisualization: 'No visualization is available for this learning goal.',
      visualizationAlt: (title) => `Visualization for the learning goal “${title}”`,
      topicPath: 'Topic path',
      description: 'Learning-goal description',
      directPrerequisites: 'Direct prerequisites',
      reversePrerequisites: 'Directly required by',
      externalPrerequisites: 'Prerequisites outside this book',
      externalReversePrerequisites: 'Direct dependants outside this book',
      none: 'None',
      page: (page, total) => `Page ${page} of ${total}`,
      bookDigest: 'Book digest',
      goalFingerprint: 'Goal fingerprint',
      feedback: 'Feedback on this learning goal',
      applicability: 'Applicability',
      moreApplicabilityGroups: (count) => `+ ${count} more jurisdiction groups`,
      moreApplicabilityScopes: (count) => `+ ${count} more combinations`,
      applicabilityDetails: 'Full applicability matrix in the online atlas',
      stageLabel: (stage) => ({
        SekI: 'Lower secondary',
        SekII: 'Upper secondary',
        CrossStage: 'Secondary I–II',
      }[stage] ?? stage),
    }
  }
  throw new Error(`Unsupported goal-book locale ${locale}; renderer v1 supports de and en`)
}

const MAX_PRINT_APPLICABILITY_GROUPS = 3
const MAX_PRINT_APPLICABILITY_SCOPES_PER_GROUP = 3

const compactJurisdiction = (jurisdiction: string) => (
  jurisdiction.startsWith('DE-') ? jurisdiction.slice(3) : jurisdiction
)

const applicabilityDetailsUrl = (model: GoalBookModel, page: GoalBookPage) => {
  if (!model.book.atlasBaseUrl) return null
  const url = new URL(model.book.atlasBaseUrl)
  url.searchParams.set('landscape', model.book.landscapeId)
  url.searchParams.set('edition', model.book.edition)
  url.hash = page.anchor
  return url.toString()
}

const renderApplicabilitySummary = (
  model: GoalBookModel,
  page: GoalBookPage,
  copy: GoalBookCopy,
) => {
  const applicability = page.applicability
  if (!applicability || applicability.length === 0) return ''

  const groupsBySignature = new Map<string, {
    jurisdictions: string[]
    scopes: GoalBookApplicabilityScope[]
  }>()
  applicability.forEach(({ jurisdiction, scopes }) => {
    const normalizedScopes = [...scopes].sort((left, right) => (
      `${left.stage}\u0000${left.durationModel ?? ''}\u0000${left.courseProfile ?? ''}`
        .localeCompare(
          `${right.stage}\u0000${right.durationModel ?? ''}\u0000${right.courseProfile ?? ''}`,
          'de',
        )
    ))
    const signature = JSON.stringify(normalizedScopes)
    const group = groupsBySignature.get(signature)
    if (group) {
      group.jurisdictions.push(jurisdiction)
    } else {
      groupsBySignature.set(signature, { jurisdictions: [jurisdiction], scopes: normalizedScopes })
    }
  })
  const groups = [...groupsBySignature.values()]
    .map((group) => ({
      ...group,
      jurisdictions: group.jurisdictions
        .map(compactJurisdiction)
        .sort((left, right) => left.localeCompare(right, 'de')),
    }))
    .sort((left, right) => (
      left.jurisdictions.join(', ').localeCompare(right.jurisdictions.join(', '), 'de')
    ))
  const renderedGroups = groups.slice(0, MAX_PRINT_APPLICABILITY_GROUPS).map((group) => {
    const renderedScopes = group.scopes
      .slice(0, MAX_PRINT_APPLICABILITY_SCOPES_PER_GROUP)
      .map((scope) => [copy.stageLabel(scope.stage), scope.durationModel, scope.courseProfile]
        .filter((part): part is string => part !== null && part.trim() !== '')
        .join(' · '))
    if (group.scopes.length > renderedScopes.length) {
      renderedScopes.push(copy.moreApplicabilityScopes(group.scopes.length - renderedScopes.length))
    }
    return `<li><strong>${escapeHtml(group.jurisdictions.join(', '))}:</strong> ${escapeHtml(renderedScopes.join('; '))}</li>`
  })
  if (groups.length > renderedGroups.length) {
    renderedGroups.push(`<li class="applicability-more">${escapeHtml(copy.moreApplicabilityGroups(groups.length - renderedGroups.length))}</li>`)
  }
  const detailsUrl = applicabilityDetailsUrl(model, page)
  return `<div class="goal-applicability">
    <p class="section-heading section-heading--small">${escapeHtml(copy.applicability)}</p>
    <ul>${renderedGroups.join('')}</ul>
    ${detailsUrl ? `<a href="${escapeHtml(detailsUrl)}" rel="noreferrer noopener">${escapeHtml(copy.applicabilityDetails)}</a>` : ''}
  </div>`
}

const visualizationMediaType = (sourcePath: string) => {
  switch (extname(sourcePath).toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    default:
      throw new Error(`Unsupported goal-book visualization extension: ${sourcePath}`)
  }
}

const assertImageSignature = (
  content: Buffer,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp',
  sourcePath: string,
) => {
  const valid = mediaType === 'image/jpeg'
    ? content.length >= 3 && content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff
    : mediaType === 'image/png'
      ? content.length >= 8 && content.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      )
      : content.length >= 12
        && content.subarray(0, 4).toString('ascii') === 'RIFF'
        && content.subarray(8, 12).toString('ascii') === 'WEBP'
  if (!valid) {
    throw new Error(`Goal-book visualization bytes do not match ${mediaType}: ${sourcePath}`)
  }
}

const normalizedPublicVisualizationPath = (publicUrl: string, goalId: string) => {
  if (!publicUrl.startsWith(PUBLIC_VISUALIZATION_PREFIX)) {
    throw new Error(
      `Goal ${goalId} visualization must use ${PUBLIC_VISUALIZATION_PREFIX}: ${publicUrl}`,
    )
  }
  let parsedUrl: URL
  try {
    parsedUrl = new URL(publicUrl, GOAL_BOOK_VIRTUAL_ORIGIN)
  } catch {
    throw new Error(`Goal ${goalId} has an invalid visualization URL: ${publicUrl}`)
  }
  if (parsedUrl.origin !== GOAL_BOOK_VIRTUAL_ORIGIN || parsedUrl.search || parsedUrl.hash) {
    throw new Error(`Goal ${goalId} visualization URL must be a plain root-relative path`)
  }
  let decodedPath: string
  try {
    decodedPath = decodeURIComponent(parsedUrl.pathname)
  } catch {
    throw new Error(`Goal ${goalId} visualization URL is not valid UTF-8: ${publicUrl}`)
  }
  if (!decodedPath.startsWith(PUBLIC_VISUALIZATION_PREFIX)) {
    throw new Error(`Goal ${goalId} visualization path escapes the public asset prefix`)
  }
  return decodedPath
}

const embeddedImageBytes = (dataUrl: string, goalId: string) => {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([a-z0-9+/=\r\n]+)$/iu.exec(dataUrl)
  if (!match) {
    throw new Error(
      `Goal ${goalId} visualization is not an embedded PNG, JPEG, or WebP data URL`,
    )
  }
  const content = Buffer.from(match[2], 'base64')
  const mediaType = match[1].toLowerCase() as 'image/jpeg' | 'image/png' | 'image/webp'
  assertImageSignature(content, mediaType, `embedded visualization for ${goalId}`)
  return { content, mediaType }
}

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;')

const assertNonEmpty = (value: string, label: string) => {
  if (value.trim().length === 0) {
    throw new Error(`${label} must not be empty`)
  }
}

const feedbackUrl = (
  baseUrl: string,
  model: GoalBookModel,
  goal: GoalBookPage,
) => {
  let url: URL
  try {
    url = new URL(baseUrl)
  } catch {
    throw new Error(`feedbackBaseUrl must be an absolute URL: ${baseUrl}`)
  }
  if (url.protocol !== 'https:') {
    throw new Error(`feedbackBaseUrl must use HTTPS: ${baseUrl}`)
  }
  if (url.username || url.password || url.hash) {
    throw new Error('feedbackBaseUrl must not contain credentials or a fragment')
  }
  const reservedParameters = new Set([
    'goalid',
    'goalfingerprint',
    'pagefingerprint',
    'bookdigest',
    'page',
  ])
  for (const parameter of url.searchParams.keys()) {
    if (
      reservedParameters.has(parameter.toLowerCase())
      || /skillpilot|learner|user|token|auth|email|session|credential/iu.test(parameter)
    ) {
      throw new Error(`feedbackBaseUrl contains reserved or privacy-sensitive parameter ${parameter}`)
    }
  }
  url.searchParams.set('goalId', goal.goalId)
  url.searchParams.set('goalFingerprint', goal.goalFingerprint)
  url.searchParams.set('pageFingerprint', goal.pageFingerprint)
  url.searchParams.set('bookDigest', model.digest)
  url.searchParams.set('page', String(goal.pageNumber))
  return url.toString()
}

const embeddedVisualization = (
  page: GoalBookPage,
  options: GoalBookRenderOptions,
) => {
  if (page.visualization === null) return null
  if (page.visualization.resourceType !== 'image') {
    throw new Error(
      `Goal ${page.goalId} visualization has unsupported resource type ${page.visualization.resourceType}`,
    )
  }
  const source = options.embeddedVisualizationByGoalId?.[page.goalId]
    ?? options.embeddedVisualizationByUrl?.[page.visualization.url]
    ?? page.visualization.url
  if (source.startsWith('data:')) {
    embeddedImageBytes(source, page.goalId)
    return source
  }
  normalizedPublicVisualizationPath(source, page.goalId)
  return source
}

const resolvePublicVisualizationSource = async (
  absolutePublicRoot: string,
  decodedPath: string,
  goalId: string,
) => {
  const candidatePath = resolve(absolutePublicRoot, decodedPath.slice(1))
  const sourcePath = await realpath(candidatePath)
  const relativeSourcePath = relative(absolutePublicRoot, sourcePath)
  if (
    relativeSourcePath === ''
    || relativeSourcePath.startsWith(`..${sep}`)
    || relativeSourcePath === '..'
    || isAbsolute(relativeSourcePath)
  ) {
    throw new Error(`Goal ${goalId} visualization resolves outside the public root`)
  }
  return sourcePath
}

export const loadEmbeddedGoalBookVisualizations = async (
  model: GoalBookModel,
  publicRoot: string,
) => {
  const absolutePublicRoot = await realpath(resolve(publicRoot))
  const dataUrlBySourceUrl = new Map<string, { dataUrl: string; digest: string }>()
  const embeddedVisualizationByGoalId: Record<string, string> = {}
  let embeddedTotalBytes = 0

  for (const page of model.pages) {
    const visualization = page.visualization
    if (visualization === null) continue
    const publicUrl = visualization.url
    const decodedPath = normalizedPublicVisualizationPath(publicUrl, page.goalId)

    let embedded = dataUrlBySourceUrl.get(decodedPath)
    if (!embedded) {
      const sourcePath = await resolvePublicVisualizationSource(
        absolutePublicRoot,
        decodedPath,
        page.goalId,
      )
      const mediaType = visualizationMediaType(sourcePath)
      const content = await readFile(sourcePath)
      if (content.length > MAX_DIRECT_EMBEDDED_VISUALIZATION_BYTES) {
        throw new Error(
          `Goal ${page.goalId} embedded visualization exceeds ${MAX_DIRECT_EMBEDDED_VISUALIZATION_BYTES} bytes`,
        )
      }
      assertImageSignature(content, mediaType, sourcePath)
      const digest = `sha256:${createHash('sha256').update(content).digest('hex')}`
      embeddedTotalBytes += content.length
      if (embeddedTotalBytes > MAX_DIRECT_EMBEDDED_TOTAL_BYTES) {
        throw new Error(
          `Embedded goal-book visualizations exceed the ${MAX_DIRECT_EMBEDDED_TOTAL_BYTES}-byte total budget`,
        )
      }
      embedded = {
        dataUrl: `data:${mediaType};base64,${content.toString('base64')}`,
        digest,
      }
      dataUrlBySourceUrl.set(decodedPath, embedded)
    }
    if (embedded.digest !== visualization.originalDigest) {
      throw new Error(
        `Goal ${page.goalId} visualization digest mismatch: model ${visualization.originalDigest}, asset ${embedded.digest}`,
      )
    }
    embeddedVisualizationByGoalId[page.goalId] = embedded.dataUrl
  }

  return embeddedVisualizationByGoalId
}

const optimizeVisualizationOnPage = async (
  optimizerPage: Page,
  sourceDataUrl: string,
  sourceMediaType: 'image/jpeg' | 'image/png' | 'image/webp',
  policy: GoalBookPrintDerivativePolicy,
) => optimizerPage.evaluate(async ({
  source,
  sourceType,
  policy,
}) => {
  const image = new Image()
  image.decoding = 'sync'
  await new Promise<void>((resolveImage, rejectImage) => {
    image.addEventListener('load', () => resolveImage(), { once: true })
    image.addEventListener('error', () => rejectImage(new Error('image decode failed')), {
      once: true,
    })
    image.src = source
  })
  const sourceWidth = image.naturalWidth
  const sourceHeight = image.naturalHeight
  if (sourceWidth < 1 || sourceHeight < 1) throw new Error('image has empty dimensions')

  const baseScale = Math.min(
    1,
    policy.maxWidthPixels / sourceWidth,
    policy.maxHeightPixels / sourceHeight,
  )
  const outputType = sourceType === 'image/jpeg' ? 'image/jpeg' : 'image/webp'
  let result: OptimizedVisualization | null = null

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const retryScale = 0.88 ** attempt
    const width = Math.max(1, Math.round(sourceWidth * baseScale * retryScale))
    const height = Math.max(1, Math.round(sourceHeight * baseScale * retryScale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d', { alpha: outputType !== 'image/jpeg' })
    if (!context) throw new Error('2D canvas context unavailable')
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    if (outputType === 'image/jpeg') {
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, width, height)
    }
    context.drawImage(image, 0, 0, width, height)
    const initialQuality = outputType === 'image/jpeg'
      ? policy.jpegQuality
      : policy.webpQuality
    const quality = Math.max(0.55, initialQuality - attempt * 0.04)
    const dataUrl = canvas.toDataURL(outputType, quality)
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
    const bytes = Math.floor(base64.length * 3 / 4) - padding
    result = {
      dataUrl,
      sourceWidth,
      sourceHeight,
      width,
      height,
      bytes,
    }
    canvas.width = 1
    canvas.height = 1
    if (bytes <= policy.maxBytes) return result
  }

  if (!result) throw new Error('print derivative was not produced')
  return result
}, {
  source: sourceDataUrl,
  sourceType: sourceMediaType,
  policy,
})

const prepareLocalRenderAssets = async (
  browser: Browser,
  model: GoalBookModel,
  options: GoalBookPdfOptions,
) => {
  const printDerivativePolicy = printDerivativePolicyForProfile(
    options.printDerivativeProfile,
  )
  const printDerivativeTotalLimit = printDerivativeTotalLimitForProfile(
    options.printDerivativeProfile,
  )
  const requestedPaths = new Map<string, GoalBookPage>()
  model.pages.forEach((page) => {
    const source = embeddedVisualization(page, options)
    if (source && !source.startsWith('data:')) {
      const publicPath = normalizedPublicVisualizationPath(source, page.goalId)
      const existing = requestedPaths.get(publicPath)
      if (
        existing?.visualization?.originalDigest
        && existing.visualization.originalDigest !== page.visualization?.originalDigest
      ) {
        throw new Error(`Shared visualization ${publicPath} carries conflicting original digests`)
      }
      requestedPaths.set(publicPath, page)
    }
  })
  if (requestedPaths.size === 0) return new Map<string, PreparedGoalBookAsset>()
  if (!options.publicRoot) {
    throw new Error('publicRoot is required to render root-relative goal visualizations')
  }

  const absolutePublicRoot = await realpath(resolve(options.publicRoot))
  const optimizerPage = await browser.newPage()
  const preparedAssets = new Map<string, PreparedGoalBookAsset>()
  let totalDerivativeBytes = 0
  try {
    await optimizerPage.setContent('<!doctype html><html><body></body></html>')
    for (const [publicPath, goalPage] of requestedPaths) {
      const goalId = goalPage.goalId
      const sourcePath = await resolvePublicVisualizationSource(
        absolutePublicRoot,
        publicPath,
        goalId,
      )
      const sourceMediaType = visualizationMediaType(sourcePath)
      const sourceContent = await readFile(sourcePath)
      if (sourceContent.length > MAX_EMBEDDED_VISUALIZATION_BYTES) {
        throw new Error(
          `Goal ${goalId} visualization exceeds ${MAX_EMBEDDED_VISUALIZATION_BYTES} bytes`,
        )
      }
      assertImageSignature(sourceContent, sourceMediaType, sourcePath)
      const sourceSha256 = `sha256:${createHash('sha256').update(sourceContent).digest('hex')}`
      if (goalPage.visualization?.originalDigest !== sourceSha256) {
        throw new Error(
          `Goal ${goalId} visualization digest mismatch: model ${goalPage.visualization?.originalDigest ?? 'missing'}, asset ${sourceSha256}`,
        )
      }
      const optimized = await optimizeVisualizationOnPage(
        optimizerPage,
        `data:${sourceMediaType};base64,${sourceContent.toString('base64')}`,
        sourceMediaType,
        printDerivativePolicy,
      )
      const { content: renderedContent, mediaType: renderedMediaType } = embeddedImageBytes(
        optimized.dataUrl,
        goalId,
      )
      if (renderedContent.length !== optimized.bytes) {
        throw new Error(`Goal ${goalId} print derivative byte count is inconsistent`)
      }
      if (renderedContent.length > printDerivativePolicy.maxBytes) {
        throw new Error(
          `Goal ${goalId} print derivative exceeds ${printDerivativePolicy.maxBytes} bytes`,
        )
      }
      totalDerivativeBytes += renderedContent.length
      if (totalDerivativeBytes > printDerivativeTotalLimit) {
        throw new Error(
          `Goal-book print derivatives exceed ${printDerivativeTotalLimit} bytes`,
        )
      }
      preparedAssets.set(publicPath, {
        publicPath,
        contentType: renderedMediaType,
        body: renderedContent,
        sourceSha256,
        renderedSha256: `sha256:${createHash('sha256').update(renderedContent).digest('hex')}`,
        sourceBytes: sourceContent.length,
        renderedBytes: renderedContent.length,
        sourceWidth: optimized.sourceWidth,
        sourceHeight: optimized.sourceHeight,
        renderedWidth: optimized.width,
        renderedHeight: optimized.height,
      })
    }
  } finally {
    await optimizerPage.close()
  }
  return preparedAssets
}

const referenceList = (
  label: string,
  references: readonly GoalBookReference[],
  pagesByGoalId: ReadonlyMap<string, GoalBookPage>,
  copy: GoalBookCopy,
) => {
  const items = references.map((reference) => {
    const target = pagesByGoalId.get(reference.goalId)
    if (
      !target
      || reference.anchor !== target.anchor
      || reference.pageNumber !== target.pageNumber
    ) {
      throw new Error(
        `${label} reference ${reference.goalId} does not resolve to an in-book goal anchor`,
      )
    }
    const pageLabel = reference.pageNumber === undefined
      ? ''
      : `<span class="reference-page">S. ${reference.pageNumber}</span>`
    return `<li><a href="#${escapeHtml(reference.anchor)}"><span>${escapeHtml(reference.title)}</span><code>${escapeHtml(reference.goalId)}</code>${pageLabel}</a></li>`
  }).join('')
  if (items.length === 0) {
    return `<p class="empty-reference-list">${escapeHtml(copy.none)}</p>`
  }
  return `<ul class="reference-list">${items}</ul>`
}

const externalReferenceList = (
  pageAnchor: string,
  sectionId: 'external-prerequisites' | 'external-reverse-prerequisites',
  label: string,
  references: readonly GoalBookExternalReference[],
) => {
  if (references.length === 0) return ''
  const headingId = `${pageAnchor}-${sectionId}-heading`
  return `
    <section class="external-references" aria-labelledby="${escapeHtml(headingId)}">
      <p class="section-heading section-heading--small" id="${escapeHtml(headingId)}">${escapeHtml(label)}</p>
      <ul>${references.map((reference) => (
        `<li>${reference.canonicalUrl
          ? `<a href="${escapeHtml(reference.canonicalUrl)}" rel="noreferrer noopener"><span>${escapeHtml(reference.title)}</span> <code>${escapeHtml(reference.goalId)}</code></a>`
          : `<span>${escapeHtml(reference.title)}</span> <code>${escapeHtml(reference.goalId)}</code>`}</li>`
      )).join('')}</ul>
    </section>`
}

const renderPage = (
  model: GoalBookModel,
  page: GoalBookPage,
  options: GoalBookRenderOptions,
  pagesByGoalId: ReadonlyMap<string, GoalBookPage>,
  copy: GoalBookCopy,
) => {
  const image = embeddedVisualization(page, options)
  const altText = page.visualization?.altText?.trim()
    || copy.visualizationAlt(page.title)
  const renderedVisualization = page.visualization
    ? options.renderedVisualizationByUrl?.[page.visualization.url]
    : undefined
  const visualizationBinding = page.visualization
    ? ` data-original-digest="${escapeHtml(page.visualization.originalDigest)}"${renderedVisualization
      ? ` data-rendered-digest="${escapeHtml(renderedVisualization.digest)}" data-render-profile="${escapeHtml(renderedVisualization.profile)}"`
      : ''}`
    : ''
  const visualization = image === null
    ? `<figure class="goal-visualization goal-visualization--missing" role="img" aria-label="${escapeHtml(copy.missingVisualization)}">
        <div>${escapeHtml(copy.missingVisualization)}</div>
      </figure>`
    : `<figure class="goal-visualization"${visualizationBinding}>
        <img src="${escapeHtml(image)}" alt="${escapeHtml(altText)}">
      </figure>`
  const breadcrumbs = page.breadcrumbs.length === 0
    ? ''
    : `<nav class="breadcrumbs" aria-label="${escapeHtml(copy.topicPath)}"><ol>${page.breadcrumbs.map((part) => (
      `<li>${escapeHtml(part)}</li>`
    )).join('')}</ol></nav>`
  const directPrerequisites = referenceList('requires', page.requires, pagesByGoalId, copy)
  const reversePrerequisites = referenceList('reverseRequires', page.reverseRequires, pagesByGoalId, copy)
  const feedbackHref = feedbackUrl(options.feedbackBaseUrl, model, page)
  const applicabilitySummary = renderApplicabilitySummary(model, page, copy)
  const relationCount = page.requires.length + page.reverseRequires.length
  const relationDensityClass = relationCount > 35
    ? ' goal-page--very-dense-relations'
    : relationCount > 20
      ? ' goal-page--dense-relations'
      : ''

  return `<article class="goal-page${relationDensityClass}" id="${escapeHtml(page.anchor)}" data-goal-id="${escapeHtml(page.goalId)}" data-page-number="${page.pageNumber}" data-chapter-ids="${escapeHtml(page.chapterIds.join(' '))}" aria-labelledby="${escapeHtml(page.anchor)}-title">
    <header class="goal-header">
      <h1 id="${escapeHtml(page.anchor)}-title"><a class="goal-self-link" href="#${escapeHtml(page.anchor)}">${escapeHtml(page.title)}</a></h1>
      <p class="goal-id"><span>${escapeHtml(copy.goalId)}</span> <code>${escapeHtml(page.goalId)}</code></p>
      ${breadcrumbs}
    </header>
    <div class="goal-body">
      ${visualization}
      <section class="goal-description" aria-labelledby="${escapeHtml(page.anchor)}-description-heading">
        <p class="section-heading" id="${escapeHtml(page.anchor)}-description-heading">${escapeHtml(copy.description)}</p>
        <p>${escapeHtml(page.description)}</p>
        ${applicabilitySummary}
      </section>
      <div class="goal-relations">
        <section aria-labelledby="${escapeHtml(page.anchor)}-requires-heading">
          <p class="section-heading" id="${escapeHtml(page.anchor)}-requires-heading">${escapeHtml(copy.directPrerequisites)}</p>
          ${directPrerequisites}
        </section>
        <section aria-labelledby="${escapeHtml(page.anchor)}-reverse-heading">
          <p class="section-heading" id="${escapeHtml(page.anchor)}-reverse-heading">${escapeHtml(copy.reversePrerequisites)}</p>
          ${reversePrerequisites}
        </section>
        ${externalReferenceList(
          page.anchor,
          'external-prerequisites',
          copy.externalPrerequisites,
          page.externalPrerequisites,
        )}
        ${externalReferenceList(
          page.anchor,
          'external-reverse-prerequisites',
          copy.externalReversePrerequisites,
          page.externalReverseRequires,
        )}
      </div>
    </div>
    <footer class="goal-footer">
      <span>${escapeHtml(copy.page(page.pageNumber, model.pages.length))}</span>
      <span>${escapeHtml(copy.bookDigest)} <code>${escapeHtml(model.digest)}</code></span>
      <span>${escapeHtml(copy.goalFingerprint)} <code>${escapeHtml(page.goalFingerprint)}</code></span>
      <a href="${escapeHtml(feedbackHref)}" rel="noreferrer noopener">${escapeHtml(copy.feedback)}</a>
    </footer>
  </article>`
}

const STYLES = `
    @page { size: A4 portrait; margin: 0; }
    :root {
      color-scheme: light;
      font-family: Arial, Helvetica, sans-serif;
      --goal-visualization-row-height: ${GOAL_BOOK_VISUALIZATION_HEIGHT_MM}mm;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #e7edf5; color: #172238; }
    body { counter-reset: goal-page; }
    .goal-page {
      width: 210mm;
      height: 297mm;
      padding: 8mm 10mm 6mm;
      margin: 0 auto 8mm;
      background: #fff;
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      gap: 3mm;
      break-after: page;
      page-break-after: always;
      break-inside: avoid;
      page-break-inside: avoid;
      overflow: auto;
      counter-increment: goal-page;
      print-color-adjust: exact;
    }
    .goal-page:last-child { break-after: auto; page-break-after: auto; }
    .goal-header { min-width: 0; }
    .breadcrumbs ol { display: flex; flex-wrap: wrap; gap: 1.5mm; margin: 2mm 0 0; padding: 0; list-style: none; color: #54647c; font-size: 9pt; }
    .breadcrumbs li:not(:last-child)::after { content: "›"; padding-left: 1.5mm; }
    h1 { margin: 0; padding-right: 4mm; font-size: 23pt; line-height: 1.12; color: #132036; }
    .goal-self-link { color: inherit; text-decoration: none; }
    .goal-id { margin: 1mm 0 0; color: #4d5e77; font-size: 7pt; }
    .goal-id span { font-weight: 700; }
    code { overflow-wrap: anywhere; font: inherit; font-family: "Courier New", Courier, monospace; }
    .goal-body {
      min-height: 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: var(--goal-visualization-row-height) auto minmax(0, 1fr);
      grid-template-areas: "visual" "description" "relations";
      gap: 3mm;
    }
    .goal-visualization {
      grid-area: visual;
      height: var(--goal-visualization-row-height);
      min-width: 0;
      min-height: 0;
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .goal-visualization img { display: block; width: 100%; height: 100%; object-fit: contain; }
    .goal-visualization--missing { color: #66768c; font-size: 12pt; border: 0.35mm dashed #ccd7e5; border-radius: 3mm; }
    .goal-description { grid-area: description; min-width: 0; }
    .section-heading { margin: 0 0 0.8mm; color: #243956; font-size: 9pt; font-weight: 700; }
    .section-heading--small { margin: 1mm 0 0.5mm; font-size: 7.5pt; }
    .goal-description p { margin: 0; font-size: 11pt; line-height: 1.3; hyphens: auto; }
    .goal-applicability { margin-top: 1.2mm; }
    .goal-description .goal-applicability .section-heading { margin: 0 0 0.5mm; font-size: 7.5pt; line-height: 1.1; }
    .goal-applicability ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 0.35mm; }
    .goal-applicability li { color: #425875; font-size: 6.6pt; line-height: 1.12; }
    .goal-applicability strong { color: #243956; }
    .goal-applicability .applicability-more { font-style: italic; }
    .goal-applicability > a { color: #075c9d; font-size: 6.2pt; font-weight: 700; }
    .goal-relations { grid-area: relations; min-width: 0; min-height: 0; align-self: stretch; display: grid; align-content: start; gap: 1mm; }
    .reference-list, .external-references ul { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(43mm, 1fr)); gap: 0.7mm; }
    .reference-list a {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 0.2mm 1mm;
      padding: 0.55mm 1mm;
      color: #074f8c;
      border: 0.25mm solid #bdd5e8;
      border-radius: 1.5mm;
      text-decoration: none;
      background: #f6fbff;
      font-size: 7.2pt;
      line-height: 1.08;
    }
    .reference-list a span:first-child { font-weight: 700; }
    .reference-list a code { grid-column: 1; color: #52657d; font-size: 4.8pt; line-height: 1.05; }
    .reference-page { grid-column: 2; grid-row: 1 / span 2; align-self: center; white-space: nowrap; font-size: 7pt; }
    .empty-reference-list { margin: 0; color: #63728a; font-size: 7.5pt; }
    .external-references li { color: #52657d; font-size: 6.5pt; line-height: 1.1; }
    .external-references code { font-size: 4.8pt; }
    .external-references a { color: #075c9d; text-decoration: underline; }
    .goal-page--dense-relations .reference-list { grid-template-columns: repeat(auto-fit, minmax(30mm, 1fr)); gap: 0.4mm; }
    .goal-page--dense-relations .reference-list a { padding: 0.4mm 0.7mm; font-size: 6.1pt; line-height: 1.04; }
    .goal-page--dense-relations .reference-list a code { font-size: 4.1pt; line-height: 1; }
    .goal-page--dense-relations .reference-list a code { display: none; }
    .goal-page--dense-relations .reference-page { font-size: 5.8pt; }
    .goal-page--very-dense-relations .reference-list { grid-template-columns: repeat(auto-fit, minmax(25mm, 1fr)); gap: 0.3mm; }
    .goal-page--very-dense-relations .goal-relations { gap: 0.4mm; }
    .goal-page--very-dense-relations .reference-list a { padding: 0.2mm 0.4mm; font-size: 4.5pt; line-height: 1; }
    .goal-page--very-dense-relations .reference-list a code { font-size: 3.3pt; line-height: 1; }
    .goal-page--very-dense-relations .reference-page { font-size: 4.2pt; }
    .goal-footer {
      min-width: 0;
      padding-top: 1mm;
      border-top: 0.25mm solid #d6dee9;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) minmax(0, 1fr) auto;
      gap: 2mm;
      align-items: center;
      color: #5b6a80;
      font-size: 5pt;
    }
    .goal-footer span { min-width: 0; overflow-wrap: anywhere; }
    .goal-footer a { color: #075c9d; font-weight: 700; white-space: nowrap; }
    @media print {
      html, body { background: #fff; }
      .goal-page { margin: 0; overflow: hidden; }
    }
  `

export const assertGoalBookRenderable = (
  model: GoalBookModel,
  options: GoalBookRenderOptions,
) => {
  assertNonEmpty(model.book.title, 'book.title')
  assertNonEmpty(model.digest, 'digest')
  assertNonEmpty(options.feedbackBaseUrl, 'feedbackBaseUrl')
  copyForLocale(options.language?.trim() || model.book.locale)
  if (model.schemaVersion !== '1.0.0') {
    throw new Error(`Unsupported goal-book model schema version ${model.schemaVersion}`)
  }
  if (model.book.oneGoalPerPage !== true) {
    throw new Error('Goal book model must guarantee oneGoalPerPage')
  }
  if (model.pages.length === 0) {
    throw new Error('Goal book model must contain at least one page')
  }
  if (model.book.pageCount !== model.pages.length) {
    throw new Error(
      `Goal book declares ${model.book.pageCount} pages but contains ${model.pages.length}`,
    )
  }
  if (model.book.publicationMode !== 'review' && model.book.publicationMode !== 'public') {
    throw new Error(`Unsupported goal-book publication mode ${model.book.publicationMode}`)
  }

  const goalIds = new Set<string>()
  const generatedDomIds = new Set<string>()
  model.pages.forEach((page, index) => {
    assertNonEmpty(page.goalId, `pages[${index}].goalId`)
    assertNonEmpty(page.title, `pages[${index}].title`)
    assertNonEmpty(page.description, `pages[${index}].description`)
    assertNonEmpty(page.goalFingerprint, `pages[${index}].goalFingerprint`)
    assertNonEmpty(page.pageFingerprint, `pages[${index}].pageFingerprint`)
    if (page.pageNumber !== index + 1) {
      throw new Error(
        `Goal ${page.goalId} has pageNumber ${page.pageNumber}; expected ${index + 1}`,
      )
    }
    const expectedAnchor = `goal-${page.goalId}`
    if (!SAFE_ANCHOR_PATTERN.test(page.anchor) || page.anchor !== expectedAnchor) {
      throw new Error(`Goal ${page.goalId} has unsafe anchor ${page.anchor}`)
    }
    if (goalIds.has(page.goalId)) {
      throw new Error(`Duplicate goal ID ${page.goalId}`)
    }
    goalIds.add(page.goalId)
    const pageDomIds = [
      page.anchor,
      `${page.anchor}-title`,
      `${page.anchor}-description-heading`,
      `${page.anchor}-requires-heading`,
      `${page.anchor}-reverse-heading`,
      ...(page.externalPrerequisites.length > 0
        ? [`${page.anchor}-external-prerequisites-heading`]
        : []),
      ...(page.externalReverseRequires.length > 0
        ? [`${page.anchor}-external-reverse-prerequisites-heading`]
        : []),
    ]
    pageDomIds.forEach((domId) => {
      if (generatedDomIds.has(domId)) {
        throw new Error(`Duplicate generated DOM ID ${domId}`)
      }
      generatedDomIds.add(domId)
    })
  })
  const pagesByGoalId = new Map(model.pages.map((page) => [page.goalId, page]))
  const chapterIds = new Set(model.chapters.map(({ chapterId }) => chapterId))
  const embeddedSources = new Set<string>()
  let embeddedTotalBytes = 0
  const validateInternalReference = (
    label: string,
    reference: GoalBookReference,
  ) => {
    const target = pagesByGoalId.get(reference.goalId)
    if (
      !target
      || reference.anchor !== target.anchor
      || reference.pageNumber !== target.pageNumber
      || reference.title !== target.title
    ) {
      throw new Error(
        `${label} reference ${reference.goalId} does not resolve exactly to its in-book goal`,
      )
    }
  }
  model.pages.forEach((page) => {
    page.chapterIds.forEach((chapterId) => {
      if (!chapterIds.has(chapterId)) {
        throw new Error(`Goal ${page.goalId} references unknown chapter ${chapterId}`)
      }
    })
    if (page.visualization) {
      assertNonEmpty(
        page.visualization.originalDigest,
        `goal ${page.goalId} visualization.originalDigest`,
      )
      const isApproved = page.visualization.qaStatus === 'approved'
        && page.visualization.approvedForPublication
      if (
        page.visualization.approvedForPublication
        !== (page.visualization.qaStatus === 'approved')
      ) {
        throw new Error(`Goal ${page.goalId} visualization QA approval fields disagree`)
      }
      if (model.book.publicationMode === 'public' && !isApproved) {
        throw new Error(
          `Public goal book contains unapproved visualization for goal ${page.goalId}`,
        )
      }
    }
    const applicability = page.applicability
    if (applicability) {
      const jurisdictions = new Set<string>()
      applicability.forEach(({ jurisdiction, scopes }, jurisdictionIndex) => {
        assertNonEmpty(
          jurisdiction,
          `goal ${page.goalId} applicability[${jurisdictionIndex}].jurisdiction`,
        )
        if (jurisdictions.has(jurisdiction)) {
          throw new Error(`Goal ${page.goalId} repeats applicability jurisdiction ${jurisdiction}`)
        }
        jurisdictions.add(jurisdiction)
        if (scopes.length === 0) {
          throw new Error(`Goal ${page.goalId} applicability jurisdiction ${jurisdiction} has no scopes`)
        }
        const scopeSignatures = new Set<string>()
        scopes.forEach((scope, scopeIndex) => {
          assertNonEmpty(
            scope.stage,
            `goal ${page.goalId} applicability[${jurisdictionIndex}].scopes[${scopeIndex}].stage`,
          )
          for (const [field, value] of [
            ['durationModel', scope.durationModel],
            ['courseProfile', scope.courseProfile],
          ] as const) {
            if (value !== null) {
              assertNonEmpty(
                value,
                `goal ${page.goalId} applicability[${jurisdictionIndex}].scopes[${scopeIndex}].${field}`,
              )
            }
          }
          const signature = JSON.stringify(scope)
          if (scopeSignatures.has(signature)) {
            throw new Error(
              `Goal ${page.goalId} repeats applicability scope for jurisdiction ${jurisdiction}`,
            )
          }
          scopeSignatures.add(signature)
        })
      })
    }
    const source = embeddedVisualization(page, options)
    if (source?.startsWith('data:') && !embeddedSources.has(source)) {
      const { content } = embeddedImageBytes(source, page.goalId)
      if (content.length > MAX_DIRECT_EMBEDDED_VISUALIZATION_BYTES) {
        throw new Error(
          `Goal ${page.goalId} embedded visualization exceeds ${MAX_DIRECT_EMBEDDED_VISUALIZATION_BYTES} bytes`,
        )
      }
      embeddedSources.add(source)
      embeddedTotalBytes += content.length
      if (embeddedTotalBytes > MAX_DIRECT_EMBEDDED_TOTAL_BYTES) {
        throw new Error(
          `Embedded goal-book visualizations exceed the ${MAX_DIRECT_EMBEDDED_TOTAL_BYTES}-byte total budget`,
        )
      }
    }
    feedbackUrl(options.feedbackBaseUrl, model, page)
    const requiresIds = new Set<string>()
    page.requires.forEach((reference) => {
      validateInternalReference('requires', reference)
      if (requiresIds.has(reference.goalId)) {
        throw new Error(`Goal ${page.goalId} repeats requires reference ${reference.goalId}`)
      }
      requiresIds.add(reference.goalId)
      const target = pagesByGoalId.get(reference.goalId)!
      if (!target.reverseRequires.some(({ goalId }) => goalId === page.goalId)) {
        throw new Error(
          `Goal ${page.goalId} requires ${reference.goalId} without reciprocal reverseRequires`,
        )
      }
    })
    const reverseIds = new Set<string>()
    page.reverseRequires.forEach((reference) => {
      validateInternalReference('reverseRequires', reference)
      if (reverseIds.has(reference.goalId)) {
        throw new Error(`Goal ${page.goalId} repeats reverseRequires reference ${reference.goalId}`)
      }
      reverseIds.add(reference.goalId)
      const target = pagesByGoalId.get(reference.goalId)!
      if (!target.requires.some(({ goalId }) => goalId === page.goalId)) {
        throw new Error(
          `Goal ${page.goalId} reverseRequires ${reference.goalId} without reciprocal requires`,
        )
      }
    })
    const validateExternalReferences = (
      label: string,
      references: readonly GoalBookExternalReference[],
    ) => {
      const seen = new Set<string>()
      references.forEach((reference) => {
        assertNonEmpty(reference.title, `${label} ${reference.goalId} title`)
        if (goalIds.has(reference.goalId)) {
          throw new Error(
            `${label} ${reference.goalId} is an in-book goal and must be linked internally`,
          )
        }
        if (seen.has(reference.goalId)) {
          throw new Error(`Goal ${page.goalId} repeats ${label} ${reference.goalId}`)
        }
        seen.add(reference.goalId)
        if (reference.canonicalUrl === null) {
          if (model.book.publicationMode === 'public') {
            throw new Error(`Public goal book has no canonical URL for ${reference.goalId}`)
          }
          return
        }
        let url: URL
        try {
          url = new URL(reference.canonicalUrl)
        } catch {
          throw new Error(`${label} ${reference.goalId} has an invalid canonical URL`)
        }
        if (
          url.protocol !== 'https:'
          || url.username
          || url.password
          || url.hash !== `#goal-${reference.goalId}`
        ) {
          throw new Error(
            `${label} ${reference.goalId} canonical URL must be HTTPS and target its goal anchor`,
          )
        }
      })
    }
    validateExternalReferences('external prerequisite', page.externalPrerequisites)
    validateExternalReferences('external reverse prerequisite', page.externalReverseRequires)
  })
}

export const renderGoalBookHtml = (
  model: GoalBookModel,
  options: GoalBookRenderOptions,
) => {
  assertGoalBookRenderable(model, options)
  const printDerivativePolicy = printDerivativePolicyForProfile(
    options.printDerivativeProfile,
  )
  const pagesByGoalId = new Map(model.pages.map((page) => [page.goalId, page]))
  const language = options.language?.trim() || model.book.locale
  const copy = copyForLocale(language)
  const pages = model.pages.map((page) => (
    renderPage(model, page, options, pagesByGoalId, copy)
  )).join('\n')
  return `<!doctype html>
<html lang="${escapeHtml(language)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="skillpilot-goal-book-renderer" content="${GOAL_BOOK_RENDERER_VERSION}">
  <meta name="skillpilot-goal-book-print-profile" content="${escapeHtml(JSON.stringify(printDerivativePolicy))}">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; font-src 'none'; connect-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'">
  <title>${escapeHtml(model.book.title)}</title>
  <style>${STYLES}</style>
</head>
<body>
${pages}
</body>
</html>`
}

const optionsWithPreparedAssetMetadata = (
  options: GoalBookPdfOptions,
  assets: ReadonlyMap<string, PreparedGoalBookAsset>,
): GoalBookPdfOptions => ({
  ...options,
  renderedVisualizationByUrl: Object.fromEntries([...assets.values()].map((asset) => [
    asset.publicPath,
    {
      digest: asset.renderedSha256,
      profile: GOAL_BOOK_PRINT_DERIVATIVE_POLICY.version,
    },
  ])),
})

const createGoalBookRenderManifest = (
  model: GoalBookModel,
  format: GoalBookRenderManifest['format'],
  assets: ReadonlyMap<string, PreparedGoalBookAsset>,
  artifact: string | Buffer,
  options: GoalBookRenderOptions,
): GoalBookRenderManifest => ({
  schemaVersion: 1,
  rendererVersion: GOAL_BOOK_RENDERER_VERSION,
  bookId: model.book.id,
  bookEdition: model.book.edition,
  publicationMode: model.book.publicationMode,
  atlasBaseUrl: model.book.atlasBaseUrl,
  feedbackBaseUrl: new URL(options.feedbackBaseUrl).toString(),
  modelDigest: model.digest,
  format,
  pageCount: model.pages.length,
  chapters: model.chapters.map((chapter) => ({
    ...chapter,
    goalIds: [...chapter.goalIds],
    pageNumbers: [...chapter.pageNumbers],
  })),
  pages: model.pages.map((page) => ({
    pageNumber: page.pageNumber,
    goalId: page.goalId,
    anchor: page.anchor,
    chapterIds: [...page.chapterIds],
    goalFingerprint: page.goalFingerprint,
    pageFingerprint: page.pageFingerprint,
  })),
  visualizationMode: 'root-relative-local-assets',
  printDerivativePolicy: printDerivativePolicyForProfile(options.printDerivativeProfile),
  artifactSizeLimitBytes: artifactSizeLimitForProfile(options.printDerivativeProfile),
  assets: [...assets.values()]
    .sort((left, right) => left.publicPath.localeCompare(right.publicPath, 'en'))
    .map((asset) => ({
      publicPath: asset.publicPath,
      contentType: asset.contentType,
      sourceSha256: asset.sourceSha256,
      renderedSha256: asset.renderedSha256,
      sourceBytes: asset.sourceBytes,
      renderedBytes: asset.renderedBytes,
      sourceWidth: asset.sourceWidth,
      sourceHeight: asset.sourceHeight,
      renderedWidth: asset.renderedWidth,
      renderedHeight: asset.renderedHeight,
    })),
  artifactSha256: `sha256:${createHash('sha256').update(artifact).digest('hex')}`,
})

export const writeGoalBookRenderManifest = async (
  manifest: GoalBookRenderManifest,
  outputPath: string,
) => {
  if (!outputPath.toLowerCase().endsWith('.json')) {
    throw new Error(`Goal-book render manifest path must end in .json: ${outputPath}`)
  }
  await mkdir(dirname(outputPath), { recursive: true })
  const temporaryDirectory = await mkdtemp(join(dirname(outputPath), '.goal-book-manifest-'))
  const temporaryOutput = join(temporaryDirectory, basename(outputPath))
  try {
    await writeFile(temporaryOutput, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
    await rename(temporaryOutput, outputPath)
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true })
  }
}

export const inspectGoalBookPageLayout = async (
  page: Page,
  expectedPageCount: number,
) => {
  const metrics = await page.locator('.goal-page').evaluateAll((elements) => elements.map((element) => {
    const htmlElement = element as HTMLElement
    const visualization = htmlElement.querySelector<HTMLElement>('.goal-visualization')
    const description = htmlElement.querySelector<HTMLElement>('.goal-description')
    const relations = htmlElement.querySelector<HTMLElement>('.goal-relations')
    const body = htmlElement.querySelector<HTMLElement>('.goal-body')
    const footer = htmlElement.querySelector<HTMLElement>('.goal-footer')
    const image = visualization?.querySelector<HTMLImageElement>('img') ?? null
    const visualizationBounds = visualization?.getBoundingClientRect() ?? null
    const descriptionBounds = description?.getBoundingClientRect() ?? null
    const relationsBounds = relations?.getBoundingClientRect() ?? null
    const bodyBounds = body?.getBoundingClientRect() ?? null
    const footerBounds = footer?.getBoundingClientRect() ?? null
    const imageBounds = image?.getBoundingClientRect() ?? null
    const relationSectionOverflows: Array<{
      scrollWidth: number
      clientWidth: number
      scrollHeight: number
      clientHeight: number
    }> = []
    for (const section of htmlElement.querySelectorAll<HTMLElement>('.goal-relations section')) {
      relationSectionOverflows.push({
        scrollWidth: section.scrollWidth,
        clientWidth: section.clientWidth,
        scrollHeight: section.scrollHeight,
        clientHeight: section.clientHeight,
      })
    }
    return {
      goalId: htmlElement.dataset.goalId ?? '',
      anchor: htmlElement.id,
      scrollWidth: htmlElement.scrollWidth,
      clientWidth: htmlElement.clientWidth,
      scrollHeight: htmlElement.scrollHeight,
      clientHeight: htmlElement.clientHeight,
      visualization: visualizationBounds === null ? null : {
        top: visualizationBounds.top,
        right: visualizationBounds.right,
        bottom: visualizationBounds.bottom,
        left: visualizationBounds.left,
        width: visualizationBounds.width,
        height: visualizationBounds.height,
      },
      visualizationOverflow: visualization === null ? null : {
        scrollWidth: visualization.scrollWidth,
        clientWidth: visualization.clientWidth,
        scrollHeight: visualization.scrollHeight,
        clientHeight: visualization.clientHeight,
      },
      description: descriptionBounds === null ? null : {
        top: descriptionBounds.top,
        right: descriptionBounds.right,
        bottom: descriptionBounds.bottom,
        left: descriptionBounds.left,
        width: descriptionBounds.width,
        height: descriptionBounds.height,
      },
      descriptionOverflow: description === null ? null : {
        scrollWidth: description.scrollWidth,
        clientWidth: description.clientWidth,
        scrollHeight: description.scrollHeight,
        clientHeight: description.clientHeight,
      },
      relations: relationsBounds === null ? null : {
        top: relationsBounds.top,
        right: relationsBounds.right,
        bottom: relationsBounds.bottom,
        left: relationsBounds.left,
        width: relationsBounds.width,
        height: relationsBounds.height,
      },
      relationsOverflow: relations === null ? null : {
        scrollWidth: relations.scrollWidth,
        clientWidth: relations.clientWidth,
        scrollHeight: relations.scrollHeight,
        clientHeight: relations.clientHeight,
      },
      relationSectionOverflows,
      body: bodyBounds === null ? null : {
        top: bodyBounds.top,
        right: bodyBounds.right,
        bottom: bodyBounds.bottom,
        left: bodyBounds.left,
        width: bodyBounds.width,
        height: bodyBounds.height,
      },
      footer: footerBounds === null ? null : {
        top: footerBounds.top,
        right: footerBounds.right,
        bottom: footerBounds.bottom,
        left: footerBounds.left,
        width: footerBounds.width,
        height: footerBounds.height,
      },
      image: imageBounds === null ? null : {
        top: imageBounds.top,
        right: imageBounds.right,
        bottom: imageBounds.bottom,
        left: imageBounds.left,
        width: imageBounds.width,
        height: imageBounds.height,
      },
    }
  }))
  if (metrics.length !== expectedPageCount) {
    throw new Error(
      `Rendered ${metrics.length} goal pages; expected exactly ${expectedPageCount}`,
    )
  }
  const overflows = metrics.filter((metric) => (
    metric.scrollWidth > metric.clientWidth
      || metric.scrollHeight > metric.clientHeight
  ))
  if (overflows.length > 0) {
    const details = overflows.map((overflow) => (
      `${overflow.goalId || overflow.anchor}: ${overflow.scrollWidth}x${overflow.scrollHeight} > ${overflow.clientWidth}x${overflow.clientHeight}`
    )).join('; ')
    throw new Error(`Goal-book page overflow detected; publication aborted: ${details}`)
  }
  const internalLayoutIssues = metrics.flatMap((metric) => {
    const issues: string[] = []
    const goal = metric.goalId || metric.anchor
    const hasOverflow = (overflow: {
      scrollWidth: number
      clientWidth: number
      scrollHeight: number
      clientHeight: number
    } | null) => overflow !== null && (
      overflow.scrollWidth > overflow.clientWidth + GOAL_BOOK_LAYOUT_TOLERANCE_PX
        || overflow.scrollHeight > overflow.clientHeight + GOAL_BOOK_LAYOUT_TOLERANCE_PX
    )
    if (
      metric.visualization === null
      || Math.abs(metric.visualization.height - GOAL_BOOK_VISUALIZATION_HEIGHT_CSS_PX)
        > GOAL_BOOK_LAYOUT_TOLERANCE_PX
    ) {
      issues.push(
        `${goal} visualization height ${metric.visualization?.height ?? 'missing'} != ${GOAL_BOOK_VISUALIZATION_HEIGHT_CSS_PX.toFixed(2)}`,
      )
    }
    if (hasOverflow(metric.visualizationOverflow)) {
      issues.push(`${goal} visualization content overflows its fixed box`)
    }
    if (hasOverflow(metric.descriptionOverflow)) {
      issues.push(`${goal} description overflows the fixed visualization row`)
    }
    if (hasOverflow(metric.relationsOverflow)) {
      issues.push(`${goal} relations overflow their remaining page area`)
    }
    if (metric.relationSectionOverflows.some((overflow) => hasOverflow(overflow))) {
      issues.push(`${goal} relation section content is clipped or overflowing`)
    }
    if (
      metric.visualization !== null
      && metric.relations !== null
      && metric.visualization.bottom > metric.relations.top + GOAL_BOOK_LAYOUT_TOLERANCE_PX
    ) {
      issues.push(`${goal} visualization overlaps relations`)
    }
    if (
      metric.description !== null
      && metric.relations !== null
      && metric.description.bottom > metric.relations.top + GOAL_BOOK_LAYOUT_TOLERANCE_PX
    ) {
      issues.push(`${goal} description overlaps relations`)
    }
    if (
      metric.relations !== null
      && metric.body !== null
      && metric.relations.bottom > metric.body.bottom + GOAL_BOOK_LAYOUT_TOLERANCE_PX
    ) {
      issues.push(`${goal} relations extend beyond the body`)
    }
    if (
      metric.relations !== null
      && metric.footer !== null
      && metric.relations.bottom > metric.footer.top + GOAL_BOOK_LAYOUT_TOLERANCE_PX
    ) {
      issues.push(`${goal} relations overlap the footer`)
    }
    if (metric.image !== null && metric.visualization !== null && (
      metric.image.top < metric.visualization.top - GOAL_BOOK_LAYOUT_TOLERANCE_PX
        || metric.image.right > metric.visualization.right + GOAL_BOOK_LAYOUT_TOLERANCE_PX
        || metric.image.bottom > metric.visualization.bottom + GOAL_BOOK_LAYOUT_TOLERANCE_PX
        || metric.image.left < metric.visualization.left - GOAL_BOOK_LAYOUT_TOLERANCE_PX
    )) {
      issues.push(`${goal} image extends beyond its fixed visualization box`)
    }
    return issues
  })
  if (internalLayoutIssues.length > 0) {
    throw new Error(
      `Goal-book internal layout violation; publication aborted: ${internalLayoutIssues.join('; ')}`,
    )
  }
  const failedImages = await page.locator('.goal-visualization img').evaluateAll((images) => images
    .filter((image) => !(image as HTMLImageElement).complete || (image as HTMLImageElement).naturalWidth === 0)
    .map((image) => image.closest<HTMLElement>('.goal-page')?.dataset.goalId ?? 'unknown'))
  if (failedImages.length > 0) {
    throw new Error(`Goal visualizations failed to load: ${failedImages.join(', ')}`)
  }
  return metrics as GoalBookPageOverflow[]
}

const openValidatedGoalBookPage = async (
  browser: Browser,
  model: GoalBookModel,
  html: string,
  assets: ReadonlyMap<string, PreparedGoalBookAsset>,
) => {
  const browserPage = await browser.newPage({ locale: model.book.locale || 'de-DE' })
  const unexpectedRequests = new Set<string>()
  const servedAssetPaths = new Set<string>()
  await browserPage.route(`${GOAL_BOOK_VIRTUAL_ORIGIN}/**`, async (route) => {
    const requestUrl = new URL(route.request().url())
    if (requestUrl.pathname === '/book.html') {
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: html,
      })
      return
    }
    let decodedPath: string
    try {
      decodedPath = decodeURIComponent(requestUrl.pathname)
    } catch {
      unexpectedRequests.add(requestUrl.toString())
      await route.abort('blockedbyclient')
      return
    }
    const asset = assets.get(decodedPath)
    if (!asset) {
      unexpectedRequests.add(requestUrl.toString())
      await route.abort('blockedbyclient')
      return
    }
    servedAssetPaths.add(decodedPath)
    await route.fulfill({
      status: 200,
      contentType: asset.contentType,
      body: asset.body,
      headers: { 'Cache-Control': 'no-store' },
    })
  })
  browserPage.on('request', (request) => {
    const url = request.url()
    if (url.startsWith('data:')) return
    try {
      if (new URL(url).origin === GOAL_BOOK_VIRTUAL_ORIGIN) return
    } catch {
      // The URL is reported below as unexpected.
    }
    unexpectedRequests.add(url)
  })
  try {
    await browserPage.emulateMedia({ media: 'print' })
    await browserPage.goto(`${GOAL_BOOK_VIRTUAL_ORIGIN}/book.html`, { waitUntil: 'load' })
    await browserPage.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(Array.from(document.images, (image) => {
        if (image.complete) return Promise.resolve()
        return new Promise<void>((resolve) => {
          image.addEventListener('load', () => resolve(), { once: true })
          image.addEventListener('error', () => resolve(), { once: true })
        })
      }))
    })
    if (unexpectedRequests.size > 0) {
      throw new Error(
        `Goal-book rendering attempted network access: ${[...unexpectedRequests].join(', ')}`,
      )
    }
    if (servedAssetPaths.size !== assets.size) {
      const missing = [...assets.keys()].filter((path) => !servedAssetPaths.has(path))
      throw new Error(`Goal-book local assets were not requested: ${missing.join(', ')}`)
    }
    await inspectGoalBookPageLayout(browserPage, model.pages.length)
    return browserPage
  } catch (error) {
    await browserPage.close()
    throw error
  }
}

const launchGoalBookBrowser = async (options: GoalBookPdfOptions) => {
  const { chromium } = await import('playwright')
  return chromium.launch({
    headless: true,
    executablePath: options.chromiumExecutablePath,
    args: [
      '--disable-background-networking',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      ...(options.allowNoSandbox ? ['--no-sandbox'] : []),
    ],
  })
}

export const writeGoalBookHtml = async (
  model: GoalBookModel,
  outputPath: string,
  options: GoalBookPdfOptions,
) => {
  if (!outputPath.toLowerCase().endsWith('.html')) {
    throw new Error(`Goal-book HTML output path must end in .html: ${outputPath}`)
  }
  assertGoalBookRenderable(model, options)
  let html = ''
  let browser: Browser | null = null
  let browserPage: Page | null = null
  let assets = new Map<string, PreparedGoalBookAsset>()
  try {
    browser = await launchGoalBookBrowser(options)
    assets = await prepareLocalRenderAssets(browser, model, options)
    html = renderGoalBookHtml(model, optionsWithPreparedAssetMetadata(options, assets))
    browserPage = await openValidatedGoalBookPage(browser, model, html, assets)
  } finally {
    try {
      await browserPage?.close()
    } finally {
      await browser?.close()
    }
  }

  await mkdir(dirname(outputPath), { recursive: true })
  const temporaryDirectory = await mkdtemp(join(dirname(outputPath), '.goal-book-html-'))
  const temporaryOutput = join(temporaryDirectory, basename(outputPath))
  try {
    await writeFile(temporaryOutput, html, 'utf8')
    await rename(temporaryOutput, outputPath)
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true })
  }
  return createGoalBookRenderManifest(model, 'html', assets, html, options)
}

const renderPdfWithBrowser = async (
  browser: Browser,
  model: GoalBookModel,
  outputPath: string,
  options: GoalBookPdfOptions,
  assets: ReadonlyMap<string, PreparedGoalBookAsset>,
) => {
  const renderOptions = optionsWithPreparedAssetMetadata(options, assets)
  const browserPage = await openValidatedGoalBookPage(
    browser,
    model,
    renderGoalBookHtml(model, renderOptions),
    assets,
  )
  try {
    await browserPage.pdf({
      path: outputPath,
      format: 'A4',
      landscape: false,
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
      outline: true,
    })
  } finally {
    await browserPage.close()
  }
}

export const inspectGoalBookPdfArtifact = async (
  pdfPath: string,
  model: GoalBookModel,
  feedbackBaseUrl: string,
) => {
  let info: string
  let destinations: string
  let linkXml: string
  try {
    const infoResult = await execFileAsync('pdfinfo', [pdfPath], {
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    })
    info = infoResult.stdout
    const destinationResult = await execFileAsync('pdfinfo', ['-dests', pdfPath], {
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    })
    destinations = destinationResult.stdout
    const linkResult = await execFileAsync(
      'pdftohtml',
      ['-xml', '-i', '-q', '-stdout', pdfPath],
      {
        encoding: 'utf8',
        maxBuffer: 128 * 1024 * 1024,
      },
    )
    linkXml = linkResult.stdout
  } catch (error) {
    throw new Error(
      `Goal-book PDF validation requires working pdfinfo and pdftohtml commands: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
  const pageCount = Number(/^Pages:\s+(\d+)\s*$/mu.exec(info)?.[1])
  if (pageCount !== model.pages.length) {
    throw new Error(
      `Goal-book PDF contains ${pageCount} physical pages; expected ${model.pages.length}`,
    )
  }
  const pageSizeMatch = /^Page size:\s+([\d.]+) x ([\d.]+) pts/mu.exec(info)
  const width = Number(pageSizeMatch?.[1])
  const height = Number(pageSizeMatch?.[2])
  if (
    !Number.isFinite(width)
    || !Number.isFinite(height)
    || Math.abs(width - 595.28) > 2
    || Math.abs(height - 841.89) > 2
  ) {
    throw new Error(`Goal-book PDF page size is not A4 portrait: ${width} x ${height} pt`)
  }
  const destinationPageByName = new Map<string, number>()
  for (const match of destinations.matchAll(/^\s*(\d+)\s+\[[^\]]+\]\s+"([^"]+)"\s*$/gmu)) {
    destinationPageByName.set(match[2], Number(match[1]))
  }
  const wrongDestinations = model.pages
    .filter(({ anchor, pageNumber }) => destinationPageByName.get(anchor) !== pageNumber)
    .map(({ goalId, pageNumber, anchor }) => (
      `${goalId} expected page ${pageNumber}, got ${destinationPageByName.get(anchor) ?? 'missing'}`
    ))
  if (wrongDestinations.length > 0) {
    throw new Error(
      `Goal-book PDF has missing or wrong named goal destinations: ${wrongDestinations.join('; ')}`,
    )
  }

  const xmlPageByNumber = new Map<number, string>()
  for (const match of linkXml.matchAll(/<page number="(\d+)"[^>]*>[\s\S]*?<\/page>/gu)) {
    xmlPageByNumber.set(Number(match[1]), match[0])
  }
  const missingAnnotations: string[] = []
  const escapedPdfHref = (value: string) => value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
  model.pages.forEach((page) => {
    const pageXml = xmlPageByNumber.get(page.pageNumber) ?? ''
    const expectedTargetPages = new Set([
      page.pageNumber,
      ...page.requires.map(({ pageNumber }) => pageNumber),
      ...page.reverseRequires.map(({ pageNumber }) => pageNumber),
    ])
    expectedTargetPages.forEach((targetPage) => {
      if (
        targetPage === undefined
        || !new RegExp(`href="[^"]+\\.html#${targetPage}"`, 'u').test(pageXml)
      ) {
        missingAnnotations.push(`${page.goalId}->${targetPage ?? 'missing-page'}`)
      }
    })
    const externalUrls = [
      ...page.externalPrerequisites,
      ...page.externalReverseRequires,
    ].flatMap(({ canonicalUrl }) => canonicalUrl === null ? [] : [canonicalUrl])
    externalUrls.forEach((url) => {
      if (!pageXml.includes(`href="${escapedPdfHref(url)}"`)) {
        missingAnnotations.push(`${page.goalId}->${url}`)
      }
    })
    const expectedFeedbackUrl = feedbackUrl(feedbackBaseUrl, model, page)
    if (!pageXml.includes(`href="${escapedPdfHref(expectedFeedbackUrl)}"`)) {
      missingAnnotations.push(`${page.goalId}->feedback`)
    }
    const expectedApplicabilityUrl = applicabilityDetailsUrl(model, page)
    const applicability = page.applicability
    if (
      applicability
      && applicability.length > 0
      && expectedApplicabilityUrl
      && !pageXml.includes(`href="${escapedPdfHref(expectedApplicabilityUrl)}"`)
    ) {
      missingAnnotations.push(`${page.goalId}->applicability-details`)
    }
  })
  if (missingAnnotations.length > 0) {
    throw new Error(
      `Goal-book PDF is missing internal or feedback link annotations: ${missingAnnotations.join(', ')}`,
    )
  }
  return { pageCount, width, height, destinations, linkXml }
}

export const writeGoalBookPdf = async (
  model: GoalBookModel,
  outputPath: string,
  options: GoalBookPdfOptions,
) => {
  if (!outputPath.toLowerCase().endsWith('.pdf')) {
    throw new Error(`Goal-book PDF output path must end in .pdf: ${outputPath}`)
  }
  assertGoalBookRenderable(model, options)
  await mkdir(dirname(outputPath), { recursive: true })
  const temporaryDirectory = await mkdtemp(join(dirname(outputPath), '.goal-book-pdf-'))
  const temporaryOutput = join(temporaryDirectory, basename(outputPath))
  let browser: Browser | null = null
  let assets = new Map<string, PreparedGoalBookAsset>()
  let manifest: GoalBookRenderManifest | null = null
  try {
    browser = await launchGoalBookBrowser(options)
    assets = await prepareLocalRenderAssets(browser, model, options)
    await renderPdfWithBrowser(browser, model, temporaryOutput, options, assets)
    const pdfBytes = await readFile(temporaryOutput)
    const artifactSizeLimit = artifactSizeLimitForProfile(options.printDerivativeProfile)
    if (pdfBytes.length > artifactSizeLimit) {
      throw new Error(
        `Goal-book PDF is ${pdfBytes.length} bytes; exceeds the ${artifactSizeLimit}-byte artifact budget`,
      )
    }
    await inspectGoalBookPdfArtifact(temporaryOutput, model, options.feedbackBaseUrl)
    manifest = createGoalBookRenderManifest(
      model,
      'pdf',
      assets,
      pdfBytes,
      options,
    )
    await rename(temporaryOutput, outputPath)
  } finally {
    try {
      await browser?.close()
    } finally {
      await rm(temporaryDirectory, { force: true, recursive: true })
    }
  }
  if (!manifest) throw new Error('Goal-book PDF manifest was not produced')
  return manifest
}
