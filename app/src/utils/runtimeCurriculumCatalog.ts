export const RUNTIME_CURRICULUM_CATALOG_API_VERSION = '1.2'

export type RuntimeScope = Readonly<Record<string, string>>

export interface RuntimeCatalogPackage {
  packageId: string
  packageVersion: string
  releaseId: string
  contentDigest: string
  capabilities: readonly string[]
}

export interface RuntimeCatalogLandscape {
  packageId: string
  landscapeId: string
  role: 'root' | 'module' | 'embedded-fragment'
  locale: string
  frameworkId: string
  subject: string
  country?: string
  region?: string
  schoolForm?: string
  defaultOfferingId?: string
  parentLandscapeId?: string
}

export interface RuntimeCatalogView {
  packageId: string
  viewId: string
  landscapeId: string
  language?: string
  scope: RuntimeScope
}

export interface RuntimeCatalogOffering {
  packageId: string
  offeringId: string
  landscapeId: string
  scope: RuntimeScope
  resolution: {
    mode: 'single' | 'merge'
    mergeDimension?: string
    viewIds: readonly string[]
  }
}

export interface RuntimeCatalogDeck {
  packageId: string
  packageVersion: string
  deckId: string
  landscapeId: string
  locale: string
  href: string
}

export interface RuntimeCatalogResource {
  packageId: string
  packageVersion: string
  resourceId: string
  landscapeId: string
  ownerGoalId: string
  resourceKind: 'goal-visualization' | 'external-tool'
  delivery: 'embedded' | 'external'
  mediaType: string
  publicUrl?: string
  href: string
  runtimeRequired: boolean
  bytes?: number
  sha256?: string
}

export interface RuntimeCatalogSourceEvidenceGoal {
  goalId: string
  jurisdictions: readonly string[]
}

export interface RuntimeCatalogSourceEvidence {
  packageId: string
  packageVersion: string
  targetLandscapeId: string
  sourceCollectionCount: number
  sourceDocumentCount: number
  sourceGoalCount: number
  mappingEdgeCount: number
  goals: readonly RuntimeCatalogSourceEvidenceGoal[]
  href: string
}

export interface RuntimeCurriculumCatalog {
  catalogApiVersion: typeof RUNTIME_CURRICULUM_CATALOG_API_VERSION
  generationSha256: string
  packages: readonly RuntimeCatalogPackage[]
  rootLandscapeIds: readonly string[]
  landscapes: readonly RuntimeCatalogLandscape[]
  views: readonly RuntimeCatalogView[]
  offerings: readonly RuntimeCatalogOffering[]
  decks: readonly RuntimeCatalogDeck[]
  resources: readonly RuntimeCatalogResource[]
  sourceEvidence: readonly RuntimeCatalogSourceEvidence[]
}

export type RuntimeCurriculumCatalogState =
  | { mode: 'loading' }
  | { mode: 'repository' }
  | { mode: 'package'; catalog: RuntimeCurriculumCatalog; apiBase: string }
  | { mode: 'unavailable'; error: Error }

type GoalWithRuntimeResources = {
  id: string
  landscapeId?: string
  tags?: string[]
}

type ResourceLinkWithRuntimeIdentity = {
  url?: string
  resourceId?: string
}

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:+-]*$/u
const SHA256_PATTERN = /^[a-f0-9]{64}$/u
const CONTENT_DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/u
const LOCALE_PATTERN = /^[a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-[A-Z]{2}|-[0-9]{3})?$/u
const MEDIA_TYPE_PATTERN = /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/u
const JURISDICTION_PATTERN = /^DE-[A-Z]{2}$/u

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`)
  }
  return value as Record<string, unknown>
}

const asArray = (value: unknown, label: string): unknown[] => {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`)
  return value
}

const asString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`)
  }
  return value
}

const asOptionalString = (value: unknown, label: string): string | undefined => {
  if (value === null || value === undefined) return undefined
  return asString(value, label)
}

const asId = (value: unknown, label: string): string => {
  const id = asString(value, label)
  if (!ID_PATTERN.test(id)) throw new Error(`${label} is not a safe identifier`)
  return id
}

const assertUnique = (values: readonly string[], label: string): void => {
  if (new Set(values).size !== values.length) throw new Error(`${label} contains duplicates`)
}

const readStringArray = (value: unknown, label: string): string[] => {
  const result = asArray(value, label).map((entry, index) => asString(entry, `${label}[${index}]`))
  assertUnique(result, label)
  return result
}

const readScope = (value: unknown, label: string): RuntimeScope => {
  const record = asRecord(value, label)
  const result: Record<string, string> = {}
  Object.keys(record).sort().forEach((key) => {
    if (!/^[A-Za-z][A-Za-z0-9._-]*$/u.test(key)) {
      throw new Error(`${label} contains an invalid dimension`)
    }
    result[key] = asString(record[key], `${label}.${key}`)
  })
  if (Object.keys(result).length === 0) throw new Error(`${label} must not be empty`)
  return Object.freeze(result)
}

const scopeKey = (scope: Readonly<Record<string, string>>): string => (
  Object.keys(scope)
    .sort()
    .map((key) => `${key.length}:${key}=${scope[key].length}:${scope[key]}`)
    .join('|')
)

const assertSafeEmbeddedHref = (href: string, label: string): void => {
  if (
    !href.startsWith('/api/ui/curriculum-resources/packages/')
    || href.includes('\\')
    || href.includes('?')
    || href.includes('#')
    || href.includes('//')
    || href.split('/').some((part) => part === '.' || part === '..')
  ) {
    throw new Error(`${label} is not a safe package resource href`)
  }
}

const readNullableNumber = (value: unknown, label: string): number | undefined => {
  if (value === null || value === undefined) return undefined
  if (!Number.isSafeInteger(value) || Number(value) < 0) throw new Error(`${label} must be a non-negative integer`)
  return Number(value)
}

export const parseRuntimeCurriculumCatalog = (raw: unknown): RuntimeCurriculumCatalog => {
  const root = asRecord(raw, 'runtime curriculum catalog')
  if (root.catalogApiVersion !== RUNTIME_CURRICULUM_CATALOG_API_VERSION) {
    throw new Error(`Unsupported curriculum catalog API version: ${String(root.catalogApiVersion)}`)
  }
  const generationSha256 = asString(root.generationSha256, 'generationSha256')
  if (!SHA256_PATTERN.test(generationSha256)) throw new Error('generationSha256 must be a SHA-256 hex digest')

  const packages = asArray(root.packages, 'packages').map((entry, index): RuntimeCatalogPackage => {
    const item = asRecord(entry, `packages[${index}]`)
    const contentDigest = asString(item.contentDigest, `packages[${index}].contentDigest`)
    if (!CONTENT_DIGEST_PATTERN.test(contentDigest)) throw new Error(`packages[${index}].contentDigest is invalid`)
    return Object.freeze({
      packageId: asId(item.packageId, `packages[${index}].packageId`),
      packageVersion: asId(item.packageVersion, `packages[${index}].packageVersion`),
      releaseId: asString(item.releaseId, `packages[${index}].releaseId`),
      contentDigest,
      capabilities: Object.freeze(readStringArray(item.capabilities, `packages[${index}].capabilities`)),
    })
  })
  assertUnique(packages.map((entry) => entry.packageId), 'package IDs')
  const packageById = new Map(packages.map((entry) => [entry.packageId, entry]))

  const landscapes = asArray(root.landscapes, 'landscapes').map((entry, index): RuntimeCatalogLandscape => {
    const item = asRecord(entry, `landscapes[${index}]`)
    const packageId = asId(item.packageId, `landscapes[${index}].packageId`)
    if (!packageById.has(packageId)) throw new Error(`landscapes[${index}] references an unknown package`)
    const role = asString(item.role, `landscapes[${index}].role`)
    if (role !== 'root' && role !== 'module' && role !== 'embedded-fragment') {
      throw new Error(`landscapes[${index}].role is invalid`)
    }
    const locale = asString(item.locale, `landscapes[${index}].locale`)
    if (!LOCALE_PATTERN.test(locale)) throw new Error(`landscapes[${index}].locale is invalid`)
    const result: RuntimeCatalogLandscape = {
      packageId,
      landscapeId: asId(item.landscapeId, `landscapes[${index}].landscapeId`),
      role,
      locale,
      frameworkId: asId(item.frameworkId, `landscapes[${index}].frameworkId`),
      subject: asString(item.subject, `landscapes[${index}].subject`),
      country: asOptionalString(item.country, `landscapes[${index}].country`),
      region: asOptionalString(item.region, `landscapes[${index}].region`),
      schoolForm: asOptionalString(item.schoolForm, `landscapes[${index}].schoolForm`),
      defaultOfferingId: asOptionalString(item.defaultOfferingId, `landscapes[${index}].defaultOfferingId`),
      parentLandscapeId: asOptionalString(item.parentLandscapeId, `landscapes[${index}].parentLandscapeId`),
    }
    if (role === 'module' && !result.parentLandscapeId) throw new Error(`landscapes[${index}] module has no parent`)
    if (role !== 'module' && result.parentLandscapeId) throw new Error(`landscapes[${index}] has an unexpected parent`)
    return Object.freeze(result)
  })
  assertUnique(landscapes.map((entry) => entry.landscapeId), 'landscape IDs')
  const landscapeById = new Map(landscapes.map((entry) => [entry.landscapeId, entry]))
  landscapes.forEach((entry) => {
    if (entry.parentLandscapeId) {
      const parent = landscapeById.get(entry.parentLandscapeId)
      if (!parent || parent.packageId !== entry.packageId) throw new Error(`Landscape ${entry.landscapeId} has an invalid parent`)
    }
  })

  const rootLandscapeIds = readStringArray(root.rootLandscapeIds, 'rootLandscapeIds')
  if (rootLandscapeIds.length === 0) throw new Error('rootLandscapeIds must not be empty')
  rootLandscapeIds.forEach((landscapeId) => {
    if (landscapeById.get(landscapeId)?.role !== 'root') throw new Error(`Unknown or non-root landscape: ${landscapeId}`)
  })
  const declaredRootIds = landscapes.filter((entry) => entry.role === 'root').map((entry) => entry.landscapeId)
  if (scopeKey(Object.fromEntries(rootLandscapeIds.map((id) => [id, id]))) !== scopeKey(Object.fromEntries(declaredRootIds.map((id) => [id, id])))) {
    throw new Error('rootLandscapeIds do not exactly enumerate root landscapes')
  }

  const views = asArray(root.views, 'views').map((entry, index): RuntimeCatalogView => {
    const item = asRecord(entry, `views[${index}]`)
    const packageId = asId(item.packageId, `views[${index}].packageId`)
    const landscapeId = asId(item.landscapeId, `views[${index}].landscapeId`)
    if (landscapeById.get(landscapeId)?.packageId !== packageId) throw new Error(`views[${index}] has an invalid landscape binding`)
    return Object.freeze({
      packageId,
      viewId: asId(item.viewId, `views[${index}].viewId`),
      landscapeId,
      language: asOptionalString(item.language, `views[${index}].language`),
      scope: readScope(item.scope, `views[${index}].scope`),
    })
  })
  assertUnique(views.map((entry) => entry.viewId), 'view IDs')
  const viewById = new Map(views.map((entry) => [entry.viewId, entry]))

  const offerings = asArray(root.offerings, 'offerings').map((entry, index): RuntimeCatalogOffering => {
    const item = asRecord(entry, `offerings[${index}]`)
    const packageId = asId(item.packageId, `offerings[${index}].packageId`)
    const landscapeId = asId(item.landscapeId, `offerings[${index}].landscapeId`)
    if (landscapeById.get(landscapeId)?.packageId !== packageId) throw new Error(`offerings[${index}] has an invalid landscape binding`)
    const resolution = asRecord(item.resolution, `offerings[${index}].resolution`)
    const mode = asString(resolution.mode, `offerings[${index}].resolution.mode`)
    if (mode !== 'single' && mode !== 'merge') throw new Error(`offerings[${index}] has an invalid resolution mode`)
    const viewIds = readStringArray(resolution.viewIds, `offerings[${index}].resolution.viewIds`)
    if ((mode === 'single' && viewIds.length !== 1) || (mode === 'merge' && viewIds.length < 2)) {
      throw new Error(`offerings[${index}] has an invalid view count`)
    }
    viewIds.forEach((viewId) => {
      const view = viewById.get(viewId)
      if (!view || view.packageId !== packageId || view.landscapeId !== landscapeId) {
        throw new Error(`offerings[${index}] references an invalid view`)
      }
    })
    const mergeDimension = asOptionalString(resolution.mergeDimension, `offerings[${index}].resolution.mergeDimension`)
    if ((mode === 'merge') !== Boolean(mergeDimension)) throw new Error(`offerings[${index}] has invalid merge metadata`)
    return Object.freeze({
      packageId,
      offeringId: asId(item.offeringId, `offerings[${index}].offeringId`),
      landscapeId,
      scope: readScope(item.scope, `offerings[${index}].scope`),
      resolution: Object.freeze({ mode, mergeDimension, viewIds: Object.freeze(viewIds) }),
    })
  })
  assertUnique(offerings.map((entry) => entry.offeringId), 'offering IDs')
  assertUnique(offerings.map((entry) => `${entry.landscapeId}\u0000${scopeKey(entry.scope)}`), 'landscape offering scopes')
  const offeringById = new Map(offerings.map((entry) => [entry.offeringId, entry]))
  landscapes.forEach((entry) => {
    if (!entry.defaultOfferingId) return
    const offering = offeringById.get(entry.defaultOfferingId)
    if (!offering || offering.packageId !== entry.packageId || offering.landscapeId !== entry.landscapeId) {
      throw new Error(`Landscape ${entry.landscapeId} has an invalid default offering`)
    }
  })

  const decks = asArray(root.decks, 'decks').map((entry, index): RuntimeCatalogDeck => {
    const item = asRecord(entry, `decks[${index}]`)
    const packageId = asId(item.packageId, `decks[${index}].packageId`)
    const packageVersion = asString(item.packageVersion, `decks[${index}].packageVersion`)
    const landscapeId = asId(item.landscapeId, `decks[${index}].landscapeId`)
    const locale = asString(item.locale, `decks[${index}].locale`)
    if (!LOCALE_PATTERN.test(locale)) throw new Error(`decks[${index}].locale is invalid`)
    if (packageById.get(packageId)?.packageVersion !== packageVersion || landscapeById.get(landscapeId)?.packageId !== packageId) {
      throw new Error(`decks[${index}] has an invalid package binding`)
    }
    const href = asString(item.href, `decks[${index}].href`)
    assertSafeEmbeddedHref(href, `decks[${index}].href`)
    return Object.freeze({ packageId, packageVersion, deckId: asId(item.deckId, `decks[${index}].deckId`), landscapeId, locale, href })
  })
  assertUnique(decks.map((entry) => `${entry.packageId}\u0000${entry.packageVersion}\u0000${entry.deckId}\u0000${entry.locale}`), 'deck identities')

  const resources = asArray(root.resources, 'resources').map((entry, index): RuntimeCatalogResource => {
    const item = asRecord(entry, `resources[${index}]`)
    const packageId = asId(item.packageId, `resources[${index}].packageId`)
    const packageVersion = asString(item.packageVersion, `resources[${index}].packageVersion`)
    const landscapeId = asId(item.landscapeId, `resources[${index}].landscapeId`)
    if (packageById.get(packageId)?.packageVersion !== packageVersion || landscapeById.get(landscapeId)?.packageId !== packageId) {
      throw new Error(`resources[${index}] has an invalid package binding`)
    }
    const resourceKind = asString(item.resourceKind, `resources[${index}].resourceKind`)
    const delivery = asString(item.delivery, `resources[${index}].delivery`)
    if (resourceKind !== 'goal-visualization' && resourceKind !== 'external-tool') throw new Error(`resources[${index}].resourceKind is invalid`)
    if (delivery !== 'embedded' && delivery !== 'external') throw new Error(`resources[${index}].delivery is invalid`)
    const mediaType = asString(item.mediaType, `resources[${index}].mediaType`)
    if (!MEDIA_TYPE_PATTERN.test(mediaType)) throw new Error(`resources[${index}].mediaType is invalid`)
    const href = asString(item.href, `resources[${index}].href`)
    if (delivery === 'embedded') assertSafeEmbeddedHref(href, `resources[${index}].href`)
    if (delivery === 'external' && !/^https:\/\/[^\s]+$/u.test(href)) throw new Error(`resources[${index}].href must be HTTPS`)
    const publicUrl = asOptionalString(item.publicUrl, `resources[${index}].publicUrl`)
    if (delivery === 'embedded' && (!publicUrl?.startsWith('/assets/goal-visualizations/') || publicUrl.includes('..'))) {
      throw new Error(`resources[${index}].publicUrl is invalid`)
    }
    if (delivery === 'external' && publicUrl && !/^https:\/\/[^\s]+$/u.test(publicUrl)) {
      throw new Error(`resources[${index}].publicUrl must be HTTPS`)
    }
    const bytes = readNullableNumber(item.bytes, `resources[${index}].bytes`)
    const sha256 = asOptionalString(item.sha256, `resources[${index}].sha256`)
    if (delivery === 'embedded' && (bytes === undefined || !sha256 || !SHA256_PATTERN.test(sha256))) {
      throw new Error(`resources[${index}] has incomplete embedded integrity metadata`)
    }
    if (delivery === 'external' && (bytes !== undefined || sha256 !== undefined || item.runtimeRequired !== false)) {
      throw new Error(`resources[${index}] has invalid external metadata`)
    }
    if (typeof item.runtimeRequired !== 'boolean') throw new Error(`resources[${index}].runtimeRequired must be boolean`)
    return Object.freeze({
      packageId,
      packageVersion,
      resourceId: asId(item.resourceId, `resources[${index}].resourceId`),
      landscapeId,
      ownerGoalId: asId(item.ownerGoalId, `resources[${index}].ownerGoalId`),
      resourceKind,
      delivery,
      mediaType,
      publicUrl,
      href,
      runtimeRequired: item.runtimeRequired,
      bytes,
      sha256,
    })
  })
  assertUnique(resources.map((entry) => entry.resourceId), 'resource IDs')
  assertUnique(resources.map((entry) => `${entry.landscapeId}\u0000${entry.ownerGoalId}\u0000${entry.publicUrl ?? entry.resourceId}`), 'resource goal bindings')

  const sourceEvidence = asArray(root.sourceEvidence, 'sourceEvidence').map((entry, index): RuntimeCatalogSourceEvidence => {
    const item = asRecord(entry, `sourceEvidence[${index}]`)
    const packageId = asId(item.packageId, `sourceEvidence[${index}].packageId`)
    const packageVersion = asId(item.packageVersion, `sourceEvidence[${index}].packageVersion`)
    const targetLandscapeId = asId(item.targetLandscapeId, `sourceEvidence[${index}].targetLandscapeId`)
    if (
      packageById.get(packageId)?.packageVersion !== packageVersion
      || landscapeById.get(targetLandscapeId)?.packageId !== packageId
    ) {
      throw new Error(`sourceEvidence[${index}] has an invalid package binding`)
    }

    const readCount = (field: string): number => {
      const value = readNullableNumber(item[field], `sourceEvidence[${index}].${field}`)
      if (value === undefined || value < 1) throw new Error(`sourceEvidence[${index}].${field} must be positive`)
      return value
    }
    const goals = asArray(item.goals, `sourceEvidence[${index}].goals`).map((entryGoal, goalIndex): RuntimeCatalogSourceEvidenceGoal => {
      const goal = asRecord(entryGoal, `sourceEvidence[${index}].goals[${goalIndex}]`)
      const jurisdictions = readStringArray(
        goal.jurisdictions,
        `sourceEvidence[${index}].goals[${goalIndex}].jurisdictions`,
      )
      if (jurisdictions.length === 0 || jurisdictions.some((value) => !JURISDICTION_PATTERN.test(value))) {
        throw new Error(`sourceEvidence[${index}].goals[${goalIndex}].jurisdictions is invalid`)
      }
      return Object.freeze({
        goalId: asId(goal.goalId, `sourceEvidence[${index}].goals[${goalIndex}].goalId`),
        jurisdictions: Object.freeze(jurisdictions),
      })
    })
    if (goals.length === 0) throw new Error(`sourceEvidence[${index}].goals must not be empty`)
    assertUnique(goals.map((goal) => goal.goalId), `sourceEvidence[${index}] goal IDs`)

    const href = asString(item.href, `sourceEvidence[${index}].href`)
    const expectedHref = `/api/ui/curriculum-source-evidence/packages/${packageId}/${packageVersion}/goals`
    if (href !== expectedHref) throw new Error(`sourceEvidence[${index}].href is invalid`)

    return Object.freeze({
      packageId,
      packageVersion,
      targetLandscapeId,
      sourceCollectionCount: readCount('sourceCollectionCount'),
      sourceDocumentCount: readCount('sourceDocumentCount'),
      sourceGoalCount: readCount('sourceGoalCount'),
      mappingEdgeCount: readCount('mappingEdgeCount'),
      goals: Object.freeze(goals),
      href,
    })
  })
  assertUnique(
    sourceEvidence.map((entry) => `${entry.packageId}\u0000${entry.packageVersion}\u0000${entry.targetLandscapeId}`),
    'source-evidence identities',
  )
  assertUnique(sourceEvidence.map((entry) => entry.packageId), 'source-evidence package IDs')

  return Object.freeze({
    catalogApiVersion: RUNTIME_CURRICULUM_CATALOG_API_VERSION,
    generationSha256,
    packages: Object.freeze(packages),
    rootLandscapeIds: Object.freeze(rootLandscapeIds),
    landscapes: Object.freeze(landscapes),
    views: Object.freeze(views),
    offerings: Object.freeze(offerings),
    decks: Object.freeze(decks),
    resources: Object.freeze(resources),
    sourceEvidence: Object.freeze(sourceEvidence),
  })
}

export const resolveRuntimeApiHref = (apiBase: string, href: string): string => {
  if (/^https:\/\//u.test(href)) return href
  if (!href.startsWith('/')) throw new Error('Runtime href must be root-relative or HTTPS')
  const normalizedBase = apiBase.trim().replace(/\/+$/u, '')
  if (!normalizedBase) return href
  return new URL(href, `${normalizedBase}/`).toString()
}

export const selectRuntimeLandscapeId = (catalog: RuntimeCurriculumCatalog, requested?: string | null): string => {
  if (requested && catalog.landscapes.some((entry) => entry.landscapeId === requested)) return requested
  return catalog.rootLandscapeIds.length === 1 ? catalog.rootLandscapeIds[0] : ''
}

export const findRuntimeRootLandscapeId = (catalog: RuntimeCurriculumCatalog, landscapeId?: string | null): string | undefined => {
  if (!landscapeId) return undefined
  const byId = new Map(catalog.landscapes.map((entry) => [entry.landscapeId, entry]))
  const visited = new Set<string>()
  let current = byId.get(landscapeId)
  while (current && !visited.has(current.landscapeId)) {
    if (current.role === 'root') return current.landscapeId
    visited.add(current.landscapeId)
    current = current.parentLandscapeId ? byId.get(current.parentLandscapeId) : undefined
  }
  return undefined
}

export const resolveRuntimeOfferingId = (
  catalog: RuntimeCurriculumCatalog,
  landscapeId: string,
  scope?: Readonly<Record<string, string>> | null,
): string | undefined => {
  const landscape = catalog.landscapes.find((entry) => entry.landscapeId === landscapeId)
  if (!landscape) return undefined
  const normalizedEntries = Object.entries(scope ?? {}).filter(([, value]) => typeof value === 'string' && value.length > 0)
  if (normalizedEntries.length === 0) return landscape.defaultOfferingId
  const requestedKey = scopeKey(Object.fromEntries(normalizedEntries))
  return catalog.offerings.find((entry) => entry.landscapeId === landscapeId && scopeKey(entry.scope) === requestedKey)?.offeringId
}

export const resolveExplicitRuntimeOfferingId = (
  catalog: RuntimeCurriculumCatalog,
  landscapeId: string,
  offeringId?: string | null,
): string | undefined => {
  if (!offeringId) return undefined
  const normalized = offeringId.trim()
  if (!normalized) return undefined
  return catalog.offerings.some((entry) => (
    entry.landscapeId === landscapeId && entry.offeringId === normalized
  )) ? normalized : undefined
}

const readGoalDeckId = (goal: GoalWithRuntimeResources): string | undefined => {
  const deckTags = (goal.tags ?? []).filter((tag) => tag.startsWith('srs-deck:'))
  if (deckTags.length !== 1) return undefined
  const deckId = deckTags[0].slice('srs-deck:'.length)
  return deckId && ID_PATTERN.test(deckId) ? deckId : undefined
}

export const resolveGoalDeckHref = (
  state: RuntimeCurriculumCatalogState,
  goal: GoalWithRuntimeResources,
  language: 'de' | 'en',
  repositoryFallback?: () => string | undefined,
): string | undefined => {
  if (state.mode === 'repository') return repositoryFallback?.()
  if (state.mode !== 'package' || !goal.landscapeId) return undefined
  const deckId = readGoalDeckId(goal)
  if (!deckId) return undefined
  const locale = language === 'en' ? 'en' : 'de-DE'
  const matches = state.catalog.decks.filter((entry) => (
    entry.landscapeId === goal.landscapeId && entry.deckId === deckId && entry.locale === locale
  ))
  return matches.length === 1 ? resolveRuntimeApiHref(state.apiBase, matches[0].href) : undefined
}

export const resolveGoalResourceHref = (
  state: RuntimeCurriculumCatalogState,
  goal: GoalWithRuntimeResources,
  link: ResourceLinkWithRuntimeIdentity,
  repositoryFallback?: () => string | undefined,
): string | undefined => {
  if (state.mode === 'repository') return repositoryFallback?.()
  if (state.mode !== 'package' || !goal.landscapeId) return undefined
  const matches = state.catalog.resources.filter((entry) => (
    entry.landscapeId === goal.landscapeId
    && entry.ownerGoalId === goal.id
    && (
      (link.resourceId && entry.resourceId === link.resourceId)
      || (link.url && (entry.publicUrl === link.url || (entry.delivery === 'external' && entry.href === link.url)))
    )
  ))
  return matches.length === 1 ? resolveRuntimeApiHref(state.apiBase, matches[0].href) : undefined
}

export const loadRuntimeCurriculumCatalog = async (
  fetcher: typeof fetch,
  apiBase = '',
  { allowRepositoryFallback = true }: { allowRepositoryFallback?: boolean } = {},
): Promise<RuntimeCurriculumCatalogState> => {
  const normalizedBase = apiBase.trim().replace(/\/+$/u, '')
  const url = normalizedBase ? `${normalizedBase}/api/ui/curriculum-catalog` : '/api/ui/curriculum-catalog'
  try {
    const response = await fetcher(url, { cache: 'no-store', headers: { Accept: 'application/json' } })
    if (response.status === 404 && allowRepositoryFallback) return { mode: 'repository' }
    if (response.status === 404) {
      return {
        mode: 'unavailable',
        error: new Error('Curriculum catalog request failed (404); package-consumer mode requires it'),
      }
    }
    if (!response.ok) return { mode: 'unavailable', error: new Error(`Curriculum catalog request failed (${response.status})`) }
    const catalog = parseRuntimeCurriculumCatalog(await response.json())
    return { mode: 'package', catalog, apiBase: normalizedBase }
  } catch (cause) {
    return {
      mode: 'unavailable',
      error: cause instanceof Error ? cause : new Error('Curriculum catalog request failed'),
    }
  }
}
