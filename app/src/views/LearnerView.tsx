import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLearnerUpdates } from '../hooks/useLearnerUpdates'
import { useTranslation } from '../hooks/useTranslation'
import { CompetenceTree } from '../components/CompetenceTree'
import type { TreeStructureMode } from '../components/CompetenceTree'
import { PersonalCurriculumSetup } from '../components/PersonalCurriculumSetup'
import { Settings, Upload, Download, Menu, X, Target, Send, Check, MoveRight } from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { InfoModal } from '../components/InfoModal'
import { LogoutButton } from '../components/LogoutButton'
import { GoalCard } from '../components/GoalCard'
import { FlashcardDrill } from '../components/srs/FlashcardDrill'
import { ProgressPopover } from '../components/ProgressPopover'
import { InlineMathText } from '../components/InlineMathText'
import { useLanguage } from '../contexts/LanguageContext'
import { isMastered } from '../goalUiUtils'
import { useSrsMastery } from '../hooks/useSrsMastery'
import { getSrsFilterTagsForGoal } from '../utils/srsTags'
import { goalMatchesFilter, isWildcardFilter } from '../utils/goalFilters'
import {
  CANONICAL_GYMNASIUM_ROOT_ID,
  LEGACY_HESSEN_GYMNASIUM_UPPER_IDS,
} from '../utils/curriculumDisplay'
import {
  buildLegacyCutoverUiState,
  inferLegacyHessenLowerSelection,
} from '../utils/legacyCutover'
import {
  ABI26_CAMPAIGN_SLUG,
  extractAbi26CampaignContext,
  loadAbi26CampaignContext,
  saveAbi26CampaignContext,
} from '../utils/abi26MatheCampaign'
import { applyDefaultGlobalStageScope } from '../utils/personalCurriculumStageScope'
import { trackCampaignEvent } from '../utils/campaignTracking'
import type { ToastKind } from '../hooks/useToast'
import { queueToastForNextLoad } from '../hooks/useToast'
import { dispatchLearnerUiRefresh } from '../utils/learnerUiEvents'
import { formatFilterDisplayLabel } from '../utils/filterLabels'
import { getLearnerViewCopy } from '../utils/learnerViewCopy'
import { getNextVisibleLearnerGoalSelection } from '../utils/learnerGoalSelection'
import { normalizeLearnerVisibleChildrenMap } from '../utils/learnerTreeProjection'
import {
  buildDirectChildrenMap,
  buildVisibleChildrenMap,
  getAudienceGoalTitle,
  getRenderedChildIds,
} from '../utils/treeProjectionRuntime'

import type { UiGoal } from '../goalTypes'
import type { Learner, FrontierGoal } from '../learnerTypes'

interface LearnerViewProps {
  rootGoals: UiGoal[]
  goalIndexAll: Map<string, UiGoal>
  getMastery: (goalId: string) => number
  currentGoal: UiGoal | null
  onSelectGoal: (id: string) => void
  routeGoalId?: string
  skillpilotId: string
  landscapeId: string
  currentLandscapeHasMatchedCompositionView: boolean
  activeFilter?: string
  onLogout?: () => void
  onNotify?: (kind: ToastKind, message: string) => void
  availableLandscapes?: { landscapeId: string; title: string; filters?: { id: string; label: string }[]; compatibilityOnly?: boolean }[]
  rootLandscapeId?: string
  onRefresh?: () => void
  onScopeDataRefresh?: () => void
  parentMap?: Map<string, string[]>
  onLandscapeChange?: (landscapeId: string) => void
  onLandscapeGoalChange?: (landscapeId: string, goalId: string) => void
}

type PersonalCurriculumConfig = Record<string, { selected: boolean; filterId?: string }>
type PersonalCurriculumPreferences = {
  strategy: 'RANDOM' | 'SEQUENTIAL'
  autoPilot: boolean
  strictMode: boolean
}

const normalizePersonalConfig = (
  input: PersonalCurriculumConfig,
  availableLandscapes: { landscapeId: string; filters?: { id: string; label: string }[]; compatibilityOnly?: boolean }[],
  rootLandscapeId?: string,
): { config: PersonalCurriculumConfig; corrected: boolean } => {
  const unwrapNestedConfig = (value: PersonalCurriculumConfig): { config: PersonalCurriculumConfig; corrected: boolean } => {
    const nested = (value as Record<string, unknown>)?.personalCurriculum
    if (!nested || typeof nested !== 'object' || Array.isArray(nested)) {
      return { config: value, corrected: false }
    }
    return { config: nested as PersonalCurriculumConfig, corrected: true }
  }

  const buildDefaultConfig = (): PersonalCurriculumConfig => {
    const next: PersonalCurriculumConfig = {}
    availableLandscapes.forEach((landscape) => {
      next[landscape.landscapeId] = {
        selected: true,
        ...(landscape.filters && landscape.filters.length > 0 ? { filterId: landscape.filters[0].id } : {}),
      }
    })
    if (rootLandscapeId === CANONICAL_GYMNASIUM_ROOT_ID) {
      return applyDefaultGlobalStageScope(next).config
    }
    return next
  }

  if (!input || typeof input !== 'object' || Object.keys(input).length === 0) {
    if (availableLandscapes.length === 0) {
      return { config: {}, corrected: false }
    }
    return { config: buildDefaultConfig(), corrected: true }
  }

  const unwrapped = unwrapNestedConfig(input)

  const childLandscapeIds = availableLandscapes
    .map((l) => l.landscapeId)
    .filter((id) => id !== rootLandscapeId)

  if (childLandscapeIds.length === 0) {
    return { config: unwrapped.config, corrected: unwrapped.corrected }
  }

  let corrected = unwrapped.corrected
  let normalized: PersonalCurriculumConfig = { ...unwrapped.config }
  const availableLandscapeIds = new Set(availableLandscapes.map((landscape) => landscape.landscapeId))

  if (rootLandscapeId === CANONICAL_GYMNASIUM_ROOT_ID) {
    const stageScoped = applyDefaultGlobalStageScope(normalized)
    normalized = stageScoped.config
    corrected = corrected || stageScoped.corrected
  }

  availableLandscapes.forEach((landscape) => {
    const current = normalized[landscape.landscapeId]
    if (!current) return
    if (!current.filterId && landscape.filters && landscape.filters.length > 0) {
      normalized[landscape.landscapeId] = {
        ...current,
        filterId: landscape.filters[0].id,
      }
      corrected = true
    }
  })

  if (rootLandscapeId === CANONICAL_GYMNASIUM_ROOT_ID) {
    Object.keys(normalized).forEach((landscapeId) => {
      if (!LEGACY_HESSEN_GYMNASIUM_UPPER_IDS.has(landscapeId) || availableLandscapeIds.has(landscapeId)) {
        return
      }
      delete normalized[landscapeId]
      corrected = true
    })
  }

  const hasChildEntries = childLandscapeIds.some((id) => normalized[id] !== undefined)
  const hasSelectedChild = childLandscapeIds.some((id) => normalized[id]?.selected === true)

  // Recovery case: profile explicitly stores child settings, but all children are deselected.
  // This leads to an empty tree in learner cockpit and is almost always accidental.
  if (hasChildEntries && !hasSelectedChild) {
    const repaired: PersonalCurriculumConfig = { ...normalized }
    if (rootLandscapeId) {
      repaired[rootLandscapeId] = {
        ...repaired[rootLandscapeId],
        selected: true,
      }
    }
    childLandscapeIds.forEach((id) => {
      repaired[id] = {
        ...repaired[id],
        selected: true,
      }
    })
    return { config: repaired, corrected: true }
  }

  return { config: normalized, corrected }
}

const personalCurriculumConfigsEqual = (
  left: PersonalCurriculumConfig,
  right: PersonalCurriculumConfig,
) => {
  const allLandscapeIds = new Set([...Object.keys(left), ...Object.keys(right)])
  for (const landscapeId of allLandscapeIds) {
    const leftEntry = left[landscapeId]
    const rightEntry = right[landscapeId]
    if ((leftEntry?.selected ?? false) !== (rightEntry?.selected ?? false)) {
      return false
    }
    if ((leftEntry?.filterId ?? '') !== (rightEntry?.filterId ?? '')) {
      return false
    }
  }
  return true
}

export const LearnerView: React.FC<LearnerViewProps> = ({
  rootGoals,
  goalIndexAll,
  getMastery,
  currentGoal,
  onSelectGoal,
  routeGoalId,
  skillpilotId,
  landscapeId,
  currentLandscapeHasMatchedCompositionView,
  activeFilter = 'all',
  onLogout,
  onNotify,
  availableLandscapes = [],
  rootLandscapeId,
  onRefresh,
  onScopeDataRefresh,
  parentMap,
  onLandscapeChange,
  onLandscapeGoalChange,
}) => {
  const [plannedGoals, setPlannedGoals] = useState<Set<string>>(new Set())
  const [expandedGoalIds, setExpandedGoalIds] = useState<Set<string>>(new Set())
  const [learnerData, setLearnerData] = useState<Learner | null>(null)
  const [frontierOptions, setFrontierOptions] = useState<FrontierGoal[]>([])
  const [stateActiveGoalId, setStateActiveGoalId] = useState<string | null>(null)
  const [stateRequiredAction, setStateRequiredAction] = useState<string | null>(null)
  const [backendStats, setBackendStats] = useState<{
    masteredAtomic: number
    totalAtomic: number
    personalizedMasteredAtomic?: number
    personalizedTotalAtomic?: number
  } | null>(null)
  const [isSetupOpen, setIsSetupOpen] = useState(false)
  const [personalConfig, setPersonalConfig] = useState<PersonalCurriculumConfig>({})
  const [isPersonalConfigHydrating, setIsPersonalConfigHydrating] = useState<boolean>(!!skillpilotId)
  const [isCutoverPending, setIsCutoverPending] = useState(false)
  const [compatibilityRouteRetired, setCompatibilityRouteRetired] = useState(false)
  const [isCompatibilityArchivePending, setIsCompatibilityArchivePending] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState<'info' | 'error' | 'success'>('info');

  const [srsMasteryTick, setSrsMasteryTick] = useState(0);
  const [optimisticSrsMasteryByGoal, setOptimisticSrsMasteryByGoal] = useState<Record<string, number>>({});


  const fileInputRef = useRef<HTMLInputElement>(null)
  const srsCompletionRef = useRef<Record<string, number>>({})
  const srsCompletionInFlightRef = useRef<Set<string>>(new Set())
  const fullRefreshInFlightRef = useRef(false)
  const lastFullRefreshAtRef = useRef(0)
  const reportedLoadErrorsRef = useRef<Set<string>>(new Set())

  const { language, setLanguage } = useLanguage();
  const t = useTranslation();
  const location = useLocation()
  const localizedLanguage = language === 'en' ? 'en' : 'de'
  const learnerViewCopy = getLearnerViewCopy(localizedLanguage)
  const bavariaFilterDisplay = formatFilterDisplayLabel('DE-BY', localizedLanguage)
  const hessenFilterDisplay = formatFilterDisplayLabel('DE-HE', localizedLanguage)

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const persistedCampaignContext = useMemo(() => loadAbi26CampaignContext(), [])
  const queryCampaignContext = useMemo(() => extractAbi26CampaignContext(queryParams), [queryParams])
  const hasAbi26Marker = useMemo(() => {
    const campaignQuery = queryParams.get('campaign') || queryParams.get('utm_campaign') || queryParams.get('start')
    return campaignQuery === ABI26_CAMPAIGN_SLUG
  }, [queryParams])
  const hasPersistedCampaignForLearner =
    persistedCampaignContext?.slug === ABI26_CAMPAIGN_SLUG &&
    persistedCampaignContext.skillpilotId === skillpilotId
  const isAbi26CampaignSession = hasAbi26Marker || hasPersistedCampaignForLearner
  const campaignContext = useMemo(() => {
    if (hasAbi26Marker) return { ...queryCampaignContext, skillpilotId }
    if (hasPersistedCampaignForLearner && persistedCampaignContext) return persistedCampaignContext
    return null
  }, [hasAbi26Marker, queryCampaignContext, hasPersistedCampaignForLearner, persistedCampaignContext, skillpilotId])

  const currentRouteGoalId = routeGoalId ?? ''
  const selectedId = currentRouteGoalId || currentGoal?.id || rootGoals[0]?.id || ''
  const effectiveActiveGoalId = stateActiveGoalId ?? learnerData?.activeGoalId ?? null
  const hasTrackedCampaignOpenRef = useRef(false)
  const hasAppliedCampaignFilterRef = useRef(false)

  const notifyLoadErrorOnce = useCallback((key: string, message: string) => {
    if (!onNotify) return
    if (reportedLoadErrorsRef.current.has(key)) return
    reportedLoadErrorsRef.current.add(key)
    onNotify('error', message)
  }, [onNotify])

  const clearReportedLoadError = useCallback((key: string) => {
    reportedLoadErrorsRef.current.delete(key)
  }, [])

  useEffect(() => {
    reportedLoadErrorsRef.current.clear()
  }, [skillpilotId])

  const getSrsSource = useCallback((goal: UiGoal) => {
    const extendedData = goal.extendedData as {
      vocabularySource?: string
      vocabularySourceEn?: string
    } | undefined
    const sourceDe = typeof extendedData?.vocabularySource === 'string'
      ? extendedData.vocabularySource
      : undefined
    const sourceEn = typeof extendedData?.vocabularySourceEn === 'string'
      ? extendedData.vocabularySourceEn
      : undefined
    return language === 'en' ? (sourceEn ?? sourceDe) : (sourceDe ?? sourceEn)
  }, [language])

  const srsGoals = useMemo(() => {
    return Array.from(goalIndexAll.values()).filter((goal) => {
      if (landscapeId && goal.landscapeId && goal.landscapeId !== landscapeId) return false
      if (!goal.tags || !goal.tags.some((tag) => tag.startsWith('srs-deck'))) return false
      return typeof getSrsSource(goal) === 'string'
    })
  }, [goalIndexAll, landscapeId, getSrsSource])

  const srsMasteryByGoal = useSrsMastery(srsGoals, skillpilotId, srsMasteryTick, language)

  useEffect(() => {
    setOptimisticSrsMasteryByGoal((current) => {
      let changed = false
      const next = { ...current }
      Object.entries(current).forEach(([goalId, mastery]) => {
        if (srsMasteryByGoal[goalId] === mastery) {
          delete next[goalId]
          changed = true
        }
      })
      return changed ? next : current
    })
  }, [srsMasteryByGoal])

  const getEffectiveMastery = useCallback((goalId: string) => {
    const optimistic = optimisticSrsMasteryByGoal[goalId]
    if (optimistic !== undefined) return optimistic
    const override = srsMasteryByGoal[goalId]
    return override !== undefined ? override : getMastery(goalId)
  }, [optimisticSrsMasteryByGoal, srsMasteryByGoal, getMastery])

  const currentLandscapeRootGoals = useMemo(() => {
    const localRoots = rootGoals.filter((goal) => goal.landscapeId === landscapeId)
    return localRoots.length > 0 ? localRoots : rootGoals
  }, [rootGoals, landscapeId])

  const visibleRootGoals = useMemo(() => {
    if (isPersonalConfigHydrating) {
      return []
    }
    return currentLandscapeRootGoals
  }, [currentLandscapeRootGoals, isPersonalConfigHydrating])
  const learnerStructureMode: TreeStructureMode = 'content'

  // Determine effective active filter based on personal config for current landscape
  const supportedFilterIds = useMemo(() => {
    const ids = new Set<string>()
    availableLandscapes?.forEach((landscape) => {
      landscape.filters?.forEach((filter) => ids.add(filter.id))
    })
    return ids
  }, [availableLandscapes])

  const effectiveActiveFilter = useMemo(() => {
    const config = personalConfig[landscapeId]
    if (config?.filterId) {
      return supportedFilterIds.has(config.filterId) ? config.filterId : undefined
    }
    if (!activeFilter || isWildcardFilter(activeFilter)) return activeFilter
    return supportedFilterIds.has(activeFilter) ? activeFilter : undefined
  }, [landscapeId, personalConfig, activeFilter, supportedFilterIds])
  const learnerVisibleChildrenByParent = useMemo(
    () => {
      if (currentLandscapeHasMatchedCompositionView) {
        return buildDirectChildrenMap(goalIndexAll)
      }

      const baseVisibleChildren = buildVisibleChildrenMap(
        goalIndexAll,
        effectiveActiveFilter,
        personalConfig,
        learnerStructureMode,
      )
      return normalizeLearnerVisibleChildrenMap(goalIndexAll, baseVisibleChildren)
    },
    [currentLandscapeHasMatchedCompositionView, effectiveActiveFilter, goalIndexAll, learnerStructureMode, personalConfig],
  )

  const learnerProjectedParentMap = useMemo(() => {
    const next = new Map<string, string[]>()
    learnerVisibleChildrenByParent.forEach((childIds, parentId) => {
      childIds.forEach((childId) => {
        const currentParents = next.get(childId)
        if (currentParents) {
          currentParents.push(parentId)
        } else {
          next.set(childId, [parentId])
        }
      })
    })
    return next
  }, [learnerVisibleChildrenByParent])

  const effectiveLearnerParentMap = useMemo(
    () => learnerProjectedParentMap.size > 0 ? learnerProjectedParentMap : (parentMap ?? new Map<string, string[]>()),
    [learnerProjectedParentMap, parentMap],
  )

  const learnerTreeScopeKey = useMemo(() => {
    const selectedScopeEntries = Object.entries(personalConfig)
      .filter(([, config]) => config.selected || config.filterId)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([scopeId, config]) => `${scopeId}:${config.selected ? '1' : '0'}:${config.filterId ?? ''}`)

    return [
      landscapeId,
      effectiveActiveFilter ?? 'all',
      learnerStructureMode,
      ...visibleRootGoals.map((goal) => goal.id),
      ...selectedScopeEntries,
    ].join('|')
  }, [effectiveActiveFilter, landscapeId, learnerStructureMode, personalConfig, visibleRootGoals])

  const learnerTreeExpansionStorageKey = useMemo(
    () => `skillpilot:learner-tree-expanded:${skillpilotId || 'anonymous'}:${learnerTreeScopeKey}`,
    [learnerTreeScopeKey, skillpilotId],
  )

  const buildCollapsedFocusPath = useCallback((targetId: string) => {
    if (!targetId) return new Set<string>()

    const visiblePath = new Set<string>()
    const visited = new Set<string>()
    const findVisiblePath = (goalId: string): boolean => {
      if (visited.has(goalId)) return false
      visited.add(goalId)
      if (goalId === targetId) {
        visiblePath.add(goalId)
        return true
      }

      const childIds = getRenderedChildIds(goalId, goalIndexAll, learnerVisibleChildrenByParent)
      for (const childId of childIds) {
        if (findVisiblePath(childId)) {
          visiblePath.add(goalId)
          return true
        }
      }
      return false
    }

    for (const rootGoal of visibleRootGoals) {
      if (findVisiblePath(rootGoal.id)) {
        return visiblePath
      }
    }

    const expanded = new Set<string>()
    const queue = [targetId]
    while (queue.length > 0) {
      const current = queue.pop()!
      if (expanded.has(current)) continue
      expanded.add(current)
      const parents = effectiveLearnerParentMap.get(current)
      if (!parents) continue
      parents.forEach((parentId) => queue.push(parentId))
    }
    return expanded
  }, [effectiveLearnerParentMap, goalIndexAll, learnerVisibleChildrenByParent, visibleRootGoals])

  const forcedExpandedGoalIds = useMemo(() => {
    const targetId = currentRouteGoalId || effectiveActiveGoalId || selectedId
    return targetId ? buildCollapsedFocusPath(targetId) : new Set<string>()
  }, [buildCollapsedFocusPath, currentRouteGoalId, effectiveActiveGoalId, selectedId])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const fallbackExpanded = new Set(visibleRootGoals.map((goal) => goal.id))
    try {
      const raw = window.localStorage.getItem(learnerTreeExpansionStorageKey)
      if (!raw) {
        setExpandedGoalIds(fallbackExpanded)
        return
      }

      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        setExpandedGoalIds(fallbackExpanded)
        return
      }

      setExpandedGoalIds(new Set(parsed.filter((value): value is string => typeof value === 'string')))
    } catch {
      setExpandedGoalIds(fallbackExpanded)
    }
  }, [learnerTreeExpansionStorageKey, visibleRootGoals])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(learnerTreeExpansionStorageKey, JSON.stringify(Array.from(expandedGoalIds)))
  }, [expandedGoalIds, learnerTreeExpansionStorageKey])

  const toggleExpandedGoal = useCallback((goalId: string) => {
    setExpandedGoalIds((current) => {
      const next = new Set(current)
      if (next.has(goalId)) {
        next.delete(goalId)
      } else {
        next.add(goalId)
      }
      return next
    })
  }, [])

  const getVisibleChildIds = useCallback((parentId: string) => {
    if (isPersonalConfigHydrating) return []
    return getRenderedChildIds(parentId, goalIndexAll, learnerVisibleChildrenByParent)
  }, [goalIndexAll, isPersonalConfigHydrating, learnerVisibleChildrenByParent])

  const getLearnerGoalTitle = useCallback(
    (goal: Pick<UiGoal, 'title'>) => currentLandscapeHasMatchedCompositionView ? goal.title : getAudienceGoalTitle(goal),
    [currentLandscapeHasMatchedCompositionView],
  )

  const visibleGoals = useMemo(() => {
    if (isPersonalConfigHydrating) {
      return new Set<string>()
    }

    const visible = new Set<string>()
    const stack = [...visibleRootGoals]
    const hasConfig = Object.keys(personalConfig).length > 0

    while (stack.length > 0) {
      const g = stack.pop()
      if (!g) continue

      // If config exists, respect visibility settings for children
      if (hasConfig) {
        const cfg = personalConfig[g.id]
        // If explicitly unselected, skip branch
        if (cfg && cfg.selected === false) continue
      }

      if (visible.has(g.id)) continue
      visible.add(g.id)
      const childIds = getVisibleChildIds(g.id)
      childIds.forEach((childId) => {
        const child = goalIndexAll.get(childId)
        if (child) stack.push(child)
      })
    }
    return visible
  }, [visibleRootGoals, goalIndexAll, isPersonalConfigHydrating, personalConfig, getVisibleChildIds])

  useEffect(() => {
    const nextVisibleGoalId = getNextVisibleLearnerGoalSelection({
      currentGoalId: currentGoal?.id,
      currentRouteGoalId,
      visibleGoalIds: visibleGoals,
      activeGoalId: effectiveActiveGoalId,
      plannedGoalIds: plannedGoals,
      visibleRootGoalIds: visibleRootGoals.map((goal) => goal.id),
    })

    if (nextVisibleGoalId) {
      onSelectGoal(nextVisibleGoalId)
    }
  }, [currentGoal, currentRouteGoalId, visibleGoals, effectiveActiveGoalId, plannedGoals, visibleRootGoals, onSelectGoal])

  const getFilteredMastery = useCallback(
    (goalId: string) => {
      const masteryCache = new Map<string, { masterySum: number; weightSum: number }>()

      const compute = (
        gId: string,
        visited: Set<string> = new Set(),
      ): { masterySum: number; weightSum: number } => {
        if (masteryCache.has(gId)) return masteryCache.get(gId)!
        if (visited.has(gId)) return { masterySum: 0, weightSum: 0 }

        visited.add(gId)
        const goal = goalIndexAll.get(gId)
        if (!goal) return { masterySum: 0, weightSum: 0 }

        let masterySum = 0
        let weightSum = 0
        const children = getVisibleChildIds(gId)

        if (!goal.contains || goal.contains.length === 0 || children.length === 0) {
          const masteryValue = getEffectiveMastery(gId)
          const weight = goal.weight ?? 1
          masterySum = masteryValue * weight
          weightSum = weight
        } else {
          children.forEach((childId) => {
            const childTotals = compute(childId, new Set(visited))
            masterySum += childTotals.masterySum
            weightSum += childTotals.weightSum
          })
        }

        visited.delete(gId)
        masteryCache.set(gId, { masterySum, weightSum })
        return { masterySum, weightSum }
      }

      const totals = compute(goalId)
      return totals.weightSum > 0 ? totals.masterySum / totals.weightSum : 0
    },
    [goalIndexAll, getEffectiveMastery, getVisibleChildIds],
  )

  // Calculate statistics: Total Atomic and Mastered Atomic
  // Relative to Focus (Planned Subtree) if active, otherwise Global Visible.
  const stats = useMemo(() => {
    const hasPersonalConfig = Object.keys(personalConfig).length > 0
    const hasActiveFilter = !!effectiveActiveFilter && !isWildcardFilter(effectiveActiveFilter)

    // In global mode (no planned goals), prefer backend stats only when no filters are active
    if (plannedGoals.size === 0 && backendStats && !hasPersonalConfig && !hasActiveFilter) {
      return backendStats
    }

    // Local calculation for scope mode or fallback
    let totalAtomic = 0
    let masteredAtomic = 0
    const visited = new Set<string>()

    const countRecursive = (id: string) => {
      if (visited.has(id)) return
      visited.add(id)

      if (!visibleGoals.has(id)) return

      const g = goalIndexAll.get(id)
      if (!g) return

      // Atomic Goal
      if (!g.contains || g.contains.length === 0) {
        totalAtomic++
        if (isMastered(getEffectiveMastery(id))) {
          masteredAtomic++
        }
      } else {
        g.contains.forEach(childId => countRecursive(childId))
      }
    }

    if (plannedGoals.size > 0) {
      // Focus Mode: Count only within planned subtrees
      plannedGoals.forEach(id => countRecursive(id))
    } else {
      // Global Mode: Local fallback if backend stats not available
      visibleGoals.forEach(id => {
        const g = goalIndexAll.get(id)
        if (g && (!g.contains || g.contains.length === 0)) {
          totalAtomic++
          if (isMastered(getEffectiveMastery(id))) {
            masteredAtomic++
          }
        }
      })
    }

    return { totalAtomic, masteredAtomic }
  }, [plannedGoals, goalIndexAll, visibleGoals, getEffectiveMastery, backendStats, personalConfig, effectiveActiveFilter])


  // Reveal Active Goal Logic
  const revealActiveGoal = useCallback(() => {
    if (!effectiveActiveGoalId || effectiveLearnerParentMap.size === 0) return
    const targetId = effectiveActiveGoalId
    setExpandedGoalIds(buildCollapsedFocusPath(targetId))
    if (targetId !== currentRouteGoalId) {
      onSelectGoal(targetId)
    }
  }, [buildCollapsedFocusPath, currentRouteGoalId, effectiveActiveGoalId, effectiveLearnerParentMap, onSelectGoal])

  // Reveal Scope (Planned Goals) Logic
  const revealScope = useCallback(() => {
    if (effectiveLearnerParentMap.size === 0 || plannedGoals.size === 0) return
    // Get the first (and typically only) planned goal as target
    const targetId = Array.from(plannedGoals)[0]
    if (!targetId) return
    setExpandedGoalIds(buildCollapsedFocusPath(targetId))
    if (targetId !== currentRouteGoalId) {
      onSelectGoal(targetId)
    }
  }, [buildCollapsedFocusPath, currentRouteGoalId, effectiveLearnerParentMap, plannedGoals, onSelectGoal])

  // Auto-reveal scope on start if no active goal exists but scope is set
  const hasAutoRevealedScope = useRef(false)
  useEffect(() => {
    // Only run once on initial load
    if (hasAutoRevealedScope.current) return
    // Wait until data is loaded
    if (effectiveLearnerParentMap.size === 0) return

    // If there's an active goal, reveal that instead
    if (effectiveActiveGoalId) {
      hasAutoRevealedScope.current = true
      return
    }

    // If there's a scope but no active goal, reveal the scope
    if (plannedGoals.size > 0) {
      hasAutoRevealedScope.current = true
      revealScope()
    }
  }, [effectiveActiveGoalId, plannedGoals, effectiveLearnerParentMap, revealScope])

  // Frontier Logic: Identify the "Next Actionable" goal in every branch.
  // Assumption: Content is sequential within containers.
  const frontierIds = useMemo(() => {
    const ids = new Set<string>()

    const check = (id: string, visiting: Set<string> = new Set()): boolean => {
      // Respect Global Visibility Config (e.g. Personal Curriculum)
      if (!visibleGoals.has(id)) return false
      if (visiting.has(id)) return false

      const nextVisiting = new Set(visiting)
      nextVisiting.add(id)

      const g = goalIndexAll.get(id)
      if (!g) return false

      // Check Prerequisites (Requires)
      // If ANY required goal is not masterd, this goal is BLOCKED (not frontier).
      if (g.requires && g.requires.length > 0) {
        for (const reqId of g.requires) {
          // Check if requirement is visible? Usually yes.
          // Check mastery.
          if (!isMastered(getEffectiveMastery(reqId))) {
            return false // Blocked by prerequisite
          }
        }
      }

      // 1. If Atomic
      if (!g.contains || g.contains.length === 0) {
        if (!goalMatchesFilter(g, effectiveActiveFilter)) {
          return false
        }

        const m = getEffectiveMastery(id)
        if (!isMastered(m)) {
          ids.add(id)
          return true // Found frontier, branch is active
        }
        return false // Mastered
      }

      // 2. If Container
      // If the container ITSELF is marked mastered (explicitly), we might skip children?
      // But typically mastery is on atomic leaves. Let's traverse children.
      let containerActive = false
      for (const childId of g.contains) {
        // If we found the frontier in this child, we STOP checking subsequent children (Sequential assumption).
        // This ensures typically only 1 frontier goal per container.
        const childActive = check(childId, nextVisiting)
        if (childActive) {
          containerActive = true
          break
        }
      }
      return containerActive
    }

    // Check all visible roots in parallel (parallel tracks)
    visibleRootGoals.forEach(r => check(r.id))

    return ids
  }, [visibleRootGoals, goalIndexAll, getEffectiveMastery, visibleGoals, effectiveActiveFilter])

  const atomicFrontierOptions = useMemo(() => {
    const atomic = frontierOptions.filter((candidate) => candidate.type === 'atomic')
    const strategy = learnerData?.learningStrategy || 'RANDOM'

    if (strategy === 'SEQUENTIAL') {
      return atomic
    } else {
      // RANDOM: Deterministic shuffle based on options length/content to avoid jitter
      // We will just shuffle once when list changes.
      const shuffled = [...atomic]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled
    }
  }, [frontierOptions, learnerData?.learningStrategy])

  const backendFrontierIds = useMemo(
    () => new Set(atomicFrontierOptions.map((goal) => goal.id)),
    [atomicFrontierOptions],
  )

  const shouldShowNextSteps =
    atomicFrontierOptions.length > 0 &&
    (stateRequiredAction ? stateRequiredAction === 'setActiveGoal' : !effectiveActiveGoalId)

  const refreshLearnerData = useCallback(async () => {
    if (!skillpilotId) return
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}` : `/api/ui/learners/${skillpilotId}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setLearnerData(data)
        clearReportedLoadError('learner-initial-load')
        return
      }
      notifyLoadErrorOnce('learner-initial-load', t.notifications.learnerInitialLoadFailed)
    } catch (e) {
      console.warn('Failed to load learner data', e)
      notifyLoadErrorOnce('learner-initial-load', t.notifications.learnerInitialLoadFailed)
    }
  }, [clearReportedLoadError, notifyLoadErrorOnce, skillpilotId, t.notifications.learnerInitialLoadFailed])

  const lowerLegacySelection = useMemo(() => inferLegacyHessenLowerSelection({
    selectedCurriculum: learnerData?.selectedCurriculum,
    personalConfig,
    plannedGoalIds: Array.from(plannedGoals),
    activeGoalId: effectiveActiveGoalId,
    resolveGoalLandscapeId: (goalId) => goalIndexAll.get(goalId)?.landscapeId,
  }), [learnerData?.selectedCurriculum, personalConfig, plannedGoals, effectiveActiveGoalId, goalIndexAll])
  const legacyCutoverUiState = useMemo(() => buildLegacyCutoverUiState({
    selectedCurriculum: learnerData?.selectedCurriculum,
    language,
    compatibilityRouteRetired,
    personalConfig,
    lowerSelection: lowerLegacySelection,
    bavariaFilterDisplay,
    hessenFilterDisplay,
  }), [
    learnerData?.selectedCurriculum,
    language,
    compatibilityRouteRetired,
    personalConfig,
    lowerLegacySelection,
    bavariaFilterDisplay,
    hessenFilterDisplay,
  ])
  const canCutoverLegacyGymnasium = legacyCutoverUiState.canCutover
  const supportsCompatibilityArchive = legacyCutoverUiState.supportsCompatibilityArchive
  const isCompatibilityAuditOnly = legacyCutoverUiState.isCompatibilityAuditOnly
  const shouldShowCompatibilityRetirementGate = legacyCutoverUiState.shouldShowCompatibilityRetirementGate
  const legacyReadOnlyCopy = legacyCutoverUiState.readOnlyCopy
  const legacyErrorCopy = legacyCutoverUiState.errorCopy
  const legacyUiCopy = legacyCutoverUiState.uiCopy


  const refreshState = useCallback(
    async (cacheBust = false) => {
      if (!skillpilotId) return
      try {
        const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
        const suffix = cacheBust ? `?_t=${Date.now()}` : ''
        const url = apiBase
          ? `${apiBase}/api/ui/learners/${skillpilotId}/state${suffix}`
          : `/api/ui/learners/${skillpilotId}/state${suffix}`
        const res = await fetch(url)
        if (res.ok) {
          setCompatibilityRouteRetired(false)
          const data = await res.json()
          if (data.frontier && Array.isArray(data.frontier)) {
            setFrontierOptions(data.frontier)
          } else if (data.stateMachine && Array.isArray(data.stateMachine.goalOptions)) {
            setFrontierOptions(data.stateMachine.goalOptions)
          } else {
            setFrontierOptions([])
          }
          setStateActiveGoalId(data.activeGoal?.id ?? data.stateMachine?.activeGoal?.id ?? null)
          setStateRequiredAction(data.stateMachine?.requiredAction ?? null)
          // Store backend-computed stats for consistency with GPT
          if (data.goals) {
            setBackendStats({
              masteredAtomic: data.goals.mastered_count ?? 0,
              totalAtomic: data.goals.total_count ?? 0,
              personalizedMasteredAtomic: data.goals.personalized?.mastered_atomic,
              personalizedTotalAtomic: data.goals.personalized?.total_atomic,
            })
          }
          clearReportedLoadError('learner-initial-load')
          return
        }
        if (res.status === 409) {
          setCompatibilityRouteRetired(true)
          setFrontierOptions([])
          setStateActiveGoalId(null)
          setStateRequiredAction('compatibilityArchive')
          setBackendStats(null)
          clearReportedLoadError('learner-initial-load')
          return
        }
        notifyLoadErrorOnce('learner-initial-load', t.notifications.learnerInitialLoadFailed)
      } catch (e) {
        console.warn('Failed to load learner state', e)
        notifyLoadErrorOnce('learner-initial-load', t.notifications.learnerInitialLoadFailed)
      }
    },
    [clearReportedLoadError, notifyLoadErrorOnce, skillpilotId, t.notifications.learnerInitialLoadFailed],

  )

  const refreshPlanned = useCallback(async () => {
    if (!skillpilotId) return
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/planned` : `/api/ui/learners/${skillpilotId}/planned`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (data.goals && Array.isArray(data.goals)) {
          setPlannedGoals(new Set(data.goals))
        }
        clearReportedLoadError('learner-initial-load')
        return
      }
      notifyLoadErrorOnce('learner-initial-load', t.notifications.learnerInitialLoadFailed)
    } catch (e) {
      console.warn('Failed to load planned goals', e)
      notifyLoadErrorOnce('learner-initial-load', t.notifications.learnerInitialLoadFailed)
    }
  }, [clearReportedLoadError, notifyLoadErrorOnce, skillpilotId, t.notifications.learnerInitialLoadFailed])

  const [srsReloadCounter, setSrsReloadCounter] = useState(0)

  const handleSseUpdate = useCallback(async (payload?: { type?: string; nodeId?: string }) => {
    if (payload?.type === 'CLIENT_STATE_UPDATED' && payload?.nodeId) {
      setSrsMasteryTick(c => c + 1)
      dispatchLearnerUiRefresh({
        skillpilotId,
        reason: payload.type,
        targets: ['history'],
      })
      if (currentGoal?.id === payload.nodeId) {
        setSrsReloadCounter(c => c + 1)
      }
      return
    }

    const now = Date.now()
    if (fullRefreshInFlightRef.current) return
    if (now - lastFullRefreshAtRef.current < 800) return

    fullRefreshInFlightRef.current = true
    lastFullRefreshAtRef.current = now
    console.log('[SSE] 🔄 Triggering full refresh...')
    // Refresh mastery data, learner state, AND planned goals (scope) in parallel
    try {
      await Promise.all([
        refreshState(true),
        refreshPlanned(),
        onRefresh?.()
      ])
      dispatchLearnerUiRefresh({
        skillpilotId,
        reason: payload?.type ?? 'FULL_REFRESH',
        targets: ['all'],
      })
      console.log('[SSE] ✅ Refresh complete')
    } finally {
      fullRefreshInFlightRef.current = false
    }
  }, [refreshState, refreshPlanned, onRefresh, currentGoal?.id, skillpilotId])

  useEffect(() => {
    if (!campaignContext) return
    saveAbi26CampaignContext(campaignContext)
  }, [campaignContext])

  useEffect(() => {
    if (!isAbi26CampaignSession) return
    if (language === 'de') return
    setLanguage('de')
    localStorage.setItem('skillpilot_lang', 'de')
  }, [isAbi26CampaignSession, language, setLanguage])

  useEffect(() => {
    if (!campaignContext || hasTrackedCampaignOpenRef.current) return
    hasTrackedCampaignOpenRef.current = true
    trackCampaignEvent('cockpit_opened', {
      start: ABI26_CAMPAIGN_SLUG,
      source: campaignContext.source,
      campaign: campaignContext.campaign,
      medium: campaignContext.medium,
      courseLevel: campaignContext.courseLevel,
      location: 'cockpit',
    }, skillpilotId)
  }, [campaignContext, skillpilotId])

  useLearnerUpdates(skillpilotId, handleSseUpdate)


  // Auto-reveal when active goal changes (including from SSE updates).
  // Keep at most one pending selection request per active goal while the router catches up.
  const prevRevealedActiveGoalIdRef = useRef<string | null>(null)
  const pendingActiveGoalRouteSyncRef = useRef<string | null>(null)
  useEffect(() => {
    prevRevealedActiveGoalIdRef.current = null
    pendingActiveGoalRouteSyncRef.current = null
  }, [landscapeId, learnerTreeScopeKey])

  useEffect(() => {
    if (!effectiveActiveGoalId) {
      prevRevealedActiveGoalIdRef.current = null
      pendingActiveGoalRouteSyncRef.current = null
      return
    }
    if (effectiveLearnerParentMap.size === 0) return

    if (currentRouteGoalId === effectiveActiveGoalId) {
      pendingActiveGoalRouteSyncRef.current = null
    }

    const activeGoalChanged = effectiveActiveGoalId !== prevRevealedActiveGoalIdRef.current
    const routeNeedsSync = currentRouteGoalId !== effectiveActiveGoalId
    if (!activeGoalChanged && !routeNeedsSync) return
    if (!activeGoalChanged && pendingActiveGoalRouteSyncRef.current === effectiveActiveGoalId) return

    console.log('[SSE] 🎯 Active goal ready for reveal:', effectiveActiveGoalId)
    revealActiveGoal()
    prevRevealedActiveGoalIdRef.current = effectiveActiveGoalId
    pendingActiveGoalRouteSyncRef.current = routeNeedsSync ? effectiveActiveGoalId : null
  }, [currentRouteGoalId, effectiveActiveGoalId, effectiveLearnerParentMap, revealActiveGoal])


  // Load planned goals from backend
  React.useEffect(() => {
    if (!skillpilotId) return

    // fetchPlanned now handled by refreshPlanned
    refreshPlanned()
    refreshLearnerData()
  }, [skillpilotId, refreshPlanned, refreshLearnerData])

  const handleSetActiveGoal = useCallback(async (goalId: string) => {
    if (isCompatibilityAuditOnly) {
      setModalTitle(legacyReadOnlyCopy.title)
      setModalMessage(legacyReadOnlyCopy.activeGoalMessage)
      setModalType('info')
      setIsModalOpen(true)
      return
    }
    if (!skillpilotId) return;
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/active-goal` : `/api/ui/learners/${skillpilotId}/active-goal`

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId })
      });

      if (res.ok) {
        const data = await res.json()
        if (data.frontier && Array.isArray(data.frontier)) {
          setFrontierOptions(data.frontier)
        } else if (data.stateMachine && Array.isArray(data.stateMachine.goalOptions)) {
          setFrontierOptions(data.stateMachine.goalOptions)
        }

        const targetId = data.activeGoal?.id ?? goalId
        setLearnerData((prev) => (prev ? { ...prev, activeGoalId: targetId } : prev))
        setStateActiveGoalId(targetId)
        setStateRequiredAction(data.stateMachine?.requiredAction ?? null)
        if (parentMap) {
          setExpandedGoalIds(buildCollapsedFocusPath(targetId))
        }
        if (targetId !== currentRouteGoalId) {
          pendingActiveGoalRouteSyncRef.current = targetId
          onSelectGoal(targetId)
        }
        onRefresh?.()
      } else {
        const message = await res.text()
        if (onNotify) {
          onNotify('error', message || t.notifications.activeGoalSetFailed)
        } else {
          setModalTitle(learnerViewCopy.activeGoalNotAllowedTitle)
          setModalMessage(message || learnerViewCopy.activeGoalNotInFrontierMessage)
          setModalType('error')
          setIsModalOpen(true)
        }
      }
    } catch (e) {
      console.warn('Failed to set active goal', e)
      onNotify?.('error', t.notifications.activeGoalSetSystemFailed)
    }
  }, [
    isCompatibilityAuditOnly,
    legacyReadOnlyCopy,
    learnerViewCopy.activeGoalNotAllowedTitle,
    learnerViewCopy.activeGoalNotInFrontierMessage,
    onNotify,
    onRefresh,
    onSelectGoal,
    buildCollapsedFocusPath,
    currentRouteGoalId,
    parentMap,
    skillpilotId,
    t.notifications.activeGoalSetFailed,
    t.notifications.activeGoalSetSystemFailed,
  ])

  const togglePlan = useCallback(async (id: string) => {
    if (isCompatibilityAuditOnly) {
      setModalTitle(legacyReadOnlyCopy.title)
      setModalMessage(legacyReadOnlyCopy.planMessage)
      setModalType('info')
      setIsModalOpen(true)
      return
    }
    // Single Goal Mode:
    // If clicking the ALREADY selected goal -> Deselect it (Set empty)
    // If clicking a NEW goal -> Select only that one (Set with 1 item)
    let next: Set<string>;
    const previousPlannedGoals = new Set(plannedGoals)

    if (plannedGoals.has(id)) {
      next = new Set();
    } else {
      next = new Set([id]);
    }

    setPlannedGoals(next)

    if (!skillpilotId) return
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/planned` : `/api/ui/learners/${skillpilotId}/planned`
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals: Array.from(next) })
      })
      if (!res.ok) {
        throw new Error(`planned-goal-save-failed:${res.status}`)
      }
      await refreshState(true)
    } catch (e) {
      console.warn('Failed to save planned goals', e)
      setPlannedGoals(previousPlannedGoals)
      onNotify?.('error', t.notifications.plannedGoalSaveFailed)
    }
  }, [
    isCompatibilityAuditOnly,
    legacyReadOnlyCopy,
    onNotify,
    plannedGoals,
    refreshState,
    skillpilotId,
    t.notifications.plannedGoalSaveFailed,
  ])

  // Load personal config from backend
  React.useEffect(() => {
    let cancelled = false
    if (!skillpilotId) {
      setIsPersonalConfigHydrating(false)
      return
    }

    setIsPersonalConfigHydrating(true)
    const fetchConfig = async () => {
      try {
        const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
        const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}` : `/api/ui/learners/${skillpilotId}`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          if (data.personalCurriculum) {
            const parsed = JSON.parse(data.personalCurriculum)
            const { config, corrected } = normalizePersonalConfig(parsed || {}, availableLandscapes, rootLandscapeId)
            if (!cancelled) {
              setPersonalConfig(config || {})
            }

            if (corrected) {
              const saveUrl = apiBase
                ? `${apiBase}/api/ui/learners/${skillpilotId}/personal-curriculum`
                : `/api/ui/learners/${skillpilotId}/personal-curriculum`
              await fetch(saveUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
              })
            }
          }
          clearReportedLoadError('learner-initial-load')
          return
        }
        notifyLoadErrorOnce('learner-initial-load', t.notifications.learnerInitialLoadFailed)
      } catch (e) {
        console.warn('Failed to load personal curriculum', e)
        notifyLoadErrorOnce('learner-initial-load', t.notifications.learnerInitialLoadFailed)
      } finally {
        if (!cancelled) {
          setIsPersonalConfigHydrating(false)
        }
      }
    }
    fetchConfig()
    refreshState()
    return () => {
      cancelled = true
    }
  }, [
    availableLandscapes,
    clearReportedLoadError,
    notifyLoadErrorOnce,
    refreshState,
    rootLandscapeId,
    skillpilotId,
    t.notifications.learnerInitialLoadFailed,
  ])

  // Check mobile state
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isResizing = useRef(false)

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing.current) {
      setSidebarWidth(Math.max(240, Math.min(800, e.clientX)))
    }
  }, [])

  const stopResizing = useCallback(() => {
    isResizing.current = false
    document.removeEventListener('mousemove', resize)
    document.removeEventListener('mouseup', stopResizing)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [resize])

  const startResizing = useCallback(() => {
    isResizing.current = true
    document.addEventListener('mousemove', resize)
    document.addEventListener('mouseup', stopResizing)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [resize, stopResizing])

  // Save personal config to backend
  const handleConfigChange = useCallback(async (newConfig: PersonalCurriculumConfig) => {
    const previousConfig = personalConfig
    setPersonalConfig(newConfig)
    if (!skillpilotId) return
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/personal-curriculum` : `/api/ui/learners/${skillpilotId}/personal-curriculum`
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      })
      if (!res.ok) {
        throw new Error(`personal-curriculum-save-failed:${res.status}`)
      }
      onScopeDataRefresh?.()
      await refreshState(true)
    } catch (e) {
      console.warn('Failed to save personal curriculum', e)
      setPersonalConfig(previousConfig)
      onNotify?.('error', t.notifications.personalCurriculumSaveFailed)
    }
  }, [
    onNotify,
    onScopeDataRefresh,
    personalConfig,
    refreshState,
    skillpilotId,
    t.notifications.personalCurriculumSaveFailed,
  ])

  const handleCutoverCanonicalGymnasium = useCallback(async () => {
    if (!skillpilotId || isCutoverPending) return
    setIsCutoverPending(true)
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase
        ? `${apiBase}/api/ui/learners/${skillpilotId}/cutover/canonical-gymnasium`
        : `/api/ui/learners/${skillpilotId}/cutover/canonical-gymnasium`
      const res = await fetch(url, { method: 'POST' })
      if (!res.ok) {
        const message = await res.text()
        setModalTitle(legacyErrorCopy.cutoverTitle)
        setModalMessage(
          message || legacyErrorCopy.cutoverCreateMessage,
        )
        setModalType('error')
        setIsModalOpen(true)
        return
      }

      const data = await res.json()
      if (data.frontier && Array.isArray(data.frontier)) {
        setFrontierOptions(data.frontier)
      } else if (data.stateMachine && Array.isArray(data.stateMachine.goalOptions)) {
        setFrontierOptions(data.stateMachine.goalOptions)
      } else {
        setFrontierOptions([])
      }
      setStateActiveGoalId(data.activeGoal?.id ?? data.stateMachine?.activeGoal?.id ?? null)
      setStateRequiredAction(data.stateMachine?.requiredAction ?? null)
      if (data.goals) {
        setPlannedGoals(new Set((data.goals.planned ?? []).map((goal: FrontierGoal) => goal.id)))
        setBackendStats({
          masteredAtomic: data.goals.mastered_count ?? 0,
          totalAtomic: data.goals.total_count ?? 0,
          personalizedMasteredAtomic: data.goals.personalized?.mastered_atomic,
          personalizedTotalAtomic: data.goals.personalized?.total_atomic,
        })
      }

      const targetGoalId =
        data.activeGoal?.id ??
        data.goals?.planned?.[0]?.id ??
        data.stateMachine?.activeGoal?.id ??
        data.stateMachine?.goalOptions?.[0]?.id ??
        null

      if (targetGoalId && onLandscapeGoalChange) {
        onLandscapeGoalChange(CANONICAL_GYMNASIUM_ROOT_ID, targetGoalId)
      } else {
        onLandscapeChange?.(CANONICAL_GYMNASIUM_ROOT_ID)
      }

      await Promise.all([
        refreshLearnerData(),
        onRefresh?.(),
      ])
      setCompatibilityRouteRetired(false)
      dispatchLearnerUiRefresh({
        skillpilotId,
        reason: 'CANONICAL_CUTOVER',
        targets: ['all'],
      })
      setIsSetupOpen(false)
      setModalTitle(legacyUiCopy.cutoverSuccessTitle)
      setModalMessage(
        legacyCutoverUiState.cutoverSuccessMessage
          ?? legacyUiCopy.cutoverFallbackMessage,
      )
      setModalType('success')
      setIsModalOpen(true)
    } catch (e) {
      console.warn('Failed to cut over learner to canonical Gymnasium', e)
      setModalTitle(legacyErrorCopy.cutoverTitle)
      setModalMessage(
        legacyErrorCopy.cutoverSystemMessage,
      )
      setModalType('error')
      setIsModalOpen(true)
    } finally {
      setIsCutoverPending(false)
    }
  }, [skillpilotId, isCutoverPending, onLandscapeChange, onLandscapeGoalChange, refreshLearnerData, onRefresh, legacyCutoverUiState.cutoverSuccessMessage, legacyErrorCopy, legacyUiCopy])

  useEffect(() => {
    if (!isAbi26CampaignSession || !campaignContext || !rootLandscapeId) return
    if (hasAppliedCampaignFilterRef.current) return

    const current = personalConfig[rootLandscapeId]
    if (current?.filterId) {
      hasAppliedCampaignFilterRef.current = true
      return
    }

    hasAppliedCampaignFilterRef.current = true
    void handleConfigChange({
      ...personalConfig,
      [rootLandscapeId]: {
        selected: current?.selected ?? true,
        filterId: campaignContext.courseLevel,
      },
    })
  }, [isAbi26CampaignSession, campaignContext, rootLandscapeId, personalConfig, handleConfigChange])

  useEffect(() => {
    hasAppliedCampaignFilterRef.current = false
  }, [skillpilotId, rootLandscapeId, campaignContext?.courseLevel])

  const handlePersonalCurriculumApply = useCallback(async (
    newConfig: PersonalCurriculumConfig,
    preferences: PersonalCurriculumPreferences,
  ) => {
    const configChanged = !personalCurriculumConfigsEqual(newConfig, personalConfig)
    const preferencesChanged =
      (learnerData?.learningStrategy ?? 'RANDOM') !== preferences.strategy
      || (learnerData?.autoPilot ?? false) !== preferences.autoPilot
      || (learnerData?.strictMode ?? false) !== preferences.strictMode

    if (!configChanged && !preferencesChanged) {
      return
    }

    if (!skillpilotId) {
      if (configChanged) {
        setPersonalConfig(newConfig)
      }
      if (preferencesChanged) {
        setLearnerData(prev => prev ? {
          ...prev,
          learningStrategy: preferences.strategy,
          autoPilot: preferences.autoPilot,
          strictMode: preferences.strictMode,
        } : prev)
      }
      return
    }

    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')

      if (configChanged) {
        const configUrl = apiBase
          ? `${apiBase}/api/ui/learners/${skillpilotId}/personal-curriculum`
          : `/api/ui/learners/${skillpilotId}/personal-curriculum`
        const configRes = await fetch(configUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newConfig)
        })
        if (!configRes.ok) {
          throw new Error(`personal-curriculum-save-failed:${configRes.status}`)
        }
      }

      if (preferencesChanged) {
        const preferencesUrl = apiBase
          ? `${apiBase}/api/ui/learners/${skillpilotId}/preferences`
          : `/api/ui/learners/${skillpilotId}/preferences`
        const preferencesRes = await fetch(preferencesUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            learningStrategy: preferences.strategy,
            autoPilot: preferences.autoPilot,
            strictMode: preferences.strictMode,
          })
        })
        if (!preferencesRes.ok) {
          throw new Error(`preferences-save-failed:${preferencesRes.status}`)
        }
      }

      if (configChanged) {
        setPersonalConfig(newConfig)
        onScopeDataRefresh?.()
      }
      if (preferencesChanged) {
        setLearnerData(prev => prev ? {
          ...prev,
          learningStrategy: preferences.strategy,
          autoPilot: preferences.autoPilot,
          strictMode: preferences.strictMode,
        } : prev)
      }

      await refreshState(true)
    } catch (e) {
      console.warn('Failed to apply personal curriculum setup', e)
      if (configChanged) {
        onNotify?.('error', t.notifications.personalCurriculumSaveFailed)
      } else {
        onNotify?.('error', t.notifications.preferencesSaveFailed)
      }
      throw e
    }
  }, [
    learnerData,
    onNotify,
    onScopeDataRefresh,
    personalConfig,
    refreshState,
    skillpilotId,
    t.notifications.personalCurriculumSaveFailed,
    t.notifications.preferencesSaveFailed,
  ])

  // Save preferences to backend




  const downloadJsonPayload = useCallback((payload: unknown, filenamePrefix: string) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '')
    link.download = `${filenamePrefix}_${skillpilotId}_${timestamp}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [skillpilotId])

  const handleCompatibilityArchiveDownload = useCallback(async () => {
    if (!skillpilotId || isCompatibilityArchivePending) return
    setIsCompatibilityArchivePending(true)
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase
        ? `${apiBase}/api/ui/learners/${skillpilotId}/compatibility-archive`
        : `/api/ui/learners/${skillpilotId}/compatibility-archive`
      const res = await fetch(url)
      if (!res.ok) {
        const message = await res.text()
        if (onNotify) {
          onNotify('error', message || t.notifications.compatibilityArchiveExportFailed)
        } else {
          setModalTitle(legacyErrorCopy.archiveTitle)
          setModalMessage(
            message || legacyErrorCopy.archiveCreateMessage,
          )
          setModalType('error')
          setIsModalOpen(true)
        }
        return
      }

      const serverArchive = await res.json()
      const clientData: Record<string, unknown> = { srsState: {} }
      const prefix = `srs_state_${skillpilotId}_`

      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith(prefix)) {
            const val = localStorage.getItem(key)
            if (val) (clientData.srsState as Record<string, unknown>)[key] = JSON.parse(val)
          }
        }
      } catch (e) {
        console.warn('Error collecting local SRS state for compatibility archive', e)
      }

      const exportPayload = {
        version: 'compatibility-archive/1.0',
        exportedAt: new Date().toISOString(),
        serverArchive,
        clientData,
      }

      downloadJsonPayload(exportPayload, 'compatibility_archive')
      if (onNotify) {
        onNotify('success', t.notifications.compatibilityArchiveExported)
      } else {
        setModalTitle(legacyUiCopy.archiveSuccessTitle)
        setModalMessage(
          legacyCutoverUiState.compatibilityArchiveSuccessMessage
            ?? legacyUiCopy.archiveFallbackMessage,
        )
        setModalType('success')
        setIsModalOpen(true)
      }
    } catch (e) {
      console.error('Compatibility archive export error', e)
      if (onNotify) {
        onNotify('error', t.notifications.compatibilityArchiveExportFailed)
      } else {
        setModalTitle(legacyErrorCopy.archiveTitle)
        setModalMessage(
          legacyErrorCopy.archiveSystemMessage,
        )
        setModalType('error')
        setIsModalOpen(true)
      }
    } finally {
      setIsCompatibilityArchivePending(false)
    }
  }, [
    downloadJsonPayload,
    isCompatibilityArchivePending,
    legacyErrorCopy,
    legacyCutoverUiState.compatibilityArchiveSuccessMessage,
    legacyUiCopy,
    onNotify,
    skillpilotId,
    t.notifications.compatibilityArchiveExportFailed,
    t.notifications.compatibilityArchiveExported,
  ])

  const handleExport = useCallback(async () => {
    if (!skillpilotId) return
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/export` : `/api/ui/learners/${skillpilotId}/export`
      const res = await fetch(url)
      if (res.ok) {
        const serverData = await res.json()

        // V2 Export: Collect Local SRS State
        const clientData: Record<string, unknown> = { srsState: {} }
        const prefix = `srs_state_${skillpilotId}_`

        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith(prefix)) {
              // Save full key-value pair. We will parse the key on import to handle ID changes.
              const val = localStorage.getItem(key)
              if (val) (clientData.srsState as Record<string, unknown>)[key] = JSON.parse(val)
            }
          }
        } catch (e) {
          console.warn("Error collecting local stats for export", e)
        }

        const parseTimestamp = (value: unknown) => {
          if (!value) return 0
          const numeric = Number(value)
          if (Number.isFinite(numeric)) return numeric
          const parsed = Date.parse(String(value))
          return Number.isFinite(parsed) ? parsed : 0
        }

        // Merge in server-stored SRS state (important for multi-device exports)
        try {
          const srsNodes = srsGoals.filter((goal) => goal.tags?.some((tag) => tag.startsWith('srs-deck')))
          await Promise.all(
            srsNodes.map(async (goal) => {
              const nodeId = goal.id
              const syncUrl = apiBase
                ? `${apiBase}/api/ui/learners/${skillpilotId}/client-state/${nodeId}`
                : `/api/ui/learners/${skillpilotId}/client-state/${nodeId}`
              try {
                const stateRes = await fetch(syncUrl)
                if (!stateRes.ok) return
                const payload = await stateRes.json()
                const serverState = payload?.srsState
                if (!serverState || Object.keys(serverState).length === 0) return

                const lastSyncKey = `srs_state_last_sync_${skillpilotId}_${nodeId}`
                const localLast = localStorage.getItem(lastSyncKey)
                const localLastAt = parseTimestamp(localLast)
                const serverUpdatedAt = parseTimestamp(payload?.updatedAt)

                const storageKey = `srs_state_${skillpilotId}_${nodeId}`
                const existing = (clientData.srsState as Record<string, unknown>)[storageKey]
                if (!existing || serverUpdatedAt > localLastAt) {
                  (clientData.srsState as Record<string, unknown>)[storageKey] = serverState
                }
              } catch (err) {
                console.warn('Error fetching server SRS state for export', err)
              }
            })
          )
        } catch (e) {
          console.warn('Error merging server SRS state for export', e)
        }

        const exportPayload = {
          version: "2.0",
          exportedAt: new Date().toISOString(),
          serverExport: serverData,
          clientData: clientData
        }

        downloadJsonPayload(exportPayload, 'learner_data')
        onNotify?.('success', t.notifications.learnerExported)
      } else {
        console.error("Export failed", res.status, res.statusText)
        onNotify?.('error', t.notifications.learnerExportFailed)
      }
    } catch (e) {
      console.error("Export error", e)
      onNotify?.('error', t.notifications.learnerExportFailed)
    }
  }, [downloadJsonPayload, onNotify, skillpilotId, srsGoals, t.notifications.learnerExportFailed, t.notifications.learnerExported])

  const syncClientData = useCallback(async (nodeId: string): Promise<boolean> => {
    if (!skillpilotId || !nodeId) return false
    const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
    const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/client-state/${nodeId}` : `/api/ui/learners/${skillpilotId}/client-state/${nodeId}`
    const lastSyncKey = `srs_state_last_sync_${skillpilotId}_${nodeId}`
    const storageKey = `srs_state_${skillpilotId}_${nodeId}`

    let srsState: Record<string, unknown> = {}
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) srsState = JSON.parse(stored)
    } catch (e) {
      console.warn("Error collecting local SRS state for sync", e)
    }

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updatedAt: new Date().toISOString(),
          srsState
        })
      })

      if (res.ok) {
        try {
          const data = await res.json()
          if (data && data.savedAt) {
            localStorage.setItem(lastSyncKey, String(data.savedAt))
          } else {
            localStorage.setItem(lastSyncKey, new Date().toISOString())
          }
        } catch {
          localStorage.setItem(lastSyncKey, new Date().toISOString())
        }
        return true
      }
      if (res.status === 404) {
        console.warn('Client-state sync endpoint not available on backend.')
        return false
      }
      console.warn('Client-state sync failed', res.status, res.statusText)
      return false
    } catch (e) {
      console.warn('Client-state sync error', e)
      return false
    }
  }, [skillpilotId])

  useEffect(() => {
    const goalId = currentGoal?.id
    if (!goalId) return
    if (!currentGoal?.tags?.some((tag) => tag.startsWith('srs-deck'))) return

    const mastery = srsMasteryByGoal[goalId]
    if (mastery === undefined) return

    const previous = srsCompletionRef.current[goalId]
    if (previous === mastery) return
    srsCompletionRef.current[goalId] = mastery

    if (mastery < 1) return
    if (srsCompletionInFlightRef.current.has(goalId)) return

    srsCompletionInFlightRef.current.add(goalId)
    void (async () => {
      try {
        await syncClientData(goalId)
        await refreshState(true)
        onRefresh?.()
        dispatchLearnerUiRefresh({
          skillpilotId,
          reason: 'SRS_SYNC',
          targets: ['all'],
        })
      } finally {
        srsCompletionInFlightRef.current.delete(goalId)
      }
    })()
  }, [currentGoal?.id, currentGoal?.tags, skillpilotId, srsMasteryByGoal, refreshState, onRefresh, syncClientData])

  const handleImportClick = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !skillpilotId) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);

        // V2 Import: Unwrap if Wrapper exists
        let payloadToSend: unknown = json;
        let clientDataToRestore: unknown = null;

        if (json.serverExport && json.clientData) {
          console.log("Detected V2 Export Wrapper")
          payloadToSend = json.serverExport;
          clientDataToRestore = json.clientData as Record<string, unknown>;
        }

        const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
        const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/import` : `/api/ui/learners/${skillpilotId}/import`

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadToSend)
        });

        if (res.ok) {
          // Restore Local Data (SRS State) if present
          if (clientDataToRestore && (clientDataToRestore as Record<string, unknown>).srsState) {
            try {
              console.log("Restoring SRS State...")
              const srsState = (clientDataToRestore as Record<string, unknown>).srsState as Record<string, unknown>
              let restoreCount = 0;
              const goalStateMap = new Map<string, Record<string, unknown>>();

              // Regex to parse old keys: srs_state_{OLD_ID}_{GOAL_ID}
              // We assume ID does not contain underscores (UUIDs are hyphens).
              // But just in case, we split by first 3 parts: srs, state, id.
              // safer: match /^srs_state_([^_]+)_(.+)$/
              const keyPattern = /^srs_state_([^_]+)_(.+)$/

              Object.entries(srsState).forEach(([oldKey, value]) => {
                const match = oldKey.match(keyPattern)
                if (match) {
                  // match[1] is old ID (ignored, we use current `skillpilotId`)
                  const goalId = match[2]

                  // Construct new key for CURRENT user
                  const newKey = `srs_state_${skillpilotId}_${goalId}`

                  localStorage.setItem(newKey, JSON.stringify(value))
                  if (value && typeof value === 'object') {
                    goalStateMap.set(goalId, value as Record<string, unknown>)
                  }
                  restoreCount++;
                }
              })
              console.log(`Restored ${restoreCount} SRS state entries.`)

              // Persist restored SRS state to backend for memory nodes
              const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
              await Promise.all(
                Array.from(goalStateMap.entries()).map(async ([goalId, state]) => {
                  const syncUrl = apiBase
                    ? `${apiBase}/api/ui/learners/${skillpilotId}/client-state/${goalId}`
                    : `/api/ui/learners/${skillpilotId}/client-state/${goalId}`
                  try {
                    const res = await fetch(syncUrl, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        updatedAt: new Date().toISOString(),
                        srsState: state
                      })
                    })
                    if (res.ok) {
                      const lastSyncKey = `srs_state_last_sync_${skillpilotId}_${goalId}`
                      localStorage.setItem(lastSyncKey, new Date().toISOString())
                    }
                  } catch (err) {
                    console.warn('Failed to persist imported SRS state', err)
                  }
                })
              )
            } catch (err) {
              console.error("Error restoring local state", err)
            }
          }

          queueToastForNextLoad('success', t.notifications.learnerImported)
          // Keep the reload for now because import may replace learner context,
          // selected curriculum, and local mirrored state across the app.
          window.location.reload();
        } else {
          console.error("Import failed", res.status);

          let serverMsg = "";
          try {
            const errData = await res.json();
            if (errData && errData.message) serverMsg = errData.message;
          } catch { /* ignore */ }

          const notifyImportError = (message: string, title: string) => {
            if (onNotify) {
              onNotify('error', message)
              return
            }
            setModalMessage(message)
            setModalTitle(title)
            setModalType('error')
            setIsModalOpen(true)
          }

	          // Use helpful message if signature error suspected (400 Bad Request) or generic otherwise
	          if (res.status === 400) {
	            notifyImportError(
	              t.notifications.learnerImportValidationFailed,
	              learnerViewCopy.importValidationFailedTitle,
	            )
	          } else {
	            notifyImportError(
	              serverMsg || t.notifications.learnerImportFailed,
	              learnerViewCopy.importFailedTitle,
	            )
	          }
	        }
	      } catch (err) {
	        console.error("Import error", err);
	        if (onNotify) {
	          onNotify('error', t.notifications.learnerImportSystemFailed)
	        } else {
	          setModalMessage(learnerViewCopy.importSystemMessage);
	          setModalTitle(learnerViewCopy.importErrorTitle);
	          setModalType('error');
	          setIsModalOpen(true);
	        }
	      }
	    };
    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [
    skillpilotId,
    learnerViewCopy.importErrorTitle,
    learnerViewCopy.importFailedTitle,
    learnerViewCopy.importSystemMessage,
    learnerViewCopy.importValidationFailedTitle,
    onNotify,
    t.notifications.learnerImported,
    t.notifications.learnerImportFailed,
    t.notifications.learnerImportSystemFailed,
    t.notifications.learnerImportValidationFailed,
  ]);

  return (
    <div className="flex h-screen bg-chat-bg text-text-primary overflow-hidden transition-colors">

      {/* Mobile Backdrop */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`flex flex-col bg-sidebar-bg border-r border-border-color shrink-0
          fixed inset-y-0 left-0 z-50 shadow-2xl transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:shadow-none md:transition-none md:flex
        `}
        style={{
          width: isMobile ? '85%' : sidebarWidth,
          maxWidth: isMobile ? '320px' : 'none'
        }}
      >
        <div className="p-4 border-b border-border-color flex items-center justify-between shrink-0">
          <div className="flex-1 min-w-0 mr-2">
            <h2 className="font-bold text-sky-600 dark:text-sky-400 truncate">{t.learner.myGoals}</h2>
            <div className="text-xs flex items-center gap-2 mt-1">
              <button
                className="flex items-center gap-1 font-bold text-red-500 hover:text-red-400 transition-colors"
	                onClick={revealScope}
	                disabled={plannedGoals.size === 0}
	                title={plannedGoals.size > 0
	                  ? learnerViewCopy.revealMarkedScopeTitle
	                  : t.learner.totalInContext
	                }
	              >
                {stats.totalAtomic} <Target size={16} />
              </button>
              <MoveRight size={12} className="text-slate-400" />
              <button
                className="text-slate-400 dark:text-slate-500 flex items-center gap-1 text-[10px] hover:text-sky-500 transition-colors"
                onClick={revealActiveGoal}
                title="Gehe zum aktiven Ziel / Go to active goal"
              >
                <Send size={16} className="text-amber-500" />
              </button>
              <MoveRight size={12} className="text-slate-400" />
              <ProgressPopover
                skillpilotId={skillpilotId}
                goalIndexAll={goalIndexAll}
              >
                <button
                  className="flex items-center gap-1 font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
                  title={t.learner.completed}
                >
                  {stats.masteredAtomic} <Check size={16} strokeWidth={3} />
                </button>
              </ProgressPopover>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">

            {/* SSE auto-refresh now active - manual refresh button removed */}
            <button onClick={() => setIsSetupOpen(true)} className="p-1 text-text-secondary hover:text-sky-400"><Settings size={16} /></button>
            <ThemeToggle />
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 ml-1 text-text-secondary hover:text-red-400"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {isPersonalConfigHydrating ? (
            <div className="p-8 text-center text-sm text-text-secondary">
              {t.learner.loadingGoals}
            </div>
          ) : (
            <CompetenceTree
              key={learnerTreeScopeKey}
              rootGoals={visibleRootGoals}
              allGoals={goalIndexAll}
              getMastery={getEffectiveMastery}
              plannedGoals={plannedGoals}
              onTogglePlan={togglePlan}
              readOnly={isCompatibilityAuditOnly}
              onSelect={onSelectGoal}
              selectedId={selectedId}
              activeFilter={effectiveActiveFilter}
              structureMode={learnerStructureMode}
              hideTechnicalStructureUi
              allowClusterPlanning
              personalConfig={personalConfig}
              activeGoalId={effectiveActiveGoalId ?? undefined}
              expandedGoalIds={expandedGoalIds}
              onToggleExpanded={toggleExpandedGoal}
              forcedExpandedIds={forcedExpandedGoalIds}
              frontierIds={frontierIds}
              audience="learner"
              visibleChildrenByParentOverride={learnerVisibleChildrenByParent}
              useRawGoalTitles={currentLandscapeHasMatchedCompositionView}
            />
          )}
        </div>
        {learnerData && learnerData.copySources && learnerData.copySources.length > 0 && (
          <div className="p-3 border-t border-border-color bg-gray-50 dark:bg-slate-900 text-xs text-text-secondary shrink-0">
            <h3 className="font-semibold mb-1">
              {t.learner.includesDataFrom}
            </h3>
            <div className="flex flex-col gap-1 max-h-[100px] overflow-y-auto">
              {learnerData.copySources.map((src, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate" title={src.sourceId}>
                    {src.sourceId.substring(0, 8)}...
                  </span>
                  <span className="whitespace-nowrap ml-2">
                    {new Date(src.copiedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Footer Imports/Exports */}
        <div className="p-2 border-t border-border-color flex justify-between">
          <div className="flex gap-2">
            <button onClick={handleExport} className="text-text-secondary hover:text-sky-400"><Download size={16} /></button>
            <button onClick={handleImportClick} className="text-text-secondary hover:text-sky-400"><Upload size={16} /></button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
          </div>
          {onLogout && <LogoutButton onLogout={onLogout} />}
        </div>

        {/* Resize Handle (Desktop) */}
        {!isMobile && (
          <div
            className="absolute right-0 top-0 bottom-0 w-1 hover:w-1.5 cursor-col-resize z-10 transition-colors group"
            style={{ right: -2 }}
            onMouseDown={startResizing}
          >
            {/* Visual indicator on hover */}
            <div className="absolute inset-y-0 right-0 w-full bg-transparent group-hover:bg-sky-400/50 transition-colors" />
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-y-auto bg-chat-bg p-6 flex flex-col items-center relative">
        {/* Mobile Toggle Button */}
        {isMobile && !isSidebarOpen && (
          <button
            className="absolute top-4 left-4 p-2 text-text-secondary hover:text-sky-400 z-10 bg-white/50 dark:bg-slate-900/50 rounded-md backdrop-blur-sm border border-border-color shadow-sm"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
        )}
        {currentGoal ? (
          <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {canCutoverLegacyGymnasium && (
              <div className="mb-6 rounded-xl border border-amber-300/70 bg-amber-50/90 p-4 shadow-sm dark:border-amber-700/60 dark:bg-amber-950/30">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                      {legacyCutoverUiState.bannerLabel}
                    </div>
                    <p className="mt-1 text-sm text-amber-900/90 dark:text-amber-100/90">
                      {legacyCutoverUiState.bannerDescription}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {supportsCompatibilityArchive && (
                      <button
                        type="button"
                        onClick={handleCompatibilityArchiveDownload}
                        disabled={isCompatibilityArchivePending}
                        className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/50"
                      >
                        {isCompatibilityArchivePending
                          ? legacyCutoverUiState.compatibilityArchivePendingLabel
                          : legacyCutoverUiState.compatibilityArchiveActionLabel}
                      </button>
                    )}
	                    <button
	                      type="button"
	                      onClick={() => setIsSetupOpen(true)}
	                      className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/50"
	                    >
	                      {legacyUiCopy.setupButtonLabel}
	                    </button>
                    <button
                      type="button"
                      onClick={handleCutoverCanonicalGymnasium}
                      disabled={isCutoverPending}
                      className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <MoveRight size={16} />
                      <span>
                        {isCutoverPending
                          ? legacyCutoverUiState.actionPendingLabel
                          : legacyCutoverUiState.actionLabel}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {shouldShowCompatibilityRetirementGate && (
              <div className="mb-6 rounded-xl border border-sky-300/80 bg-sky-50/90 p-5 shadow-sm dark:border-sky-700/60 dark:bg-sky-950/30">
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="text-sm font-semibold text-sky-800 dark:text-sky-300">
                      {legacyCutoverUiState.retirementGateCopy?.title}
                    </div>
                    <p className="mt-2 text-sm text-sky-900/90 dark:text-sky-100/90">
                      {legacyCutoverUiState.retirementGateCopy?.description}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleCutoverCanonicalGymnasium}
                      disabled={isCutoverPending}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <MoveRight size={16} />
                      <span>
                        {isCutoverPending
                          ? legacyCutoverUiState.retirementGateCopy?.cutoverPendingLabel
                          : legacyCutoverUiState.retirementGateCopy?.cutoverLabel}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCompatibilityArchiveDownload}
                      disabled={isCompatibilityArchivePending}
                      className="rounded-lg border border-sky-300 bg-white px-4 py-2 text-sm font-medium text-sky-900 transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-100 dark:hover:bg-sky-900/50"
                    >
                      {isCompatibilityArchivePending
                        ? legacyCutoverUiState.retirementGateCopy?.archivePendingLabel
                        : legacyCutoverUiState.retirementGateCopy?.archiveLabel}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Check for SRS Tag */}
            {!shouldShowCompatibilityRetirementGate && (
              currentGoal.tags && currentGoal.tags.some(t => t.startsWith('srs-deck')) ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border-color p-6">
                  <div className="mb-6 border-b border-border-color pb-4">
                    <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400 mb-2">
                      <InlineMathText text={getLearnerGoalTitle(currentGoal)} />
                    </h1>
                    {currentGoal.description ? (
                      <p className="text-text-secondary">{currentGoal.description}</p>
                    ) : null}
                  </div>
                  <FlashcardDrill
                    key={currentGoal.id}
                    goalId={currentGoal.id}
                    dataSourceUrl={getSrsSource(currentGoal)}
                    skillPilotId={skillpilotId}
                    readOnly={isCompatibilityAuditOnly}
                    titleOverride={getLearnerGoalTitle(currentGoal)}
                    onSync={syncClientData}
                    reloadSignal={srsReloadCounter}
                    filterTags={getSrsFilterTagsForGoal(currentGoal)}
                    onStateChange={({ goalId, mastery }) => {
                      setOptimisticSrsMasteryByGoal((current) => {
                        if (current[goalId] === mastery) return current
                        return { ...current, [goalId]: mastery }
                      })
                      setSrsMasteryTick(c => c + 1)
                    }}
                  />
                </div>
              ) : (
                <GoalCard
                  goal={currentGoal}
                  masteryValue={
                    currentGoal.contains && currentGoal.contains.length > 0
                      ? getFilteredMastery(currentGoal.id)
                      : getEffectiveMastery(currentGoal.id)
                  }
                  showLearnerTools={true}
                  hideTechnicalStructureUi
                  readOnly={isCompatibilityAuditOnly}
                  isPlanned={plannedGoals.has(currentGoal.id)}
                  isActive={effectiveActiveGoalId === currentGoal.id}
                  onSetActive={handleSetActiveGoal}
                  onRevealActive={revealActiveGoal}
                  isFrontier={backendFrontierIds.has(currentGoal.id)}
                  useRawGoalTitles={currentLandscapeHasMatchedCompositionView}
                />
              )
            )}

            {/* Extended Frontier Panel (Below GoalCard) */}
            {!shouldShowCompatibilityRetirementGate && !isCompatibilityAuditOnly && shouldShowNextSteps && (
              <div className="mt-8 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border-color p-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg text-sky-600 dark:text-sky-400">
                    <Send size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">
                      {t.learner?.nextSteps || "Als nächste Lernziele stehen dir offen:"}
                    </h2>
                    <p className="text-sm text-text-secondary">
                      {t.learner?.chooseNext || "Welches möchtest du als Nächstes angehen?"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {atomicFrontierOptions
                    .map((candidate, idx) => (
                      <button
                        key={candidate.id}
                        onClick={() => handleSetActiveGoal(candidate.id)}
                        className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-border-color hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-md transition-all text-left group"
                      >
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-slate-700 text-xs font-bold text-text-secondary border border-border-color group-hover:border-sky-400 group-hover:text-sky-500 transition-colors shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <InlineMathText
                            text={getLearnerGoalTitle(candidate)}
                            className="font-semibold text-text-primary group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2"
                          />
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary">
            <p>Select a goal to start learning</p>
          </div>
        )}
      </main>

      <PersonalCurriculumSetup
        key={`personal-curriculum:${skillpilotId}:${landscapeId}:${isSetupOpen ? 'open' : 'closed'}`}
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        availableLandscapes={availableLandscapes}
        currentLandscapeId={landscapeId}
        retirementOnly={canCutoverLegacyGymnasium}
        onApply={handlePersonalCurriculumApply}
        initialConfig={personalConfig}
        rootLandscapeId={rootLandscapeId}
        initialStrategy={learnerData?.learningStrategy}
        initialAutoPilot={learnerData?.autoPilot}
        initialStrictMode={learnerData?.strictMode}
        migration={canCutoverLegacyGymnasium
          ? {
            title: legacyCutoverUiState.migrationTitle ?? '',
            description: legacyCutoverUiState.migrationDescription ?? '',
            actionLabel: legacyCutoverUiState.migrationActionLabel ?? '',
            actionPending: isCutoverPending,
            onAction: handleCutoverCanonicalGymnasium,
            previewItems: legacyCutoverUiState.previewItems,
          }
          : undefined}
      />

      <InfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        type={modalType}
      >
        {modalMessage}
      </InfoModal>
    </div>
  )
}
