import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CompetenceTree } from '../components/CompetenceTree'
import { CoursePlanPilotView, type CoursePlanSection } from '../components/CoursePlanPilotView'
import { GoalCard } from '../components/GoalCard'
import { NeighborSection } from '../components/NeighborSection'
import { ClassSetup } from '../components/ClassSetup'
import { ConfirmModal } from '../components/ConfirmModal'
import { InlineMathText } from '../components/InlineMathText'
import { LogoutButton } from '../components/LogoutButton'
import { TrainerClassFilePasswordDialog } from '../components/TrainerClassFilePasswordDialog'
import { TrainerLearningPlanActivation } from '../components/TrainerLearningPlanActivation'
import { TrainerLearningPlanPreview } from '../components/TrainerLearningPlanPreview'
import { useCompetenceGraph } from '../hooks/useCompetenceGraph'
import { useGoalIndex } from '../hooks/useGoalIndex'
import { useLandscapes, type LandscapeEntry } from '../hooks/useLandscapes'
import type { UiGoal } from '../goalTypes'
import type { ClassSession } from '../trainerTypes'
import type { MasteryMap } from '../learnerTypes'

import { BookOpenCheck, CalendarRange, Pencil, Save, Trash2 } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { en } from '../locales/en'
import { de } from '../locales/de'
import type { ToastKind } from '../hooks/useToast'
import { interpolateTemplate } from '../utils/interpolateTemplate'
import { getCoursePlanCopy } from '../utils/coursePlanCopy'
import { deleteTeacherCoursePlans } from '../utils/localTeacherCoursePlan'
import {
  getLegacyTeacherCoursePlanStorageIds,
  getTeacherCoursePlanStorageId,
  teacherCoursePlanStoragePrefixForClass,
} from '../utils/teacherCoursePlanContext'
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
import {
  buildExistingLearnerClassSession,
  clearLegacyTeacherSupervisionBrowserCredentials,
  EXISTING_LEARNER_LINKING_ENABLED,
  fetchExistingLearnerProfile,
  getExistingLearnerSubjectIds,
  isExistingLearnerClassSession,
  isExistingLearnerSessionDisabled,
  isLegacyLinkedSupervisionSession,
  removeUnsupportedTeacherSessionsFromBrowserStorage,
  selectExistingLearnerSubject,
} from '../utils/existingLearnerClass'
import { getExistingLearnerClassCopy } from '../utils/existingLearnerClassCopy'
import {
  fetchLandscapeClosureEntries,
  landscapeEntriesBelongToRoot,
} from '../utils/landscapeClosure'
import { getTrainerClassFileCopy } from '../utils/trainerClassFileCopy'
import {
  classifyTrainerClassFileContent,
  decryptTrainerClassFileContent,
  encryptTrainerClassFileContent,
  MAX_TRAINER_CLASS_FILE_SIZE,
  TRAINER_CLASS_FILE_EXTENSION,
} from '../utils/trainerClassFile'

const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
const toApi = (path: string) => (apiBase ? `${apiBase}${path}` : path)

const readMasteryValue = (
  mastery: MasteryMap,
  canonicalGoalId: string,
  legacyShortKey?: string,
): number => {
  const canonicalValue = mastery[canonicalGoalId]
  if (canonicalValue !== undefined) return canonicalValue
  return legacyShortKey ? mastery[legacyShortKey] ?? 0 : 0
}

const getTrainerSessionFilter = (session: ClassSession): string => {
  const rootFilter = session.rootLandscapeId
    ? session.personalConfig?.[session.rootLandscapeId]?.filterId?.trim()
    : ''
  if (rootFilter && !isWildcardFilter(rootFilter)) return rootFilter
  const landscapeFilter = session.personalConfig?.[session.landscapeId]?.filterId?.trim()
  if (landscapeFilter && !isWildcardFilter(landscapeFilter)) return landscapeFilter
  if (session.activeFilter && !isWildcardFilter(session.activeFilter)) return session.activeFilter
  return 'all'
}

const collectGoalIdsBelowEntryRoots = (
  entry: LandscapeEntry | null,
  goalIndex: ReadonlyMap<string, UiGoal>,
) => {
  const goalIds = new Set<string>()
  const pendingGoalIds = (entry?.goals ?? [])
    .filter((goal) => (goal.tags ?? []).includes('root'))
    .map((goal) => goal.id)
  while (pendingGoalIds.length > 0) {
    const goalId = pendingGoalIds.pop()
    if (!goalId || goalIds.has(goalId)) continue
    const goal = goalIndex.get(goalId)
    if (!goal) continue
    goalIds.add(goalId)
    ;(goal.contains ?? []).forEach((childId) => {
      if (!goalIds.has(childId)) pendingGoalIds.push(childId)
    })
  }
  return goalIds
}

const downloadTrainerClassFile = (content: string) => {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `skillpilot-class-${new Date().toISOString().slice(0, 10)}${TRAINER_CLASS_FILE_EXTENSION}`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

interface TrainerViewProps {
  landscapeEntries: LandscapeEntry[]
  loadingLandscapes?: boolean
  landscapeError?: Error | null
  runtimeCatalogState: RuntimeCurriculumCatalogState
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

type TrainerClassFileDialogState =
  | { mode: 'export'; session: ClassSession }
  | { mode: 'import'; content: string; fileName: string }

const loadStoredTrainerClasses = (): ClassSession[] => {
  try {
    const raw = localStorage.getItem('skillpilot_classes')
    if (!raw) {
      clearLegacyTeacherSupervisionBrowserCredentials()
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      clearLegacyTeacherSupervisionBrowserCredentials()
      return []
    }
    const retained = removeUnsupportedTeacherSessionsFromBrowserStorage(
      parsed,
      EXISTING_LEARNER_LINKING_ENABLED,
    )
    const migrated = retained
      .map((session) => migrateTrainerClassSession(session as ClassSession))
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
  landscapeError = null,
  runtimeCatalogState,
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
  const [searchParams, setSearchParams] = useSearchParams()
  const trainerWorkspace = searchParams.get('view') === 'plan' ? 'plan' : 'goals'
  const coursePlanCopy = useMemo(() => getCoursePlanCopy(localizedLanguage), [localizedLanguage])
  const existingLearnerCopy = useMemo(() => getExistingLearnerClassCopy(localizedLanguage), [localizedLanguage])
  const classFileCopy = useMemo(() => getTrainerClassFileCopy(localizedLanguage), [localizedLanguage])
  const t = language === 'en' ? en.trainer : de.trainer
  const tExp = language === 'en' ? en.explorer : de.explorer
  const notifications = language === 'en' ? en.notifications : de.notifications
  const [classes, setClasses] = useState<ClassSession[]>(loadStoredTrainerClasses)
  const classesRef = useRef(classes)
  classesRef.current = classes
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
  const [classFileDialog, setClassFileDialog] = useState<TrainerClassFileDialogState | null>(null)
  const [classFileBusy, setClassFileBusy] = useState(false)
  const [classFileError, setClassFileError] = useState('')
  const [coursePlanActivationRefreshToken, setCoursePlanActivationRefreshToken] = useState(0)
  const [coursePlanHasUnsavedDraft, setCoursePlanHasUnsavedDraft] = useState(false)
  const [coursePlanSection, setCoursePlanSection] = useState<CoursePlanSection>('plan')
  const classFileOperationRef = useRef(false)
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
  const draftNavigationOriginRef = useRef<HTMLElement | null>(null)
  const closeConfirmation = () => {
    setConfirmation((current) => ({ ...current, isOpen: false }))
    const origin = draftNavigationOriginRef.current
    draftNavigationOriginRef.current = null
    if (origin?.isConnected) origin.focus({ preventScroll: true })
  }

  const leavePlanSafely = useCallback((action: () => void) => {
    if (!coursePlanHasUnsavedDraft) {
      action()
      return
    }
    draftNavigationOriginRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setConfirmation({
      isOpen: true,
      title: localizedLanguage === 'de' ? 'Ungespeicherte Änderungen verwerfen?' : 'Discard unsaved changes?',
      message: localizedLanguage === 'de'
        ? 'Deine zuletzt gespeicherte Planung bleibt erhalten. Noch nicht gespeicherte Eingaben gehen beim Wechsel verloren.'
        : 'Your last saved plan is kept. Unsaved inputs will be lost when you leave.',
      confirmText: localizedLanguage === 'de' ? 'Verwerfen und wechseln' : 'Discard and continue',
      onConfirm: () => {
        draftNavigationOriginRef.current = null
        setConfirmation((current) => ({ ...current, isOpen: false }))
        action()
      },
    })
  }, [coursePlanHasUnsavedDraft, localizedLanguage])

  useEffect(() => {
    if (!coursePlanHasUnsavedDraft) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [coursePlanHasUnsavedDraft])

  const handleTrainerExit = useCallback(() => {
    if (!onLogout) return
    leavePlanSafely(() => {
      onLogout()
      window.location.replace('/')
    })
  }, [leavePlanSafely, onLogout])

  const handleTrainerWorkspaceChange = useCallback((workspace: 'goals' | 'plan') => {
    if ((searchParams.get('view') === 'plan') === (workspace === 'plan')) return
    const nextSearchParams = new URLSearchParams(searchParams)
    if (workspace === 'plan') {
      nextSearchParams.set('view', 'plan')
    } else {
      nextSearchParams.delete('view')
    }
    leavePlanSafely(() => {
      if (workspace === 'plan') onSelectLearner('__ALL__')
      setSearchParams(nextSearchParams)
    })
  }, [leavePlanSafely, onSelectLearner, searchParams, setSearchParams])

  const classRootLandscapeIds = useMemo(() => Array.from(new Set(
    classes
      .map((session) => (session.rootLandscapeId || session.landscapeId).trim())
      .filter(Boolean),
  )).sort(), [classes])
  const classRootLandscapeIdsKey = classRootLandscapeIds.join('\u0000')
  const [classLandscapeEntriesByRootId, setClassLandscapeEntriesByRootId] = useState<
    Record<string, LandscapeEntry[]>
  >({})

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    if (classRootLandscapeIds.length === 0) {
      setClassLandscapeEntriesByRootId({})
      return () => controller.abort()
    }

    void Promise.allSettled(classRootLandscapeIds.map(async (rootId) => (
      [rootId, await fetchLandscapeClosureEntries(rootId, language, controller.signal)] as const
    ))).then((results) => {
      if (!active) return
      const entries = results.flatMap((result) => {
        if (result.status === 'fulfilled') return [result.value]
        if (!controller.signal.aborted) {
          console.warn('Could not load course curriculum labels', result.reason)
        }
        return []
      })
      // Replace the complete map atomically. A failed or removed root must not
      // keep stale labels from an earlier class list or language.
      setClassLandscapeEntriesByRootId(Object.fromEntries(entries))
    })

    return () => {
      active = false
      controller.abort()
    }
  // The sorted key is the stable dependency; the array itself is recreated
  // whenever the local class list changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classRootLandscapeIdsKey, language])
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
        openCourse: (name: string) => `Kurs ${name} öffnen`,
        classActions: (name: string) => `Aktionen für ${name}`,
        deletePlanFailed: 'Die Klasse wurde nicht gelöscht, weil ihre lokalen Kurspläne nicht zuverlässig entfernt werden konnten.',
        setupLoading: 'Gymnasium-Auswahl wird geladen …',
        compositionLoading: 'Klassen-Curriculum wird geladen …',
        compositionUnavailable: 'Für diese Klassenauswahl konnte keine passende Curriculumansicht geladen werden.',
        compositionRetry: 'Erneut versuchen',
        courseLoadErrorTitle: 'Kurs-Curriculum nicht verfügbar',
        courseLoadErrorText: 'Die Lernziele dieses Kurses konnten nicht geladen werden. Deine lokal gespeicherten Kursdaten bleiben erhalten.',
        courseLoadRetry: 'Erneut laden',
        backToClasses: 'Alle Klassen',
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
        openCourse: (name: string) => `Open course ${name}`,
        classActions: (name: string) => `Actions for ${name}`,
        deletePlanFailed: 'The class was not deleted because its local course plans could not be removed reliably.',
        setupLoading: 'Loading Gymnasium selection …',
        compositionLoading: 'Loading class curriculum …',
        compositionUnavailable: 'No matching curriculum view could be loaded for this class scope.',
        compositionRetry: 'Try again',
        courseLoadErrorTitle: 'Course curriculum unavailable',
        courseLoadErrorText: 'The learning goals for this course could not be loaded. Your locally stored course data remains intact.',
        courseLoadRetry: 'Reload',
        backToClasses: 'All classes',
      }, [localizedLanguage])

  const getClassScopeDisplay = useCallback((session: ClassSession) => {
    const sessionRootLandscapeId = session.rootLandscapeId || session.landscapeId
    const loadedSessionLandscapeEntries = classLandscapeEntriesByRootId[sessionRootLandscapeId]
    const sessionLandscapeEntries = landscapeEntriesBelongToRoot(
      loadedSessionLandscapeEntries,
      sessionRootLandscapeId,
    )
      ? loadedSessionLandscapeEntries
      : landscapeEntriesBelongToRoot(landscapeEntries, sessionRootLandscapeId)
        ? landscapeEntries
        : []
    const sessionLandscapeById = new Map(
      sessionLandscapeEntries.map((entry) => [entry.meta.landscapeId, entry]),
    )
    const rootEntry = sessionLandscapeById.get(sessionRootLandscapeId)
    const packageRootLandscape = runtimeCatalogState.mode === 'package'
      ? runtimeCatalogState.catalog.landscapes.find(
        (entry) => entry.landscapeId === sessionRootLandscapeId,
      )
      : undefined
    const isGymnasiumCourse = Boolean(
      isRepositoryGymnasiumFramework(rootEntry?.meta.frameworkId)
      || packageRootLandscape?.schoolForm?.trim().toLocaleLowerCase('de-DE') === 'gymnasium',
    )
    if (isExistingLearnerClassSession(session)) {
      const subjectLabels = getExistingLearnerSubjectIds(
        session.personalConfig ?? {},
        sessionLandscapeEntries,
        session.rootLandscapeId,
      ).map((landscapeId, index) => {
        const entry = sessionLandscapeById.get(landscapeId)
        return entry?.meta.subject?.trim()
          || entry?.meta.title?.trim()
          || (localizedLanguage === 'de'
            ? `Personalisiertes Fach ${index + 1}`
            : `Personalized subject ${index + 1}`)
      })
      return {
        subjectLabel: subjectLabels.join(' · '),
        badges: [
          ...(rootEntry?.meta.title?.trim() && !subjectLabels.includes(rootEntry.meta.title.trim())
            ? [rootEntry.meta.title.trim()]
            : []),
          existingLearnerCopy.localBadge,
          existingLearnerCopy.readOnlyBadge,
        ],
      }
    }
    const subjectEntry = sessionLandscapeById.get(session.landscapeId)
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

    if (!isGymnasiumCourse) {
      const genericFilter = rawCourseProfile?.trim()
      const curriculumLabel = rootEntry?.meta.title?.trim()
        || rootEntry?.meta.subject?.trim()
      return {
        subjectLabel,
        badges: [
          ...(curriculumLabel && curriculumLabel !== subjectLabel ? [curriculumLabel] : []),
          ...(genericFilter && !isWildcardFilter(genericFilter)
            ? [formatFilterDisplayLabel(genericFilter, localizedLanguage)]
            : []),
        ],
      }
    }

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
  }, [
    classLandscapeEntriesByRootId,
    existingLearnerCopy,
    landscapeEntries,
    localizedLanguage,
    runtimeCatalogState,
    scopeCopy,
  ])

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
  const activeClassIsExistingLearner = isExistingLearnerClassSession(activeClass)
  const {
    landscapeEntries: activeExistingLearnerRootLandscapes,
  } = useLandscapes(
    activeClassIsExistingLearner ? activeClass.rootLandscapeId : undefined,
    language,
    {
      enabled: activeClassIsExistingLearner && !!activeClass.rootLandscapeId,
    },
  )
  const activeExistingLearnerLandscapeEntries = useMemo(() => {
    const activeRootLandscapeId = activeClass?.rootLandscapeId
    if (!activeRootLandscapeId) return []
    if (landscapeEntriesBelongToRoot(
      activeExistingLearnerRootLandscapes,
      activeRootLandscapeId,
    )) {
      return activeExistingLearnerRootLandscapes
    }
    const cachedEntries = classLandscapeEntriesByRootId[activeRootLandscapeId]
    return landscapeEntriesBelongToRoot(cachedEntries, activeRootLandscapeId)
      ? cachedEntries
      : []
  }, [
    activeClass?.rootLandscapeId,
    activeExistingLearnerRootLandscapes,
    classLandscapeEntriesByRootId,
  ])
  const activeCoursePlanStorageId = activeClass
    ? getTeacherCoursePlanStorageId(activeClass)
    : ''
  const activeCoursePlanLearnerId = activeClassIsExistingLearner
    ? activeClass.students[0]?.id ?? ''
    : ''
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
    () => (activeClassIsExistingLearner
      ? activeExistingLearnerLandscapeEntries
      : landscapeEntries
    ).find((entry) => entry.meta.landscapeId === activeClass?.landscapeId) ?? null,
    [
      activeClass?.landscapeId,
      activeClassIsExistingLearner,
      activeExistingLearnerLandscapeEntries,
      landscapeEntries,
    ],
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
    const existingLearnerFailClosedRequest = (reason: string): TrainerCompositionRequest => ({
      key: `existing-learner-unavailable:${reason}:${activeClass.landscapeId}`,
      landscapeId: activeClass.landscapeId,
      url: null,
    })
    if (runtimeCatalogState.mode === 'loading' || runtimeCatalogState.mode === 'unavailable') {
      return activeClassIsExistingLearner
        ? existingLearnerFailClosedRequest(`catalog-${runtimeCatalogState.mode}`)
        : null
    }

    const packageRootLandscapeId = runtimeCatalogState.mode === 'package'
      ? findRuntimeRootLandscapeId(runtimeCatalogState.catalog, activeClass.landscapeId)
      : undefined
    const rootLandscapeId = packageRootLandscapeId ?? activeClass.rootLandscapeId
    const compositionScopeEnabled = runtimeCatalogState.mode === 'package'
      || isRepositoryGymnasiumFramework(activeClassSourceLandscapeEntry?.meta.frameworkId)
    const scope = deriveRuntimeCompositionScope({
      landscapeId: activeClass.landscapeId,
      rootLandscapeId,
      scopeEnabled: compositionScopeEnabled,
      catalogJurisdictions: runtimeCatalogState.mode === 'package'
        ? runtimeCatalogState.catalog.offerings
            .filter((offering) => offering.landscapeId === activeClass.landscapeId)
            .map((offering) => offering.scope.jurisdiction)
            .filter((jurisdiction): jurisdiction is string => typeof jurisdiction === 'string')
        : undefined,
      activeFilter: activeClass.activeFilter,
      learnerPersonalCurriculum: activeClassPersonalCurriculum,
    })

    if (!scope && activeClassIsExistingLearner && compositionScopeEnabled) {
      return existingLearnerFailClosedRequest('scope')
    }

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
    if (!catalogLandscape) {
      return activeClassIsExistingLearner ? existingLearnerFailClosedRequest('catalog-landscape') : null
    }
    const hasOfferings = runtimeCatalogState.catalog.offerings.some(
      (candidate) => candidate.landscapeId === activeClass.landscapeId,
    )
    if (!hasOfferings && !catalogLandscape.defaultOfferingId) {
      return activeClassIsExistingLearner ? existingLearnerFailClosedRequest('catalog-offering') : null
    }

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
    activeClassIsExistingLearner,
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
  const levelTwoProjectedTrainerLandscapeEntries = useMemo(() => {
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
    return compositionProjectedEntries
  }, [
    landscapeEntries,
    matchedTrainerCompositionView,
    placementProjectedTrainerLandscapeEntries,
    trainerCompositionRequest,
  ])
  const projectedTrainerLandscapeEntries = useMemo(() => {
    if (!trainerCompositionRequest) {
      return levelTwoProjectedTrainerLandscapeEntries
    }
    const routeProjectedEntries = applyMatchedCompositionRouteGoalProjection(
      levelTwoProjectedTrainerLandscapeEntries,
      routeGoalId,
    )
    return routeProjectedEntries.map((entry) => normalizeLearnerProjectedEntries([entry])[0] ?? entry)
  }, [
    levelTwoProjectedTrainerLandscapeEntries,
    routeGoalId,
    trainerCompositionRequest,
  ])
  // The authored Level-2 composition is authoritative for planning. Its canonical
  // nodes may carry legacy phase metadata that presentation normalization hides.
  const coursePlanProjectedTrainerLandscapeEntries = levelTwoProjectedTrainerLandscapeEntries
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
    return collectGoalIdsBelowEntryRoots(activeLandscapeEntry, classGoalIndexAll)
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
  const coursePlanActiveLandscapeEntry = useMemo(
    () => coursePlanProjectedTrainerLandscapeEntries.find(
      (entry) => entry.meta.landscapeId === activeClass?.landscapeId,
    ) ?? null,
    [activeClass, coursePlanProjectedTrainerLandscapeEntries],
  )
  const coursePlanAllGoals = useMemo(
    () => coursePlanProjectedTrainerLandscapeEntries.flatMap((entry) => entry.goals),
    [coursePlanProjectedTrainerLandscapeEntries],
  )
  const { goalIndexAll: coursePlanGoalIndexAll } = useGoalIndex(coursePlanAllGoals)
  const coursePlanVisibleChildrenByParent = useMemo(
    () => matchedTrainerCompositionView ? buildDirectChildrenMap(coursePlanGoalIndexAll) : undefined,
    [coursePlanGoalIndexAll, matchedTrainerCompositionView],
  )
  const coursePlanCompositionTargetGoalIds = useMemo(() => {
    if (!matchedTrainerCompositionView || !coursePlanActiveLandscapeEntry) return null
    return collectGoalIdsBelowEntryRoots(coursePlanActiveLandscapeEntry, coursePlanGoalIndexAll)
  }, [coursePlanActiveLandscapeEntry, coursePlanGoalIndexAll, matchedTrainerCompositionView])
  const coursePlanGoalMatchesActiveClassConfig = useCallback((goal: UiGoal | null | undefined) => {
    if (!goal) return false
    if (!activeClass) return true
    if (coursePlanCompositionTargetGoalIds) {
      return coursePlanCompositionTargetGoalIds.has(goal.id)
    }
    if (!goalMatchesGlobalStageScope(
      goal,
      activeClass.personalConfig ?? {},
      { rootLandscapeId: activeClass.rootLandscapeId },
    )) {
      return false
    }
    return goalMatchesFilters(goal, activeClassFilterIds)
  }, [activeClass, activeClassFilterIds, coursePlanCompositionTargetGoalIds])
  const coursePlanGoalIndex = useMemo(() => {
    const result = new Map<string, UiGoal>()
    coursePlanGoalIndexAll.forEach((goal, goalId) => {
      if (coursePlanGoalMatchesActiveClassConfig(goal)) result.set(goalId, goal)
    })
    return result
  }, [coursePlanGoalIndexAll, coursePlanGoalMatchesActiveClassConfig])
  const coursePlanChildrenByParent = useMemo(() => {
    const result = new Map<string, string[]>()
    coursePlanGoalIndex.forEach((goal) => {
      const childIds = coursePlanVisibleChildrenByParent?.get(goal.id) ?? goal.contains ?? []
      result.set(goal.id, childIds.filter((childId) => coursePlanGoalIndex.has(childId)))
    })
    return result
  }, [coursePlanGoalIndex, coursePlanVisibleChildrenByParent])
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
  const getStudentMastery = useMemo(() => {
    const masteryCache = new Map<string, { masterySum: number; weightSum: number }>()
    return (goalId: string): number => {
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
            let totalMasteryForGoal = 0
            let studentsCounted = 0
            masteryByStudent.forEach((studentMap) => {
              const studentMastery = readMasteryValue(studentMap, gId, key)
              totalMasteryForGoal += studentMastery
              studentsCounted++
            })
            masteryValue = studentsCounted > 0 ? totalMasteryForGoal / studentsCounted : 0
          } else {
            // Existing logic for single student view
            const key = goalShortKeyMap.get(gId)
            masteryValue = studentMasteryMap
              ? readMasteryValue(studentMasteryMap, gId, key)
              : 0
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
    }
  }, [classGoalIndexAll, currentLearnerId, masteryByStudent, goalShortKeyMap])

  const persistClasses = useCallback((items: ClassSession[]) => {
    try {
      localStorage.setItem('skillpilot_classes', JSON.stringify(items))
      classesRef.current = items
      setClasses(items)
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
    if (!activeClass || trainerWorkspace === 'plan') {
      setMasteryByStudent(new Map())
      setPlannedGoalsByStudent(new Map())
      return
    }

    const controller = new AbortController()
    let cancelled = false
    const fetchAllData = async () => {
      let hadDataLoadFailure = false
      const masteryPromises = activeClass.students.map(async (student) => {
        try {
          const res = await fetch(
            toApi(`/api/ui/learners/${encodeURIComponent(student.id)}/mastery`),
            { signal: controller.signal, cache: 'no-store' },
          )
          if (res.ok) {
            const data = await res.json()
            if (data && data.mastery) return [student.id, data.mastery] as const
          } else {
            hadDataLoadFailure = true
          }
        } catch (err) {
          if (controller.signal.aborted) return [student.id, {}] as const
          console.warn(`Could not load mastery for ${student.name}`, err)
          hadDataLoadFailure = true
        }
        return [student.id, {}] as const
      })
      const plannedGoalsPromises = activeClassIsExistingLearner
        ? activeClass.students.map(async (student) => [student.id, new Set<string>()] as const)
        : activeClass.students.map(async (student) => {
        try {
          const res = await fetch(
            toApi(`/api/ui/learners/${encodeURIComponent(student.id)}/planned`),
            { signal: controller.signal },
          )
          if (res.ok) {
            const data = await res.json()
            if (data && Array.isArray(data.goals)) return [student.id, new Set<string>(data.goals as string[])] as const
          } else {
            hadDataLoadFailure = true
          }
        } catch (err) {
          if (controller.signal.aborted) return [student.id, new Set<string>()] as const
          console.warn(`Could not load planned goals for ${student.name}`, err)
          hadDataLoadFailure = true
        }
        return [student.id, new Set()] as const
        })
      const [masteryResults, plannedGoalsResults] = await Promise.all([
        Promise.all(masteryPromises),
        Promise.all(plannedGoalsPromises),
      ])
      if (cancelled) return
      setMasteryByStudent(new Map(masteryResults))
      setPlannedGoalsByStudent(new Map<string, Set<string>>(plannedGoalsResults as [string, Set<string>][]))
      if (hadDataLoadFailure) {
        notifyLoadErrorOnce('trainer-class-data-load', notifications.trainerClassDataLoadFailed)
      } else {
        clearReportedLoadError('trainer-class-data-load')
      }
    }
    void fetchAllData()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [
    activeClass,
    activeClassIsExistingLearner,
    clearReportedLoadError,
    notifications.trainerClassDataLoadFailed,
    notifyLoadErrorOnce,
    trainerWorkspace,
  ])

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
    onContextChange(
      session.landscapeId,
      getTrainerSessionFilter(session),
      undefined,
      { replace: true },
    )
    if (!isExistingLearnerClassSession(session)) return

    const learner = session.students[0]
    if (!learner) return
    void fetchExistingLearnerProfile(learner.id)
      .then(async (profile) => {
        const currentSession = classesRef.current.find((candidate) => candidate.id === session.id)
        if (
          !currentSession
          || !isExistingLearnerClassSession(currentSession)
          || currentSession.students[0]?.id !== learner.id
        ) return
        const rootLandscapeId = currentSession.rootLandscapeId?.trim()
        if (!rootLandscapeId) throw new Error('missing-course-curriculum-root')
        const cachedEntries = classLandscapeEntriesByRootId[rootLandscapeId]
        const currentLandscapeEntries = landscapeEntriesBelongToRoot(cachedEntries, rootLandscapeId)
          ? cachedEntries
          : await fetchLandscapeClosureEntries(rootLandscapeId, language)
        const latestSession = classesRef.current.find((candidate) => candidate.id === session.id)
        if (
          !latestSession
          || !isExistingLearnerClassSession(latestSession)
          || latestSession.students[0]?.id !== learner.id
          || latestSession.rootLandscapeId !== rootLandscapeId
        ) return
        const refreshed = buildExistingLearnerClassSession({
          className: latestSession.name,
          learnerAlias: latestSession.students[0].name,
          profile,
          landscapes: currentLandscapeEntries,
          rootLandscapeId,
          existing: latestSession,
        })
        if (JSON.stringify(refreshed) !== JSON.stringify(latestSession)) {
          persistClasses(classesRef.current.map((candidate) => candidate.id === refreshed.id ? refreshed : candidate))
        }
        clearReportedLoadError('trainer-existing-learner-profile-load')
      })
      .catch((error) => {
        console.warn('Could not refresh existing learner personalization', error)
        notifyLoadErrorOnce(
          'trainer-existing-learner-profile-load',
          error instanceof Error && error.message === 'learner-not-found'
            ? existingLearnerCopy.learnerNotFound
            : existingLearnerCopy.profileUnavailable,
        )
      })
  }

  const handleShowAllClasses = () => {
    leavePlanSafely(() => {
      setOpeningClassId(null)
      setSelectedGoalId('')
      setCoursePlanSection('plan')
      onContextChange('', 'all', null)
    })
  }

  const handleExistingLearnerSubjectChange = (landscapeId: string) => {
    if (!activeClass || !isExistingLearnerClassSession(activeClass)) return
    const nextSession = selectExistingLearnerSubject(
      activeClass,
      landscapeId,
      activeExistingLearnerLandscapeEntries,
    )
    if (nextSession === activeClass) {
      setCoursePlanSection('plan')
      return
    }
    leavePlanSafely(() => {
      if (!persistClasses(classes.map((session) => session.id === nextSession.id ? nextSession : session))) {
        onNotify?.('error', notifications.trainerClassSaveFailed)
        return
      }
      setMasteryByStudent(new Map())
      setCoursePlanSection('plan')
      setSelectedGoalId('')
      setOpeningClassId(nextSession.id)
      onSelectLearner('__ALL__')
      onContextChange(nextSession.landscapeId, nextSession.activeFilter, null, { replace: true })
    })
  }

  const handleLocalCoursePlanChange = useCallback(() => {
    setCoursePlanActivationRefreshToken((current) => current + 1)
  }, [])

  const handleSelectGoal = (id: string) => {
    if (!activeClass || id === routeGoalId) return
    onContextChange(activeClass.landscapeId, trainerContextFilter, id)
  }

  const handleTogglePlan = async (goalId: string) => {
    if (activeClassIsExistingLearner) {
      onNotify?.('info', existingLearnerCopy.readOnlyHint)
      return
    }
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
    if (isExistingLearnerClassSession(activeClass)) {
      onNotify?.('info', existingLearnerCopy.readOnlyHint)
      return
    }
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
    setClassFileError('')
    setClassFileDialog({ mode: 'export', session })
  }

  const removeLocalClass = (session: ClassSession) => {
    const previousClasses = classes
    const nextClasses = classes.filter((candidate) => candidate.id !== session.id)
    if (!persistClasses(nextClasses)) return false
    const plansDeleted = deleteTeacherCoursePlans({
      exactPlanIds: getLegacyTeacherCoursePlanStorageIds(session),
      planIdPrefixes: [teacherCoursePlanStoragePrefixForClass(session.id)],
    })
    if (!plansDeleted.ok) {
      persistClasses(previousClasses)
      onNotify?.('error', scopeCopy.deletePlanFailed)
      return false
    }
    if (activeClassId === session.id) {
      setOpeningClassId(null)
      setActiveClassId(null)
      onSelectLearner('__ALL__')
    }
    return true
  }

  const handleDeleteClass = (e: React.MouseEvent, session: ClassSession) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmation({
      isOpen: true,
      title: t.deleteClassDialogTitle,
      message: interpolateTemplate(t.deleteClassDialogMessage, { name: session.name }),
      confirmText: t.deleteClassDialogConfirm,
      confirmClassName: 'bg-rose-600 hover:bg-rose-500',
      onConfirm: () => {
        if (removeLocalClass(session)) {
          setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => { } })
        }
      },
    })
  }

  const fileInputRef = useRef<HTMLInputElement>(null)
  const importClassSession = (rawSession: ClassSession, legacy: boolean) => {
    if (isLegacyLinkedSupervisionSession(rawSession)) {
      onNotify?.('error', `${notifications.classImportFailed}: ${existingLearnerCopy.legacyImportRejected}`)
      return
    }
    if (isExistingLearnerSessionDisabled(rawSession, EXISTING_LEARNER_LINKING_ENABLED)) {
      onNotify?.('error', `${notifications.classImportFailed}: ${existingLearnerCopy.disabledImportRejected}`)
      return
    }
    const session = migrateTrainerClassSession(rawSession)

    const notifyImported = () => {
      onNotify?.(
        legacy ? 'info' : 'success',
        legacy ? classFileCopy.importedLegacy : classFileCopy.imported,
      )
    }
    const doImport = (overwrite = false) => {
      const idx = classes.findIndex(candidate => candidate.id === session.id)
      let next = classes
      if (idx >= 0) {
        if (!overwrite) return
        next = [...classes]
        next[idx] = session
      } else {
        next = [...classes, session]
      }
      if (!persistClasses(next)) return
      notifyImported()
      setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => { } })
    }

    const idx = classes.findIndex(candidate => candidate.id === session.id)
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
  }

  const handleImportClass = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > MAX_TRAINER_CLASS_FILE_SIZE) {
      onNotify?.('error', classFileCopy.importInvalid)
      return
    }

    try {
      const content = await file.text()
      const classified = classifyTrainerClassFileContent(content)
      if (classified.kind === 'encrypted') {
        setClassFileError('')
        setClassFileDialog({ mode: 'import', content, fileName: file.name })
        return
      }
      importClassSession(classified.session, true)
    } catch (error) {
      onNotify?.(
        'error',
        (error as Error).message === 'linked-trainer-class-file-not-supported'
          ? `${notifications.classImportFailed}: ${existingLearnerCopy.legacyImportRejected}`
          : classFileCopy.importInvalid,
      )
    }
  }

  const closeClassFileDialog = () => {
    if (classFileOperationRef.current) return
    setClassFileDialog(null)
    setClassFileError('')
  }

  const handleClassFilePasswordSubmit = async (password: string) => {
    if (!classFileDialog || classFileOperationRef.current) return
    classFileOperationRef.current = true
    setClassFileBusy(true)
    setClassFileError('')
    try {
      if (classFileDialog.mode === 'export') {
        const content = await encryptTrainerClassFileContent(classFileDialog.session, password)
        downloadTrainerClassFile(content)
        setClassFileDialog(null)
        onNotify?.('success', classFileCopy.exported)
      } else {
        const session = await decryptTrainerClassFileContent(classFileDialog.content, password)
        setClassFileDialog(null)
        importClassSession(session, false)
      }
    } catch (error) {
      const message = (error as Error).message
      if (message === 'browser-encryption-unavailable') {
        setClassFileError(classFileCopy.dialog.encryptionUnavailable)
      } else {
        setClassFileError(
          classFileDialog.mode === 'export'
            ? classFileCopy.dialog.exportFailed
            : classFileCopy.dialog.decryptFailed,
        )
      }
    } finally {
      classFileOperationRef.current = false
      setClassFileBusy(false)
    }
  }

  // ----- RENDER -----
  const editingClass = editingClassId
    ? classes.find((session) => session.id === editingClassId) ?? null
    : null

  // Keep this component mounted while a class switches to another landscape.
  // Its one-shot opening intent must survive until the target closure is ready.
  if (loadingLandscapes && activeClass) {
    return (
      <div className="min-h-screen bg-app-gradient text-slate-100 p-6">
        Landscapes laden ...
      </div>
    )
  }

  if (landscapeError && activeClass) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto mt-20 max-w-xl rounded-xl border border-amber-300 bg-amber-50 p-6 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/25">
          <h2 className="text-xl font-bold">{scopeCopy.courseLoadErrorTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{scopeCopy.courseLoadErrorText}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleShowAllClasses}
              className="rounded-lg border border-border-color bg-sidebar-bg px-4 py-2 font-medium text-text-primary hover:border-sky-400"
            >
              {scopeCopy.backToClasses}
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-500"
            >
              {scopeCopy.courseLoadRetry}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isCreating || editingClass) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8 flex items-center justify-center">
        <ClassSetup
          key={editingClass?.id ?? 'new-class'}
          initialSession={editingClass ?? undefined}
          onCancel={() => {
            setIsCreating(false)
            setEditingClassId(null)
          }}
          onSave={(session) => {
            const existingLocalLink = !editingClass && isExistingLearnerClassSession(session)
              ? classes.find((current) => (
                  isExistingLearnerClassSession(current)
                  && current.students[0]?.id === session.students[0]?.id
                )) ?? null
              : null
            const persistedSession = existingLocalLink
              ? { ...session, id: existingLocalLink.id }
              : session
            const next = editingClass
              ? classes.map((current) => current.id === persistedSession.id ? persistedSession : current)
              : existingLocalLink
                ? classes.map((current) => current.id === existingLocalLink.id ? persistedSession : current)
                : [...classes, persistedSession]
            if (!persistClasses(next)) return false
            if (!editingClass) {
              handleOpenClass(persistedSession)
            }
            setIsCreating(false)
            setEditingClassId(null)
            return true
          }}
        />
      </div>
    )
  }
  if (!activeClass) {
    return (
      <div className="min-h-screen bg-chat-bg p-12 text-text-primary">
        <ConfirmModal isOpen={confirmation.isOpen} onClose={closeConfirmation} onConfirm={confirmation.onConfirm} title={confirmation.title} confirmText={confirmation.confirmText} confirmClassName={confirmation.confirmClassName}>
          {confirmation.message}
        </ConfirmModal>
        <TrainerClassFilePasswordDialog
          isOpen={classFileDialog !== null}
          mode={classFileDialog?.mode ?? 'export'}
          fileName={classFileDialog?.mode === 'import' ? classFileDialog.fileName : undefined}
          busy={classFileBusy}
          error={classFileError}
          copy={classFileCopy.dialog}
          onClose={closeClassFileDialog}
          onClearError={() => setClassFileError('')}
          onSubmit={(password) => { void handleClassFilePasswordSubmit(password) }}
        />
        <header className="max-w-4xl mx-auto mb-12 flex justify-between items-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-700 dark:text-slate-200 sm:text-4xl">{t.dashboard}</h1>
          <div className="flex gap-3">
            <button onClick={() => fileInputRef.current?.click()} className="border border-border-color hover:bg-gray-200 dark:hover:bg-slate-800 px-4 py-2 rounded-lg text-text-secondary transition-colors">{t.import}</button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportClass}
              hidden
              accept={`${TRAINER_CLASS_FILE_EXTENSION},.json,application/json`}
            />
            <button
              onClick={() => setIsCreating(true)}
              className="bg-sky-600 hover:bg-sky-500 px-6 py-2 rounded-lg font-medium transition-colors text-white"
            >
              + {t.newClass}
            </button>
            {onLogout && (
              <LogoutButton
                onLogout={handleTrainerExit}
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
            <article key={c.id} className="relative flex flex-col text-left bg-sidebar-bg border border-border-color hover:border-sky-500 rounded-xl transition-all group overflow-hidden">
              <div className="flex justify-between items-start mb-1">
                <button
                  type="button"
                  onClick={() => handleOpenClass(c)}
                  aria-label={scopeCopy.openCourse(c.name)}
                  className="min-w-0 flex-1 p-6 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500"
                >
                  <div className="font-bold text-lg text-text-primary group-hover:text-sky-600 dark:group-hover:text-sky-400 pr-2">{c.name}</div>
                  <div className="mt-3 text-sm text-text-secondary mb-4">{c.students.length} {t.students}</div>
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
                </button>
                <div className="flex gap-2 p-4 pl-0" role="group" aria-label={scopeCopy.classActions(c.name)}>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      setEditingClassId(c.id)
                    }}
                    className="p-2 rounded-lg border border-border-color text-text-secondary hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                    title={scopeCopy.editTooltip}
                    aria-label={`${scopeCopy.editTooltip}: ${c.name}`}
                  >
                    <Pencil size={16} className="pointer-events-none" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleExportClass(e, c)}
                    className="p-2 rounded-lg border border-border-color text-text-secondary hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                    title={classFileCopy.exportTooltip}
                    aria-label={`${classFileCopy.exportTooltip}: ${c.name}`}
                  >
                    <Save size={16} className="pointer-events-none" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClass(e, c)}
                    className="p-2 rounded-lg border border-border-color text-text-secondary hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    title={t.classDeleteTooltip}
                    aria-label={`${t.classDeleteTooltip}: ${c.name}`}
                  >
                    <Trash2 size={16} className="pointer-events-none" />
                  </button>
                </div>
              </div>
            </article>
            )
          })}
          {classes.length === 0 && <div className="col-span-full text-center py-20 border-2 border-dashed border-border-color rounded-2xl text-text-secondary">{t.emptyClasses}</div>}
        </div>

      </div>
    )
  }
  return (
    <div className={`flex h-screen bg-chat-bg text-text-primary overflow-hidden ${trainerWorkspace === 'plan' ? 'flex-col md:flex-row' : ''}`}>
      <ConfirmModal isOpen={confirmation.isOpen} onClose={closeConfirmation} onConfirm={confirmation.onConfirm} title={confirmation.title} confirmText={confirmation.confirmText} confirmClassName={confirmation.confirmClassName}>
        {confirmation.message}
      </ConfirmModal>
      <aside className={`${trainerWorkspace === 'plan' ? 'w-full md:w-56' : 'w-72'} border-r border-border-color bg-sidebar-bg flex flex-col flex-shrink-0`}>
        <div className="p-4 border-b border-border-color flex justify-between items-start">
          <div>
            <button onClick={handleShowAllClasses} className="text-xs text-text-secondary hover:text-text-primary mb-2">← {t.allClasses}</button>
            <h2 className="font-bold text-sky-600 dark:text-sky-400 truncate" title={activeClass.name}>{activeClass.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            {onLogout && (
              <LogoutButton onLogout={handleTrainerExit} className="text-text-secondary hover:text-rose-600 dark:hover:text-rose-400" />
            )}
          </div>
        </div>

        {isExistingLearnerClassSession(activeClass) && trainerWorkspace !== 'plan' && (
          <div className="border-b border-border-color p-3">
            <label htmlFor="trainer-existing-learner-subject" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              {existingLearnerCopy.subjectSwitchLabel}
            </label>
            <select
              id="trainer-existing-learner-subject"
              value={activeClass.landscapeId}
              onChange={(event) => handleExistingLearnerSubjectChange(event.target.value)}
              className="w-full rounded-lg border border-border-color bg-input-bg p-2 text-sm text-text-primary"
            >
              {getExistingLearnerSubjectIds(
                activeClass.personalConfig ?? {},
                activeExistingLearnerLandscapeEntries,
                activeClass.rootLandscapeId,
              ).map((landscapeId, index) => {
                const entry = activeExistingLearnerLandscapeEntries.find(
                  (candidate) => candidate.meta.landscapeId === landscapeId,
                )
                const label = entry?.meta.subject?.trim()
                  || entry?.meta.title?.trim()
                  || (localizedLanguage === 'de'
                    ? `Personalisiertes Fach ${index + 1}`
                    : `Personalized subject ${index + 1}`)
                return <option key={landscapeId} value={landscapeId}>{label}</option>
              })}
            </select>
            <p className="mt-2 text-xs leading-5 text-text-secondary">{existingLearnerCopy.readOnlyHint}</p>
          </div>
        )}

        <nav className="grid grid-cols-2 gap-1 border-b border-border-color p-2" aria-label={coursePlanCopy.workspaceLabel}>
          <button
            type="button"
            onClick={() => handleTrainerWorkspaceChange('goals')}
            aria-current={trainerWorkspace === 'goals' ? 'page' : undefined}
            className={`flex min-h-10 items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${trainerWorkspace === 'goals' ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-100' : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-slate-900'}`}
            data-testid="trainer-goals-tab"
          >
            <BookOpenCheck size={16} aria-hidden="true" />
            {coursePlanCopy.goalsTab}
          </button>
          <button
            type="button"
            onClick={() => handleTrainerWorkspaceChange('plan')}
            aria-current={trainerWorkspace === 'plan' ? 'page' : undefined}
            className={`flex min-h-10 items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${trainerWorkspace === 'plan' ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-100' : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-slate-900'}`}
            data-testid="trainer-plan-tab"
          >
            <CalendarRange size={16} aria-hidden="true" />
            {coursePlanCopy.planTab}
          </button>
        </nav>

        {trainerWorkspace === 'plan' ? (
          <div className="hidden flex-1 overflow-y-auto p-4 md:block">
            <p className="text-xs leading-6 text-text-secondary">{activeClassIsExistingLearner
              ? localizedLanguage === 'de' ? 'Du planst den Rahmen. SkillPilot führt den Schüler im Chat durch seine Aufgaben.' : 'You plan the learning path. SkillPilot guides the learner through their work in chat.'
              : coursePlanCopy.teacherLeadsBody}</p>
            <details className="mt-5 text-xs text-text-secondary">
              <summary className="cursor-pointer font-semibold">{localizedLanguage === 'de' ? 'Speicherung & Datenschutz' : 'Storage & privacy'}</summary>
              <p className="mt-2 leading-5">{coursePlanCopy.studentPrivacyHint}</p>
            </details>
          </div>
        ) : (
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
        )}
      </aside>
      {trainerWorkspace === 'plan' ? (
        isTrainerCompositionPending ? (
          <main className="flex flex-1 items-center justify-center bg-chat-bg p-8 text-text-secondary" data-testid="trainer-course-plan-view">
            {scopeCopy.compositionLoading}
          </main>
        ) : isTrainerCompositionUnavailable ? (
          <main className="flex flex-1 items-center justify-center bg-chat-bg p-8">
            <div className="max-w-lg rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
              <p>{scopeCopy.compositionUnavailable}</p>
              <button
                type="button"
                onClick={() => setCompositionRetryToken((current) => current + 1)}
                className="mt-3 rounded-lg bg-sky-600 px-3 py-2 font-semibold text-white transition-colors hover:bg-sky-500"
              >
                {scopeCopy.compositionRetry}
              </button>
            </div>
          </main>
        ) : (
          <CoursePlanPilotView
            key={`${activeCoursePlanStorageId}:${activeCoursePlanLearnerId}:${localizedLanguage}`}
            classId={activeCoursePlanStorageId}
            classLabel={activeClass.name}
            goals={coursePlanGoalIndex}
            visibleChildrenByParent={coursePlanChildrenByParent}
            learnerId={activeCoursePlanLearnerId || undefined}
            landscapeId={activeClassIsExistingLearner ? activeClass.landscapeId : undefined}
            language={localizedLanguage}
            section={coursePlanSection}
            onSectionChange={setCoursePlanSection}
            sharedActivationAvailable={activeClassIsExistingLearner}
            sharedActivationPanel={activeClassIsExistingLearner ? (
              <TrainerLearningPlanActivation
                classSession={activeClass}
                learnerId={activeCoursePlanLearnerId}
                landscapeEntries={activeExistingLearnerLandscapeEntries}
                runtimeCatalogState={runtimeCatalogState}
                language={localizedLanguage}
                refreshToken={coursePlanActivationRefreshToken}
                hasUnsavedActiveDraft={coursePlanHasUnsavedDraft}
                onSelectSubject={handleExistingLearnerSubjectChange}
                onPreview={() => setCoursePlanSection('preview')}
                onNotify={onNotify}
              />
            ) : undefined}
            sharedPreviewPanel={activeClassIsExistingLearner && coursePlanSection === 'preview' ? (
              <TrainerLearningPlanPreview
                classSession={activeClass}
                learnerId={activeCoursePlanLearnerId}
                landscapeEntries={activeExistingLearnerLandscapeEntries}
                runtimeCatalogState={runtimeCatalogState}
                language={localizedLanguage}
                refreshToken={coursePlanActivationRefreshToken}
                hasUnsavedActiveDraft={coursePlanHasUnsavedDraft}
                onSelectSubject={handleExistingLearnerSubjectChange}
              />
            ) : undefined}
            onLocalPlanChange={activeClassIsExistingLearner ? handleLocalCoursePlanChange : undefined}
            onDraftStateChange={setCoursePlanHasUnsavedDraft}
            onNotify={onNotify}
          />
        )
      ) : (
        <>
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
              readOnly={activeClassIsExistingLearner}
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
                  {!activeClassIsExistingLearner && (
                    <button onClick={handleAssignToClass} disabled={isAssigning} className={`w-full px-6 py-3 rounded-lg font-medium transition-colors text-white disabled:bg-gray-400 dark:disabled:bg-slate-700 disabled:text-gray-200 dark:disabled:text-slate-500 ${isRemoving ? 'bg-rose-600 hover:bg-rose-500' : 'bg-sky-600 hover:bg-sky-500'}`}>
                      {isAssigning
                          ? (isRemoving ? t.removing : t.assigning)
                        : isRemoving
                          ? interpolateTemplate(t.removeFromPlan, { count: plannedCount })
                          : interpolateTemplate(t.assignToAll, { count: activeClass.students.length })}
                    </button>
                  )}
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
                showLearnerTools={!activeClassIsExistingLearner}
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
        </>
      )}
    </div>
  )
}
