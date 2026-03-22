import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLearnerUpdates } from '../hooks/useLearnerUpdates'
import { useTranslation } from '../hooks/useTranslation'
import { CompetenceTree } from '../components/CompetenceTree'
import type { TreeStructureMode } from '../components/CompetenceTree'
import { PersonalCurriculumSetup } from '../components/PersonalCurriculumSetup'
import { Settings, Upload, Download, Menu, X, Target, Send, Check, MoveRight, Link2 } from 'lucide-react'
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
  LEGACY_HESSEN_GYMNASIUM_LOWER_IDS,
} from '../utils/curriculumDisplay'
import {
  ABI26_CAMPAIGN_SLUG,
  extractAbi26CampaignContext,
  loadAbi26CampaignContext,
  saveAbi26CampaignContext,
} from '../utils/abi26MatheCampaign'
import { applyDefaultGlobalStageScope, goalMatchesGlobalStageScope } from '../utils/personalCurriculumStageScope'
import { trackCampaignEvent } from '../utils/campaignTracking'
import type { ToastKind } from '../hooks/useToast'
import { queueToastForNextLoad } from '../hooks/useToast'

import type { UiGoal } from '../goalTypes'
import type { Learner, FrontierGoal } from '../learnerTypes'

interface LearnerViewProps {
  rootGoals: UiGoal[]
  goalIndexAll: Map<string, UiGoal>
  getMastery: (goalId: string) => number
  currentGoal: UiGoal | null
  onSelectGoal: (id: string) => void
  skillpilotId: string
  landscapeId: string
  activeFilter?: string
  structureMode?: TreeStructureMode
  onStructureModeChange?: (mode: TreeStructureMode) => void
  onLogout?: () => void
  onShareContext?: () => void
  onNotify?: (kind: ToastKind, message: string) => void
  availableLandscapes?: { landscapeId: string; title: string; filters?: { id: string; label: string }[]; compatibilityOnly?: boolean }[]
  rootLandscapeId?: string
  onRefresh?: () => void
  parentMap?: Map<string, string[]>
  onLandscapeChange?: (landscapeId: string) => void
  onLandscapeGoalChange?: (landscapeId: string, goalId: string) => void
}

type PersonalCurriculumConfig = Record<string, { selected: boolean; filterId?: string }>

const HESSEN_GYMNASIUM_LOWER_ROOT_ID = 'f050ee48-6891-4f83-995f-0f8be5e31b7f'
const HESSEN_GYMNASIUM_LOWER_MATH_ID = 'b167b4cd-4b78-4c84-a721-6b2adbbcab3c'
const HESSEN_GYMNASIUM_LOWER_PHYSICS_ID = '996d097a-cac2-4b5f-979a-b3a0b9803265'
const HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID = 'bea90c22-b9c5-4c0c-9b10-89d875f50772'
const HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID = '71438941-0ceb-46ee-ad31-773cee700779'
const HESSEN_GYMNASIUM_LOWER_FRENCH_ID = '762de708-85fa-4324-958e-56002a318f7f'
const BAVARIA_GYMNASIUM_MATH_ID = 'c1600692-e543-5cf2-a399-6bd96e6b817f'
const BAVARIA_GYMNASIUM_PHYSICS_ID = '42c2f7e3-91b4-5de8-bef0-d563440e9d52'
const BAVARIA_GYMNASIUM_CHEMISTRY_ID = 'ff1ca997-b6cc-5ece-8e13-5498b4bbf808'
const BAVARIA_GYMNASIUM_BIOLOGY_ID = '357a7003-b636-570e-a0bd-6bb63518d2f6'
const BAVARIA_GYMNASIUM_CHINESE_ID = '40744ec5-7de1-5e41-9fc2-a1e774721644'
const BAVARIA_GYMNASIUM_INFORMATICS_ID = '1af3eba8-749f-5359-8f12-18f87b13616c'
const BAVARIA_GYMNASIUM_HISTORY_ID = '01c2ba7a-ebd4-5840-bc09-123d7b31c914'
const BAVARIA_GYMNASIUM_GERMAN_ID = '05f1cd27-5a58-5415-8fda-d4807067f70a'
const BAVARIA_GYMNASIUM_ENGLISH_ID = '9da8e86b-92dc-5ba0-827e-339400af2b38'
const BAVARIA_GYMNASIUM_GREEK_ID = '22703293-7307-5ad2-b158-efe6ae28c7c3'
const BAVARIA_GYMNASIUM_ECONOMICS_ID = '4959d7df-e430-5c1d-bb7b-873d6252a27f'
const BAVARIA_GYMNASIUM_POLITICS_SOCIETY_ID = '486a8278-39b2-5450-96f8-1076a47b655b'
const BAVARIA_GYMNASIUM_LATIN_ID = 'c7eeaaa4-7c23-5ab7-8643-b7a03760cd6b'
const BAVARIA_GYMNASIUM_MUSIC_ID = 'a00d70bf-3d3c-58fc-af4f-881b29635c2e'
const BAVARIA_GYMNASIUM_FRENCH_ID = '49aefe0c-f365-5f30-b84f-b9a7699e4f2c'
const BAVARIA_GYMNASIUM_SPANISH_ID = '8dba4715-f75e-5339-9e99-02236e4b80dd'
const BAVARIA_GYMNASIUM_ITALIAN_ID = 'c7643536-1163-50d8-86a6-9645c8fd3e25'
const BAVARIA_GYMNASIUM_RUSSIAN_ID = '2b6e79f6-5130-56cb-9a2f-d08e6dc4b4d7'
const BAVARIA_GYMNASIUM_POLISH_ID = '21148204-794c-515d-ae20-c4d5cd4e56d8'
const BAVARIA_GYMNASIUM_CZECH_ID = '097f3667-2488-57b2-a3e0-2cb334e422a2'

type HessenLowerSelection = {
  mathSelected: boolean
  physicsSelected: boolean
  chemistrySelected: boolean
  biologySelected: boolean
  frenchSelected: boolean
  retirementEligible: boolean
}

const inferLegacyHessenLowerSelection = (
  selectedCurriculum: string | null | undefined,
  personalConfig: PersonalCurriculumConfig,
  plannedGoals: Set<string>,
  activeGoalId: string | null,
  goalIndexAll: Map<string, UiGoal>,
): HessenLowerSelection => {
  if (!selectedCurriculum || !LEGACY_HESSEN_GYMNASIUM_LOWER_IDS.has(selectedCurriculum)) {
    return {
      mathSelected: false,
      physicsSelected: false,
      chemistrySelected: false,
      biologySelected: false,
      frenchSelected: false,
      retirementEligible: false,
    }
  }

  const goalBelongsToLandscape = (goalId: string | null | undefined, landscapeId: string) =>
    !!goalId && goalIndexAll.get(goalId)?.landscapeId === landscapeId

  let mathSelected = selectedCurriculum === HESSEN_GYMNASIUM_LOWER_MATH_ID
  let physicsSelected = selectedCurriculum === HESSEN_GYMNASIUM_LOWER_PHYSICS_ID
  let chemistrySelected = selectedCurriculum === HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID
  let biologySelected = selectedCurriculum === HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID
  let frenchSelected = selectedCurriculum === HESSEN_GYMNASIUM_LOWER_FRENCH_ID

  if (selectedCurriculum === HESSEN_GYMNASIUM_LOWER_ROOT_ID) {
    const plannedGoalIds = Array.from(plannedGoals)
    mathSelected = personalConfig[HESSEN_GYMNASIUM_LOWER_MATH_ID]?.selected === true
      || plannedGoalIds.some((goalId) => goalBelongsToLandscape(goalId, HESSEN_GYMNASIUM_LOWER_MATH_ID))
      || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_LOWER_MATH_ID)
    physicsSelected = personalConfig[HESSEN_GYMNASIUM_LOWER_PHYSICS_ID]?.selected === true
      || plannedGoalIds.some((goalId) => goalBelongsToLandscape(goalId, HESSEN_GYMNASIUM_LOWER_PHYSICS_ID))
      || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_LOWER_PHYSICS_ID)
    chemistrySelected = personalConfig[HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID]?.selected === true
      || plannedGoalIds.some((goalId) => goalBelongsToLandscape(goalId, HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID))
      || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID)
    biologySelected = personalConfig[HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID]?.selected === true
      || plannedGoalIds.some((goalId) => goalBelongsToLandscape(goalId, HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID))
      || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID)
    frenchSelected = personalConfig[HESSEN_GYMNASIUM_LOWER_FRENCH_ID]?.selected === true
      || plannedGoalIds.some((goalId) => goalBelongsToLandscape(goalId, HESSEN_GYMNASIUM_LOWER_FRENCH_ID))
      || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_LOWER_FRENCH_ID)
  }

  if (!mathSelected && !physicsSelected && !chemistrySelected && !biologySelected && !frenchSelected) {
    mathSelected = true
    physicsSelected = true
    chemistrySelected = true
    biologySelected = true
    frenchSelected = true
  }

  if (physicsSelected) {
    mathSelected = true
  }

  return {
    mathSelected,
    physicsSelected,
    chemistrySelected,
    biologySelected,
    frenchSelected,
    retirementEligible: mathSelected || physicsSelected || chemistrySelected || biologySelected || frenchSelected,
  }
}

const normalizePersonalConfig = (
  input: PersonalCurriculumConfig,
  availableLandscapes: { landscapeId: string; filters?: { id: string; label: string }[]; compatibilityOnly?: boolean }[],
  rootLandscapeId?: string,
): { config: PersonalCurriculumConfig; corrected: boolean } => {
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

  const childLandscapeIds = availableLandscapes
    .map((l) => l.landscapeId)
    .filter((id) => id !== rootLandscapeId)

  if (childLandscapeIds.length === 0) {
    return { config: input, corrected: false }
  }

  let corrected = false
  let normalized: PersonalCurriculumConfig = { ...input }
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

  const hasChildEntries = childLandscapeIds.some((id) => input[id] !== undefined)
  const hasSelectedChild = childLandscapeIds.some((id) => input[id]?.selected === true)

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

export const LearnerView: React.FC<LearnerViewProps> = ({
  rootGoals,
  goalIndexAll,
  getMastery,
  currentGoal,
  onSelectGoal,
  skillpilotId,
  landscapeId,
  activeFilter = 'all',
  structureMode = 'all',
  onStructureModeChange = () => {},
  onLogout,
  onShareContext,
  onNotify,
  availableLandscapes = [],
  rootLandscapeId,
  onRefresh,
  parentMap,
  onLandscapeChange,
  onLandscapeGoalChange,
}) => {
  const [plannedGoals, setPlannedGoals] = useState<Set<string>>(new Set())
  const [forcedExpandedIds, setForcedExpandedIds] = useState<Set<string>>(new Set())
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

  // Refresh counter to force CompetenceTree re-render on SSE updates
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [velocityRefreshCounter, setVelocityRefreshCounter] = useState(0);
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

  const selectedId = currentGoal?.id ?? rootGoals[0]?.id ?? ''
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

  const hasCompetencyStructure = useMemo(() => {
    return visibleRootGoals.some((rootGoal) =>
      (rootGoal.contains ?? []).some((childId) =>
        goalIndexAll.get(childId)?.tags?.includes('competency-axis:dimension-root'),
      ),
    )
  }, [goalIndexAll, visibleRootGoals])

  useEffect(() => {
    if (structureMode !== 'competency' || hasCompetencyStructure) {
      return
    }
    onStructureModeChange('all')
  }, [hasCompetencyStructure, onStructureModeChange, structureMode])

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

  const getVisibleChildIds = useCallback((parentId: string) => {
    if (isPersonalConfigHydrating) return []

    const parent = goalIndexAll.get(parentId)
    const childIds = parent?.contains ?? []
    if (childIds.length === 0) return []

    const hasConfig = Object.keys(personalConfig).length > 0
    const hasPositiveSibling = hasConfig && childIds.some(childId => {
      const c = goalIndexAll.get(childId)
      if (!c) return false
      const cfg = (c.landscapeId ? personalConfig[c.landscapeId] : undefined) ?? personalConfig[c.id]
      return cfg?.selected === true
    })

    return childIds.filter((childId) => {
      const child = goalIndexAll.get(childId)
      if (!child) return false

      if (!goalMatchesGlobalStageScope(child, personalConfig)) {
        return false
      }

      // Apply the currently active cockpit filter (e.g. DE-BY/DE-HE or GK/LK)
      // on top of personal curriculum selections.
      if (!goalMatchesFilter(child, effectiveActiveFilter)) {
        return false
      }

      // 2) Personal curriculum selection + per-landscape filterId
      if (hasConfig) {
        const cfg = (child.landscapeId ? personalConfig[child.landscapeId] : undefined) ?? personalConfig[child.id]
        if (cfg) {
          if (cfg.selected !== true) return false
          if (!goalMatchesFilter(child, cfg.filterId)) {
            return false
          }
        } else if (hasPositiveSibling) {
          return false
        }
      }

      return true
    })
  }, [goalIndexAll, isPersonalConfigHydrating, personalConfig, effectiveActiveFilter])

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
    if (!currentGoal) return
    if (visibleGoals.has(currentGoal.id)) return

    const nextVisibleGoalId =
      (effectiveActiveGoalId && visibleGoals.has(effectiveActiveGoalId) ? effectiveActiveGoalId : undefined)
      ?? Array.from(plannedGoals).find((goalId) => visibleGoals.has(goalId))
      ?? visibleRootGoals.find((goal) => visibleGoals.has(goal.id))?.id
      ?? Array.from(visibleGoals)[0]

    if (nextVisibleGoalId && nextVisibleGoalId !== currentGoal.id) {
      onSelectGoal(nextVisibleGoalId)
    }
  }, [currentGoal, visibleGoals, effectiveActiveGoalId, plannedGoals, visibleRootGoals, onSelectGoal])

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
    if (!effectiveActiveGoalId || !parentMap) return
    const targetId = effectiveActiveGoalId
    const ancestors = new Set<string>()

    // Recursive / Iterative lookup
    const queue = [targetId]
    while (queue.length > 0) {
      const current = queue.pop()!
      const parents = parentMap.get(current)
      if (parents) {
        parents.forEach(p => {
          if (!ancestors.has(p)) {
            ancestors.add(p)
            queue.push(p)
          }
        })
      }
    }
    setForcedExpandedIds(ancestors)
    if (targetId !== selectedId) {
      onSelectGoal(targetId)
    }
  }, [effectiveActiveGoalId, parentMap, onSelectGoal, selectedId])

  // Reveal Scope (Planned Goals) Logic
  const revealScope = useCallback(() => {
    if (!parentMap || plannedGoals.size === 0) return
    // Get the first (and typically only) planned goal as target
    const targetId = Array.from(plannedGoals)[0]
    if (!targetId) return

    const ancestors = new Set<string>()

    // Find all ancestors to expand
    const queue = [targetId]
    while (queue.length > 0) {
      const current = queue.pop()!
      const parents = parentMap.get(current)
      if (parents) {
        parents.forEach(p => {
          if (!ancestors.has(p)) {
            ancestors.add(p)
            queue.push(p)
          }
        })
      }
    }
    setForcedExpandedIds(ancestors)
    if (targetId !== selectedId) {
      onSelectGoal(targetId)
    }
  }, [parentMap, plannedGoals, onSelectGoal, selectedId])

  // Auto-reveal scope on start if no active goal exists but scope is set
  const hasAutoRevealedScope = useRef(false)
  useEffect(() => {
    // Only run once on initial load
    if (hasAutoRevealedScope.current) return
    // Wait until data is loaded
    if (!parentMap || parentMap.size === 0) return

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
  }, [effectiveActiveGoalId, plannedGoals, parentMap, revealScope])

  // Frontier Logic: Identify the "Next Actionable" goal in every branch.
  // Assumption: Content is sequential within containers.
  const frontierIds = useMemo(() => {
    const ids = new Set<string>()

    const check = (id: string): boolean => {
      // Respect Global Visibility Config (e.g. Personal Curriculum)
      if (!visibleGoals.has(id)) return false

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
        const childActive = check(childId)
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

  const isUpperLegacyHessenSession = useMemo(() => {
    const selectedCurriculum = learnerData?.selectedCurriculum
    return !!selectedCurriculum && LEGACY_HESSEN_GYMNASIUM_UPPER_IDS.has(selectedCurriculum)
  }, [learnerData?.selectedCurriculum])
  const bavariaLegacyRetirementSubject = useMemo(() => {
    const selectedCurriculum = learnerData?.selectedCurriculum
    if (selectedCurriculum === BAVARIA_GYMNASIUM_MATH_ID) {
      return 'Mathematik'
    }
    if (selectedCurriculum === BAVARIA_GYMNASIUM_PHYSICS_ID) {
      return 'Physik'
    }
    if (selectedCurriculum === BAVARIA_GYMNASIUM_CHEMISTRY_ID) {
      return 'Chemie'
    }
    if (selectedCurriculum === BAVARIA_GYMNASIUM_BIOLOGY_ID) {
      return 'Biologie'
    }
    if (selectedCurriculum === BAVARIA_GYMNASIUM_CHINESE_ID) {
      return 'Chinesisch'
    }
    if (selectedCurriculum === BAVARIA_GYMNASIUM_INFORMATICS_ID) {
      return 'Informatik'
    }
    if (selectedCurriculum === BAVARIA_GYMNASIUM_HISTORY_ID) {
      return 'Geschichte'
    }
    if (selectedCurriculum === BAVARIA_GYMNASIUM_GERMAN_ID) {
      return 'Deutsch'
    }
    if (selectedCurriculum === BAVARIA_GYMNASIUM_ENGLISH_ID) {
      return 'Englisch'
    }
    if (selectedCurriculum === BAVARIA_GYMNASIUM_GREEK_ID) {
      return 'Griechisch'
    }
    if (selectedCurriculum === BAVARIA_GYMNASIUM_ECONOMICS_ID) {
      return 'Wirtschaft und Recht'
    }
    if (selectedCurriculum === BAVARIA_GYMNASIUM_POLITICS_SOCIETY_ID) {
      return 'Politik und Gesellschaft'
    }
    if (selectedCurriculum === BAVARIA_GYMNASIUM_LATIN_ID) {
      return 'Latein'
    }
    if (selectedCurriculum === BAVARIA_GYMNASIUM_MUSIC_ID) {
      return 'Musik'
    }
    if (selectedCurriculum === BAVARIA_GYMNASIUM_FRENCH_ID) {
      return 'Französisch'
    }
    if (selectedCurriculum === BAVARIA_GYMNASIUM_SPANISH_ID) {
      return 'Spanisch'
    }
    if (selectedCurriculum === BAVARIA_GYMNASIUM_ITALIAN_ID) {
      return 'Italienisch'
    }
    if (selectedCurriculum === BAVARIA_GYMNASIUM_RUSSIAN_ID) {
      return 'Russisch'
    }
    if (selectedCurriculum === BAVARIA_GYMNASIUM_POLISH_ID) {
      return 'Polnisch'
    }
    if (selectedCurriculum === BAVARIA_GYMNASIUM_CZECH_ID) {
      return 'Tschechisch'
    }
    return null
  }, [learnerData?.selectedCurriculum])
  const bavariaLegacyRetirementSubjectEn = useMemo(() => {
    if (bavariaLegacyRetirementSubject === 'Mathematik') {
      return 'mathematics'
    }
    if (bavariaLegacyRetirementSubject === 'Physik') {
      return 'physics'
    }
    if (bavariaLegacyRetirementSubject === 'Chemie') {
      return 'chemistry'
    }
    if (bavariaLegacyRetirementSubject === 'Biologie') {
      return 'biology'
    }
    if (bavariaLegacyRetirementSubject === 'Chinesisch') {
      return 'chinese'
    }
    if (bavariaLegacyRetirementSubject === 'Informatik') {
      return 'computer science'
    }
    if (bavariaLegacyRetirementSubject === 'Geschichte') {
      return 'history'
    }
    if (bavariaLegacyRetirementSubject === 'Deutsch') {
      return 'german'
    }
    if (bavariaLegacyRetirementSubject === 'Englisch') {
      return 'english'
    }
    if (bavariaLegacyRetirementSubject === 'Griechisch') {
      return 'greek'
    }
    if (bavariaLegacyRetirementSubject === 'Wirtschaft und Recht') {
      return 'economics and law'
    }
    if (bavariaLegacyRetirementSubject === 'Politik und Gesellschaft') {
      return 'politics and society'
    }
    if (bavariaLegacyRetirementSubject === 'Latein') {
      return 'latin'
    }
    if (bavariaLegacyRetirementSubject === 'Musik') {
      return 'music'
    }
    if (bavariaLegacyRetirementSubject === 'Französisch') {
      return 'french'
    }
    if (bavariaLegacyRetirementSubject === 'Spanisch') {
      return 'spanish'
    }
    if (bavariaLegacyRetirementSubject === 'Italienisch') {
      return 'italian'
    }
    if (bavariaLegacyRetirementSubject === 'Russisch') {
      return 'russian'
    }
    if (bavariaLegacyRetirementSubject === 'Polnisch') {
      return 'polish'
    }
    if (bavariaLegacyRetirementSubject === 'Tschechisch') {
      return 'czech'
    }
    return null
  }, [bavariaLegacyRetirementSubject])
  const isBavariaLegacyRetirementOnly = bavariaLegacyRetirementSubject !== null
  const lowerLegacySelection = useMemo(() => inferLegacyHessenLowerSelection(
    learnerData?.selectedCurriculum,
    personalConfig,
    plannedGoals,
    effectiveActiveGoalId,
    goalIndexAll,
  ), [learnerData?.selectedCurriculum, personalConfig, plannedGoals, effectiveActiveGoalId, goalIndexAll])
  const isLowerLegacyRetirementOnly = lowerLegacySelection.retirementEligible
  const canCutoverLegacyGymnasium =
    isUpperLegacyHessenSession || isLowerLegacyRetirementOnly || isBavariaLegacyRetirementOnly
  const supportsCompatibilityArchive = isUpperLegacyHessenSession
  const isCompatibilityAuditOnly = canCutoverLegacyGymnasium
  const shouldShowCompatibilityRetirementGate =
    compatibilityRouteRetired &&
    isUpperLegacyHessenSession

  const legacyCutoverPreviewItems = useMemo(() => {
    const selectedCurriculum = learnerData?.selectedCurriculum
    if (!selectedCurriculum) {
      return []
    }

    if (
      selectedCurriculum === BAVARIA_GYMNASIUM_MATH_ID
      || selectedCurriculum === BAVARIA_GYMNASIUM_PHYSICS_ID
      || selectedCurriculum === BAVARIA_GYMNASIUM_CHEMISTRY_ID
      || selectedCurriculum === BAVARIA_GYMNASIUM_BIOLOGY_ID
      || selectedCurriculum === BAVARIA_GYMNASIUM_CHINESE_ID
      || selectedCurriculum === BAVARIA_GYMNASIUM_INFORMATICS_ID
      || selectedCurriculum === BAVARIA_GYMNASIUM_HISTORY_ID
      || selectedCurriculum === BAVARIA_GYMNASIUM_GERMAN_ID
      || selectedCurriculum === BAVARIA_GYMNASIUM_ENGLISH_ID
      || selectedCurriculum === BAVARIA_GYMNASIUM_GREEK_ID
      || selectedCurriculum === BAVARIA_GYMNASIUM_ECONOMICS_ID
      || selectedCurriculum === BAVARIA_GYMNASIUM_POLITICS_SOCIETY_ID
      || selectedCurriculum === BAVARIA_GYMNASIUM_LATIN_ID
      || selectedCurriculum === BAVARIA_GYMNASIUM_MUSIC_ID
      || selectedCurriculum === BAVARIA_GYMNASIUM_FRENCH_ID
      || selectedCurriculum === BAVARIA_GYMNASIUM_SPANISH_ID
    ) {
      return [
        { label: 'Quelle', value: `Bayern Gymnasium ${bavariaLegacyRetirementSubject}` },
        { label: 'Ziel', value: 'Gymnasium (DE)' },
        { label: 'Filter', value: 'DE-BY' },
        { label: 'Fach', value: bavariaLegacyRetirementSubject ?? 'Mathematik' },
      ]
    }

    if (isLowerLegacyRetirementOnly) {
      const selectedSubjects = [
        lowerLegacySelection.mathSelected ? 'Mathematik' : null,
        lowerLegacySelection.physicsSelected ? 'Physik' : null,
        lowerLegacySelection.chemistrySelected ? 'Chemie' : null,
        lowerLegacySelection.biologySelected ? 'Biologie' : null,
        lowerLegacySelection.frenchSelected ? 'Französisch' : null,
      ].filter(Boolean).join(', ')

      return [
        { label: 'Quelle', value: 'Hessen Sek I' },
        { label: 'Ziel', value: 'Gymnasium (DE)' },
        { label: 'Faecher', value: selectedSubjects || 'Mathematik, Physik, Chemie, Biologie, Französisch' },
      ]
    }

    if (!LEGACY_HESSEN_GYMNASIUM_UPPER_IDS.has(selectedCurriculum)) {
      return []
    }

    const inferCourseFilter = (landscapeId: string) => {
      const filterId = personalConfig[landscapeId]?.filterId
      if (filterId === 'LK') {
        return 'Leistungskurs'
      }
      if (filterId === 'ALL') {
        return 'Grund- und Leistungskurs'
      }
      return 'Grundkurs'
    }

    let mathSelected = selectedCurriculum === '2796fc7b-ba9d-446f-8f26-711dd6d8a9a3'
    let physicsSelected = selectedCurriculum === '24f2ca0f-b94a-444e-bb70-677cb6f85c02'
    let chemistrySelected = selectedCurriculum === '2f391ba2-ba1e-40e4-a8d2-dff049516c13'
    let biologySelected = selectedCurriculum === '3e56aa75-c76c-4de5-883b-0aac98297846'
    let informaticsSelected = selectedCurriculum === 'c1a02ddd-736d-4975-920b-18b03aff147f'
    let historySelected = selectedCurriculum === 'bdc89685-73d3-446c-af5a-eaf642c07463'
    let germanSelected = selectedCurriculum === 'f1ba2118-853f-4aa0-bef5-4f749bc621ed'
    let politicsEconomicsSelected = selectedCurriculum === '1d0e9f8f-0087-49e4-8ea2-976e5a89b165'
    let englishSelected = selectedCurriculum === 'bc2124fa-2974-46cc-85e7-2392e61250e1'
    let frenchSelected = selectedCurriculum === '30acd190-609c-4109-8ee7-06fc5594af19'
    let latinSelected = selectedCurriculum === 'fe28bda8-03f3-4c4a-8286-7fcfce4eeac1'
    let spanishSelected = selectedCurriculum === '936efc61-a4d5-49fd-8694-085d1347db80'
    let greekSelected = selectedCurriculum === 'c7209caa-18e5-4dd8-b68f-dd86e228d045'
    let chineseSelected = selectedCurriculum === '7651cbe2-5fb8-464d-b0c4-3e830cda41dd'
    let musicSelected = selectedCurriculum === 'a8c23058-6998-49f2-9f3b-a85e951d5ab0'
    let economicsSelected = selectedCurriculum === 'a334a745-1d67-4e1d-86a5-dadc04f144d2'

    if (selectedCurriculum === 'bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da') {
      mathSelected = personalConfig['2796fc7b-ba9d-446f-8f26-711dd6d8a9a3']?.selected === true
      physicsSelected = personalConfig['24f2ca0f-b94a-444e-bb70-677cb6f85c02']?.selected === true
      chemistrySelected = personalConfig['2f391ba2-ba1e-40e4-a8d2-dff049516c13']?.selected === true
      biologySelected = personalConfig['3e56aa75-c76c-4de5-883b-0aac98297846']?.selected === true
      informaticsSelected = personalConfig['c1a02ddd-736d-4975-920b-18b03aff147f']?.selected === true
      historySelected = personalConfig['bdc89685-73d3-446c-af5a-eaf642c07463']?.selected === true
      germanSelected = personalConfig['f1ba2118-853f-4aa0-bef5-4f749bc621ed']?.selected === true
      politicsEconomicsSelected = personalConfig['1d0e9f8f-0087-49e4-8ea2-976e5a89b165']?.selected === true
      englishSelected = personalConfig['bc2124fa-2974-46cc-85e7-2392e61250e1']?.selected === true
      frenchSelected = personalConfig['30acd190-609c-4109-8ee7-06fc5594af19']?.selected === true
      latinSelected = personalConfig['fe28bda8-03f3-4c4a-8286-7fcfce4eeac1']?.selected === true
      spanishSelected = personalConfig['936efc61-a4d5-49fd-8694-085d1347db80']?.selected === true
      greekSelected = personalConfig['c7209caa-18e5-4dd8-b68f-dd86e228d045']?.selected === true
      chineseSelected = personalConfig['7651cbe2-5fb8-464d-b0c4-3e830cda41dd']?.selected === true
      musicSelected = personalConfig['a8c23058-6998-49f2-9f3b-a85e951d5ab0']?.selected === true
      economicsSelected = personalConfig['a334a745-1d67-4e1d-86a5-dadc04f144d2']?.selected === true
      if (!mathSelected && !physicsSelected && !chemistrySelected && !biologySelected && !informaticsSelected && !historySelected && !germanSelected && !politicsEconomicsSelected && !englishSelected && !frenchSelected && !latinSelected && !spanishSelected && !greekSelected && !chineseSelected && !musicSelected && !economicsSelected) {
        mathSelected = true
        physicsSelected = true
        chemistrySelected = true
        biologySelected = true
        informaticsSelected = true
        historySelected = true
        germanSelected = true
        politicsEconomicsSelected = true
        englishSelected = true
        frenchSelected = true
        latinSelected = true
        spanishSelected = true
        greekSelected = true
        chineseSelected = true
        musicSelected = true
        economicsSelected = true
      }
    }

    const mathWasImplicitlyAdded = physicsSelected && !mathSelected
    if (physicsSelected) {
      mathSelected = true
    }
    if (!mathSelected && !physicsSelected && !chemistrySelected && !biologySelected && !informaticsSelected && !historySelected && !germanSelected && !politicsEconomicsSelected && !englishSelected && !frenchSelected && !latinSelected && !spanishSelected && !greekSelected && !chineseSelected && !musicSelected && !economicsSelected) {
      mathSelected = true
      chemistrySelected = true
      biologySelected = true
      informaticsSelected = true
      historySelected = true
      germanSelected = true
      politicsEconomicsSelected = true
      englishSelected = true
      frenchSelected = true
      latinSelected = true
      spanishSelected = true
      greekSelected = true
      chineseSelected = true
      musicSelected = true
      economicsSelected = true
    }

    const items: Array<{ label: string; value: string }> = [
      { label: 'Bundesland', value: 'Hessen -> Gymnasium (DE)' },
    ]

    if (mathSelected) {
      items.push({
        label: 'Mathematik',
        value: mathWasImplicitlyAdded
          ? `${inferCourseFilter('2796fc7b-ba9d-446f-8f26-711dd6d8a9a3')} (als Voraussetzung)`
          : inferCourseFilter('2796fc7b-ba9d-446f-8f26-711dd6d8a9a3'),
      })
    }

    if (physicsSelected) {
      items.push({
        label: 'Physik',
        value: inferCourseFilter('24f2ca0f-b94a-444e-bb70-677cb6f85c02'),
      })
    }

    if (chemistrySelected) {
      items.push({
        label: 'Chemie',
        value: inferCourseFilter('2f391ba2-ba1e-40e4-a8d2-dff049516c13'),
      })
    }

    if (biologySelected) {
      items.push({
        label: 'Biologie',
        value: inferCourseFilter('3e56aa75-c76c-4de5-883b-0aac98297846'),
      })
    }

    if (informaticsSelected) {
      items.push({
        label: 'Informatik',
        value: inferCourseFilter('c1a02ddd-736d-4975-920b-18b03aff147f'),
      })
    }

    if (historySelected) {
      items.push({
        label: 'Geschichte',
        value: inferCourseFilter('bdc89685-73d3-446c-af5a-eaf642c07463'),
      })
    }

    if (germanSelected) {
      items.push({
        label: 'Deutsch',
        value: inferCourseFilter('f1ba2118-853f-4aa0-bef5-4f749bc621ed'),
      })
    }

    if (politicsEconomicsSelected) {
      items.push({
        label: 'Politik und Wirtschaft',
        value: inferCourseFilter('1d0e9f8f-0087-49e4-8ea2-976e5a89b165'),
      })
    }

    if (englishSelected) {
      items.push({
        label: 'Englisch',
        value: inferCourseFilter('bc2124fa-2974-46cc-85e7-2392e61250e1'),
      })
    }

    if (frenchSelected) {
      items.push({
        label: 'Französisch',
        value: inferCourseFilter('30acd190-609c-4109-8ee7-06fc5594af19'),
      })
    }

    if (latinSelected) {
      items.push({
        label: 'Latein',
        value: inferCourseFilter('fe28bda8-03f3-4c4a-8286-7fcfce4eeac1'),
      })
    }

    if (spanishSelected) {
      items.push({
        label: 'Spanisch',
        value: inferCourseFilter('936efc61-a4d5-49fd-8694-085d1347db80'),
      })
    }

    if (greekSelected) {
      items.push({
        label: 'Griechisch',
        value: inferCourseFilter('c7209caa-18e5-4dd8-b68f-dd86e228d045'),
      })
    }

    if (chineseSelected) {
      items.push({
        label: 'Chinesisch',
        value: inferCourseFilter('7651cbe2-5fb8-464d-b0c4-3e830cda41dd'),
      })
    }

    if (musicSelected) {
      items.push({
        label: 'Musik',
        value: inferCourseFilter('a8c23058-6998-49f2-9f3b-a85e951d5ab0'),
      })
    }

    if (economicsSelected) {
      items.push({
        label: 'Wirtschaftswissenschaften',
        value: inferCourseFilter('a334a745-1d67-4e1d-86a5-dadc04f144d2'),
      })
    }

    return items
  }, [
    bavariaLegacyRetirementSubject,
    learnerData?.selectedCurriculum,
    personalConfig,
    isLowerLegacyRetirementOnly,
    lowerLegacySelection,
  ])


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
      setRefreshCounter(c => c + 1)
      setVelocityRefreshCounter(c => c + 1)
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
      // Increment counter to force CompetenceTree re-render
      setRefreshCounter(c => c + 1)
      setVelocityRefreshCounter(c => c + 1)
      console.log('[SSE] ✅ Refresh complete')
    } finally {
      fullRefreshInFlightRef.current = false
    }
  }, [refreshState, refreshPlanned, onRefresh, currentGoal?.id])

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


  // Auto-reveal when active goal changes (including from SSE updates)
  const prevActiveGoalIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (effectiveActiveGoalId && effectiveActiveGoalId !== prevActiveGoalIdRef.current) {
      console.log('[SSE] 🎯 Active goal changed, revealing:', effectiveActiveGoalId)
      revealActiveGoal()
    }
    prevActiveGoalIdRef.current = effectiveActiveGoalId
  }, [effectiveActiveGoalId, revealActiveGoal])


  // Load planned goals from backend
  React.useEffect(() => {
    if (!skillpilotId) return

    // fetchPlanned now handled by refreshPlanned
    refreshPlanned()
    refreshLearnerData()
  }, [skillpilotId, refreshPlanned, refreshLearnerData])

  const handleSetActiveGoal = useCallback(async (goalId: string) => {
    if (isCompatibilityAuditOnly) {
      setModalTitle(language === 'de' ? 'Nur Lesemodus' : 'Read-only mode')
      setModalMessage(
        language === 'de'
          ? 'In dieser Legacy-Ansicht koennen keine neuen aktiven Lernziele gesetzt werden. Bitte auf Gymnasium (DE) umstellen.'
          : 'You cannot set new active goals in this legacy view. Please migrate to Gymnasium (DE).',
      )
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
          const ancestors = new Set<string>()
          const queue = [targetId]
          while (queue.length > 0) {
            const current = queue.pop()!
            const parents = parentMap.get(current)
            if (parents) {
              parents.forEach((p) => {
                if (!ancestors.has(p)) {
                  ancestors.add(p)
                  queue.push(p)
                }
              })
            }
          }
          setForcedExpandedIds(ancestors)
        }
        if (targetId !== selectedId) {
          onSelectGoal(targetId)
        }
        onRefresh?.()
      } else {
        const message = await res.text()
        if (onNotify) {
          onNotify('error', message || t.notifications.activeGoalSetFailed)
        } else {
          setModalTitle(language === 'de' ? 'Aktion nicht möglich' : 'Action not allowed')
          setModalMessage(message || (language === 'de'
            ? 'Dieses Ziel ist nicht im aktuellen Frontier.'
            : 'This goal is not in the current frontier.'))
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
    language,
    onNotify,
    onRefresh,
    onSelectGoal,
    parentMap,
    selectedId,
    skillpilotId,
    t.notifications.activeGoalSetFailed,
    t.notifications.activeGoalSetSystemFailed,
  ])

  const togglePlan = useCallback(async (id: string) => {
    if (isCompatibilityAuditOnly) {
      setModalTitle(language === 'de' ? 'Nur Lesemodus' : 'Read-only mode')
      setModalMessage(
        language === 'de'
          ? 'Der Lernfokus kann in dieser Legacy-Ansicht nicht mehr veraendert werden. Bitte auf Gymnasium (DE) umstellen.'
          : 'Planned-goal changes are disabled in this legacy view. Please migrate to Gymnasium (DE).',
      )
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
    language,
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
      await refreshState(true)
    } catch (e) {
      console.warn('Failed to save personal curriculum', e)
      setPersonalConfig(previousConfig)
      onNotify?.('error', t.notifications.personalCurriculumSaveFailed)
    }
  }, [
    onNotify,
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
        setModalTitle(language === 'de' ? 'Umstellung fehlgeschlagen' : 'Migration failed')
        setModalMessage(
          message || (
            language === 'de'
              ? 'Die Umstellung auf Gymnasium (DE) konnte nicht durchgeführt werden.'
              : 'Could not migrate to Gymnasium (DE).'
          ),
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
      setRefreshCounter((count) => count + 1)
      setVelocityRefreshCounter((count) => count + 1)
      setIsSetupOpen(false)
      setModalTitle(language === 'de' ? 'Umstellung abgeschlossen' : 'Migration complete')
      setModalMessage(
        language === 'de'
          ? 'Dein Lernstand wurde auf Gymnasium (DE) umgestellt. Hessen bleibt als Kompatibilitaetsansicht erhalten, dein Mastery-Verlauf wird aber jetzt auf der gemeinsamen DE-Struktur weiter genutzt.'
          : 'Your learner state has been migrated to Gymnasium (DE). Hesse remains available as a compatibility view while your mastery history continues on the shared DE structure.',
      )
      setModalType('success')
      setIsModalOpen(true)
    } catch (e) {
      console.warn('Failed to cut over learner to canonical Gymnasium', e)
      setModalTitle(language === 'de' ? 'Umstellung fehlgeschlagen' : 'Migration failed')
      setModalMessage(
        language === 'de'
          ? 'Während der Umstellung ist ein Netzwerk- oder Systemfehler aufgetreten.'
          : 'A network or system error occurred during migration.',
      )
      setModalType('error')
      setIsModalOpen(true)
    } finally {
      setIsCutoverPending(false)
    }
  }, [skillpilotId, isCutoverPending, language, onLandscapeChange, onLandscapeGoalChange, refreshLearnerData, onRefresh])

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

  // Save preferences to backend
  const handlePreferencesChange = useCallback(async (strategy: 'RANDOM' | 'SEQUENTIAL', autoPilot: boolean, strictMode: boolean) => {
    const previousPreferences = learnerData
      ? {
          learningStrategy: learnerData.learningStrategy,
          autoPilot: learnerData.autoPilot,
          strictMode: learnerData.strictMode,
        }
      : null
    setLearnerData(prev => prev ? { ...prev, learningStrategy: strategy, autoPilot, strictMode } : null)

    if (!skillpilotId) return
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/preferences` : `/api/ui/learners/${skillpilotId}/preferences`
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learningStrategy: strategy, autoPilot, strictMode })
      })
      if (!res.ok) {
        throw new Error(`preferences-save-failed:${res.status}`)
      }
      // Refresh state to reflect strict mode changes in frontier
      await refreshState(true)
    } catch (e) {
      console.warn('Failed to save preferences', e)
      if (previousPreferences) {
        setLearnerData(prev => prev ? {
          ...prev,
          learningStrategy: previousPreferences.learningStrategy,
          autoPilot: previousPreferences.autoPilot,
          strictMode: previousPreferences.strictMode,
        } : prev)
      }
      onNotify?.('error', t.notifications.preferencesSaveFailed)
    }
  }, [learnerData, onNotify, refreshState, skillpilotId, t.notifications.preferencesSaveFailed])

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
          setModalTitle(language === 'de' ? 'Archivexport fehlgeschlagen' : 'Archive export failed')
          setModalMessage(
            message || (
              language === 'de'
                ? 'Das Kompatibilitaetsarchiv konnte nicht erstellt werden.'
                : 'Could not create the compatibility archive.'
            ),
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
        setModalTitle(language === 'de' ? 'Archiv erstellt' : 'Archive created')
        setModalMessage(
          language === 'de'
            ? 'Die eingefrorene Hessen-Kompatibilitaetsansicht wurde als Archiv exportiert.'
            : 'The frozen Hesse compatibility view was exported as an archive.',
        )
        setModalType('success')
        setIsModalOpen(true)
      }
    } catch (e) {
      console.error('Compatibility archive export error', e)
      if (onNotify) {
        onNotify('error', t.notifications.compatibilityArchiveExportFailed)
      } else {
        setModalTitle(language === 'de' ? 'Archivexport fehlgeschlagen' : 'Archive export failed')
        setModalMessage(
          language === 'de'
            ? 'Waehrend des Archivexports ist ein Netzwerk- oder Systemfehler aufgetreten.'
            : 'A network or system error occurred during archive export.',
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
    language,
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
        setRefreshCounter((count) => count + 1)
      } finally {
        srsCompletionInFlightRef.current.delete(goalId)
      }
    })()
  }, [currentGoal?.id, currentGoal?.tags, srsMasteryByGoal, refreshState, onRefresh, syncClientData])

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
            if (language === 'de') {
              notifyImportError(
                t.notifications.learnerImportValidationFailed,
                "Import-Validierung fehlgeschlagen",
              )
            } else {
              notifyImportError(
                t.notifications.learnerImportValidationFailed,
                "Import Validation Failed",
              )
            }
          } else {
            if (language === 'de') {
              notifyImportError(
                serverMsg || t.notifications.learnerImportFailed,
                "Import fehlgeschlagen",
              )
            } else {
              notifyImportError(
                serverMsg || t.notifications.learnerImportFailed,
                "Import Failed",
              )
            }
          }
        }
      } catch (err) {
        console.error("Import error", err);
        if (language === 'de') {
          if (onNotify) {
            onNotify('error', t.notifications.learnerImportSystemFailed)
          } else {
            setModalMessage("Ein Netzwerk- oder Systemfehler ist während des Imports aufgetreten.");
            setModalTitle("Import-Fehler");
            setModalType('error');
            setIsModalOpen(true);
          }
        } else {
          if (onNotify) {
            onNotify('error', t.notifications.learnerImportSystemFailed)
          } else {
            setModalMessage("A network or system error occurred during import.");
            setModalTitle("Import Error");
            setModalType('error');
            setIsModalOpen(true);
          }
        }
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [
    skillpilotId,
    language,
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
                  ? (language === 'de' ? 'Gehe zum markierten Scope' : 'Go to marked scope')
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
                refreshSignal={velocityRefreshCounter}
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
            {onShareContext && (
              <button
                onClick={onShareContext}
                className="p-1 text-text-secondary hover:text-sky-400"
                title={t.learner.shareContext}
                aria-label={t.learner.shareContext}
              >
                <Link2 size={16} />
              </button>
            )}
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
        {hasCompetencyStructure && (
          <div className="px-4 py-2 border-b border-border-color">
            <div className="text-[10px] uppercase tracking-wide text-text-secondary font-bold mb-2">
              {t.learner.structureMode}
            </div>
            <div className="inline-flex rounded-lg border border-border-color overflow-hidden bg-chat-bg/40">
              {([
                ['all', t.learner.structureAll],
                ['content', t.learner.structureContent],
                ['competency', t.learner.structureCompetencies],
              ] as const).map(([mode, label]) => {
                const isActive = structureMode === mode
                return (
                  <button
                    key={mode}
                    type="button"
                      onClick={() => onStructureModeChange(mode)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-sky-600 text-white'
                        : 'text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-2">
          {isPersonalConfigHydrating ? (
            <div className="p-8 text-center text-sm text-text-secondary">
              {t.learner.loadingGoals}
            </div>
          ) : (
            <CompetenceTree
              key={`competence-tree-${refreshCounter}-${structureMode}`}
              rootGoals={visibleRootGoals}
              allGoals={goalIndexAll}
              getMastery={getEffectiveMastery}
              plannedGoals={plannedGoals}
              onTogglePlan={togglePlan}
              readOnly={isCompatibilityAuditOnly}
              onSelect={onSelectGoal}
              selectedId={selectedId}
              activeFilter={effectiveActiveFilter}
              structureMode={structureMode}
              personalConfig={personalConfig}
              activeGoalId={effectiveActiveGoalId ?? undefined}
              forcedExpandedIds={forcedExpandedIds}
              frontierIds={frontierIds}
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
                      {isBavariaLegacyRetirementOnly
                        ? (language === 'de' ? 'Bayern-Lernstand erkannt' : 'Bavaria learner state detected')
                        : (language === 'de' ? 'Hessen-Lernstand erkannt' : 'Hesse learner state detected')}
                    </div>
                    <p className="mt-1 text-sm text-amber-900/90 dark:text-amber-100/90">
                      {isUpperLegacyHessenSession
                        ? (language === 'de'
                          ? 'Diese Hessen-Lernspur bleibt als eingefrorenes Kompatibilitaetsarchiv exportierbar. Fuer die gemeinsame DE-Struktur kannst du jetzt direkt auf Gymnasium (DE) umstellen, ohne deinen bisherigen Mastery-Verlauf zu verlieren.'
                          : 'This Hesse learner trail remains exportable as a frozen compatibility archive. You can now move directly to Gymnasium (DE) without losing your existing mastery history.')
                        : isBavariaLegacyRetirementOnly
                          ? (language === 'de'
                            ? `Diese Bayern-${bavariaLegacyRetirementSubject}-Lernspur laeuft jetzt als schreibgeschuetzte Legacy-Ansicht. Fuer die gemeinsame DE-Struktur kannst du direkt auf Gymnasium (DE) mit Filter DE-BY umstellen, ohne deinen bisherigen Mastery-Verlauf zu verlieren.`
                            : `This Bavaria ${bavariaLegacyRetirementSubjectEn ?? 'chemistry'} learner trail now runs as a read-only legacy view. You can move directly to Gymnasium (DE) with filter DE-BY without losing your existing mastery history.`)
                        : (language === 'de'
                          ? 'Diese Hessen-Sek-I-Lernspur laeuft jetzt als schreibgeschuetzte Legacy-Ansicht. Fuer die gemeinsame DE-Struktur kannst du direkt auf Gymnasium (DE) umstellen, ohne deinen bisherigen Mastery-Verlauf zu verlieren.'
                          : 'This Hesse lower-secondary learner trail now runs as a read-only legacy view. You can move directly to Gymnasium (DE) without losing your existing mastery history.')}
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
                          ? (language === 'de' ? 'Erstelle Archiv...' : 'Creating archive...')
                          : (language === 'de' ? 'Archiv herunterladen' : 'Download archive')}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsSetupOpen(true)}
                      className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/50"
                    >
                      {language === 'de' ? 'Migration' : 'Migration'}
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
                          ? (language === 'de' ? 'Stelle um...' : 'Migrating...')
                          : (language === 'de'
                            ? (isBavariaLegacyRetirementOnly
                              ? 'Auf Gymnasium (DE) mit DE-BY umstellen'
                              : 'Auf Gymnasium (DE) umstellen')
                            : (isBavariaLegacyRetirementOnly
                              ? 'Migrate to Gymnasium (DE) with DE-BY'
                              : 'Migrate to Gymnasium (DE)'))}
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
                      {language === 'de' ? 'Normale Hessen-Route beendet' : 'Normal Hesse route retired'}
                    </div>
                    <p className="mt-2 text-sm text-sky-900/90 dark:text-sky-100/90">
                      {language === 'de'
                        ? 'Diese Learner-Session wird nicht mehr als normale Arbeitsansicht ausgeliefert. Bitte stelle jetzt auf Gymnasium (DE) um oder lade das eingefrorene Hessen-Archiv fuer Audit- und Nachweiszwecke herunter.'
                        : 'This learner session is no longer served as a normal working route. Please migrate to Gymnasium (DE) now or download the frozen Hesse archive for audit and record-keeping.'}
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
                          ? (language === 'de' ? 'Stelle um...' : 'Migrating...')
                          : (language === 'de' ? 'Jetzt auf Gymnasium (DE) umstellen' : 'Migrate to Gymnasium (DE) now')}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCompatibilityArchiveDownload}
                      disabled={isCompatibilityArchivePending}
                      className="rounded-lg border border-sky-300 bg-white px-4 py-2 text-sm font-medium text-sky-900 transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-100 dark:hover:bg-sky-900/50"
                    >
                      {isCompatibilityArchivePending
                        ? (language === 'de' ? 'Erstelle Archiv...' : 'Creating archive...')
                        : (language === 'de' ? 'Archiv herunterladen' : 'Download archive')}
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
                      <InlineMathText text={currentGoal.title} />
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
                    titleOverride={currentGoal.title}
                    onSync={syncClientData}
                    reloadSignal={srsReloadCounter}
                    filterTags={getSrsFilterTagsForGoal(currentGoal)}
                    onStateChange={({ goalId, mastery }) => {
                      setOptimisticSrsMasteryByGoal((current) => {
                        if (current[goalId] === mastery) return current
                        return { ...current, [goalId]: mastery }
                      })
                      setSrsMasteryTick(c => c + 1)
                      setRefreshCounter(c => c + 1)
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
                  readOnly={isCompatibilityAuditOnly}
                  isPlanned={plannedGoals.has(currentGoal.id)}
                  isActive={effectiveActiveGoalId === currentGoal.id}
                  onSetActive={handleSetActiveGoal}
                  onRevealActive={revealActiveGoal}
                  isFrontier={backendFrontierIds.has(currentGoal.id)}
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
                            text={candidate.title}
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
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        availableLandscapes={availableLandscapes}
        currentLandscapeId={landscapeId}
        retirementOnly={canCutoverLegacyGymnasium}
        onConfigChange={handleConfigChange}
        initialConfig={personalConfig}
        rootLandscapeId={rootLandscapeId}
        initialStrategy={learnerData?.learningStrategy}
        initialAutoPilot={learnerData?.autoPilot}
        initialStrictMode={learnerData?.strictMode}
        onPreferencesChange={handlePreferencesChange}
        migrationTitle={canCutoverLegacyGymnasium ? 'Auf Gymnasium (DE) umstellen' : undefined}
        migrationDescription={canCutoverLegacyGymnasium
          ? (isUpperLegacyHessenSession
            ? 'Dein bisheriger Hessen-Lernstand bleibt erhalten und wird auf die gemeinsame DE-Struktur übernommen. Mathe, Physik, Chemie, Biologie, Informatik, Geschichte, Deutsch, Politik und Wirtschaft, Englisch, Französisch, Latein, Spanisch, Italienisch, Russisch, Polnisch, Tschechisch, Griechisch, Chinesisch, Musik und Wirtschaftswissenschaften laufen danach unter einem gemeinsamen Gymnasium-Root weiter.'
            : isBavariaLegacyRetirementOnly
              ? `Dein bisheriger Bayern-${bavariaLegacyRetirementSubject}-Lernstand bleibt erhalten und wird auf die gemeinsame DE-Struktur übernommen. ${bavariaLegacyRetirementSubject === 'Physik' ? 'Physik und die benoetigte Mathe-Bruecke' : bavariaLegacyRetirementSubject === 'Chemie' ? 'Chemie' : bavariaLegacyRetirementSubject === 'Biologie' ? 'Biologie' : bavariaLegacyRetirementSubject === 'Chinesisch' ? 'Chinesisch' : bavariaLegacyRetirementSubject === 'Informatik' ? 'Informatik' : bavariaLegacyRetirementSubject === 'Geschichte' ? 'Geschichte' : bavariaLegacyRetirementSubject === 'Deutsch' ? 'Deutsch' : bavariaLegacyRetirementSubject === 'Englisch' ? 'Englisch' : bavariaLegacyRetirementSubject === 'Französisch' ? 'Französisch' : bavariaLegacyRetirementSubject === 'Spanisch' ? 'Spanisch' : bavariaLegacyRetirementSubject === 'Italienisch' ? 'Italienisch' : bavariaLegacyRetirementSubject === 'Russisch' ? 'Russisch' : bavariaLegacyRetirementSubject === 'Polnisch' ? 'Polnisch' : bavariaLegacyRetirementSubject === 'Tschechisch' ? 'Tschechisch' : bavariaLegacyRetirementSubject === 'Griechisch' ? 'Griechisch' : bavariaLegacyRetirementSubject === 'Wirtschaft und Recht' ? 'Wirtschaftswissenschaften' : bavariaLegacyRetirementSubject === 'Politik und Gesellschaft' ? 'Politik und Wirtschaft' : bavariaLegacyRetirementSubject === 'Latein' ? 'Latein' : bavariaLegacyRetirementSubject === 'Musik' ? 'Musik' : 'Mathematik'} laufen danach unter dem gemeinsamen Gymnasium-Root mit Filter DE-BY weiter.`
              : 'Dein bisheriger Hessen-Sek-I-Lernstand bleibt erhalten und wird auf die gemeinsame DE-Struktur übernommen. Mathe, Physik, Chemie, Biologie und Französisch laufen danach unter einem gemeinsamen Gymnasium-Root weiter.')
          : undefined}
        migrationActionLabel={canCutoverLegacyGymnasium ? 'Jetzt umstellen' : undefined}
        migrationActionPending={isCutoverPending}
        onMigrationAction={canCutoverLegacyGymnasium ? handleCutoverCanonicalGymnasium : undefined}
        migrationPreviewItems={canCutoverLegacyGymnasium ? legacyCutoverPreviewItems : undefined}
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
