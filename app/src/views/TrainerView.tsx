import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CompetenceTree } from '../components/CompetenceTree'
import { GoalCard } from '../components/GoalCard'
import { NeighborSection } from '../components/NeighborSection'
import { ClassSetup } from '../components/ClassSetup'
import { ConfirmModal } from '../components/ConfirmModal'
import { InlineMathText } from '../components/InlineMathText'
import { LogoutButton } from '../components/LogoutButton'
import { useCompetenceGraph } from '../hooks/useCompetenceGraph'
import { useGoalIndex } from '../hooks/useGoalIndex'
import type { LandscapeEntry } from '../hooks/useLandscapes'
import type { UiGoal } from '../goalTypes'
import type { ClassSession } from '../trainerTypes'
import type { MasteryMap } from '../learnerTypes'

import { Pencil, Save, Trash2 } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { en } from '../locales/en'
import { de } from '../locales/de'
import type { ToastKind } from '../hooks/useToast'
import { interpolateTemplate } from '../utils/interpolateTemplate'
import { migrateTrainerClassSession } from '../utils/trainerLandscapeContext'
import { applyGoalPlacementProjection } from '../utils/goalPlacementProjection'
import { goalMatchesFilters, isWildcardFilter } from '../utils/goalFilters'
import {
  getGlobalStageScopeSelection,
  goalMatchesGlobalStageScope,
} from '../utils/personalCurriculumStageScope'
import { formatFilterDisplayLabel } from '../utils/filterLabels'
import { normalizeDurationModel } from '../utils/durationModel'
import { normalizeJurisdictionCode } from '../utils/jurisdictionMetadata'
import { isRepositoryGymnasiumFramework } from '../utils/curriculumDisplay'
import {
  applyCompositionViewProjection,
  applyMatchedCompositionRouteGoalProjection,
  deriveRuntimeCompositionScope,
} from '../utils/compositionViewRuntime'
import {
  normalizeCompositionView,
  type CompositionView,
} from '../utils/authoring/compositionViewAuthoring'
import { normalizeLearnerProjectedEntries } from '../utils/learnerTreeProjection'
import { buildDirectChildrenMap } from '../utils/treeProjectionRuntime'
import {
  findRuntimeRootLandscapeId,
  resolveLearnerRuntimeOfferingId,
  resolveRuntimeApiHref,
  type RuntimeCurriculumCatalogState,
} from '../utils/runtimeCurriculumCatalog'

const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
const toApi = (path: string) => (apiBase ? `${apiBase}${path}` : path)

interface TrainerViewProps {
  landscapeEntries: LandscapeEntry[]
  loadingLandscapes?: boolean
  runtimeCatalogState: RuntimeCurriculumCatalogState
  classSetupLandscapes?: LandscapeEntry[]
  classSetupRootLandscapeId?: string
  onContextChange: (
    landscapeId: string,
    filter: string,
    goalId: string | null | undefined,
    options?: { replace?: boolean },
  ) => void
  routeGoalId: string
  currentLearnerId: string
  onSelectLearner: (id: string) => void
  goalShortKeyMap: Map<string, string>
  onLogout?: () => void
  onNotify?: (kind: ToastKind, message: string) => void
}

interface TrainerCompositionRequest {
  key: string
  landscapeId: string
  url: string | null
}

type TrainerCompositionResolution =
  | { key: string; status: 'loading' }
  | { key: string; status: 'ready'; view: CompositionView }
  | { key: string; status: 'no-match' }
  | { key: string; status: 'error'; error: Error }

const loadStoredTrainerClasses = (): ClassSession[] => {
  try {
    const raw = localStorage.getItem('skillpilot_classes')
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    const migrated = parsed.map((session) => migrateTrainerClassSession(session))
    if (JSON.stringify(migrated) !== JSON.stringify(parsed)) {
      localStorage.setItem('skillpilot_classes', JSON.stringify(migrated))
    }
    return migrated
  } catch (err) {
    console.warn('Could not load classes', err)
    return []
  }
}

const loadStoredActiveClassId = (): string | null => {
  try {
    return localStorage.getItem('skillpilot_active_class')
  } catch (err) {
    console.warn('Could not load active class', err)
    return null
  }
}

export const TrainerView: React.FC<TrainerViewProps> = ({
  landscapeEntries,
  loadingLandscapes = false,
  runtimeCatalogState,
  classSetupLandscapes,
  classSetupRootLandscapeId,
  onContextChange,
  routeGoalId,
  currentLearnerId,
  onSelectLearner,
  goalShortKeyMap,
  onLogout,
  onNotify,
}) => {
  const { language } = useLanguage()
  const localizedLanguage = language === 'en' ? 'en' : 'de'
  const t = language === 'en' ? en.trainer : de.trainer
  const tExp = language === 'en' ? en.explorer : de.explorer
  const notifications = language === 'en' ? en.notifications : de.notifications
  const [classes, setClasses] = useState<ClassSession[]>(loadStoredTrainerClasses)
  const [activeClassId, setActiveClassId] = useState<string | null>(loadStoredActiveClassId)
  const [openingClassId, setOpeningClassId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editingClassId, setEditingClassId] = useState<string | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string>('')
  const [plannedGoals, setPlannedGoals] = useState<Set<string>>(new Set())
  const [masteryByStudent, setMasteryByStudent] = useState<Map<string, MasteryMap>>(new Map())
  const [plannedGoalsByStudent, setPlannedGoalsByStudent] = useState<Map<string, Set<string>>>(new Map())
  const [compositionResolution, setCompositionResolution] = useState<TrainerCompositionResolution | null>(null)
  const [compositionRetryToken, setCompositionRetryToken] = useState(0)
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean
    title: string
    message: React.ReactNode
    onConfirm: () => void
    confirmText?: string
    confirmClassName?: string
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  })
  const reportedLoadErrorsRef = useRef<Set<string>>(new Set())

  const setupLandscapeEntries = classSetupLandscapes ?? landscapeEntries
  const isClassSetupReady = !classSetupRootLandscapeId || setupLandscapeEntries.some(
    (entry) => entry.meta.landscapeId === classSetupRootLandscapeId,
  )
  const setupLandscapeById = useMemo(
    () => new Map(setupLandscapeEntries.map((entry) => [entry.meta.landscapeId, entry])),
    [setupLandscapeEntries],
  )
  const scopeCopy = useMemo(() => localizedLanguage === 'de'
    ? ({
        allJurisdictions: 'Alle Bundesländer',
        jurisdictionOpen: 'Bundesland offen',
        stageSek1: 'Sekundarstufe I',
        stageSek2: 'Sekundarstufe II',
        stageBoth: 'Sekundarstufe I + II',
        stageOpen: 'Sekundarstufe offen',
        durationOpen: 'G8/G9 offen',
        courseProfileOpen: 'Kursprofil offen',
        editTooltip: 'Klasse und Curriculum bearbeiten',
        setupLoading: 'Gymnasium-Auswahl wird geladen …',
        compositionLoading: 'Klassen-Curriculum wird geladen …',
        compositionUnavailable: 'Für diese Klassenauswahl konnte keine passende Curriculumansicht geladen werden.',
        compositionRetry: 'Erneut versuchen',
      })
    : {
        allJurisdictions: 'All federal states',
        jurisdictionOpen: 'Jurisdiction open',
        stageSek1: 'Lower secondary',
        stageSek2: 'Upper secondary',
        stageBoth: 'Lower + upper secondary',
        stageOpen: 'Secondary stage open',
        durationOpen: 'G8/G9 open',
        courseProfileOpen: 'Course profile open',
        editTooltip: 'Edit class and curriculum',
        setupLoading: 'Loading Gymnasium selection …',
        compositionLoading: 'Loading class curriculum …',
        compositionUnavailable: 'No matching curriculum view could be loaded for this class scope.',
        compositionRetry: 'Try again',
      }, [localizedLanguage])

  const getClassScopeDisplay = useCallback((session: ClassSession) => {
    const subjectEntry = setupLandscapeById.get(session.landscapeId)
      ?? landscapeEntries.find((entry) => entry.meta.landscapeId === session.landscapeId)
    const subjectLabel = subjectEntry?.meta.subject?.trim()
      || subjectEntry?.meta.title?.trim()
      || (localizedLanguage === 'de' ? 'Fach nicht zugeordnet' : 'Subject not assigned')
    const rootFilterId = session.rootLandscapeId
      ? session.personalConfig?.[session.rootLandscapeId]?.filterId
      : undefined
    const jurisdiction = normalizeJurisdictionCode(rootFilterId)
    const jurisdictionLabel = jurisdiction
      ? formatFilterDisplayLabel(jurisdiction, localizedLanguage)
      : rootFilterId?.trim().toUpperCase() === 'ALL'
        ? scopeCopy.allJurisdictions
        : scopeCopy.jurisdictionOpen
    const stageSelection = getGlobalStageScopeSelection(session.personalConfig ?? {}, {
      rootLandscapeId: session.rootLandscapeId,
      landscapeId: session.landscapeId,
    })
    const stageLabel = stageSelection.sek1Selected && stageSelection.sek2Selected
      ? scopeCopy.stageBoth
      : stageSelection.sek1Selected
        ? scopeCopy.stageSek1
        : stageSelection.sek2Selected
          ? scopeCopy.stageSek2
          : scopeCopy.stageOpen
    const durationModel = normalizeDurationModel(
      session.personalConfig?.[session.landscapeId]?.durationModel
        ?? (session.rootLandscapeId ? session.personalConfig?.[session.rootLandscapeId]?.durationModel : undefined),
    )
    const rawCourseProfile = session.personalConfig?.[session.landscapeId]?.filterId
      ?? session.activeFilter
    const normalizedCourseProfile = rawCourseProfile?.trim().toUpperCase()
    const courseProfile = normalizedCourseProfile === 'GK'
      || normalizedCourseProfile === 'LK'
      || normalizedCourseProfile === 'GK+LK'
      ? normalizedCourseProfile
      : null

    return {
      subjectLabel,
      badges: [
        jurisdictionLabel,
        stageLabel,
        durationModel ?? scopeCopy.durationOpen,
        ...(stageSelection.sek2Selected
          ? [courseProfile ? formatFilterDisplayLabel(courseProfile, localizedLanguage) : scopeCopy.courseProfileOpen]
          : []),
      ],
    }
  }, [landscapeEntries, localizedLanguage, scopeCopy, setupLandscapeById])

  const notifyLoadErrorOnce = useCallback((key: string, message: string) => {
    if (!onNotify) return
    if (reportedLoadErrorsRef.current.has(key)) return
    reportedLoadErrorsRef.current.add(key)
    onNotify('error', message)
  }, [onNotify])

  const clearReportedLoadError = useCallback((key: string) => {
    reportedLoadErrorsRef.current.delete(key)
  }, [])

  // --- DERIVED STATE & MEMOS ---
  const aggregatedPlannedGoals = useMemo(() => {
    if (currentLearnerId !== '__ALL__' || plannedGoalsByStudent.size === 0) return undefined
    const result = new Map<string, number>()
    plannedGoalsByStudent.forEach((plannedSet) => {
      plannedSet.forEach((goalId) => {
        result.set(goalId, (result.get(goalId) ?? 0) + 1)
      })
    })
    return result
  }, [currentLearnerId, plannedGoalsByStudent])

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === activeClassId) ?? null,
    [activeClassId, classes],
  )
  // A remembered class does not reopen itself on /trainer. The route (or an
  // explicit class click still resolving its root goal) owns the visible view.
  const activeClass = useMemo(() => {
    if (!routeGoalId && openingClassId !== activeClassId) {
      return null
    }
    return selectedClass
  }, [activeClassId, openingClassId, routeGoalId, selectedClass])
  const activeClassRootFilterId = useMemo(() => {
    if (!activeClass?.rootLandscapeId) return undefined
    return activeClass.personalConfig?.[activeClass.rootLandscapeId]?.filterId
  }, [activeClass])
  const activeClassRootDurationModel = useMemo(() => {
    if (!activeClass?.rootLandscapeId) return undefined
    return normalizeDurationModel(activeClass.personalConfig?.[activeClass.rootLandscapeId]?.durationModel) ?? undefined
  }, [activeClass])
  const activeClassLandscapeFilterId = useMemo(() => {
    if (!activeClass) return undefined
    return activeClass.personalConfig?.[activeClass.landscapeId]?.filterId
  }, [activeClass])
  const activeClassLandscapeDurationModel = useMemo(() => {
    if (!activeClass) return undefined
    return normalizeDurationModel(activeClass.personalConfig?.[activeClass.landscapeId]?.durationModel)
  }, [activeClass])
  const activeClassSourceLandscapeEntry = useMemo(
    () => landscapeEntries.find((entry) => entry.meta.landscapeId === activeClass?.landscapeId) ?? null,
    [activeClass?.landscapeId, landscapeEntries],
  )
  const activeClassPersonalCurriculum = useMemo(
    () => activeClass
      ? JSON.stringify({ personalCurriculum: activeClass.personalConfig ?? {} })
      : null,
    [activeClass],
  )
  const trainerContextFilter = useMemo(() => {
    if (activeClassRootFilterId && !isWildcardFilter(activeClassRootFilterId)) {
      return activeClassRootFilterId
    }
    if (activeClassLandscapeFilterId && !isWildcardFilter(activeClassLandscapeFilterId)) {
      return activeClassLandscapeFilterId
    }
    if (activeClass?.activeFilter && !isWildcardFilter(activeClass.activeFilter)) {
      return activeClass.activeFilter
    }
    return 'all'
  }, [activeClass, activeClassLandscapeFilterId, activeClassRootFilterId])
  const activeClassFilterIds = useMemo(() => {
    if (!activeClass) return [] as string[]
    const next = new Set<string>()
    if (activeClassRootFilterId && !isWildcardFilter(activeClassRootFilterId)) {
      next.add(activeClassRootFilterId)
    }
    if (activeClassLandscapeFilterId && !isWildcardFilter(activeClassLandscapeFilterId)) {
      next.add(activeClassLandscapeFilterId)
    }
    const durationModel = activeClassLandscapeDurationModel ?? activeClassRootDurationModel
    if (durationModel) {
      next.add(durationModel)
    }
    if (next.size === 0 && activeClass.activeFilter && !isWildcardFilter(activeClass.activeFilter)) {
      next.add(activeClass.activeFilter)
    }
    return Array.from(next)
  }, [activeClass, activeClassLandscapeDurationModel, activeClassLandscapeFilterId, activeClassRootDurationModel, activeClassRootFilterId])
  const trainerCompositionRequest = useMemo<TrainerCompositionRequest | null>(() => {
    if (!activeClass || !activeClassPersonalCurriculum) return null
    if (runtimeCatalogState.mode === 'loading' || runtimeCatalogState.mode === 'unavailable') return null

    const packageRootLandscapeId = runtimeCatalogState.mode === 'package'
      ? findRuntimeRootLandscapeId(runtimeCatalogState.catalog, activeClass.landscapeId)
      : undefined
    const rootLandscapeId = packageRootLandscapeId ?? activeClass.rootLandscapeId
    const scope = deriveRuntimeCompositionScope({
      landscapeId: activeClass.landscapeId,
      rootLandscapeId,
      scopeEnabled: runtimeCatalogState.mode === 'package'
        || isRepositoryGymnasiumFramework(activeClassSourceLandscapeEntry?.meta.frameworkId),
      catalogJurisdictions: runtimeCatalogState.mode === 'package'
        ? runtimeCatalogState.catalog.offerings
            .filter((offering) => offering.landscapeId === activeClass.landscapeId)
            .map((offering) => offering.scope.jurisdiction)
            .filter((jurisdiction): jurisdiction is string => typeof jurisdiction === 'string')
        : undefined,
      activeFilter: activeClass.activeFilter,
      learnerPersonalCurriculum: activeClassPersonalCurriculum,
    })

    if (runtimeCatalogState.mode === 'repository') {
      if (!scope) return null
      const params = new URLSearchParams({
        landscapeId: scope.landscapeId,
        schoolForm: scope.schoolForm ?? '',
        jurisdiction: scope.jurisdiction ?? '',
        stage: scope.stage ?? '',
        courseProfile: scope.courseProfile ?? '',
        durationModel: scope.durationModel ?? '',
      })
      const url = `/api/ui/composition-views/match?${params.toString()}`
      return {
        key: `repository:${url}`,
        landscapeId: activeClass.landscapeId,
        url,
      }
    }

    const catalogLandscape = runtimeCatalogState.catalog.landscapes.find(
      (candidate) => candidate.landscapeId === activeClass.landscapeId,
    )
    if (!catalogLandscape) return null
    const hasOfferings = runtimeCatalogState.catalog.offerings.some(
      (candidate) => candidate.landscapeId === activeClass.landscapeId,
    )
    if (!hasOfferings && !catalogLandscape.defaultOfferingId) return null

    const requestedScope = scope
      ? Object.entries(scope).reduce<Record<string, string>>((result, [key, value]) => {
          if (key !== 'landscapeId' && typeof value === 'string' && value.length > 0) {
            result[key] = value
          }
          return result
        }, {})
      : null
    const offeringId = resolveLearnerRuntimeOfferingId(
      runtimeCatalogState.catalog,
      activeClass.landscapeId,
      requestedScope,
    )
    const scopeKey = new URLSearchParams(requestedScope ?? {}).toString()
    if (!offeringId) {
      return {
        key: `package:no-offering:${activeClass.landscapeId}:${scopeKey}`,
        landscapeId: activeClass.landscapeId,
        url: null,
      }
    }
    const href = `/api/ui/composition-views/offerings/${encodeURIComponent(offeringId)}`
    const url = resolveRuntimeApiHref(runtimeCatalogState.apiBase, href)
    return {
      key: `package:${url}`,
      landscapeId: activeClass.landscapeId,
      url,
    }
  }, [
    activeClass,
    activeClassPersonalCurriculum,
    activeClassSourceLandscapeEntry?.meta.frameworkId,
    runtimeCatalogState,
  ])
  const trainerCompositionRequestKey = trainerCompositionRequest?.key ?? null
  const trainerCompositionRequestLandscapeId = trainerCompositionRequest?.landscapeId ?? null
  const trainerCompositionRequestUrl = trainerCompositionRequest?.url ?? null

  useEffect(() => {
    if (!trainerCompositionRequestKey || !trainerCompositionRequestLandscapeId) {
      setCompositionResolution(null)
      return
    }

    const requestKey = trainerCompositionRequestKey
    const requestLandscapeId = trainerCompositionRequestLandscapeId
    if (!trainerCompositionRequestUrl) {
      setCompositionResolution({
        key: requestKey,
        status: 'error',
        error: new Error(`No curriculum offering matches ${requestLandscapeId}`),
      })
      return
    }

    const controller = new AbortController()
    const signal = controller.signal
    setCompositionResolution({ key: requestKey, status: 'loading' })
    void fetch(trainerCompositionRequestUrl, { signal })
      .then(async (response) => {
        if (response.status === 204) {
          return null
        }
        if (!response.ok) {
          throw new Error(`Failed to load composition view for ${requestLandscapeId} (${response.status})`)
        }
        const view = normalizeCompositionView(await response.json())
        if (view.landscapeId !== requestLandscapeId) {
          throw new Error(`Composition view landscape mismatch for ${requestLandscapeId}`)
        }
        return view
      })
      .then((view) => {
        if (signal.aborted) return
        setCompositionResolution(view
          ? { key: requestKey, status: 'ready', view }
          : { key: requestKey, status: 'no-match' })
      })
      .catch((error) => {
        if (signal.aborted) return
        console.warn('[TrainerView] Failed to load matching class composition view', error)
        setCompositionResolution({
          key: requestKey,
          status: 'error',
          error: error instanceof Error ? error : new Error('Failed to load composition view'),
        })
      })

    return () => controller.abort()
  }, [
    compositionRetryToken,
    trainerCompositionRequestKey,
    trainerCompositionRequestLandscapeId,
    trainerCompositionRequestUrl,
  ])

  const currentCompositionResolution = trainerCompositionRequest
    && compositionResolution?.key === trainerCompositionRequest.key
    ? compositionResolution
    : null
  const isTrainerCompositionPending = !!trainerCompositionRequest
    && (!currentCompositionResolution || currentCompositionResolution.status === 'loading')
  const isTrainerCompositionUnavailable = !!trainerCompositionRequest
    && !!currentCompositionResolution
    && (currentCompositionResolution.status === 'no-match' || currentCompositionResolution.status === 'error')
  const matchedTrainerCompositionView = currentCompositionResolution?.status === 'ready'
    ? currentCompositionResolution.view
    : null
  const placementProjectedTrainerLandscapeEntries = useMemo(
    () => applyGoalPlacementProjection(landscapeEntries, activeClassFilterIds),
    [activeClassFilterIds, landscapeEntries],
  )
  const projectedTrainerLandscapeEntries = useMemo(() => {
    if (!trainerCompositionRequest) {
      return placementProjectedTrainerLandscapeEntries
    }
    if (!matchedTrainerCompositionView) {
      return [] as LandscapeEntry[]
    }

    const placementByLandscapeId = new Map(
      placementProjectedTrainerLandscapeEntries.map((entry) => [entry.meta.landscapeId, entry] as const),
    )
    const compositionSourceEntries = landscapeEntries.map((entry) => (
      entry.meta.landscapeId === trainerCompositionRequest.landscapeId
        ? entry
        : placementByLandscapeId.get(entry.meta.landscapeId) ?? entry
    ))
    const compositionProjectedEntries = applyCompositionViewProjection(
      compositionSourceEntries,
      matchedTrainerCompositionView,
    )
    const routeProjectedEntries = applyMatchedCompositionRouteGoalProjection(
      compositionProjectedEntries,
      routeGoalId,
    )
    return routeProjectedEntries.map((entry) => normalizeLearnerProjectedEntries([entry])[0] ?? entry)
  }, [
    landscapeEntries,
    matchedTrainerCompositionView,
    placementProjectedTrainerLandscapeEntries,
    routeGoalId,
    trainerCompositionRequest,
  ])
  const activeLandscapeEntry = useMemo(
    () => projectedTrainerLandscapeEntries.find((entry) => entry.meta.landscapeId === activeClass?.landscapeId) ?? null,
    [activeClass, projectedTrainerLandscapeEntries],
  )
  const classAllGoals = useMemo(
    () => projectedTrainerLandscapeEntries.flatMap((entry) => entry.goals),
    [projectedTrainerLandscapeEntries],
  )
  const { goalIndexAll: classGoalIndexAll } = useGoalIndex(classAllGoals)
  const trainerVisibleChildrenByParent = useMemo(
    () => matchedTrainerCompositionView ? buildDirectChildrenMap(classGoalIndexAll) : undefined,
    [classGoalIndexAll, matchedTrainerCompositionView],
  )
  const trainerCompositionTargetGoalIds = useMemo(() => {
    if (!matchedTrainerCompositionView || !activeLandscapeEntry) return null

    const targetGoalIds = new Set<string>()
    const pendingGoalIds = activeLandscapeEntry.goals
      .filter((goal) => (goal.tags ?? []).includes('root'))
      .map((goal) => goal.id)
    while (pendingGoalIds.length > 0) {
      const goalId = pendingGoalIds.pop()
      if (!goalId || targetGoalIds.has(goalId)) continue
      const goal = classGoalIndexAll.get(goalId)
      if (!goal) continue
      targetGoalIds.add(goalId)
      ;(goal.contains ?? []).forEach((childId) => {
        if (!targetGoalIds.has(childId)) pendingGoalIds.push(childId)
      })
    }
    return targetGoalIds
  }, [activeLandscapeEntry, classGoalIndexAll, matchedTrainerCompositionView])
  const goalMatchesActiveClassConfig = useCallback((goal: UiGoal | null | undefined) => {
    if (!goal) return false
    if (!activeClass) return true
    if (trainerCompositionTargetGoalIds) {
      return trainerCompositionTargetGoalIds.has(goal.id)
    }
    if (!goalMatchesGlobalStageScope(
      goal,
      activeClass.personalConfig ?? {},
      { rootLandscapeId: activeClass.rootLandscapeId },
    )) {
      return false
    }
    return goalMatchesFilters(goal, activeClassFilterIds)
  }, [activeClass, activeClassFilterIds, trainerCompositionTargetGoalIds])
  const classRootGoals = useMemo(() => {
    if (!activeClass) {
      return [] as UiGoal[]
    }

    const entryRoots = (activeLandscapeEntry?.goals ?? []).filter((goal) => (goal.tags ?? []).includes('root'))
    if (entryRoots.length > 0) {
      return entryRoots
    }

    const directLandscapeRoots = Array.from(classGoalIndexAll.values()).filter(
      (goal) =>
        goal.landscapeId === activeClass.landscapeId &&
        (goal.tags ?? []).includes('root'),
    )

    if (directLandscapeRoots.length > 0) {
      return directLandscapeRoots
    }

    return (activeLandscapeEntry?.goals ?? []).filter((goal) => goal.landscapeId === activeClass.landscapeId && goal.contains.length > 0)
  }, [activeClass, activeLandscapeEntry, classGoalIndexAll])
  const landscapeGoals = useMemo(
    () => Array.from(classGoalIndexAll.values()).filter((g) => !activeClass || g.landscapeId === activeClass.landscapeId),
    [activeClass, classGoalIndexAll],
  )
  const currentGoal = useMemo(() => {
    const routeGoal = routeGoalId ? classGoalIndexAll.get(routeGoalId) : undefined
    if (
      routeGoal &&
      (!activeClass || routeGoal.landscapeId === activeClass.landscapeId) &&
      goalMatchesActiveClassConfig(routeGoal)
    ) {
      return routeGoal
    }
    const goal = selectedGoalId ? classGoalIndexAll.get(selectedGoalId) : undefined
    if (goal && (!activeClass || goal.landscapeId === activeClass.landscapeId) && goalMatchesActiveClassConfig(goal)) return goal
    return classGoalIndexAll.get(classRootGoals[0]?.id ?? '') ?? null
  }, [activeClass, classGoalIndexAll, classRootGoals, goalMatchesActiveClassConfig, routeGoalId, selectedGoalId])

  const { neighbors } = useCompetenceGraph(currentGoal, landscapeGoals)
  const filteredNeighbors = useMemo(
    () => ({
      containers: neighbors.containers.filter(goalMatchesActiveClassConfig),
      children: neighbors.children.filter(goalMatchesActiveClassConfig),
      requires: neighbors.requires.filter(goalMatchesActiveClassConfig),
      inheritedRequires: neighbors.inheritedRequires.filter(goalMatchesActiveClassConfig),
      effectiveRequires: neighbors.effectiveRequires.filter(goalMatchesActiveClassConfig),
      directForward: neighbors.directForward.filter(goalMatchesActiveClassConfig),
      inheritedForward: neighbors.inheritedForward.filter(goalMatchesActiveClassConfig),
      forward: neighbors.forward.filter(goalMatchesActiveClassConfig),
    }),
    [goalMatchesActiveClassConfig, neighbors],
  )

  // --- MASTERY CALCULATION ---
  const masteryCache = useMemo(() => new Map<string, { masterySum: number; weightSum: number }>(), [])
  const getStudentMastery = useCallback(
    (goalId: string): number => {
      // For __ALL__ students view, studentMasteryMap will not be directly used at this top level
      // The aggregated logic will be handled inside getMasteryRecursive
      const studentMasteryMap = masteryByStudent.get(currentLearnerId)
      if (currentLearnerId !== '__ALL__' && !studentMasteryMap) return 0

      const getMasteryRecursive = (gId: string, visited: Set<string> = new Set()): { masterySum: number; weightSum: number } => {
        if (masteryCache.has(gId)) return masteryCache.get(gId)!
        if (visited.has(gId)) return { masterySum: 0, weightSum: 0 } // Circular dependency

        visited.add(gId)
        const goal = classGoalIndexAll.get(gId)
        if (!goal) return { masterySum: 0, weightSum: 0 }

        let masterySum = 0
        let weightSum = 0

        if (!goal.contains || goal.contains.length === 0) {
          let masteryValue = 0
          if (currentLearnerId === '__ALL__') {
            const key = goalShortKeyMap.get(gId)
            if (!key) return { masterySum: 0, weightSum: 0 }
            let totalMasteryForGoal = 0
            let studentsCounted = 0
            masteryByStudent.forEach((studentMap) => {
              const studentMastery = studentMap[key] ?? 0
              totalMasteryForGoal += studentMastery
              studentsCounted++
            })
            masteryValue = studentsCounted > 0 ? totalMasteryForGoal / studentsCounted : 0
          } else {
            // Existing logic for single student view
            const key = goalShortKeyMap.get(gId)
            masteryValue = key ? studentMasteryMap?.[key] ?? 0 : 0
          }
          const weight = goal.weight ?? 1
          masterySum = masteryValue * weight
          weightSum = weight
        } else {
          goal.contains.forEach((childId) => {
            const childGoal = classGoalIndexAll.get(childId)
            if (childGoal) {
              const childTotals = getMasteryRecursive(childId, new Set(visited))
              masterySum += childTotals.masterySum
              weightSum += childTotals.weightSum
            }
          })
        }
        masteryCache.set(gId, { masterySum, weightSum })
        return { masterySum, weightSum }
      }
      const totals = getMasteryRecursive(goalId)
      return totals.weightSum > 0 ? totals.masterySum / totals.weightSum : 0
    },
    [classGoalIndexAll, currentLearnerId, masteryByStudent, goalShortKeyMap, masteryCache],
  )

  const persistClasses = useCallback((items: ClassSession[]) => {
    setClasses(items)
    try {
      localStorage.setItem('skillpilot_classes', JSON.stringify(items))
      return true
    } catch (err) {
      console.warn('Could not save classes', err)
      onNotify?.('error', notifications.trainerClassSaveFailed)
      return false
    }
  }, [notifications.trainerClassSaveFailed, onNotify])


  // --- EFFECTS ---
  // Browser Back/Forward is authoritative for both the visible and persisted goal.
  useEffect(() => {
    if (!activeClass || !routeGoalId || isTrainerCompositionPending || isTrainerCompositionUnavailable) return

    const routeGoal = classGoalIndexAll.get(routeGoalId)
    const routeGoalIsValid =
      routeGoal?.landscapeId === activeClass.landscapeId &&
      goalMatchesActiveClassConfig(routeGoal)

    if (!routeGoalIsValid) {
      const fallbackGoalId = classRootGoals[0]?.id
      if (fallbackGoalId && fallbackGoalId !== routeGoalId) {
        onContextChange(
          activeClass.landscapeId,
          trainerContextFilter,
          fallbackGoalId,
          { replace: true },
        )
      } else if (!fallbackGoalId) {
        onContextChange(
          activeClass.landscapeId,
          trainerContextFilter,
          undefined,
          { replace: true },
        )
      }
      return
    }

    setSelectedGoalId((current) => current === routeGoalId ? current : routeGoalId)
    if (activeClass.currentGoalId !== routeGoalId) {
      persistClasses(classes.map((session) =>
        session.id === activeClass.id
          ? { ...session, currentGoalId: routeGoalId }
          : session,
      ))
    }
  }, [
    activeClass,
    classGoalIndexAll,
    classRootGoals,
    classes,
    goalMatchesActiveClassConfig,
    isTrainerCompositionPending,
    isTrainerCompositionUnavailable,
    onContextChange,
    persistClasses,
    routeGoalId,
    trainerContextFilter,
  ])

  useEffect(() => {
    if (
      !activeClass
      || openingClassId !== activeClass.id
      || isTrainerCompositionPending
      || isTrainerCompositionUnavailable
    ) return

    const persistedGoal = activeClass.currentGoalId
      ? classGoalIndexAll.get(activeClass.currentGoalId)
      : undefined
    const persistedGoalIsValid =
      persistedGoal?.landscapeId === activeClass.landscapeId &&
      goalMatchesActiveClassConfig(persistedGoal)
    const targetGoalId = persistedGoalIsValid
      ? persistedGoal.id
      : classRootGoals[0]?.id
    if (!targetGoalId) {
      onContextChange(
        activeClass.landscapeId,
        trainerContextFilter,
        undefined,
        { replace: true },
      )
      return
    }

    onContextChange(activeClass.landscapeId, trainerContextFilter, targetGoalId)
  }, [
    activeClass,
    classGoalIndexAll,
    classRootGoals,
    goalMatchesActiveClassConfig,
    isTrainerCompositionPending,
    isTrainerCompositionUnavailable,
    onContextChange,
    openingClassId,
    trainerContextFilter,
  ])

  useEffect(() => {
    if (routeGoalId && openingClassId) {
      setOpeningClassId(null)
    }
  }, [openingClassId, routeGoalId])

  useEffect(() => {
    if (classes.length === 0) {
      return
    }
    clearReportedLoadError('trainer-class-list-load')
  }, [classes.length, clearReportedLoadError])

  useEffect(() => {
    if (!activeClassId) {
      return
    }
    if (classes.some((session) => session.id === activeClassId)) {
      return
    }
    setActiveClassId(classes[0]?.id ?? null)
  }, [activeClassId, classes])

  useEffect(() => {
    try {
      if (activeClassId) {
        localStorage.setItem('skillpilot_active_class', activeClassId)
      } else {
        localStorage.removeItem('skillpilot_active_class')
      }
    } catch (err) {
      console.warn('Could not save active class', err)
      onNotify?.('error', notifications.trainerClassSaveFailed)
    }
  }, [activeClassId, notifications.trainerClassSaveFailed, onNotify])

  useEffect(() => {
    clearReportedLoadError('trainer-class-data-load')
  }, [activeClassId, clearReportedLoadError])

  useEffect(() => {
    if (!activeClass) return
    if (!activeClass.students.find((s) => s.id === currentLearnerId) && currentLearnerId !== '__ALL__') {
      onSelectLearner('__ALL__')
    }
  }, [activeClass, currentLearnerId, onSelectLearner])

  useEffect(() => {
    if (!activeClass) return
    const fetchAllData = async () => {
      let hadDataLoadFailure = false
      const masteryPromises = activeClass.students.map(async (student) => {
        try {
          const res = await fetch(toApi(`/api/ui/learners/${encodeURIComponent(student.id)}/mastery`))
          if (res.ok) {
            const data = await res.json()
            if (data && data.mastery) return [student.id, data.mastery] as const
          } else {
            hadDataLoadFailure = true
          }
        } catch (err) {
          console.warn(`Could not load mastery for ${student.name}`, err)
          hadDataLoadFailure = true
        }
        return [student.id, {}] as const
      })
      const plannedGoalsPromises = activeClass.students.map(async (student) => {
        try {
          const res = await fetch(toApi(`/api/ui/learners/${encodeURIComponent(student.id)}/planned`))
          if (res.ok) {
            const data = await res.json()
            if (data && Array.isArray(data.goals)) return [student.id, new Set<string>(data.goals as string[])] as const
          } else {
            hadDataLoadFailure = true
          }
        } catch (err) {
          console.warn(`Could not load planned goals for ${student.name}`, err)
          hadDataLoadFailure = true
        }
        return [student.id, new Set()] as const
      })
      const [masteryResults, plannedGoalsResults] = await Promise.all([
        Promise.all(masteryPromises),
        Promise.all(plannedGoalsPromises),
      ])
      setMasteryByStudent(new Map(masteryResults))
      setPlannedGoalsByStudent(new Map<string, Set<string>>(plannedGoalsResults as [string, Set<string>][]))
      if (hadDataLoadFailure) {
        notifyLoadErrorOnce('trainer-class-data-load', notifications.trainerClassDataLoadFailed)
      } else {
        clearReportedLoadError('trainer-class-data-load')
      }
    }
    void fetchAllData()
  }, [activeClass, clearReportedLoadError, notifications.trainerClassDataLoadFailed, notifyLoadErrorOnce])

  useEffect(() => {
    if (currentLearnerId && currentLearnerId !== '__ALL__') {
      setPlannedGoals(plannedGoalsByStudent.get(currentLearnerId) ?? new Set())
    } else {
      setPlannedGoals(new Set())
    }
  }, [currentLearnerId, plannedGoalsByStudent])

  // --- HANDLERS ---
  const handleOpenClass = (session: ClassSession) => {
    setOpeningClassId(session.id)
    setSelectedGoalId(session.currentGoalId ?? '')
    setActiveClassId(session.id)
  }

  const handleShowAllClasses = () => {
    setOpeningClassId(null)
    setSelectedGoalId('')
    onContextChange(activeClass?.landscapeId ?? '', trainerContextFilter, null)
  }

  const handleSelectGoal = (id: string) => {
    if (!activeClass || id === routeGoalId) return
    onContextChange(activeClass.landscapeId, trainerContextFilter, id)
  }

  const handleTogglePlan = async (goalId: string) => {
    if (!currentLearnerId || currentLearnerId === '__ALL__') return
    const previousPlannedGoals = plannedGoals
    const next = new Set(plannedGoals)
    if (next.has(goalId)) next.delete(goalId)
    else next.add(goalId)
    setPlannedGoals(next)
    setPlannedGoalsByStudent((current) => new Map(current).set(currentLearnerId, next))
    try {
      const res = await fetch(toApi(`/api/ui/learners/${encodeURIComponent(currentLearnerId)}/planned`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals: Array.from(next) }),
      })
      if (!res.ok) {
        throw new Error(`Unexpected status ${res.status}`)
      }
      const data = await res.json()
      const persistedGoals = data && Array.isArray(data.goals)
        ? new Set<string>(data.goals as string[])
        : next
      setPlannedGoalsByStudent((current) =>
        new Map(current).set(currentLearnerId, persistedGoals))
    } catch (err) {
      console.warn('Could not save learning plan', err)
      setPlannedGoalsByStudent((current) =>
        new Map(current).set(currentLearnerId, previousPlannedGoals))
      onNotify?.('error', notifications.trainerPlannedGoalSaveFailed)
    }
  }

  const handleTogglePlanForAll = async (goalId: string) => {
    if (!activeClass) return
    const goal = classGoalIndexAll.get(goalId)
    if (!goal) return

    const plannedCount = aggregatedPlannedGoals?.get(goalId) ?? 0
    const isRemoving = plannedCount > 0

    const doToggle = async () => {
      setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => { } })
      setIsAssigning(true)
      try {
        await Promise.all(
          activeClass.students.map(async (student) => {
            const studentGoals = plannedGoalsByStudent.get(student.id) ?? new Set()
            const hasGoal = studentGoals.has(goalId)
            let newGoals: Set<string> | null = null
            if (isRemoving) {
              if (hasGoal) {
                newGoals = new Set(studentGoals)
                newGoals.delete(goalId)
              }
            } else if (!hasGoal) {
              newGoals = new Set(studentGoals)
              newGoals.add(goalId)
            }
            if (newGoals) {
              const res = await fetch(toApi(`/api/ui/learners/${encodeURIComponent(student.id)}/planned`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goals: Array.from(newGoals) }),
              })
              if (!res.ok) {
                throw new Error(`Unexpected status ${res.status} while saving planned goals for ${student.id}`)
              }
            }
          }),
        )
        const plannedGoalsPromises = activeClass.students.map(async (student) => {
          try {
            const res = await fetch(toApi(`/api/ui/learners/${encodeURIComponent(student.id)}/planned`))
            if (res.ok) {
              const data = await res.json()
              if (data && Array.isArray(data.goals)) return [student.id, new Set(data.goals)] as const
            }
            throw new Error(`Unexpected status ${res.status} while loading planned goals for ${student.id}`)
          } catch (err) {
            console.warn(`Could not load planned goals for ${student.name}`, err)
            throw err
          }
        })
        const plannedGoalsResults = await Promise.all(plannedGoalsPromises)
        setPlannedGoalsByStudent(new Map<string, Set<string>>(plannedGoalsResults as [string, Set<string>][]))
      } catch (err) {
        console.error(err)
        onNotify?.('error', notifications.trainerBulkPlannedGoalSaveFailed)
      } finally {
        setIsAssigning(false)
      }
    }
    setConfirmation({
      isOpen: true,
      title: isRemoving ? t.bulkRemoveDialogTitle : t.bulkAddDialogTitle,
      message: isRemoving
        ? interpolateTemplate(t.bulkRemoveDialogMessage, { goal: goal.title, count: plannedCount })
        : interpolateTemplate(t.bulkAddDialogMessage, { goal: goal.title, count: activeClass.students.length }),
      confirmText: isRemoving ? t.bulkRemoveDialogConfirm : t.bulkAddDialogConfirm,
      confirmClassName: isRemoving ? 'bg-rose-600 hover:bg-rose-500' : 'bg-sky-600 hover:bg-sky-500',
      onConfirm: doToggle,
    })
  }

  const handleAssignToClass = async () => {
    if (!currentGoal) return
    await handleTogglePlanForAll(currentGoal.id)
  }

  const handleExportClass = (e: React.MouseEvent, session: ClassSession) => {
    e.stopPropagation()
    const data = JSON.stringify(session, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `skillpilot-class-${session.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    onNotify?.('success', notifications.classExported)
  }

  const handleDeleteClass = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmation({
      isOpen: true,
      title: t.deleteClassDialogTitle,
      message: interpolateTemplate(t.deleteClassDialogMessage, { name }),
      confirmText: t.deleteClassDialogConfirm,
      confirmClassName: 'bg-rose-600 hover:bg-rose-500',
      onConfirm: () => {
        persistClasses(classes.filter((c) => c.id !== id))
        setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => { } })
      },
    })
  }

  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleImportClass = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const content = ev.target?.result as string
        const session = JSON.parse(content)
        if (!session.id || !session.name || !Array.isArray(session.students)) {
          throw new Error(t.invalidImportFormat)
        }
        const doImport = (overwrite = false) => {
          const idx = classes.findIndex((c) => c.id === session.id)
          let next = classes
          if (idx >= 0) {
            if (!overwrite) return
            next = [...classes]
            next[idx] = session
          } else {
            next = [...classes, session]
          }
          if (!persistClasses(next)) {
            return
          }
          onNotify?.('success', notifications.classImported)
          setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => { } })
        }
        const idx = classes.findIndex((c) => c.id === session.id)
        if (idx >= 0) {
          setConfirmation({
            isOpen: true,
            title: t.importClassDialogTitle,
            message: interpolateTemplate(t.importClassDialogMessage, { name: session.name }),
            confirmText: t.importClassDialogConfirm,
            onConfirm: () => doImport(true),
          })
        } else {
          doImport()
        }
      } catch (err) {
        console.error(err)
        onNotify?.(
          'error',
          `${notifications.classImportFailed}: ${(err as Error).message}`,
        )
      }
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.readAsText(file)
  }

  // ----- RENDER -----
  const editingClass = editingClassId
    ? classes.find((session) => session.id === editingClassId) ?? null
    : null

  // Keep this component mounted while a class switches to another landscape.
  // Its one-shot opening intent must survive until the target closure is ready.
  if (loadingLandscapes) {
    return (
      <div className="min-h-screen bg-app-gradient text-slate-100 p-6">
        Landscapes laden ...
      </div>
    )
  }

  if ((isCreating || editingClass) && !isClassSetupReady) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8 flex items-center justify-center text-text-secondary">
        {scopeCopy.setupLoading}
      </div>
    )
  }

  if (isCreating || editingClass) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8 flex items-center justify-center">
        <ClassSetup
          key={editingClass?.id ?? 'new-class'}
          landscapes={setupLandscapeEntries}
          rootLandscapeId={classSetupRootLandscapeId}
          initialSession={editingClass ?? undefined}
          onCancel={() => {
            setIsCreating(false)
            setEditingClassId(null)
          }}
          onSave={(session) => {
            const next = editingClass
              ? classes.map((current) => current.id === session.id ? session : current)
              : [...classes, session]
            persistClasses(next)
            if (!editingClass) {
              handleOpenClass(session)
            }
            setIsCreating(false)
            setEditingClassId(null)
          }}
        />
      </div>
    )
  }
  if (!activeClass) {
    return (
      <div className="min-h-screen bg-chat-bg p-12 text-text-primary">
        <ConfirmModal isOpen={confirmation.isOpen} onClose={() => setConfirmation({ ...confirmation, isOpen: false })} onConfirm={confirmation.onConfirm} title={confirmation.title} confirmText={confirmation.confirmText} confirmClassName={confirmation.confirmClassName}>
          {confirmation.message}
        </ConfirmModal>
        <header className="max-w-4xl mx-auto mb-12 flex justify-between items-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-700 dark:text-slate-200 sm:text-4xl">{t.dashboard}</h1>
          <div className="flex gap-3">
            <button onClick={() => fileInputRef.current?.click()} className="border border-border-color hover:bg-gray-200 dark:hover:bg-slate-800 px-4 py-2 rounded-lg text-text-secondary transition-colors">{t.import}</button>
            <input type="file" ref={fileInputRef} onChange={handleImportClass} hidden accept=".json" />
            <button
              onClick={() => setIsCreating(true)}
              disabled={!isClassSetupReady}
              title={!isClassSetupReady ? scopeCopy.setupLoading : undefined}
              className="bg-sky-600 hover:bg-sky-500 px-6 py-2 rounded-lg font-medium transition-colors text-white disabled:cursor-wait disabled:opacity-60"
            >
              + {t.newClass}
            </button>
            {onLogout && (
              <LogoutButton
                onLogout={onLogout}
                size="pill"
                className="border border-border-color hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-600 dark:hover:text-rose-400 text-text-secondary"
              />
            )}
          </div>
        </header>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c) => {
            const scope = getClassScopeDisplay(c)
            return (
            <div key={c.id} onClick={() => handleOpenClass(c)} className="relative flex flex-col text-left bg-sidebar-bg border border-border-color hover:border-sky-500 p-6 rounded-xl transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <div className="font-bold text-lg text-text-primary group-hover:text-sky-600 dark:group-hover:text-sky-400 pr-2">{c.name}</div>
                <div className="flex gap-2">
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      setEditingClassId(c.id)
                    }}
                    disabled={!isClassSetupReady}
                    className="p-2 rounded-lg border border-border-color text-text-secondary hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-600 dark:hover:text-sky-400 transition-colors disabled:cursor-wait disabled:opacity-50"
                    title={isClassSetupReady ? scopeCopy.editTooltip : scopeCopy.setupLoading}
                  >
                    <Pencil size={16} className="pointer-events-none" />
                  </button>
                  <button
                    onClick={(e) => handleExportClass(e, c)}
                    className="p-2 rounded-lg border border-border-color text-text-secondary hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                    title={t.classExportTooltip}
                  >
                    <Save size={16} className="pointer-events-none" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClass(e, c.id, c.name)}
                    className="p-2 rounded-lg border border-border-color text-text-secondary hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    title={t.classDeleteTooltip}
                  >
                    <Trash2 size={16} className="pointer-events-none" />
                  </button>
                </div>
              </div>

              <div className="text-sm text-text-secondary mb-4">{c.students.length} {t.students}</div>
              {scope.subjectLabel !== c.name && (
                <div className="mb-2 text-sm font-medium text-text-primary">{scope.subjectLabel}</div>
              )}
              <div className="mt-auto flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-text-secondary">
                {scope.badges.map((badge, index) => (
                  <span key={`${index}:${badge}`} className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded border border-border-color">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            )
          })}
          {classes.length === 0 && <div className="col-span-full text-center py-20 border-2 border-dashed border-border-color rounded-2xl text-text-secondary">{t.emptyClasses}</div>}
        </div>

      </div>
    )
  }
  return (
    <div className="flex h-screen bg-chat-bg text-text-primary overflow-hidden">
      <ConfirmModal isOpen={confirmation.isOpen} onClose={() => setConfirmation({ ...confirmation, isOpen: false })} onConfirm={confirmation.onConfirm} title={confirmation.title} confirmText={confirmation.confirmText} confirmClassName={confirmation.confirmClassName}>
        {confirmation.message}
      </ConfirmModal>
      <aside className="w-72 border-r border-border-color bg-sidebar-bg flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-border-color flex justify-between items-start">
          <div>
            <button onClick={handleShowAllClasses} className="text-xs text-text-secondary hover:text-text-primary mb-2">← {t.allClasses}</button>
            <h2 className="font-bold text-sky-600 dark:text-sky-400 truncate" title={activeClass.name}>{activeClass.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            {onLogout && (
              <LogoutButton onLogout={onLogout} className="text-text-secondary hover:text-rose-600 dark:hover:text-rose-400" />
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="text-[10px] uppercase text-text-secondary font-bold px-2 mb-1 mt-2">{t.studentList} ({activeClass.students.length})</div>
          <button onClick={() => onSelectLearner('__ALL__')} className={`w-full text-left px-3 py-2 rounded text-sm flex justify-between items-center group ${currentLearnerId === '__ALL__' ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-200 border border-sky-300 dark:border-sky-500/30' : 'text-text-secondary hover:bg-gray-200 dark:hover:bg-slate-900'}`}>
            <span className="truncate">{t.allStudents}</span>
            {currentLearnerId === '__ALL__' && <span className="w-2 h-2 rounded-full bg-sky-400" />}
          </button>
          {activeClass.students.map((s) => (
            <button key={s.id} onClick={() => onSelectLearner(s.id)} className={`w-full text-left px-3 py-2 rounded text-sm flex justify-between items-center group ${currentLearnerId === s.id ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-200 border border-sky-300 dark:border-sky-500/30' : 'text-text-secondary hover:bg-gray-200 dark:hover:bg-slate-900'}`}>
              <span className="truncate">{s.name}</span>
              {currentLearnerId === s.id && <span className="w-2 h-2 rounded-full bg-sky-400" />}
            </button>
          ))}
        </div>
      </aside>
      <aside
        className="w-1/3 min-w-[320px] border-r border-border-color flex flex-col bg-sidebar-bg"
        data-testid="trainer-competence-tree-panel"
      >
        <div className="p-4 border-b border-border-color bg-sidebar-bg">
          <div className="text-xs uppercase text-text-secondary font-bold mb-1">{t.currentContext}</div>
          {currentGoal && (
            <InlineMathText
              text={currentGoal.title}
              title={currentGoal.title}
              className="font-medium text-text-primary truncate mb-2"
            />
          )}
        </div>
        <div className="flex-1 p-2 overflow-y-auto">
          {isTrainerCompositionPending ? (
            <div className="p-8 text-center text-sm text-text-secondary" data-testid="trainer-composition-loading">
              {scopeCopy.compositionLoading}
            </div>
          ) : isTrainerCompositionUnavailable ? (
            <div className="m-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-900/60 dark:bg-amber-950/20">
              <p className="text-text-secondary">{scopeCopy.compositionUnavailable}</p>
              <button
                type="button"
                onClick={() => setCompositionRetryToken((current) => current + 1)}
                className="mt-3 rounded-lg bg-sky-600 px-3 py-2 font-semibold text-white transition-colors hover:bg-sky-500"
              >
                {scopeCopy.compositionRetry}
              </button>
            </div>
          ) : (
            <CompetenceTree
              key={`trainer-competence-tree-${activeClass?.id ?? 'none'}`}
              rootGoals={classRootGoals}
              allGoals={classGoalIndexAll}
              getMastery={getStudentMastery}
              plannedGoals={plannedGoals}
              onTogglePlan={currentLearnerId === '__ALL__' ? handleTogglePlanForAll : handleTogglePlan}
              onSelect={handleSelectGoal}
              selectedId={currentGoal?.id ?? selectedGoalId}
              activeFilter={trainerContextFilter}
              structureMode="content"
              aggregatedPlannedGoals={aggregatedPlannedGoals}
              totalStudents={activeClass.students.length}
              personalConfig={activeClass.personalConfig}
              rootLandscapeId={activeClass.rootLandscapeId}
              visibleChildrenByParentOverride={trainerVisibleChildrenByParent}
              useRawGoalTitles={!!matchedTrainerCompositionView}
            />
          )}
        </div>
      </aside>
      <main className="flex-1 p-8 bg-chat-bg overflow-y-auto flex flex-col">
        {isTrainerCompositionPending ? (
          <div className="flex-1 flex items-center justify-center text-text-secondary">
            {scopeCopy.compositionLoading}
          </div>
        ) : isTrainerCompositionUnavailable ? (
          <div className="flex-1 flex items-center justify-center text-text-secondary">
            {scopeCopy.compositionUnavailable}
          </div>
        ) : currentGoal ? (
          currentLearnerId === '__ALL__' ? (
            (() => {
              const plannedCount = aggregatedPlannedGoals?.get(currentGoal.id) ?? 0
              const isRemoving = plannedCount > 0
              return (
                <div className="max-w-2xl mx-auto w-full space-y-6">
                  <NeighborSection
                    title={tExp.requires}
                    emptyLabel={tExp.emptyRequires}
                    goals={filteredNeighbors.requires}
                    getMastery={getStudentMastery}
                    onClick={handleSelectGoal}
                    showMastery
                  />
                  <NeighborSection
                    title={tExp.inheritedRequires}
                    emptyLabel={tExp.emptyInherited}
                    goals={filteredNeighbors.inheritedRequires}
                    getMastery={getStudentMastery}
                    onClick={handleSelectGoal}
                    showMastery
                  />

                  <GoalCard
                    goal={currentGoal}
                    masteryValue={0}
                    onMasteryChange={() => { }}
                    showLearnerTools={false}
                    useRawGoalTitles={!!matchedTrainerCompositionView}
                  />

                  <NeighborSection
                    title={tExp.contains}
                    emptyLabel={tExp.emptyContains}
                    goals={filteredNeighbors.children}
                    getMastery={getStudentMastery}
                    onClick={handleSelectGoal}
                    showMastery
                  />

                  <NeighborSection
                    title={tExp.nextStepsDirect ?? tExp.nextSteps}
                    emptyLabel={tExp.emptyNextSteps}
                    goals={filteredNeighbors.directForward}
                    getMastery={getStudentMastery}
                    onClick={handleSelectGoal}
                    highlightForward
                    showMastery
                  />
                  <NeighborSection
                    title={tExp.nextStepsInherited ?? tExp.nextSteps}
                    emptyLabel={tExp.emptyNextStepsInherited ?? tExp.emptyNextSteps}
                    goals={filteredNeighbors.inheritedForward}
                    getMastery={getStudentMastery}
                    onClick={handleSelectGoal}
                    highlightForward
                    showMastery
                  />
                  <button onClick={handleAssignToClass} disabled={isAssigning} className={`w-full px-6 py-3 rounded-lg font-medium transition-colors text-white disabled:bg-gray-400 dark:disabled:bg-slate-700 disabled:text-gray-200 dark:disabled:text-slate-500 ${isRemoving ? 'bg-rose-600 hover:bg-rose-500' : 'bg-sky-600 hover:bg-sky-500'}`}>
                    {isAssigning
                        ? (isRemoving ? t.removing : t.assigning)
                      : isRemoving
                        ? interpolateTemplate(t.removeFromPlan, { count: plannedCount })
                        : interpolateTemplate(t.assignToAll, { count: activeClass.students.length })}
                  </button>
                </div>
              )
            })()
          ) : (
            <div className="max-w-2xl mx-auto w-full space-y-6">
              <NeighborSection
                title={tExp.requires}
                emptyLabel={tExp.emptyRequires}
                goals={filteredNeighbors.requires}
                getMastery={getStudentMastery}
                onClick={handleSelectGoal}
                showMastery
              />
              <NeighborSection
                title={tExp.inheritedRequires}
                emptyLabel={tExp.emptyInherited}
                goals={filteredNeighbors.inheritedRequires}
                getMastery={getStudentMastery}
                onClick={handleSelectGoal}
                showMastery
              />

              <GoalCard
                goal={currentGoal}
                masteryValue={getStudentMastery(currentGoal.id)}
                showLearnerTools
                useRawGoalTitles={!!matchedTrainerCompositionView}
              />

              <NeighborSection
                title={tExp.contains}
                emptyLabel={tExp.emptyContains}
                goals={filteredNeighbors.children}
                getMastery={getStudentMastery}
                onClick={handleSelectGoal}
                showMastery
              />

              <NeighborSection
                title={tExp.nextStepsDirect ?? tExp.nextSteps}
                emptyLabel={tExp.emptyNextSteps}
                goals={filteredNeighbors.directForward}
                getMastery={getStudentMastery}
                onClick={handleSelectGoal}
                highlightForward
                showMastery
              />
              <NeighborSection
                title={tExp.nextStepsInherited ?? tExp.nextSteps}
                emptyLabel={tExp.emptyNextStepsInherited ?? tExp.emptyNextSteps}
                goals={filteredNeighbors.inheritedForward}
                getMastery={getStudentMastery}
                onClick={handleSelectGoal}
                highlightForward
                showMastery
              />
              {plannedGoals.has(currentGoal.id) && (
                <div className="bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-500/30 p-3 rounded-lg flex gap-3 items-center">
                  <div className="text-amber-500 dark:text-amber-400 text-xl">★</div>
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>{t.selectedGoal}:</strong>{' '}
                    {interpolateTemplate(t.goalOnPlan, {
                      name: activeClass.students.find((s) => s.id === currentLearnerId)?.name ?? '',
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-secondary space-y-4">
            <div className="text-6xl opacity-20">🎓</div>
            <p className="text-lg text-center">{t.emptyState.title}<br />{t.emptyState.text.split('\n')[0]}<br />{t.emptyState.text.split('\n')[1]}</p>
          </div>
        )}
      </main>
    </div>
  )
}
