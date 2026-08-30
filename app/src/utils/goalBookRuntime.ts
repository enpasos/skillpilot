import {
  DEFAULT_GOAL_BOOK_ID,
  GOAL_BOOK_INDEX_URL,
  GOAL_BOOK_PUBLICATION_REGISTRY,
  goalBookDefinitionById,
  goalBookDefinitionByLandscapeId,
  goalBookModelUrl,
  goalBookPdfUrl,
  goalBookRenderManifestUrl,
} from './goalBookPublicationRegistry'
import {
  GOAL_BOOK_CHAPTER_PROJECTION_SCHEMA_VERSION,
  type GoalBookNavigationGoalGraph,
} from './goalBookChapterProjection'

const DEFAULT_GOAL_BOOK_DEFINITION = GOAL_BOOK_PUBLICATION_REGISTRY[0]
const PHYSICS_GOAL_BOOK_DEFINITION = GOAL_BOOK_PUBLICATION_REGISTRY[1]

export const GOAL_BOOK_MODEL_URL = goalBookModelUrl(DEFAULT_GOAL_BOOK_DEFINITION)
export const GOAL_BOOK_PDF_URL = goalBookPdfUrl(DEFAULT_GOAL_BOOK_DEFINITION)
export const PHYSICS_GOAL_BOOK_MODEL_URL = goalBookModelUrl(PHYSICS_GOAL_BOOK_DEFINITION)
export const PHYSICS_GOAL_BOOK_PDF_URL = goalBookPdfUrl(PHYSICS_GOAL_BOOK_DEFINITION)
export { GOAL_BOOK_INDEX_URL }

const SAFE_GOAL_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,499}$/u
const SAFE_JURISDICTIONS = new Set([
  'DE-BB', 'DE-BE', 'DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV',
  'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH',
])
const SAFE_ANCHOR = /^goal-[A-Za-z0-9][A-Za-z0-9._:-]{0,499}$/u
const SAFE_SHA256 = /^sha256:[0-9a-f]{64}$/u
const SAFE_VISUALIZATION_PATH = /^\/assets\/goal-visualizations\/[A-Za-z0-9/_.-]+$/u
const PUBLIC_ATLAS_URL = 'https://skillpilot.com/lernzielbuch'
const MAX_PAGES = 5_000
const MAX_CHAPTERS = 1_000
const MAX_NAVIGATION_GOALS = 20_000
const MAX_MODEL_BYTES = 8 * 1024 * 1024

export interface GoalBookRuntimeReference {
  goalId: string
  title: string
  anchor: string
  pageNumber: number
}

export interface GoalBookRuntimeExternalReference {
  goalId: string
  title: string
  landscapeId?: string
  canonicalUrl: string | null
}

export interface GoalBookRuntimeExternalLandscapeSource {
  path: string
  landscapeId: string
  digest: string
}

export interface GoalBookRuntimeCompositionViewSource {
  path: string
  viewId: string
  scope: Record<string, string>
  digest: string
  projectionFingerprint: string
}

export interface GoalBookRuntimeChapter {
  chapterId: string
  label: string
  parentChapterId: string | null
  order: number
  treeOrder: number
  goalIds: string[]
  pageNumbers: number[]
}

export type GoalBookProjectionNodeKind = 'structure' | 'cluster' | 'goal'

/**
 * Adapter boundary for a compiled, scope-specific chapter projection.
 *
 * The goal-book model currently publishes the legacy `chapters` array. A
 * composition-view compiler can supply this closed, ordered shape without
 * coupling the read-only goal-book UI to Cockpit mastery or focus state.
 */
export interface GoalBookSuppliedChapterProjectionNode {
  nodeId: string
  label: string
  parentNodeId: string | null
  childNodeIds: string[]
  kind: GoalBookProjectionNodeKind
  goalId: string | null
  descendantGoalCount: number
}

export interface GoalBookSuppliedChapterProjection {
  projectionId: string
  viewId?: string | null
  scope: GoalBookApplicabilityFilter | null
  digest: string
  nodes: GoalBookSuppliedChapterProjectionNode[]
}

export interface GoalBookResolvedChapterProjectionNode
  extends GoalBookSuppliedChapterProjectionNode {
  descendantGoalIds: string[]
}

export interface GoalBookResolvedChapterProjection {
  projectionId: string
  viewId: string | null
  scope: GoalBookApplicabilityFilter | null
  digest: string
  source: 'supplied' | 'canonical-fallback'
  nodes: GoalBookResolvedChapterProjectionNode[]
  rootNodeIds: string[]
  goalIds: string[]
}

export interface GoalBookApplicabilityScope {
  stage: string
  durationModel: string | null
  courseProfile: string | null
}

export interface GoalBookApplicabilityGroup {
  jurisdiction: string
  scopes: GoalBookApplicabilityScope[]
}

export interface GoalBookApplicabilityFilter {
  jurisdiction: string | null
  stage: string | null
  durationModel: string | null
  courseProfile: string | null
}

export interface GoalBookApplicabilityOptions {
  jurisdictions: string[]
  stages: string[]
  durationModels: string[]
  courseProfiles: string[]
}

export interface GoalBookRuntimePage {
  pageNumber: number
  navigationOrder: number
  treeOrder: number
  goalId: string
  anchor: string
  title: string
  description: string
  breadcrumbs: string[]
  chapterIds: string[]
  requires: GoalBookRuntimeReference[]
  reverseRequires: GoalBookRuntimeReference[]
  externalPrerequisites: GoalBookRuntimeExternalReference[]
  externalReverseRequires: GoalBookRuntimeExternalReference[]
  applicability?: GoalBookApplicabilityGroup[]
  visualization: {
    title: string
    url: string
    altText: string
    qaStatus: 'approved' | 'review_candidate' | 'rejected'
    approvedForPublication: boolean
  } | null
  evidenceReview: {
    status: 'needs_human_review' | 'approved' | 'rejected'
    evidenceLevel: 'E0' | 'E1' | 'E2' | 'E3' | 'E4' | 'E5'
    maximumClaimScope: 'G0' | 'G1' | 'G2' | 'G3' | 'G4'
  } | null
  goalFingerprint: string
  pageFingerprint: string
}

export interface GoalBookRuntimeModel {
  schemaVersion: '1.1.0'
  book: {
    id: string
    title: string
    locale: string
    landscapeId: string
    edition: string
    atlasBaseUrl: typeof PUBLIC_ATLAS_URL
    pageCount: number
    publicationMode: 'review' | 'public'
    oneGoalPerPage: true
  }
  source: {
    externalLandscapes: GoalBookRuntimeExternalLandscapeSource[]
    compositionViewSources: GoalBookRuntimeCompositionViewSource[]
  }
  navigation: {
    schemaVersion: typeof GOAL_BOOK_CHAPTER_PROJECTION_SCHEMA_VERSION
    canonicalProjectionSource: {
      path: string
      viewId: string
      title: string
      scope: Record<string, string>
      digest: string
      projectionFingerprint: string
    }
    goalGraph: GoalBookNavigationGoalGraph
  }
  chapters: GoalBookRuntimeChapter[]
  pages: GoalBookRuntimePage[]
  digest: string
}

export interface GoalBookRuntimePublication {
  bookId: string
  landscapeId: string
  edition: string
  title: string
  locale: string
  publicationMode: 'review' | 'public'
  pageCount: number
  modelUrl: string
  modelSha256: string
  modelDigest: string
  pdfUrl: string
}

export interface GoalBookRuntimePublicationIndex {
  schemaVersion: 1
  books: GoalBookRuntimePublication[]
}

const record = (value: unknown): Record<string, unknown> | null => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
)

const nonBlank = (value: unknown, maxLength: number): value is string => (
  typeof value === 'string'
  && value.length <= maxLength
  && /\S/u.test(value)
)

const stringList = (value: unknown, maxItems: number, maxLength: number): string[] | null => {
  if (!Array.isArray(value) || value.length > maxItems) return null
  if (!value.every((entry) => nonBlank(entry, maxLength))) return null
  return value as string[]
}

const exactKeys = (value: Record<string, unknown>, allowed: readonly string[]): boolean => {
  const allowedSet = new Set(allowed)
  return Object.keys(value).every((key) => allowedSet.has(key))
}

const parseInternalReferences = (value: unknown): GoalBookRuntimeReference[] | null => {
  if (!Array.isArray(value) || value.length > MAX_PAGES) return null
  const parsed: GoalBookRuntimeReference[] = []
  for (const item of value) {
    const candidate = record(item)
    if (!candidate || !exactKeys(candidate, ['goalId', 'title', 'anchor', 'pageNumber'])) return null
    if (
      !nonBlank(candidate.goalId, 500)
      || !SAFE_GOAL_ID.test(candidate.goalId)
      || !nonBlank(candidate.title, 1_000)
      || !nonBlank(candidate.anchor, 505)
      || !SAFE_ANCHOR.test(candidate.anchor)
      || !Number.isSafeInteger(candidate.pageNumber)
      || (candidate.pageNumber as number) < 1
    ) return null
    parsed.push(candidate as unknown as GoalBookRuntimeReference)
  }
  return parsed
}

const parseExternalReferences = (
  value: unknown,
  binding: { landscapeId: string; edition: string; atlasBaseUrl: string },
  externalLandscapeIds: ReadonlySet<string>,
): GoalBookRuntimeExternalReference[] | null => {
  if (!Array.isArray(value) || value.length > MAX_PAGES) return null
  const parsed: GoalBookRuntimeExternalReference[] = []
  for (const item of value) {
    const candidate = record(item)
    if (!candidate || !exactKeys(candidate, ['goalId', 'title', 'landscapeId', 'canonicalUrl'])) return null
    const referenceLandscapeId = candidate.landscapeId
    if (
      !nonBlank(candidate.goalId, 500)
      || !SAFE_GOAL_ID.test(candidate.goalId)
      || !nonBlank(candidate.title, 1_000)
      || !(
        referenceLandscapeId === undefined
        || (
          nonBlank(referenceLandscapeId, 500)
          && SAFE_GOAL_ID.test(referenceLandscapeId)
          && referenceLandscapeId !== binding.landscapeId
          && externalLandscapeIds.has(referenceLandscapeId)
        )
      )
      || !(candidate.canonicalUrl === null || nonBlank(candidate.canonicalUrl, 2_000))
    ) return null
    let canonicalUrl: string | null = null
    if (typeof candidate.canonicalUrl === 'string') {
      try {
        const url = new URL(candidate.canonicalUrl)
        const parameterKeys = [...url.searchParams.keys()]
        // `landscapeId` records the reference's source landscape. The URL
        // deliberately stays in the containing book context so its hash can
        // resolve references that are not pages in the source landscape book.
        if (
          url.origin !== new URL(binding.atlasBaseUrl).origin
          || url.pathname !== new URL(binding.atlasBaseUrl).pathname
          || url.username !== ''
          || url.password !== ''
          || url.hash !== `#goal-${candidate.goalId}`
          || parameterKeys.length !== 2
          || new Set(parameterKeys).size !== 2
          || !parameterKeys.includes('landscape')
          || !parameterKeys.includes('edition')
          || url.searchParams.get('landscape') !== binding.landscapeId
          || url.searchParams.get('edition') !== binding.edition
        ) return null
        canonicalUrl = url.href
      } catch {
        return null
      }
    }
    parsed.push({
      goalId: candidate.goalId,
      title: candidate.title,
      ...(typeof referenceLandscapeId === 'string' ? { landscapeId: referenceLandscapeId } : {}),
      canonicalUrl,
    })
  }
  return parsed
}

const parseExternalLandscapeSources = (
  value: unknown,
  primaryLandscapeId: string,
): GoalBookRuntimeExternalLandscapeSource[] | null => {
  if (value === undefined) return []
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) return null
  const result: GoalBookRuntimeExternalLandscapeSource[] = []
  const paths = new Set<string>()
  const landscapeIds = new Set<string>()
  for (const item of value) {
    const candidate = record(item)
    if (
      !candidate
      || !exactKeys(candidate, ['path', 'landscapeId', 'digest'])
      || !nonBlank(candidate.path, 2_000)
      || !nonBlank(candidate.landscapeId, 500)
      || !SAFE_GOAL_ID.test(candidate.landscapeId)
      || candidate.landscapeId === primaryLandscapeId
      || !nonBlank(candidate.digest, 71)
      || !SAFE_SHA256.test(candidate.digest)
      || paths.has(candidate.path)
      || landscapeIds.has(candidate.landscapeId)
    ) return null
    paths.add(candidate.path)
    landscapeIds.add(candidate.landscapeId)
    result.push({
      path: candidate.path,
      landscapeId: candidate.landscapeId,
      digest: candidate.digest,
    })
  }
  return result
}

const isSafeVisualizationPath = (value: string): boolean => {
  if (!SAFE_VISUALIZATION_PATH.test(value) || value.includes('%') || value.includes('\\')) return false
  const suffix = value.slice('/assets/goal-visualizations/'.length)
  if (!suffix || suffix.split('/').some((segment) => !segment || segment === '.' || segment === '..')) return false
  try {
    const base = new URL('https://skillpilot.invalid')
    const resolved = new URL(value, base)
    return resolved.origin === base.origin && resolved.pathname === value && !resolved.search && !resolved.hash
  } catch {
    return false
  }
}

const parseVisualization = (value: unknown): GoalBookRuntimePage['visualization'] | undefined => {
  if (value === null) return null
  const candidate = record(value)
  if (!candidate || !exactKeys(candidate, [
    'resourceType',
    'title',
    'url',
    'altText',
    'originalDigest',
    'qaStatus',
    'approvedForPublication',
  ])) return undefined
  if (
    candidate.resourceType !== 'image'
    || !nonBlank(candidate.title, 1_000)
    || !nonBlank(candidate.url, 2_000)
    || !isSafeVisualizationPath(candidate.url)
    || !nonBlank(candidate.originalDigest, 71)
    || !SAFE_SHA256.test(candidate.originalDigest)
    || !['approved', 'review_candidate', 'rejected'].includes(String(candidate.qaStatus))
    || typeof candidate.approvedForPublication !== 'boolean'
    || !(candidate.altText === undefined || nonBlank(candidate.altText, 4_000))
  ) return undefined
  return {
    title: candidate.title,
    url: candidate.url,
    altText: typeof candidate.altText === 'string' ? candidate.altText : candidate.title,
    qaStatus: candidate.qaStatus as 'approved' | 'review_candidate' | 'rejected',
    approvedForPublication: candidate.approvedForPublication,
  }
}

const parseEvidenceReview = (value: unknown): GoalBookRuntimePage['evidenceReview'] | undefined => {
  if (value === null) return null
  const candidate = record(value)
  if (!candidate || !exactKeys(candidate, [
    'reviewId',
    'status',
    'reviewInputFingerprint',
    'profileFingerprint',
    'evidenceLevel',
    'maximumClaimScope',
  ])) return undefined
  if (
    !nonBlank(candidate.reviewId, 500)
    || !['needs_human_review', 'approved', 'rejected'].includes(String(candidate.status))
    || !nonBlank(candidate.reviewInputFingerprint, 71)
    || !SAFE_SHA256.test(candidate.reviewInputFingerprint)
    || !nonBlank(candidate.profileFingerprint, 71)
    || !SAFE_SHA256.test(candidate.profileFingerprint)
    || !['E0', 'E1', 'E2', 'E3', 'E4', 'E5'].includes(String(candidate.evidenceLevel))
    || !['G0', 'G1', 'G2', 'G3', 'G4'].includes(String(candidate.maximumClaimScope))
  ) return undefined
  return {
    status: candidate.status as 'needs_human_review' | 'approved' | 'rejected',
    evidenceLevel: candidate.evidenceLevel as 'E0' | 'E1' | 'E2' | 'E3' | 'E4' | 'E5',
    maximumClaimScope: candidate.maximumClaimScope as 'G0' | 'G1' | 'G2' | 'G3' | 'G4',
  }
}

const parseApplicability = (value: unknown): GoalBookApplicabilityGroup[] | undefined => {
  if (value === undefined) return undefined
  if (!Array.isArray(value) || value.length === 0 || value.length > 100) return fail()
  const groups: GoalBookApplicabilityGroup[] = []
  const jurisdictions = new Set<string>()
  for (const item of value) {
    const group = record(item)
    if (
      !group
      || !exactKeys(group, ['jurisdiction', 'scopes'])
      || !nonBlank(group.jurisdiction, 50)
      || !SAFE_JURISDICTIONS.has(group.jurisdiction)
      || jurisdictions.has(group.jurisdiction)
      || !Array.isArray(group.scopes)
      || group.scopes.length === 0
      || group.scopes.length > 100
    ) return fail()
    jurisdictions.add(group.jurisdiction)
    const scopes: GoalBookApplicabilityScope[] = []
    const scopeKeys = new Set<string>()
    for (const itemScope of group.scopes) {
      const scope = record(itemScope)
      if (
        !scope
        || !exactKeys(scope, ['stage', 'durationModel', 'courseProfile'])
        || !['SekI', 'SekII'].includes(String(scope.stage))
        || !(scope.durationModel === null || ['G8', 'G9'].includes(String(scope.durationModel)))
        || !(scope.courseProfile === null || ['GK', 'LK'].includes(String(scope.courseProfile)))
      ) return fail()
      const parsedScope = {
        stage: scope.stage as string,
        durationModel: scope.durationModel as string | null,
        courseProfile: scope.courseProfile as string | null,
      }
      const scopeKey = JSON.stringify(parsedScope)
      if (scopeKeys.has(scopeKey)) return fail()
      scopeKeys.add(scopeKey)
      scopes.push(parsedScope)
    }
    groups.push({ jurisdiction: group.jurisdiction, scopes })
  }
  return groups
}

const fail = (): never => {
  throw new Error('Das Lernzielbuch konnte nicht sicher gelesen werden.')
}

function ensure(condition: unknown): asserts condition {
  if (!condition) fail()
}

const parseStringScope = (value: unknown): Record<string, string> | null => {
  const candidate = record(value)
  if (!candidate || Object.keys(candidate).length > 20) return null
  const scope: Record<string, string> = {}
  for (const [key, entry] of Object.entries(candidate)) {
    if (!nonBlank(key, 100) || !nonBlank(entry, 500)) return null
    scope[key] = entry
  }
  return scope
}

const parseCompositionViewSources = (
  value: unknown,
): GoalBookRuntimeCompositionViewSource[] | null => {
  if (!Array.isArray(value) || value.length < 1 || value.length > 500) return null
  const sources: GoalBookRuntimeCompositionViewSource[] = []
  const bindings = new Set<string>()
  for (const item of value) {
    const source = record(item)
    if (!source || !exactKeys(source, [
      'path',
      'viewId',
      'scope',
      'digest',
      'projectionFingerprint',
    ])) return null
    const scope = parseStringScope(source.scope)
    if (
      !nonBlank(source.path, 2_000)
      || !nonBlank(source.viewId, 500)
      || scope === null
      || !nonBlank(source.digest, 71)
      || !SAFE_SHA256.test(source.digest)
      || !nonBlank(source.projectionFingerprint, 71)
      || !SAFE_SHA256.test(source.projectionFingerprint)
    ) return null
    const bindingKey = `${source.viewId}\u0000${JSON.stringify(scope)}`
    if (bindings.has(bindingKey)) return null
    bindings.add(bindingKey)
    sources.push({
      path: source.path,
      viewId: source.viewId,
      scope,
      digest: source.digest,
      projectionFingerprint: source.projectionFingerprint,
    })
  }
  return sources
}

const parseGoalBookNavigation = (
  value: unknown,
  landscapeId: string,
): GoalBookRuntimeModel['navigation'] | null => {
  const navigation = record(value)
  if (!navigation || !exactKeys(navigation, [
    'schemaVersion',
    'canonicalProjectionSource',
    'goalGraph',
  ])) return null
  if (navigation.schemaVersion !== GOAL_BOOK_CHAPTER_PROJECTION_SCHEMA_VERSION) return null

  const source = record(navigation.canonicalProjectionSource)
  if (!source || !exactKeys(source, [
    'path',
    'viewId',
    'title',
    'scope',
    'digest',
    'projectionFingerprint',
  ])) return null
  const sourceScope = parseStringScope(source.scope)
  if (
    !nonBlank(source.path, 2_000)
    || !nonBlank(source.viewId, 500)
    || !nonBlank(source.title, 1_000)
    || sourceScope === null
    || !nonBlank(source.digest, 71)
    || !SAFE_SHA256.test(source.digest)
    || !nonBlank(source.projectionFingerprint, 71)
    || !SAFE_SHA256.test(source.projectionFingerprint)
  ) return null

  const graph = record(navigation.goalGraph)
  if (!graph || !exactKeys(graph, [
    'schemaVersion',
    'landscapeId',
    'title',
    'goals',
    'digest',
  ])) return null
  if (
    graph.schemaVersion !== GOAL_BOOK_CHAPTER_PROJECTION_SCHEMA_VERSION
    || graph.landscapeId !== landscapeId
    || !nonBlank(graph.title, 1_000)
    || !Array.isArray(graph.goals)
    || graph.goals.length < 1
    || graph.goals.length > MAX_NAVIGATION_GOALS
    || !nonBlank(graph.digest, 71)
    || !SAFE_SHA256.test(graph.digest)
  ) return null

  const semanticKinds = new Set([
    'orientation',
    'curricularAtomic',
    'curricularArea',
    'practiceAssessment',
    'memory',
    'programStructure',
    'runtimeSupport',
  ])
  const goals: GoalBookNavigationGoalGraph['goals'] = []
  const goalIds = new Set<string>()
  for (const rawGoal of graph.goals) {
    const goal = record(rawGoal)
    if (!goal || !exactKeys(goal, ['id', 'title', 'contains', 'type', 'tags', 'semanticKind'])) {
      return null
    }
    const contains = stringList(goal.contains, MAX_NAVIGATION_GOALS, 500)
    const tags = goal.tags === undefined ? undefined : stringList(goal.tags, 100, 500)
    if (
      !nonBlank(goal.id, 500)
      || !SAFE_GOAL_ID.test(goal.id)
      || goalIds.has(goal.id)
      || !nonBlank(goal.title, 1_000)
      || contains === null
      || new Set(contains).size !== contains.length
      || !['atomic', 'cluster'].includes(String(goal.type))
      || (goal.type === 'atomic' && contains.length > 0)
      || (goal.type === 'cluster' && contains.length === 0)
      || tags === null
      || !semanticKinds.has(String(goal.semanticKind))
    ) return null
    goalIds.add(goal.id)
    goals.push({
      id: goal.id,
      title: goal.title,
      contains,
      type: goal.type as 'atomic' | 'cluster',
      ...(tags === undefined ? {} : { tags }),
      semanticKind: goal.semanticKind as string,
    })
  }
  if (goals.some(({ contains }) => contains.some((goalId) => !goalIds.has(goalId)))) return null

  return {
    schemaVersion: GOAL_BOOK_CHAPTER_PROJECTION_SCHEMA_VERSION,
    canonicalProjectionSource: {
      path: source.path,
      viewId: source.viewId,
      title: source.title,
      scope: sourceScope,
      digest: source.digest,
      projectionFingerprint: source.projectionFingerprint,
    },
    goalGraph: {
      schemaVersion: GOAL_BOOK_CHAPTER_PROJECTION_SCHEMA_VERSION,
      landscapeId,
      title: graph.title,
      goals,
      digest: graph.digest,
    },
  }
}

export const parseGoalBookRuntimeModel = (value: unknown): GoalBookRuntimeModel => {
  const root = record(value)
  ensure(root !== null)
  ensure(root.schemaVersion === '1.1.0')
  ensure(typeof root.digest === 'string' && SAFE_SHA256.test(root.digest))
  const rawBook = record(root.book)
  ensure(rawBook !== null)
  ensure(nonBlank(rawBook.id, 500))
  ensure(nonBlank(rawBook.title, 1_000))
  ensure(nonBlank(rawBook.locale, 50))
  ensure(nonBlank(rawBook.landscapeId, 500) && SAFE_GOAL_ID.test(rawBook.landscapeId))
  ensure(nonBlank(rawBook.edition, 500) && SAFE_GOAL_ID.test(rawBook.edition))
  ensure(rawBook.atlasBaseUrl === PUBLIC_ATLAS_URL)
  ensure(typeof rawBook.pageCount === 'number' && Number.isSafeInteger(rawBook.pageCount))
  ensure(rawBook.pageCount >= 1 && rawBook.pageCount <= MAX_PAGES)
  ensure(rawBook.publicationMode === 'review' || rawBook.publicationMode === 'public')
  ensure(rawBook.oneGoalPerPage === true)

  const rawSource = record(root.source)
  ensure(rawSource !== null)
  const externalLandscapes = parseExternalLandscapeSources(
    rawSource.externalLandscapes,
    rawBook.landscapeId,
  )
  ensure(externalLandscapes !== null)
  const compositionViewSources = parseCompositionViewSources(rawSource.compositionViewSources)
  ensure(compositionViewSources !== null)
  const externalLandscapeIds = new Set(externalLandscapes.map(({ landscapeId }) => landscapeId))
  const navigation = parseGoalBookNavigation(root.navigation, rawBook.landscapeId)
  ensure(navigation !== null)

  ensure(Array.isArray(root.pages))
  ensure(root.pages.length === rawBook.pageCount)
  const pages: GoalBookRuntimePage[] = []
  for (const item of root.pages) {
    const page = record(item)
    ensure(page !== null)
    const breadcrumbs = stringList(page.breadcrumbs, 50, 1_000)
    const chapterIds = stringList(page.chapterIds, 50, 500)
    const requires = parseInternalReferences(page.requires)
    const reverseRequires = parseInternalReferences(page.reverseRequires)
    const externalBinding = {
      landscapeId: rawBook.landscapeId,
      edition: rawBook.edition,
      atlasBaseUrl: rawBook.atlasBaseUrl,
    } as { landscapeId: string; edition: string; atlasBaseUrl: string }
    const externalPrerequisites = parseExternalReferences(
      page.externalPrerequisites,
      externalBinding,
      externalLandscapeIds,
    )
    const externalReverseRequires = parseExternalReferences(
      page.externalReverseRequires,
      externalBinding,
      externalLandscapeIds,
    )
    const applicability = parseApplicability(page.applicability)
    const visualization = parseVisualization(page.visualization)
    const evidenceReview = parseEvidenceReview(page.evidenceReview)
    ensure(typeof page.pageNumber === 'number' && Number.isSafeInteger(page.pageNumber) && page.pageNumber >= 1)
    ensure(
      typeof page.navigationOrder === 'number'
      && Number.isSafeInteger(page.navigationOrder)
      && page.navigationOrder >= 0
    )
    ensure(
      typeof page.treeOrder === 'number'
      && Number.isSafeInteger(page.treeOrder)
      && page.treeOrder >= 0
    )
    ensure(nonBlank(page.goalId, 500) && SAFE_GOAL_ID.test(page.goalId))
    ensure(nonBlank(page.anchor, 505) && page.anchor === `goal-${page.goalId}`)
    ensure(nonBlank(page.title, 1_000))
    ensure(nonBlank(page.description, 20_000))
    ensure(breadcrumbs !== null)
    ensure(chapterIds !== null)
    ensure(requires !== null)
    ensure(reverseRequires !== null)
    ensure(externalPrerequisites !== null)
    ensure(externalReverseRequires !== null)
    ensure(visualization !== undefined)
    ensure(evidenceReview !== undefined)
    ensure(nonBlank(page.goalFingerprint, 71) && SAFE_SHA256.test(page.goalFingerprint))
    ensure(nonBlank(page.pageFingerprint, 71) && SAFE_SHA256.test(page.pageFingerprint))
    pages.push({
      pageNumber: page.pageNumber,
      navigationOrder: page.navigationOrder,
      treeOrder: page.treeOrder,
      goalId: page.goalId,
      anchor: page.anchor,
      title: page.title,
      description: page.description,
      breadcrumbs,
      chapterIds,
      requires,
      reverseRequires,
      externalPrerequisites,
      externalReverseRequires,
      ...(applicability === undefined ? {} : { applicability }),
      visualization,
      evidenceReview,
      goalFingerprint: page.goalFingerprint,
      pageFingerprint: page.pageFingerprint,
    })
  }

  ensure(Array.isArray(root.chapters))
  ensure(root.chapters.length >= 1 && root.chapters.length <= MAX_CHAPTERS)
  const chapters: GoalBookRuntimeChapter[] = []
  for (const item of root.chapters) {
    const chapter = record(item)
    ensure(chapter !== null)
    const goalIds = stringList(chapter.goalIds, MAX_PAGES, 500)
    const pageNumbers = Array.isArray(chapter.pageNumbers)
      && chapter.pageNumbers.length <= MAX_PAGES
      && chapter.pageNumbers.every((pageNumber) => (
        typeof pageNumber === 'number' && Number.isSafeInteger(pageNumber) && pageNumber >= 1
      ))
        ? chapter.pageNumbers as number[]
        : null
    ensure(nonBlank(chapter.chapterId, 500))
    ensure(nonBlank(chapter.label, 1_000))
    ensure(chapter.parentChapterId === null || nonBlank(chapter.parentChapterId, 500))
    ensure(goalIds !== null)
    ensure(pageNumbers !== null)
    ensure(goalIds.length === pageNumbers.length)
    ensure(
      typeof chapter.order === 'number'
      && Number.isSafeInteger(chapter.order)
      && chapter.order === chapters.length
    )
    ensure(
      typeof chapter.treeOrder === 'number'
      && Number.isSafeInteger(chapter.treeOrder)
      && chapter.treeOrder >= 0
    )
    chapters.push({
      chapterId: chapter.chapterId,
      label: chapter.label,
      parentChapterId: chapter.parentChapterId as string | null,
      order: chapter.order,
      treeOrder: chapter.treeOrder,
      goalIds,
      pageNumbers,
    })
  }

  const goalIds = new Set<string>()
  const anchors = new Set<string>()
  const pageNumbers = new Set<number>()
  for (const page of pages) {
    if (goalIds.has(page.goalId) || anchors.has(page.anchor) || pageNumbers.has(page.pageNumber)) fail()
    goalIds.add(page.goalId)
    anchors.add(page.anchor)
    pageNumbers.add(page.pageNumber)
  }
  if (pages.some((page, index) => page.pageNumber !== index + 1)) fail()
  const treeOrders = [
    ...chapters.map(({ treeOrder }) => treeOrder),
    ...pages.map(({ treeOrder }) => treeOrder),
  ].sort((left, right) => left - right)
  if (treeOrders.some((treeOrder, index) => treeOrder !== index)) fail()

  const chapterIds = new Set(chapters.map(({ chapterId }) => chapterId))
  if (chapterIds.size !== chapters.length) fail()
  for (const chapter of chapters) {
    if (chapter.parentChapterId !== null && !chapterIds.has(chapter.parentChapterId)) fail()
    if (chapter.goalIds.some((goalId) => !goalIds.has(goalId))) fail()
  }
  for (const page of pages) {
    if (page.chapterIds.some((chapterId) => !chapterIds.has(chapterId))) fail()
    for (const reference of [...page.requires, ...page.reverseRequires]) {
      const target = pages[reference.pageNumber - 1]
      if (!target || target.goalId !== reference.goalId || target.anchor !== reference.anchor) fail()
    }
  }

  return {
    schemaVersion: '1.1.0',
    book: {
      id: rawBook.id,
      title: rawBook.title,
      locale: rawBook.locale,
      landscapeId: rawBook.landscapeId,
      edition: rawBook.edition,
      atlasBaseUrl: PUBLIC_ATLAS_URL,
      pageCount: rawBook.pageCount,
      publicationMode: rawBook.publicationMode,
      oneGoalPerPage: true,
    },
    source: { externalLandscapes, compositionViewSources },
    navigation,
    chapters,
    pages,
    digest: root.digest,
  }
}

const sha256 = async (bytes: ArrayBuffer): Promise<string> => {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return `sha256:${[...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')}`
}

export const parseVerifiedGoalBookRuntimeModel = async (
  bytes: ArrayBuffer,
  expectedSha256: string,
): Promise<GoalBookRuntimeModel> => {
  ensure(bytes.byteLength > 0 && bytes.byteLength <= MAX_MODEL_BYTES)
  ensure(SAFE_SHA256.test(expectedSha256))
  ensure(await sha256(bytes) === expectedSha256)
  try {
    const source = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return parseGoalBookRuntimeModel(JSON.parse(source) as unknown)
  } catch {
    return fail()
  }
}

export const parseGoalBookPublicationIndex = (value: unknown): GoalBookRuntimePublicationIndex => {
  const root = record(value)
  ensure(root !== null)
  ensure(exactKeys(root, ['schemaVersion', 'books']))
  ensure(root.schemaVersion === 1)
  ensure(
    Array.isArray(root.books)
    && root.books.length === GOAL_BOOK_PUBLICATION_REGISTRY.length,
  )
  const publications: GoalBookRuntimePublication[] = []
  const seenBookIds = new Set<string>()
  let previousRegistryIndex = -1
  for (const item of root.books) {
    const book = record(item)
    ensure(book !== null)
    ensure(exactKeys(book, ['bookId', 'title', 'locale', 'publicationMode', 'pageCount', 'model', 'pdf']))
    ensure(nonBlank(book.bookId, 500))
    const definition = goalBookDefinitionById(book.bookId)
    ensure(definition !== undefined)
    const registryIndex = GOAL_BOOK_PUBLICATION_REGISTRY.findIndex(
      (candidate) => candidate.bookId === definition.bookId,
    )
    ensure(registryIndex > previousRegistryIndex && !seenBookIds.has(book.bookId))
    previousRegistryIndex = registryIndex
    seenBookIds.add(book.bookId)
    ensure(nonBlank(book.title, 1_000))
    ensure(nonBlank(book.locale, 50))
    ensure(book.publicationMode === 'review' || book.publicationMode === 'public')
    ensure(typeof book.pageCount === 'number' && Number.isSafeInteger(book.pageCount) && book.pageCount >= 1)
    const model = record(book.model)
    const pdf = record(book.pdf)
    ensure(model !== null && exactKeys(model, ['url', 'sha256', 'modelDigest']))
    ensure(pdf !== null && exactKeys(pdf, ['url', 'sha256', 'renderManifestUrl', 'renderManifestSha256']))
    ensure(model.url === goalBookModelUrl(definition))
    ensure(pdf.url === goalBookPdfUrl(definition))
    ensure(pdf.renderManifestUrl === goalBookRenderManifestUrl(definition))
    ensure(typeof model.sha256 === 'string' && SAFE_SHA256.test(model.sha256))
    ensure(typeof model.modelDigest === 'string' && SAFE_SHA256.test(model.modelDigest))
    ensure(typeof pdf.sha256 === 'string' && SAFE_SHA256.test(pdf.sha256))
    ensure(typeof pdf.renderManifestSha256 === 'string' && SAFE_SHA256.test(pdf.renderManifestSha256))
    publications.push({
      bookId: book.bookId,
      landscapeId: definition.landscapeId,
      edition: definition.edition,
      title: book.title,
      locale: book.locale,
      publicationMode: book.publicationMode,
      pageCount: book.pageCount,
      modelUrl: model.url,
      modelSha256: model.sha256,
      modelDigest: model.modelDigest,
      pdfUrl: pdf.url,
    })
  }
  return { schemaVersion: 1, books: publications }
}

export const selectGoalBookPublication = (
  index: GoalBookRuntimePublicationIndex,
  search: string,
): GoalBookRuntimePublication => {
  const params = new URLSearchParams(search)
  const requestedBookIds = params.getAll('book')
  const requestedLandscapeIds = params.getAll('landscape')
  const requestedEditions = params.getAll('edition')
  ensure(
    requestedBookIds.length <= 1
    && requestedLandscapeIds.length <= 1
    && requestedEditions.length <= 1,
  )
  const requestedBookDefinition = requestedBookIds.length === 1
    ? goalBookDefinitionById(requestedBookIds[0])
    : undefined
  const requestedLandscapeDefinition = requestedLandscapeIds.length === 1
    ? goalBookDefinitionByLandscapeId(requestedLandscapeIds[0])
    : undefined
  if (requestedBookIds.length === 1) ensure(requestedBookDefinition !== undefined)
  if (requestedLandscapeIds.length === 1) ensure(requestedLandscapeDefinition !== undefined)
  if (requestedBookDefinition && requestedLandscapeDefinition) {
    ensure(requestedBookDefinition.bookId === requestedLandscapeDefinition.bookId)
  }
  const selectedBookId = requestedBookDefinition?.bookId
    ?? requestedLandscapeDefinition?.bookId
    ?? DEFAULT_GOAL_BOOK_ID
  const selectedDefinition = goalBookDefinitionById(selectedBookId)
  ensure(selectedDefinition !== undefined)
  if (requestedEditions.length === 1) {
    ensure(requestedEditions[0] === selectedDefinition.edition)
  }
  const publication = index.books.find(({ bookId }) => bookId === selectedBookId)
  ensure(publication !== undefined)
  return publication
}

export const assertGoalBookPublicationBinding = (
  publication: GoalBookRuntimePublication,
  model: GoalBookRuntimeModel,
): void => {
  ensure(model.book.id === publication.bookId)
  ensure(model.book.landscapeId === publication.landscapeId)
  ensure(model.book.edition === publication.edition)
  ensure(model.book.title === publication.title)
  ensure(model.book.locale === publication.locale)
  ensure(model.book.publicationMode === publication.publicationMode)
  ensure(model.book.pageCount === publication.pageCount)
  ensure(model.digest === publication.modelDigest)
}

const normalizedSearchText = (value: string): string => value
  .normalize('NFKD')
  .replace(/\p{M}/gu, '')
  .toLocaleLowerCase('de-DE')
  .replace(/\s+/gu, ' ')
  .trim()

export const filterGoalBookPages = ({
  model,
  query,
  chapterId,
  applicability,
  goalIds,
}: {
  model: GoalBookRuntimeModel
  query: string
  chapterId: string | null
  applicability?: GoalBookApplicabilityFilter
  goalIds?: readonly string[] | ReadonlySet<string> | null
}): GoalBookRuntimePage[] => {
  const normalizedQuery = normalizedSearchText(query)
  const queryParts = normalizedQuery ? normalizedQuery.split(' ') : []
  const allowedGoalIds = goalIds !== undefined && goalIds !== null
    ? new Set(goalIds)
    : chapterId
      ? new Set(model.chapters.find((chapter) => chapter.chapterId === chapterId)?.goalIds ?? [])
      : null
  const filteredPages = model.pages.filter((page) => {
    if (allowedGoalIds && !allowedGoalIds.has(page.goalId)) return false
    if (applicability && Object.values(applicability).some((value) => value !== null)) {
      if (!page.applicability || !page.applicability.some((group) => {
        if (applicability.jurisdiction && group.jurisdiction !== applicability.jurisdiction) return false
        return group.scopes.some((scope) => (
          (!applicability.stage || scope.stage === applicability.stage)
          && (!applicability.durationModel
            || scope.durationModel === applicability.durationModel)
          && (!applicability.courseProfile
            || scope.courseProfile === applicability.courseProfile)
        ))
      })) return false
    }
    if (queryParts.length === 0) return true
    const haystack = normalizedSearchText([
      page.title,
      page.description,
      page.goalId,
      ...page.breadcrumbs,
    ].join(' '))
    return queryParts.every((part) => haystack.includes(part))
  })
  if (!Array.isArray(goalIds)) return filteredPages
  const requestedOrder = new Map(goalIds.map((goalId, index) => [goalId, index] as const))
  return filteredPages.sort((left, right) => (
    (requestedOrder.get(left.goalId) ?? Number.MAX_SAFE_INTEGER)
    - (requestedOrder.get(right.goalId) ?? Number.MAX_SAFE_INTEGER)
  ))
}

const hasApplicabilitySelection = (filter: GoalBookApplicabilityFilter): boolean => (
  Object.values(filter).some((value) => value !== null)
)

const legacyChapterProjection = (
  model: GoalBookRuntimeModel,
): GoalBookSuppliedChapterProjection => {
  const orderedNodes = [
    ...model.chapters.map((chapter) => ({
      node: {
        nodeId: chapter.chapterId,
        label: chapter.label,
        parentNodeId: chapter.parentChapterId,
        childNodeIds: [],
        kind: chapter.chapterId.startsWith('goal:') ? 'cluster' as const : 'structure' as const,
        goalId: null,
        descendantGoalCount: chapter.goalIds.length,
      },
      treeOrder: chapter.treeOrder,
    })),
    ...model.pages.map((page) => ({
      node: {
        nodeId: `goal:${page.goalId}`,
        label: page.title,
        parentNodeId: page.chapterIds.at(-1) ?? null,
        childNodeIds: [],
        kind: 'goal' as const,
        goalId: page.goalId,
        descendantGoalCount: 1,
      },
      treeOrder: page.treeOrder,
    })),
  ].sort((left, right) => left.treeOrder - right.treeOrder)
  const nodes: GoalBookSuppliedChapterProjectionNode[] = orderedNodes.map(({ node }) => node)
  const knownChapterIds = new Set(model.chapters.map(({ chapterId }) => chapterId))
  const nodesById = new Map(nodes.map((node) => [node.nodeId, node] as const))
  nodes.forEach((node) => {
    if (!node.parentNodeId || !knownChapterIds.has(node.parentNodeId)) return
    nodesById.get(node.parentNodeId)?.childNodeIds.push(node.nodeId)
  })
  return {
    projectionId: `canonical-fallback:${model.book.id}:${model.book.edition}`,
    viewId: null,
    scope: null,
    digest: model.digest,
    nodes,
  }
}

const validateAndResolveProjectionNodes = (
  model: GoalBookRuntimeModel,
  projection: GoalBookSuppliedChapterProjection,
  applicableGoalIds: ReadonlySet<string>,
): Pick<GoalBookResolvedChapterProjection, 'nodes' | 'rootNodeIds' | 'goalIds'> => {
  ensure(nonBlank(projection.projectionId, 500))
  ensure(projection.viewId === undefined || projection.viewId === null || nonBlank(projection.viewId, 500))
  ensure(nonBlank(projection.digest, 200))
  ensure(Array.isArray(projection.nodes) && projection.nodes.length <= MAX_CHAPTERS + MAX_PAGES)

  const modelGoalIds = new Set(model.pages.map(({ goalId }) => goalId))
  const nodesById = new Map<string, GoalBookSuppliedChapterProjectionNode>()
  const placedGoalIds = new Set<string>()
  for (const node of projection.nodes) {
    ensure(nonBlank(node.nodeId, 500) && !nodesById.has(node.nodeId))
    ensure(nonBlank(node.label, 1_000))
    ensure(node.parentNodeId === null || nonBlank(node.parentNodeId, 500))
    ensure(Array.isArray(node.childNodeIds) && node.childNodeIds.length <= MAX_CHAPTERS + MAX_PAGES)
    ensure(new Set(node.childNodeIds).size === node.childNodeIds.length)
    ensure(['structure', 'cluster', 'goal'].includes(node.kind))
    ensure(Number.isSafeInteger(node.descendantGoalCount) && node.descendantGoalCount >= 0)
    if (node.kind === 'goal') {
      ensure(nonBlank(node.goalId, 500) && modelGoalIds.has(node.goalId))
      ensure(node.childNodeIds.length === 0 && node.descendantGoalCount === 1)
      ensure(!placedGoalIds.has(node.goalId))
      placedGoalIds.add(node.goalId)
    } else {
      ensure(node.goalId === null)
    }
    nodesById.set(node.nodeId, node)
  }

  const rootNodeIds: string[] = []
  for (const node of projection.nodes) {
    if (node.parentNodeId === null) {
      rootNodeIds.push(node.nodeId)
    } else {
      const parent = nodesById.get(node.parentNodeId)
      ensure(parent !== undefined && parent.childNodeIds.includes(node.nodeId))
    }
    for (const childNodeId of node.childNodeIds) {
      const child = nodesById.get(childNodeId)
      ensure(child !== undefined && child.parentNodeId === node.nodeId)
    }
  }

  const visiting = new Set<string>()
  const visited = new Set<string>()
  const fullDescendants = new Map<string, string[]>()
  const descendantsFor = (nodeId: string): string[] => {
    const known = fullDescendants.get(nodeId)
    if (known) return known
    ensure(!visiting.has(nodeId))
    visiting.add(nodeId)
    const node = nodesById.get(nodeId)
    ensure(node !== undefined)
    const descendantGoalIds = node.kind === 'goal'
      ? [node.goalId as string]
      : node.childNodeIds.flatMap(descendantsFor)
    ensure(new Set(descendantGoalIds).size === descendantGoalIds.length)
    ensure(descendantGoalIds.length === node.descendantGoalCount)
    visiting.delete(nodeId)
    visited.add(nodeId)
    fullDescendants.set(nodeId, descendantGoalIds)
    return descendantGoalIds
  }
  for (const rootNodeId of rootNodeIds) descendantsFor(rootNodeId)
  ensure(visited.size === projection.nodes.length)

  const retainedNodeIds = new Set<string>()
  const filteredDescendants = new Map<string, string[]>()
  const retain = (nodeId: string): string[] => {
    const node = nodesById.get(nodeId)
    ensure(node !== undefined)
    const descendantGoalIds = node.kind === 'goal'
      ? applicableGoalIds.has(node.goalId as string) ? [node.goalId as string] : []
      : node.childNodeIds.flatMap(retain)
    if (descendantGoalIds.length > 0) retainedNodeIds.add(nodeId)
    filteredDescendants.set(nodeId, descendantGoalIds)
    return descendantGoalIds
  }
  for (const rootNodeId of rootNodeIds) retain(rootNodeId)

  const nodes = projection.nodes.flatMap((node): GoalBookResolvedChapterProjectionNode[] => {
    if (!retainedNodeIds.has(node.nodeId)) return []
    const descendantGoalIds = filteredDescendants.get(node.nodeId) ?? []
    return [{
      ...node,
      childNodeIds: node.childNodeIds.filter((childNodeId) => retainedNodeIds.has(childNodeId)),
      descendantGoalCount: descendantGoalIds.length,
      descendantGoalIds,
    }]
  })
  const retainedRoots = rootNodeIds.filter((nodeId) => retainedNodeIds.has(nodeId))
  const projectionGoalIds = retainedRoots.flatMap((rootNodeId) => (
    filteredDescendants.get(rootNodeId) ?? []
  ))
  ensure(
    projectionGoalIds.length
      === [...placedGoalIds].filter((goalId) => applicableGoalIds.has(goalId)).length,
  )
  return { nodes, rootNodeIds: retainedRoots, goalIds: projectionGoalIds }
}

/**
 * Resolves the tree used by the public goal-book navigation. Search is
 * deliberately absent: it filters the result column, never the authored tree.
 */
export const resolveGoalBookChapterProjection = ({
  model,
  applicability,
  suppliedProjection,
}: {
  model: GoalBookRuntimeModel
  applicability: GoalBookApplicabilityFilter
  suppliedProjection?: GoalBookSuppliedChapterProjection | null
}): GoalBookResolvedChapterProjection => {
  const source = suppliedProjection ?? legacyChapterProjection(model)
  // A matched Composition View is the authoritative target universe for the
  // resolved learner scope. Applicability filtering is retained only for the
  // canonical compatibility tree used by partial filters; intersecting a
  // supplied view again would silently diverge from the Cockpit projection.
  const applicableGoalIds = suppliedProjection
    ? new Set(model.pages.map(({ goalId }) => goalId))
    : new Set(filterGoalBookPages({
      model,
      query: '',
      chapterId: null,
      applicability,
    }).map(({ goalId }) => goalId))
  const resolved = validateAndResolveProjectionNodes(model, source, applicableGoalIds)
  return {
    projectionId: source.projectionId,
    viewId: source.viewId ?? null,
    scope: suppliedProjection
      ? source.scope
      : hasApplicabilitySelection(applicability) ? { ...applicability } : null,
    digest: source.digest,
    source: suppliedProjection ? 'supplied' : 'canonical-fallback',
    ...resolved,
  }
}

const sortedUnique = (values: Iterable<string>): string[] => (
  [...new Set(values)].sort((left, right) => left.localeCompare(right, 'de-DE'))
)

export const goalBookApplicabilityOptions = (
  model: GoalBookRuntimeModel,
  filter: GoalBookApplicabilityFilter,
): GoalBookApplicabilityOptions => {
  const jurisdictions = sortedUnique(model.pages.flatMap((page) => (
    page.applicability?.map((group) => group.jurisdiction) ?? []
  )))
  if (!filter.jurisdiction) {
    return { jurisdictions, stages: [], durationModels: [], courseProfiles: [] }
  }
  const jurisdictionScopes = model.pages.flatMap((page) => (
    page.applicability
      ?.find((group) => group.jurisdiction === filter.jurisdiction)
      ?.scopes ?? []
  ))
  const matches = (
    scope: GoalBookApplicabilityScope,
    except: keyof Omit<GoalBookApplicabilityFilter, 'jurisdiction'>,
  ): boolean => (
    (except === 'stage' || !filter.stage || scope.stage === filter.stage)
    && (except === 'durationModel' || !filter.durationModel || scope.durationModel === filter.durationModel)
    && (except === 'courseProfile' || !filter.courseProfile || scope.courseProfile === filter.courseProfile)
  )
  return {
    jurisdictions,
    stages: sortedUnique(jurisdictionScopes
      .filter((scope) => matches(scope, 'stage'))
      .map(({ stage }) => stage)),
    durationModels: sortedUnique(jurisdictionScopes
      .filter((scope) => matches(scope, 'durationModel'))
      .flatMap(({ durationModel }) => durationModel ? [durationModel] : [])),
    courseProfiles: sortedUnique(jurisdictionScopes
      .filter((scope) => matches(scope, 'courseProfile'))
      .flatMap(({ courseProfile }) => courseProfile ? [courseProfile] : [])),
  }
}

export const goalBookPageFromHash = (
  model: GoalBookRuntimeModel,
  hash: string,
): GoalBookRuntimePage | null => {
  let anchor = hash.replace(/^#/u, '')
  try {
    anchor = decodeURIComponent(anchor)
  } catch {
    return null
  }
  if (!SAFE_ANCHOR.test(anchor)) return null
  return model.pages.find((page) => page.anchor === anchor) ?? null
}

export const goalBookExternalReferenceFromHash = (
  model: GoalBookRuntimeModel,
  hash: string,
): GoalBookRuntimeExternalReference | null => {
  let anchor = hash.replace(/^#/u, '')
  try {
    anchor = decodeURIComponent(anchor)
  } catch {
    return null
  }
  if (!SAFE_ANCHOR.test(anchor)) return null
  const goalId = anchor.slice('goal-'.length)
  for (const page of model.pages) {
    const reference = [...page.externalPrerequisites, ...page.externalReverseRequires]
      .find((candidate) => candidate.goalId === goalId)
    if (reference) return reference
  }
  return null
}

export const goalBookChapterDepths = (
  chapters: GoalBookRuntimeChapter[],
): Map<string, number> => {
  const byId = new Map(chapters.map((chapter) => [chapter.chapterId, chapter]))
  const depths = new Map<string, number>()
  const visiting = new Set<string>()
  const depthFor = (chapterId: string): number => {
    const known = depths.get(chapterId)
    if (known !== undefined) return known
    if (visiting.has(chapterId)) return 0
    visiting.add(chapterId)
    const parentId = byId.get(chapterId)?.parentChapterId ?? null
    const depth = parentId ? depthFor(parentId) + 1 : 0
    visiting.delete(chapterId)
    depths.set(chapterId, depth)
    return depth
  }
  for (const chapter of chapters) depthFor(chapter.chapterId)
  return depths
}
