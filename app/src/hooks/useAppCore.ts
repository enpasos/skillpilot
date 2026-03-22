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
import { goalMatchesFilter, isWildcardFilter } from '../utils/goalFilters'
import { applyGoalPlacementProjection } from '../utils/goalPlacementProjection'
import { applyCompetencyAxisProjection } from '../utils/goalCompetencyProjection'
import { isCompatibilityOnlyCurriculum } from '../utils/curriculumDisplay'

type Role = 'learner' | 'trainer' | 'explorer'
type TreeStructureMode = 'all' | 'content' | 'competency'
const DEFAULT_TREE_STRUCTURE_MODE: TreeStructureMode = 'all'
const DEFAULT_ACTIVE_FILTER = 'all'
const isTreeStructureMode = (value: string | null): value is TreeStructureMode =>
  value === 'all' || value === 'content' || value === 'competency'
const normalizeActiveFilter = (
  value: string | null | undefined,
  availableFilters: { id: string }[],
) => {
  const wildcardFilterId = availableFilters.find((filter) => isWildcardFilter(filter.id))?.id ?? DEFAULT_ACTIVE_FILTER
  if (!value || isWildcardFilter(value)) return wildcardFilterId
  return availableFilters.some((filter) => filter.id === value) ? value : wildcardFilterId
}

interface AppCoreOptions {
  role: Role
  setLearnerMeta: (meta: { lastUpdated: string }) => void
}

const normalizeLandscapeIdForRole = (landscapeId: string | null, role: Role) => {
  if (!landscapeId) return ''
  if (role === 'trainer' && isCompatibilityOnlyCurriculum(landscapeId, null)) {
    return ''
  }
  return landscapeId
}

export function useAppCore({ role, setLearnerMeta, skillpilotId }: AppCoreOptions & { skillpilotId: string }) {
  const navigate = useNavigate()
  const location = useLocation()
  // Fix: useParams only works inside a Route. Since useAppCore is called in App (outside Routes),
  // we must parse the URL manually using matchPath.
  const match = matchPath({ path: '/:view/:goalId?' }, location.pathname)
  const goalId = match?.params.goalId
  console.log('[useAppCore] Render. goalId from matchPath:', goalId)
  const [searchParams, setSearchParams] = useSearchParams()
  const pendingSearchRef = React.useRef<string | null>(null)
  const currentSearchString = location.search.startsWith('?') ? location.search.slice(1) : location.search

  const replaceSearchParamsIfNeeded = useCallback((next: URLSearchParams) => {
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
  }, [currentSearchString, setSearchParams])

  // Manage selectedLandscapeId state here
  const [selectedLandscapeId, setSelectedLandscapeId] = React.useState<string>(() => {
    return normalizeLandscapeIdForRole(searchParams.get('l'), role)
  })
  const [treeStructureMode, setTreeStructureMode] = React.useState<TreeStructureMode>(() => {
    const fromUrl = searchParams.get('sm')
    return isTreeStructureMode(fromUrl) ? fromUrl : DEFAULT_TREE_STRUCTURE_MODE
  })

  useEffect(() => {
    if (pendingSearchRef.current === currentSearchString) {
      pendingSearchRef.current = null
    }
  }, [currentSearchString])

  // Sync from URL if it changes externally
  useEffect(() => {
    const fromUrl = normalizeLandscapeIdForRole(searchParams.get('l'), role)
    if (fromUrl !== selectedLandscapeId) {
      setSelectedLandscapeId(fromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, role])

  // Update URL when selection changes
  useEffect(() => {
    const current = searchParams.get('l')
    const next = new URLSearchParams(searchParams)
    if (!selectedLandscapeId) {
      if (!current) return
      next.delete('l')
      replaceSearchParamsIfNeeded(next)
      return
    }
    if (current === selectedLandscapeId) return
    next.set('l', selectedLandscapeId)
    replaceSearchParamsIfNeeded(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replaceSearchParamsIfNeeded, searchParams, selectedLandscapeId])

  useEffect(() => {
    const fromUrl = searchParams.get('sm')
    const nextMode = isTreeStructureMode(fromUrl) ? fromUrl : DEFAULT_TREE_STRUCTURE_MODE
    if (nextMode !== treeStructureMode) {
      setTreeStructureMode(nextMode)
    }
  }, [location.search, searchParams, treeStructureMode])

  useEffect(() => {
    const current = searchParams.get('sm')
    const normalizedCurrent = isTreeStructureMode(current) ? current : DEFAULT_TREE_STRUCTURE_MODE
    if (normalizedCurrent === treeStructureMode) return
    const next = new URLSearchParams(searchParams)
    if (treeStructureMode === DEFAULT_TREE_STRUCTURE_MODE) {
      next.delete('sm')
    } else {
      next.set('sm', treeStructureMode)
    }
    replaceSearchParamsIfNeeded(next)
  }, [replaceSearchParamsIfNeeded, searchParams, treeStructureMode])




  const { language } = useLanguage()

  const [learnerGraphRefreshToken, setLearnerGraphRefreshToken] = React.useState(0)
  const { landscapeEntries, loadingLandscapes, landscapeError } = useLandscapes(selectedLandscapeId, language)
  const {
    learnerScopedLandscapeEntries,
    loadingLearnerScopedLandscapes,
    learnerScopedLandscapeError,
  } = useLearnerScopedLandscapes(
    selectedLandscapeId,
    language,
    skillpilotId,
    { enabled: role === 'learner', refreshToken: learnerGraphRefreshToken },
  )
  const showLearnerTools = role !== 'explorer'

  const {
    currentLandscapeEntry,
    mastery,
    updateMasteryForCurrent,
    activeFilter,
    setActiveFilter,
    refreshMastery,
  } = useLearnerProgress({ landscapeEntries, selectedLandscapeId, skillpilotId })

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
    const nextFilter = normalizeActiveFilter(searchParams.get('f'), currentLandscapeEntry.meta.filters ?? [])
    if (nextFilter !== activeFilter) {
      setActiveFilter(nextFilter)
    }
  }, [activeFilter, currentLandscapeEntry, searchParams, setActiveFilter])

  useEffect(() => {
    if (!currentLandscapeEntry) return
    const availableFilters = currentLandscapeEntry.meta.filters ?? []
    const normalizedFilter = normalizeActiveFilter(activeFilter, availableFilters)
    if (normalizedFilter !== activeFilter) {
      setActiveFilter(normalizedFilter)
      return
    }

    const currentFilterParam = searchParams.get('f')
    const next = new URLSearchParams(searchParams)
    if (isWildcardFilter(normalizedFilter)) {
      if (!currentFilterParam) return
      next.delete('f')
    } else {
      if (currentFilterParam === normalizedFilter) return
      next.set('f', normalizedFilter)
    }
    replaceSearchParamsIfNeeded(next)
  }, [activeFilter, currentLandscapeEntry, replaceSearchParamsIfNeeded, searchParams, setActiveFilter])

  const projectedLandscapeEntries = useMemo(
    () => applyCompetencyAxisProjection(
      applyGoalPlacementProjection(graphSourceLandscapeEntries, activeFilter),
      activeFilter,
    ),
    [graphSourceLandscapeEntries, activeFilter],
  )

  const projectedCurrentLandscapeEntry = useMemo(() => {
    const targetLandscapeId = currentLandscapeEntry?.meta.landscapeId ?? selectedLandscapeId
    return projectedLandscapeEntries.find((entry) => entry.meta.landscapeId === targetLandscapeId)
      ?? projectedLandscapeEntries[0]
      ?? null
  }, [currentLandscapeEntry, projectedLandscapeEntries, selectedLandscapeId])

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

  const currentGoal = useMemo(() => {
    console.log('[useAppCore] Recalculating currentGoal. goalId:', goalId)
    if (goalId) {
      const candidate = goalIndexAll.get(goalId)
      console.log('[useAppCore] Candidate found for', goalId, ':', !!candidate)
      if (candidate) return candidate
    }
    return goals[0] ?? null
  }, [goalId, goalIndexAll, goals])

  const currentGoalId = currentGoal?.id ?? ''

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
    console.log('[useAppCore] handleNavigateTo called with:', id, 'currentGoalId:', currentGoalId)
    if (!id || id === currentGoalId) {
      console.warn('[useAppCore] Navigation aborted: Invalid ID or same as current')
      return
    }
    const path = location.pathname.split('/')
    const view = path[1]
    console.log('[useAppCore] Navigating to:', `/${view}/${id}`)
    navigate(`/${view}/${id}?${searchParams.toString()}`)
  }

  const handleSelectAbsolute = useCallback((id: string) => {
    if (!id) return
    const view = location.pathname.split('/')[1]
    navigate(`/${view}/${id}?${searchParams.toString()}`)
  }, [navigate, location.pathname, searchParams])

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
  const availableFilters = currentLandscapeEntry?.meta.filters ?? []
  const breadcrumbRootGoals = filteredRootGoals.length > 0 ? filteredRootGoals : globalRootGoals

  const breadcrumbCrumbs = useBreadcrumbs({
    currentGoal,
    goalIndexAll,
    parentMapAll,
    globalRootGoals: breadcrumbRootGoals,
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
    loadingLandscapes: loadingLandscapes || (role === 'learner' && !!selectedLandscapeId && loadingLearnerScopedLandscapes),
    landscapeError,
    showLearnerTools,
    selectedLandscapeId,
    currentLandscapeEntry,
    activeFilter,
    setActiveFilter,
    treeStructureMode,
    setTreeStructureMode,
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
