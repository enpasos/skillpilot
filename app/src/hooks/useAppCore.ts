import React, { useMemo, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation, matchPath } from 'react-router-dom'
import type { UiGoal as Goal, ExternalRequirement } from '../goalTypes'
import { shortKeyFromId } from '../shortKey'
import { useLandscapes } from './useLandscapes'
import { useLearnerScopedLandscapes } from './useLearnerScopedLandscapes'
import { useCompetenceGraph } from './useCompetenceGraph'
import { useBreadcrumbs } from './useBreadcrumbs'
import { useGoalIndex } from './useGoalIndex'
import { useLearnerProgress } from './useLearnerProgress'
import { useMasteryCalculation } from './useMasteryCalculation'
import { useLanguage } from '../contexts/LanguageContext'
import { goalMatchesFilter, isWildcardFilter, splitFilterIds } from '../utils/goalFilters'
import { applyGoalPlacementProjection } from '../utils/goalPlacementProjection'
import { getDisplayFiltersForLandscapeSelection } from '../utils/landscapeFilterOptions'
import { normalizeTrainerLandscapeId } from '../utils/trainerLandscapeContext'
import { normalizeLearnerProjectedEntries } from '../utils/learnerTreeProjection'
import { CANONICAL_GYMNASIUM_ROOT_ID, isRepositoryGymnasiumFramework } from '../utils/curriculumDisplay'
import { getStoredLandscapeIdForRole, normalizeLearnerLandscapeId } from '../utils/learnerProfile'
import {
  applyMatchedCompositionRouteGoalProjection,
  applyCompositionViewProjection,
  deriveRuntimeGoalPlacementFilters,
  deriveRuntimeCompositionScope,
} from '../utils/compositionViewRuntime'
import { normalizeCompositionView } from '../utils/authoring/compositionViewAuthoring'
import { normalizeJurisdictionCode } from '../utils/jurisdictionMetadata'
import { useRuntimeCurriculumCatalog } from './useRuntimeCurriculumCatalog'
import { shouldSyncRouteStateToUrl } from '../utils/rootRoutePolicy'
import {
  findRuntimeRootLandscapeId,
  resolveExplicitRuntimeOfferingId,
  resolveRuntimeApiHref,
  resolveRuntimeOfferingId,
  selectRuntimeLandscapeId,
} from '../utils/runtimeCurriculumCatalog'

type Role = 'learner' | 'trainer' | 'explorer'
const DEFAULT_ACTIVE_FILTER = 'all'
type ActiveFilterDimension = 'jurisdiction' | 'courseProfile' | 'durationModel' | 'generic'
const COURSE_FILTER_VALUES = new Set(['GK', 'LK', 'GK+LK'])

const getActiveFilterDimension = (filterId?: string): ActiveFilterDimension => {
  const normalized = (filterId ?? '').trim().toUpperCase()
  if (normalizeJurisdictionCode(normalized)) return 'jurisdiction'
  if (COURSE_FILTER_VALUES.has(normalized)) return 'courseProfile'
  if (normalized === 'G8' || normalized === 'G9') return 'durationModel'
  return 'generic'
}

const normalizeSingleActiveFilter = (
  value: string | null | undefined,
  availableFilters: { id: string }[],
): string | null => {
  const raw = value?.trim()
  if (!raw) return null
  if (isWildcardFilter(raw)) return DEFAULT_ACTIVE_FILTER

  const jurisdictionFilterId = normalizeJurisdictionCode(raw)
  if (jurisdictionFilterId) return jurisdictionFilterId

  const normalized = raw.toUpperCase()
  if (COURSE_FILTER_VALUES.has(normalized)) return normalized
  if (normalized === 'G8' || normalized === 'G9') return normalized

  const exactFilter = availableFilters.find((filter) => filter.id === raw)
  if (exactFilter) return exactFilter.id
  const caseInsensitiveFilter = availableFilters.find((filter) => filter.id.toUpperCase() === normalized)
  return caseInsensitiveFilter?.id ?? null
}

const normalizeActiveFilterList = (
  value: string | string[] | null | undefined,
  availableFilters: { id: string }[],
) => {
  const filters: string[] = []

  splitFilterIds(value ?? undefined).forEach((rawFilter) => {
    const normalizedFilter = normalizeSingleActiveFilter(rawFilter, availableFilters)
    if (!normalizedFilter || isWildcardFilter(normalizedFilter)) return

    const dimension = getActiveFilterDimension(normalizedFilter)
    const existingIndex = filters.findIndex((filter) => getActiveFilterDimension(filter) === dimension)
    if (existingIndex >= 0) {
      filters.splice(existingIndex, 1)
    }
    filters.push(normalizedFilter)
  })

  return filters
}

const serializeActiveFilters = (
  filters: string[],
  availableFilters: { id: string }[],
) => {
  const normalizedFilters = normalizeActiveFilterList(filters, availableFilters)
  return normalizedFilters.length > 0 ? normalizedFilters.join(',') : DEFAULT_ACTIVE_FILTER
}

const normalizeActiveFilter = (
  value: string | string[] | null | undefined,
  availableFilters: { id: string }[],
) => {
  const wildcardFilterId = availableFilters.find((filter) => isWildcardFilter(filter.id))?.id ?? DEFAULT_ACTIVE_FILTER
  const normalizedFilters = normalizeActiveFilterList(value, availableFilters)
  return normalizedFilters.length > 0 ? normalizedFilters.join(',') : wildcardFilterId
}

const getFilterParams = (params: URLSearchParams) => splitFilterIds(params.getAll('f'))

const hasExplicitPersonalCurriculumScope = (value?: string | null): boolean => {
  if (!value) return false
  try {
    const parsed = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false
    const nested = (parsed as Record<string, unknown>).personalCurriculum
    const config = nested && typeof nested === 'object' && !Array.isArray(nested)
      ? nested as Record<string, unknown>
      : parsed as Record<string, unknown>
    return Object.values(config).some((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false
      const record = entry as Record<string, unknown>
      return record.selected === true
        || (typeof record.filterId === 'string' && record.filterId.trim().length > 0)
        || (typeof record.durationModel === 'string' && record.durationModel.trim().length > 0)
        || (typeof record.stage === 'string' && record.stage.trim().length > 0)
    })
  } catch {
    return false
  }
}

const readPersonalCurriculumOfferingId = (
  value: string | null | undefined,
  landscapeId: string,
): string | undefined => {
  if (!value) return undefined
  try {
    const parsed = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return undefined
    const nested = (parsed as Record<string, unknown>).personalCurriculum
    const config = nested && typeof nested === 'object' && !Array.isArray(nested)
      ? nested as Record<string, unknown>
      : parsed as Record<string, unknown>
    const entry = config[landscapeId]
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return undefined
    const offeringId = (entry as Record<string, unknown>).offeringId
    return typeof offeringId === 'string' && offeringId.trim().length > 0 ? offeringId.trim() : undefined
  } catch {
    return undefined
  }
}

const replaceFilterDimension = ({
  currentFilter,
  nextFilter,
  dimension,
  availableFilters,
}: {
  currentFilter: string
  nextFilter: string
  dimension?: ActiveFilterDimension
  availableFilters: { id: string }[]
}) => {
  const currentFilters = normalizeActiveFilterList(currentFilter, availableFilters)
  const normalizedNext = normalizeSingleActiveFilter(nextFilter, availableFilters)
  const targetDimension = dimension ?? getActiveFilterDimension(normalizedNext ?? nextFilter)
  const filtersWithoutDimension = currentFilters.filter(
    (filter) => getActiveFilterDimension(filter) !== targetDimension,
  )

  if (!normalizedNext || isWildcardFilter(normalizedNext)) {
    return serializeActiveFilters(filtersWithoutDimension, availableFilters)
  }

  return serializeActiveFilters([...filtersWithoutDimension, normalizedNext], availableFilters)
}

interface AppCoreOptions {
  role: Role
  setLearnerMeta: (meta: { lastUpdated: string }) => void
  enabled?: boolean
}

const normalizeLandscapeIdForRole = (landscapeId: string | null, role: Role) => {
  if (!landscapeId) return ''
  if (role === 'trainer') {
    return normalizeTrainerLandscapeId(landscapeId)
  }
  return normalizeLearnerLandscapeId(landscapeId)
}

export function useAppCore({
  role,
  setLearnerMeta,
  skillpilotId,
  enabled = true,
}: AppCoreOptions & { skillpilotId: string }) {
  const navigate = useNavigate()
  const location = useLocation()
  const runtimeCatalogState = useRuntimeCurriculumCatalog({ enabled })
  // Fix: useParams only works inside a Route. Since useAppCore is called in App (outside Routes),
  // we must parse the URL manually using matchPath.
  const match = matchPath({ path: '/:view/:goalId?' }, location.pathname)
  const goalId = match?.params.goalId
  const [searchParams, setSearchParams] = useSearchParams()
  const pendingSearchRef = React.useRef<string | null>(null)
  const pendingSelectedGoalNavigationRef = React.useRef<string | null>(null)
  const pendingFilterFromUrlRef = React.useRef<string | null>(null)
  const currentSearchString = location.search.startsWith('?') ? location.search.slice(1) : location.search

  const replaceSearchParamsIfNeeded = useCallback((next: URLSearchParams) => {
    if (!shouldSyncRouteStateToUrl(location.pathname)) {
      pendingSearchRef.current = null
      return
    }
    const nextString = next.toString()
    if (nextString === currentSearchString) {
      pendingSearchRef.current = null
      return
    }
    if (pendingSearchRef.current === nextString) {
      return
    }
    pendingSearchRef.current = nextString
    setSearchParams(next, { replace: true })
  }, [currentSearchString, location.pathname, setSearchParams])

  // Manage selectedLandscapeId state here
  const [selectedLandscapeId, setSelectedLandscapeId] = React.useState<string>(() => {
    return normalizeLandscapeIdForRole(searchParams.get('l') || getStoredLandscapeIdForRole(role), role)
  })

  useEffect(() => {
    if (runtimeCatalogState.mode !== 'package') return
    const normalized = selectRuntimeLandscapeId(runtimeCatalogState.catalog, selectedLandscapeId)
    if (normalized !== selectedLandscapeId) setSelectedLandscapeId(normalized)
  }, [runtimeCatalogState, selectedLandscapeId])

  useEffect(() => {
    if (pendingSearchRef.current === currentSearchString) {
      pendingSearchRef.current = null
    }
  }, [currentSearchString])

  // Sync from URL if it changes externally
  useEffect(() => {
    const rawFromUrl = searchParams.get('l')
    if (!rawFromUrl) {
      const stored = normalizeLandscapeIdForRole(getStoredLandscapeIdForRole(role), role)
      if (!selectedLandscapeId && stored) {
        setSelectedLandscapeId(stored)
      }
      return
    }
    const fromUrl = normalizeLandscapeIdForRole(rawFromUrl, role)
    if (fromUrl !== selectedLandscapeId) {
      setSelectedLandscapeId(fromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, role])

  // Update URL when selection changes
  useEffect(() => {
    const currentParams = new URLSearchParams(currentSearchString)
    const current = currentParams.get('l')
    const next = new URLSearchParams(currentParams)
    if (!selectedLandscapeId) {
      if (!current) return
      next.delete('l')
      replaceSearchParamsIfNeeded(next)
      return
    }
    if (current === selectedLandscapeId) return
    next.set('l', selectedLandscapeId)
    replaceSearchParamsIfNeeded(next)
  }, [currentSearchString, replaceSearchParamsIfNeeded, selectedLandscapeId])

  const { language } = useLanguage()
  const localizedLanguage = language === 'en' ? 'en' : 'de'
  const [learnerPersonalCurriculum, setLearnerPersonalCurriculum] = React.useState<string | null>(null)
  const [matchedCompositionViewsByLandscapeId, setMatchedCompositionViewsByLandscapeId] = React.useState<Record<string, Record<string, unknown>>>({})
  const [loadingMatchedCompositionViews, setLoadingMatchedCompositionViews] = React.useState(false)
  const [compositionViewError, setCompositionViewError] = React.useState<Error | null>(null)

  const [learnerGraphRefreshToken, setLearnerGraphRefreshToken] = React.useState(0)
  const runtimeCatalogReady = runtimeCatalogState.mode === 'package' || runtimeCatalogState.mode === 'repository'
  const {
    landscapeEntries,
    loadingLandscapes,
    landscapeError: loadedLandscapeError,
  } = useLandscapes(selectedLandscapeId, language, { enabled: enabled && runtimeCatalogReady })
  const {
    learnerScopedLandscapeEntries,
    loadingLearnerScopedLandscapes,
    learnerScopedLandscapeError,
  } = useLearnerScopedLandscapes(
    selectedLandscapeId,
    language,
    skillpilotId,
    { enabled: enabled && role === 'learner' && runtimeCatalogReady, refreshToken: learnerGraphRefreshToken },
  )
  const showLearnerTools = role !== 'explorer'

  const {
    currentLandscapeEntry,
    mastery,
    updateMasteryForCurrent,
    activeFilter,
    setActiveFilter,
    refreshMastery,
  } = useLearnerProgress({
    landscapeEntries,
    selectedLandscapeId,
    skillpilotId: enabled ? skillpilotId : '',
  })

  const graphSourceLandscapeEntries = useMemo(() => {
    if (role !== 'learner') {
      return landscapeEntries
    }
    if (loadingLearnerScopedLandscapes) {
      return []
    }
    if (learnerScopedLandscapeEntries.length > 0) {
      return learnerScopedLandscapeEntries
    }
    if (learnerScopedLandscapeError) {
      return landscapeEntries
    }
    return []
  }, [
    landscapeEntries,
    learnerScopedLandscapeEntries,
    learnerScopedLandscapeError,
    loadingLearnerScopedLandscapes,
    role,
  ])

  const refreshLearnerGraphData = useCallback(() => {
    setLearnerGraphRefreshToken((current) => current + 1)
  }, [])

  useEffect(() => {
    if (!currentLandscapeEntry) return
    if (pendingSearchRef.current && pendingSearchRef.current !== currentSearchString) return
    const currentParams = new URLSearchParams(currentSearchString)
    const nextFilter = normalizeActiveFilter(getFilterParams(currentParams), currentLandscapeEntry.meta.filters ?? [])
    if (nextFilter !== activeFilter) {
      pendingFilterFromUrlRef.current = nextFilter
      setActiveFilter(nextFilter)
    }
  }, [activeFilter, currentLandscapeEntry, currentSearchString, setActiveFilter])

  useEffect(() => {
    if (!currentLandscapeEntry) return
    const pendingFilterFromUrl = pendingFilterFromUrlRef.current
    if (pendingFilterFromUrl) {
      if (activeFilter !== pendingFilterFromUrl) {
        return
      }
      pendingFilterFromUrlRef.current = null
    }

    const availableFilters = currentLandscapeEntry.meta.filters ?? []
    const normalizedFilter = normalizeActiveFilter(activeFilter, availableFilters)
    if (normalizedFilter !== activeFilter) {
      setActiveFilter(normalizedFilter)
      return
    }

    const currentParams = new URLSearchParams(currentSearchString)
    const currentFilterParam = normalizeActiveFilter(getFilterParams(currentParams), availableFilters)
    const next = new URLSearchParams(currentParams)
    if (isWildcardFilter(normalizedFilter)) {
      if (!currentFilterParam) return
      next.delete('f')
    } else {
      if (currentFilterParam === normalizedFilter) return
      next.set('f', normalizedFilter)
    }
    replaceSearchParamsIfNeeded(next)
  }, [activeFilter, currentLandscapeEntry, currentSearchString, replaceSearchParamsIfNeeded, setActiveFilter])

  const handleFilterChange = useCallback((filter: string, dimension?: ActiveFilterDimension) => {
    if (!currentLandscapeEntry) {
      setActiveFilter(filter)
      return
    }

    const availableFilters = currentLandscapeEntry.meta.filters ?? []
    const normalizedFilter = replaceFilterDimension({
      currentFilter: activeFilter,
      nextFilter: filter,
      dimension,
      availableFilters,
    })
    if (normalizedFilter !== activeFilter) {
      setActiveFilter(normalizedFilter)
    }

    const currentParams = new URLSearchParams(currentSearchString)
    const next = new URLSearchParams(currentParams)
    if (isWildcardFilter(normalizedFilter)) {
      next.delete('f')
    } else {
      next.set('f', normalizedFilter)
    }
    replaceSearchParamsIfNeeded(next)
  }, [activeFilter, currentLandscapeEntry, currentSearchString, replaceSearchParamsIfNeeded, setActiveFilter])

  useEffect(() => {
    if (!enabled || role !== 'learner' || !skillpilotId) {
      setLearnerPersonalCurriculum(null)
      return
    }

    const controller = new AbortController()
    const signal = controller.signal
    const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
    const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}` : `/api/ui/learners/${skillpilotId}`
    setLearnerPersonalCurriculum(null)

    fetch(url, { signal })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load learner profile (${res.status})`)
        }
        const data = await res.json()
        if (!signal.aborted) {
          setLearnerPersonalCurriculum(typeof data.personalCurriculum === 'string' ? data.personalCurriculum : null)
        }
      })
      .catch((error) => {
        if (signal.aborted) return
        console.warn('[useAppCore] Failed to load learner personal curriculum for composition views', error)
        setLearnerPersonalCurriculum(null)
      })

    return () => controller.abort()
  }, [enabled, learnerGraphRefreshToken, role, skillpilotId])

  const runtimeCompositionRequests = useMemo(() => {
    const requests = new Map<string, {
      scope: ReturnType<typeof deriveRuntimeCompositionScope>
      offeringId?: string
    }>()
    graphSourceLandscapeEntries.forEach((entry) => {
      const rootLandscapeId = runtimeCatalogState.mode === 'package'
        ? findRuntimeRootLandscapeId(runtimeCatalogState.catalog, entry.meta.landscapeId)
        : undefined
      const scope = deriveRuntimeCompositionScope({
        landscapeId: entry.meta.landscapeId,
        rootLandscapeId,
        scopeEnabled: runtimeCatalogState.mode === 'package'
          || isRepositoryGymnasiumFramework(entry.meta.frameworkId),
        catalogJurisdictions: runtimeCatalogState.mode === 'package'
          ? runtimeCatalogState.catalog.offerings
              .filter((offering) => offering.landscapeId === entry.meta.landscapeId)
              .map((offering) => offering.scope.jurisdiction)
              .filter((jurisdiction): jurisdiction is string => typeof jurisdiction === 'string')
          : undefined,
        activeFilter,
        learnerPersonalCurriculum,
      })
      if (runtimeCatalogState.mode === 'package') {
        const catalogLandscape = runtimeCatalogState.catalog.landscapes.find(
          (candidate) => candidate.landscapeId === entry.meta.landscapeId,
        )
        if (!catalogLandscape) return
        const hasOfferings = runtimeCatalogState.catalog.offerings.some(
          (candidate) => candidate.landscapeId === entry.meta.landscapeId,
        )
        if (!hasOfferings && !catalogLandscape.defaultOfferingId) return
        const requestedScope = scope && hasExplicitPersonalCurriculumScope(learnerPersonalCurriculum)
          ? Object.entries(scope).reduce<Record<string, string>>((result, [key, value]) => {
              if (key !== 'landscapeId' && typeof value === 'string' && value.length > 0) {
                result[key] = value
              }
              return result
            }, {})
          : null
        const queryOfferingId = entry.meta.landscapeId === selectedLandscapeId
          ? new URLSearchParams(currentSearchString).get('offering')
          : null
        const configuredOfferingId = queryOfferingId
          ?? readPersonalCurriculumOfferingId(learnerPersonalCurriculum, entry.meta.landscapeId)
        const explicitOfferingId = configuredOfferingId
          ? resolveExplicitRuntimeOfferingId(
              runtimeCatalogState.catalog,
              entry.meta.landscapeId,
              configuredOfferingId,
            )
          : undefined
        requests.set(entry.meta.landscapeId, {
          scope,
          offeringId: configuredOfferingId
            ? explicitOfferingId
            : resolveRuntimeOfferingId(
                runtimeCatalogState.catalog,
                entry.meta.landscapeId,
                requestedScope,
              ),
        })
        return
      }
      if (runtimeCatalogState.mode === 'repository' && scope) {
        requests.set(entry.meta.landscapeId, { scope })
      }
    })
    return requests
  }, [activeFilter, currentSearchString, graphSourceLandscapeEntries, learnerPersonalCurriculum, runtimeCatalogState, selectedLandscapeId])

  useEffect(() => {
    if (role !== 'learner' || runtimeCompositionRequests.size === 0) {
      setMatchedCompositionViewsByLandscapeId((current) =>
        Object.keys(current).length === 0 ? current : {},
      )
      setLoadingMatchedCompositionViews(false)
      setCompositionViewError(null)
      return
    }

    const controller = new AbortController()
    const signal = controller.signal
    setLoadingMatchedCompositionViews(true)
    setCompositionViewError(null)
    void Promise.all(
      Array.from(runtimeCompositionRequests.entries()).map(async ([landscapeId, request]) => {
        if (runtimeCatalogState.mode === 'package') {
          if (!request.offeringId) {
            throw new Error(`No catalog offering matches the selected scope for ${landscapeId}`)
          }
          const href = `/api/ui/composition-views/offerings/${encodeURIComponent(request.offeringId)}`
          const res = await fetch(resolveRuntimeApiHref(runtimeCatalogState.apiBase, href), { signal })
          if (!res.ok) {
            throw new Error(`Failed to load catalog offering ${request.offeringId} (${res.status})`)
          }
          const data = await res.json()
          return [landscapeId, normalizeCompositionView(data)] as const
        }
        const scope = request.scope
        if (!scope) return null
        const params = new URLSearchParams({
          landscapeId: scope.landscapeId,
          schoolForm: scope.schoolForm ?? '',
          jurisdiction: scope.jurisdiction ?? '',
          stage: scope.stage ?? '',
          courseProfile: scope.courseProfile ?? '',
          durationModel: scope.durationModel ?? '',
        })
        // Keep composition-view matching same-origin so local dev middleware and proxying
        // can serve the current repo state instead of bypassing it via an absolute API base.
        const url = `/api/ui/composition-views/match?${params.toString()}`

        const res = await fetch(url, { signal })
        if (res.status === 204) {
          return null
        }
        if (!res.ok) {
          throw new Error(`Failed to load composition view for ${landscapeId} (${res.status})`)
        }
        const data = await res.json()
        return [landscapeId, normalizeCompositionView(data)] as const
      }),
    )
      .then((matches) => {
        if (signal.aborted) return
        const next: Record<string, Record<string, unknown>> = {}
        matches.forEach((entry) => {
          if (!entry) return
          next[entry[0]] = entry[1]
        })
        setMatchedCompositionViewsByLandscapeId(next)
        setLoadingMatchedCompositionViews(false)
        setCompositionViewError(null)
      })
      .catch((error) => {
        if (signal.aborted) return
        console.warn('[useAppCore] Failed to load matching composition views', error)
        setMatchedCompositionViewsByLandscapeId({})
        setLoadingMatchedCompositionViews(false)
        setCompositionViewError(error instanceof Error ? error : new Error('Failed to load composition view'))
      })

    return () => controller.abort()
  }, [role, runtimeCatalogState, runtimeCompositionRequests])

  const effectiveMatchedCompositionViewsByLandscapeId = useMemo(
    () => matchedCompositionViewsByLandscapeId,
    [matchedCompositionViewsByLandscapeId],
  )

  const projectedLandscapeEntries = useMemo(() => {
    const compositionManagedLandscapeIds = new Set(runtimeCompositionRequests.keys())
    const rawEntriesWithMatchedCompositionView = graphSourceLandscapeEntries.filter((entry) =>
      !!effectiveMatchedCompositionViewsByLandscapeId[entry.meta.landscapeId],
    )
    const entriesNeedingPlacementProjection = graphSourceLandscapeEntries.filter((entry) => {
      const landscapeId = entry.meta.landscapeId
      if (!compositionManagedLandscapeIds.has(landscapeId)) {
        return true
      }
      if (effectiveMatchedCompositionViewsByLandscapeId[landscapeId]) {
        return false
      }
      return !loadingMatchedCompositionViews
    })

    const placementProjectedEntries = entriesNeedingPlacementProjection.map((entry) => (
      applyGoalPlacementProjection(
        [entry],
        deriveRuntimeGoalPlacementFilters({
          landscapeId: entry.meta.landscapeId,
          rootLandscapeId: runtimeCatalogState.mode === 'package'
            ? findRuntimeRootLandscapeId(runtimeCatalogState.catalog, entry.meta.landscapeId)
            : undefined,
          activeFilter,
          learnerPersonalCurriculum,
        }),
      )[0] ?? entry
    ))
    const projectedByLandscapeId = new Map<string, (typeof graphSourceLandscapeEntries)[number]>()

    placementProjectedEntries.forEach((entry) => {
      projectedByLandscapeId.set(entry.meta.landscapeId, entry)
    })

    rawEntriesWithMatchedCompositionView.forEach((entry) => {
      projectedByLandscapeId.set(entry.meta.landscapeId, entry)
    })

    const orderedProjectedEntries = graphSourceLandscapeEntries
      .map((entry) => projectedByLandscapeId.get(entry.meta.landscapeId))
      .filter((entry): entry is (typeof graphSourceLandscapeEntries)[number] => !!entry)

    const compositionProjectedEntries = Object.values(effectiveMatchedCompositionViewsByLandscapeId).reduce(
      (currentEntries, view) => applyCompositionViewProjection(currentEntries, view),
      orderedProjectedEntries,
    )
    if (role !== 'learner') {
      return compositionProjectedEntries
    }

    const routeProjectedEntries = applyMatchedCompositionRouteGoalProjection(compositionProjectedEntries, goalId)
    return routeProjectedEntries.map((entry) => normalizeLearnerProjectedEntries([entry])[0] ?? entry)
  }, [
    activeFilter,
    effectiveMatchedCompositionViewsByLandscapeId,
    graphSourceLandscapeEntries,
    goalId,
    learnerPersonalCurriculum,
    loadingMatchedCompositionViews,
    role,
    runtimeCatalogState,
    runtimeCompositionRequests,
  ])

  const projectedCurrentLandscapeEntry = useMemo(() => {
    const targetLandscapeId = currentLandscapeEntry?.meta.landscapeId ?? selectedLandscapeId
    return projectedLandscapeEntries.find((entry) => entry.meta.landscapeId === targetLandscapeId)
      ?? projectedLandscapeEntries[0]
      ?? null
  }, [currentLandscapeEntry, projectedLandscapeEntries, selectedLandscapeId])
  const currentLandscapeHasMatchedCompositionView = useMemo(() => {
    const targetLandscapeId = currentLandscapeEntry?.meta.landscapeId ?? selectedLandscapeId
    return !!(targetLandscapeId && effectiveMatchedCompositionViewsByLandscapeId[targetLandscapeId])
  }, [currentLandscapeEntry?.meta.landscapeId, effectiveMatchedCompositionViewsByLandscapeId, selectedLandscapeId])

  const goals = useMemo(() => projectedCurrentLandscapeEntry?.goals ?? [], [projectedCurrentLandscapeEntry])

  const allGoalsGlobal = useMemo(
    () => projectedLandscapeEntries.flatMap((entry) => entry.goals),
    [projectedLandscapeEntries],
  )
  const { goalIndexAll, parentMapAll, globalRootGoals } = useGoalIndex(allGoalsGlobal)
  const rawAllGoalsGlobal = useMemo(
    () => landscapeEntries.flatMap((entry) => entry.goals),
    [landscapeEntries],
  )
  const { goalIndexAll: selectionGoalIndexAll } = useGoalIndex(rawAllGoalsGlobal)

  const goalShortKeyMap = useMemo(() => {
    const map = new Map<string, string>()
    goals.forEach((goal) => map.set(goal.id, shortKeyFromId(goal.id)))
    return map
  }, [goals])

  const routeGoal = useMemo(() => {
    if (!goalId) return null
    return goalIndexAll.get(goalId) ?? selectionGoalIndexAll.get(goalId) ?? null
  }, [goalId, goalIndexAll, selectionGoalIndexAll])

  useEffect(() => {
    if (role !== 'learner') return
    const routeGoalLandscapeId = routeGoal?.landscapeId
    if (!goalId || !routeGoalLandscapeId) return
    const selectedIsRuntimeRoot = runtimeCatalogState.mode === 'package'
      ? runtimeCatalogState.catalog.rootLandscapeIds.includes(selectedLandscapeId)
      : selectedLandscapeId === CANONICAL_GYMNASIUM_ROOT_ID
    if (selectedIsRuntimeRoot) return
    if (goalIndexAll.has(goalId)) return
    if (routeGoalLandscapeId === selectedLandscapeId) return
    setSelectedLandscapeId(routeGoalLandscapeId)
  }, [goalId, goalIndexAll, role, routeGoal?.landscapeId, runtimeCatalogState, selectedLandscapeId])

  const currentGoal = useMemo(() => {
    if (goalId) {
      const candidate = goalIndexAll.get(goalId)
      if (candidate) return candidate
    }
    return goals[0] ?? null
  }, [goalId, goalIndexAll, goals])

  const currentGoalId = currentGoal?.id ?? ''

  useEffect(() => {
    pendingSelectedGoalNavigationRef.current = null
  }, [location.pathname, location.search])

  const { neighbors } = useCompetenceGraph(currentGoal, allGoalsGlobal)
  const matchesActiveFilter = useCallback(
    (goal: Goal) => {
      return goalMatchesFilter(goal, activeFilter)
    },
    [activeFilter],
  )
  const filteredNeighbors = useMemo(
    () => ({
      containers: neighbors.containers.filter(matchesActiveFilter),
      children: neighbors.children.filter(matchesActiveFilter),
      requires: neighbors.requires.filter(matchesActiveFilter),
      inheritedRequires: neighbors.inheritedRequires.filter(matchesActiveFilter),
      effectiveRequires: neighbors.effectiveRequires.filter(matchesActiveFilter),
      directForward: neighbors.directForward.filter(matchesActiveFilter),
      inheritedForward: neighbors.inheritedForward.filter(matchesActiveFilter),
      forward: neighbors.forward.filter(matchesActiveFilter),
    }),
    [matchesActiveFilter, neighbors],
  )

  const externalRequires: ExternalRequirement[] = useMemo(() => {
    if (!currentGoal) return []
    const items: ExternalRequirement[] = []
    currentGoal.requires.forEach((ref: string) => {
      if (!ref.includes(':')) return
      const [landscapeId, goalId] = ref.split(':', 2)
      if (!landscapeId || !goalId) return
      const entry = landscapeEntries.find((e) => e.meta.landscapeId === landscapeId)
      if (!entry) return
      const target = entry.goals.find((g) => g.id === goalId)
      if (!target) return
      items.push({
        landscapeId,
        landscapeTitle: entry.meta.title,
        subject: entry.meta.subject,
        goalId,
        goalTitle: target.title,
      })
    })
    return items
  }, [currentGoal, landscapeEntries])

  const { getAggregatedMastery } = useMasteryCalculation(goalIndexAll, goalShortKeyMap)

  const getMasteryValue = useCallback(
    (goalId: string) => {
      return getAggregatedMastery(goalId, mastery)
    },
    [getAggregatedMastery, mastery],
  )

  const handleNavigateTo = (id: string) => {
    if (!id || id === currentGoalId) {
      console.warn('[useAppCore] Navigation aborted: Invalid ID or same as current')
      return
    }
    const path = location.pathname.split('/')
    const view = path[1]
    navigate(`/${view}/${id}?${searchParams.toString()}`)
  }

  const handleSelectAbsolute = useCallback((id: string) => {
    if (!id) return
    const view = location.pathname.split('/')[1]
    const nextSearch = searchParams.toString()
    const nextPath = `/${view}/${id}`
    const nextUrl = nextSearch ? `${nextPath}?${nextSearch}` : nextPath
    const currentRouteGoalId = goalId ?? ''
    const currentUrl = `${location.pathname}${location.search}`

    // Selection is URL-driven. If the router already targets this goal, another navigate
    // is always redundant even if currentGoal is still resolving from async landscape data.
    if (currentRouteGoalId === id && currentUrl === nextUrl) {
      pendingSelectedGoalNavigationRef.current = null
      return
    }
    if (pendingSelectedGoalNavigationRef.current === nextUrl) {
      return
    }
    pendingSelectedGoalNavigationRef.current = nextUrl
    navigate(nextUrl)
  }, [goalId, navigate, location.pathname, location.search, searchParams])

  const handleNavigateToExternal = useCallback(
    (targetLandscapeId: string, goalId: string) => {
      if (!goalId) return
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set('l', targetLandscapeId)
      const view = location.pathname.split('/')[1]
      navigate(`/${view}/${goalId}?${newSearchParams.toString()}`)
    },
    [navigate, location.pathname, searchParams],
  )

  const handleMasteryChange = (id: string, value: number) => {
    const goal = goalIndexAll.get(id)
    if (!goal || (goal.contains && goal.contains.length > 0)) {
      return
    }

    const clamped = Math.max(0, Math.min(1, value))
    const key = goalShortKeyMap.get(id) ?? shortKeyFromId(id)
    updateMasteryForCurrent((prev) => ({ ...prev, [key]: clamped }))
    setLearnerMeta({ lastUpdated: new Date().toISOString() })
  }

  const handleTrainerContextChange = React.useCallback(
    (lid: string, filter: string, goalId?: string) => {
      const normalizedLandscapeId = normalizeLandscapeIdForRole(lid, role)
      if (normalizedLandscapeId !== selectedLandscapeId) {
        setSelectedLandscapeId(normalizedLandscapeId)
      }
      if (filter && filter !== activeFilter) {
        setActiveFilter(filter)
      }
      const newSearchParams = new URLSearchParams(searchParams)
      if (normalizedLandscapeId) newSearchParams.set('l', normalizedLandscapeId)
      else newSearchParams.delete('l')
      if (filter) newSearchParams.set('f', filter)
      replaceSearchParamsIfNeeded(newSearchParams)
      if (goalId) {
        navigate(`/trainer/${goalId}?${newSearchParams.toString()}`)
      }
    },
    [activeFilter, navigate, replaceSearchParamsIfNeeded, role, searchParams, selectedLandscapeId, setActiveFilter],
  )

  const handleShareContext = useCallback(async (): Promise<'success' | 'error'> => {
    try {
      if (!navigator.clipboard?.writeText) {
        return 'error'
      }
      const url = new URL(window.location.href)
      await navigator.clipboard.writeText(url.toString())
      return 'success'
    } catch {
      return 'error'
    }
  }, [])
  const filteredRootGoals = useMemo(() => {
    const relevantRoots = globalRootGoals
    return relevantRoots.filter(matchesActiveFilter)
  }, [globalRootGoals, matchesActiveFilter])
  const availableFilters = useMemo(
    () => getDisplayFiltersForLandscapeSelection({
      filters: currentLandscapeEntry?.meta.filters,
      goals: currentLandscapeEntry?.goals ?? [],
      goalPlacements: currentLandscapeEntry?.meta.goalPlacements,
      language: localizedLanguage,
    }),
    [
      currentLandscapeEntry?.goals,
      currentLandscapeEntry?.meta.filters,
      currentLandscapeEntry?.meta.goalPlacements,
      localizedLanguage,
    ],
  )
  const breadcrumbRootGoals = filteredRootGoals.length > 0 ? filteredRootGoals : globalRootGoals

  const breadcrumbCrumbs = useBreadcrumbs({
    currentGoal,
    goalIndexAll,
    parentMapAll,
    globalRootGoals: breadcrumbRootGoals,
    useRawGoalTitles: currentLandscapeHasMatchedCompositionView,
    onNavigate: (goalId: string, landscapeId?: string) => {
      const newSearchParams = new URLSearchParams(searchParams)
      // Only switch landscape if the goal is NOT already loaded in the current context.
      // This prevents reloading the landscape (and showing the loading screen) 
      // when navigating between subjects that are already part of the current overview.
      if (landscapeId && !goalIndexAll.has(goalId)) {
        newSearchParams.set('l', landscapeId)
      }
      const view = location.pathname.split('/')[1]
      navigate(`/${view}/${goalId}?${newSearchParams.toString()}`)
    }
  })

  return {
    landscapeEntries,
    loadingLandscapes:
      runtimeCatalogState.mode === 'loading'
      || loadingLandscapes
      || (role === 'learner' && !!selectedLandscapeId && loadingLearnerScopedLandscapes)
      || (role === 'learner' && runtimeCompositionRequests.size > 0 && loadingMatchedCompositionViews),
    landscapeError:
      (runtimeCatalogState.mode === 'unavailable' ? runtimeCatalogState.error : null)
      ?? compositionViewError
      ?? loadedLandscapeError,
    runtimeCatalogState,
    runtimeRootLandscapeId: runtimeCatalogState.mode === 'package'
      ? findRuntimeRootLandscapeId(runtimeCatalogState.catalog, selectedLandscapeId)
      : undefined,
    showLearnerTools,
    selectedLandscapeId,
    currentRouteGoalId: goalId ?? '',
    currentLandscapeEntry,
    currentLandscapeHasMatchedCompositionView,
    activeFilter,
    setActiveFilter,
    handleFilterChange,
    currentGoal,
    goalIndexAll,
    getMasteryValue,
    handleSelectAbsolute,
    handleTrainerContextChange,
    handleMasteryChange,
    breadcrumbRootGoals,
    breadcrumbCrumbs,
    filteredNeighbors,
    availableFilters,
    externalRequires,
    handleShareContext,
    handleNavigateTo,
    handleNavigateToExternal,
    goalShortKeyMap,
    selectionGoalIndexAll,
    setSelectedLandscapeId,
    refreshMastery,
    refreshLearnerGraphData,
    parentMapAll,
  }
}
