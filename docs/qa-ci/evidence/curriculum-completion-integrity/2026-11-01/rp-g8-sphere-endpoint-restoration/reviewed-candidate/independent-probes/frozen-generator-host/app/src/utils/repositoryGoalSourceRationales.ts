import { splitFilterIds } from './goalFilters'
import { normalizeJurisdictionCode } from './jurisdictionMetadata'
import type {
  GoalClassicSourceRoute,
  GoalSourceRationaleItem,
} from './sourceRationaleTypes'

type RepositoryPayloadSource = {
  publicPath: string
  statusPath?: string
}

const REPOSITORY_PAYLOAD_SOURCES: readonly RepositoryPayloadSource[] = [
  {
    publicPath: '/data/goal-source-rationales-math-public.json',
    statusPath: 'docs/qa-ci/status/goal-source-rationales-mem-examples-plain.json',
  },
  {
    publicPath: '/data/goal-source-rationales-physics-public.json',
  },
]

const asRecord = (value: unknown): Record<string, unknown> | null => (
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
)

const readString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const readStringArray = (value: unknown): string[] => (
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    : []
)

const decodeCommonHtmlEntities = (value?: string): string => (
  (value ?? '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
)

const normalizeSourceRationaleItem = (rawItem: unknown): GoalSourceRationaleItem | null => {
  const item = asRecord(rawItem)
  const rawGoal = asRecord(item?.goal)
  const goalId = readString(rawGoal?.id)
  if (!item || !rawGoal || !goalId) return null

  const normalizeClassicRoute = (rawRoute: Record<string, unknown> | null): GoalClassicSourceRoute | undefined => {
    if (!rawRoute) return undefined
    const rawRouteSourceDocument = asRecord(rawRoute.sourceDocument)
    return {
      jurisdiction: normalizeJurisdictionCode(readString(rawRoute.jurisdiction)) ?? undefined,
      sourceRef: readString(rawRoute.sourceRef),
      sourceText: readString(rawRoute.sourceText),
      parentBulletText: readString(rawRoute.parentBulletText),
      sourceExtractionPath: readString(rawRoute.sourceExtractionPath),
      sourceDocument: rawRouteSourceDocument
        ? {
            title: readString(rawRouteSourceDocument.title),
            url: readString(rawRouteSourceDocument.url),
            path: readString(rawRouteSourceDocument.path),
          }
        : undefined,
      matchType: readString(rawRoute.matchType),
      rationale: readString(rawRoute.rationale),
    }
  }

  const rawAlternateClassicRoutes = Array.isArray(item.alternateClassicSourceRoutes)
    ? item.alternateClassicSourceRoutes
    : []
  const rawMemRoute = asRecord(item.memSparqlRoute)

  return {
    goal: {
      id: goalId,
      title: readString(rawGoal.title),
      description: readString(rawGoal.description),
      pathTitles: readStringArray(rawGoal.pathTitles),
    },
    classicSourceRoute: normalizeClassicRoute(asRecord(item.classicSourceRoute)),
    alternateClassicSourceRoutes: rawAlternateClassicRoutes
      .map((rawRoute) => normalizeClassicRoute(asRecord(rawRoute)))
      .filter((route): route is GoalClassicSourceRoute => Boolean(route)),
    memSparqlRoute: rawMemRoute
      ? {
          status: readString(rawMemRoute.status),
          jurisdiction: normalizeJurisdictionCode(readString(rawMemRoute.jurisdiction)) ?? undefined,
          endpoint: readString(rawMemRoute.endpoint),
          graphIri: readString(rawMemRoute.graphIri),
          planIri: readString(rawMemRoute.planIri),
          planLabel: readString(rawMemRoute.planLabel),
          yearLabel: readString(rawMemRoute.yearLabel),
          goalIri: readString(rawMemRoute.goalIri),
          goalLabel: decodeCommonHtmlEntities(readString(rawMemRoute.goalLabel)),
          notes: readString(rawMemRoute.notes),
        }
      : undefined,
  }
}

const selectSourceRationaleForFilter = (
  item: GoalSourceRationaleItem | undefined,
  activeFilter?: string,
): GoalSourceRationaleItem | null => {
  if (!item?.goal?.id) return null

  const activeJurisdiction = splitFilterIds(activeFilter)
    .map((filterId) => normalizeJurisdictionCode(filterId))
    .find((jurisdiction) => !!jurisdiction)
  const usableMemRoute = item.memSparqlRoute?.status === 'mem_sparql_consistent'
    ? item.memSparqlRoute
    : undefined
  if (!activeJurisdiction) {
    return { ...item, memSparqlRoute: usableMemRoute }
  }

  const routes = [
    item.classicSourceRoute,
    ...(item.alternateClassicSourceRoutes ?? []),
  ].filter((route): route is GoalClassicSourceRoute => Boolean(route))
  const selectedClassicRoute = routes.find(
    (route) => normalizeJurisdictionCode(route.jurisdiction) === activeJurisdiction,
  )
  if (!selectedClassicRoute) return null

  const memRouteJurisdiction = normalizeJurisdictionCode(usableMemRoute?.jurisdiction)
  const memRouteMatchesFilter = Boolean(usableMemRoute) && (
    memRouteJurisdiction === activeJurisdiction
    || (!memRouteJurisdiction && normalizeJurisdictionCode(selectedClassicRoute.jurisdiction) === activeJurisdiction)
  )

  return {
    ...item,
    classicSourceRoute: selectedClassicRoute,
    memSparqlRoute: memRouteMatchesFilter ? usableMemRoute : undefined,
  }
}

const loadRepositoryPayload = async (
  source: RepositoryPayloadSource,
): Promise<Record<string, unknown> | null> => {
  try {
    const publicResponse = await fetch(source.publicPath)
    if (publicResponse.ok) return asRecord(await publicResponse.json())
  } catch {
    // Local quality-dashboard fallback remains available in repository development mode.
  }

  if (!source.statusPath) return null
  try {
    const params = new URLSearchParams({ path: source.statusPath })
    const localResponse = await fetch(`/__quality-dashboard/file?${params.toString()}`)
    if (!localResponse.ok) return null
    return asRecord(await localResponse.json())
  } catch {
    return null
  }
}

let repositoryIndexPromise: Promise<Map<string, GoalSourceRationaleItem>> | null = null

const loadRepositoryIndex = (): Promise<Map<string, GoalSourceRationaleItem>> => {
  if (!repositoryIndexPromise) {
    repositoryIndexPromise = Promise.all(REPOSITORY_PAYLOAD_SOURCES.map(loadRepositoryPayload))
      .then((payloads) => {
        const index = new Map<string, GoalSourceRationaleItem>()
        payloads.forEach((payload) => {
          const rawItems = Array.isArray(payload?.items) ? payload.items : []
          rawItems.forEach((rawItem) => {
            const item = normalizeSourceRationaleItem(rawItem)
            if (item?.goal?.id && !index.has(item.goal.id)) index.set(item.goal.id, item)
          })
        })
        return index
      })
      .catch(() => new Map())
  }
  return repositoryIndexPromise
}

/** Repository compatibility only. Package mode must never import or invoke this loader. */
export const loadRepositoryGoalSourceRationale = async (
  goalId: string,
  activeFilter?: string,
): Promise<GoalSourceRationaleItem | null> => {
  const index = await loadRepositoryIndex()
  return selectSourceRationaleForFilter(index.get(goalId), activeFilter)
}

export const resetRepositoryGoalSourceRationaleCacheForTests = (): void => {
  repositoryIndexPromise = null
}
