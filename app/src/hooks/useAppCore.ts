import React, { useMemo, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation, matchPath } from 'react-router-dom'
import type { UiGoal as Goal, ExternalRequirement } from '../goalTypes'
import { shortKeyFromId } from '../shortKey'
import { useLandscapes } from './useLandscapes'
import { useCompetenceGraph } from './useCompetenceGraph'
import { useBreadcrumbs } from './useBreadcrumbs'
import { useGoalIndex } from './useGoalIndex'
import { useLearnerProgress } from './useLearnerProgress'
import { useMasteryCalculation } from './useMasteryCalculation'
import { useLanguage } from '../contexts/LanguageContext'

type Role = 'learner' | 'trainer' | 'explorer'

interface AppCoreOptions {
  role: Role
  setLearnerMeta: (meta: { lastUpdated: string }) => void
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

  // Manage selectedLandscapeId state here
  const [selectedLandscapeId, setSelectedLandscapeId] = React.useState<string>(() => {
    return searchParams.get('l') ?? ''
  })

  // Sync from URL if it changes externally
  useEffect(() => {
    const fromUrl = searchParams.get('l')
    if (fromUrl && fromUrl !== selectedLandscapeId) {
      setSelectedLandscapeId(fromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, selectedLandscapeId])

  // Update URL when selection changes
  useEffect(() => {
    if (!selectedLandscapeId) return
    const current = searchParams.get('l')
    if (current === selectedLandscapeId) return
    const next = new URLSearchParams(searchParams)
    next.set('l', selectedLandscapeId)
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLandscapeId])




  const { language } = useLanguage()

  const { landscapeEntries, loadingLandscapes, landscapeError } = useLandscapes(selectedLandscapeId, language)
  const showLearnerTools = role !== 'explorer'

  const {
    currentLandscapeEntry,
    mastery,
    updateMasteryForCurrent,
    activeFilter,
    setActiveFilter,
  } = useLearnerProgress({ landscapeEntries, selectedLandscapeId, skillpilotId })

  useEffect(() => {
    const targetFilter = searchParams.get('f')
    if (targetFilter) {
      setActiveFilter(targetFilter)
    }
  }, [searchParams, setActiveFilter])

  const goals = useMemo(() => currentLandscapeEntry?.goals ?? [], [currentLandscapeEntry])

  const allGoalsGlobal = useMemo(
    () => landscapeEntries.flatMap((entry) => entry.goals),
    [landscapeEntries],
  )
  const { goalIndexAll, parentMapAll, globalRootGoals } = useGoalIndex(allGoalsGlobal)

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
      if (!activeFilter || activeFilter === 'all') return true
      if (!goal.tags || goal.tags.length === 0) return true
      return goal.tags.includes(activeFilter)
    },
    [activeFilter],
  )
  const filteredNeighbors = neighbors

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

  const handleSelectAbsolute = (id: string) => {
    if (!id) return
    const view = location.pathname.split('/')[1]
    navigate(`/${view}/${id}?${searchParams.toString()}`)
  }

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
      const newSearchParams = new URLSearchParams(searchParams)
      if (lid) newSearchParams.set('l', lid)
      if (filter) newSearchParams.set('f', filter)
      setSearchParams(newSearchParams)
      if (goalId) {
        navigate(`/trainer/${goalId}?${newSearchParams.toString()}`)
      }
    },
    [navigate, searchParams, setSearchParams],
  )

  const handleShareContext = () => {
    const url = new URL(window.location.href)
    navigator.clipboard.writeText(url.toString()).catch(() => { })
    window.alert('Link kopiert. Teilen Sie ihn mit Ihrer Lerngruppe.')
  }
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
    loadingLandscapes,
    landscapeError,
    showLearnerTools,
    selectedLandscapeId,
    currentLandscapeEntry,
    activeFilter,
    setActiveFilter,
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
    setSelectedLandscapeId,
  }
}
