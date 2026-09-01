import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Info,
  Pencil,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  Target,
  Trash2,
} from 'lucide-react'

import type { UiGoal } from '../goalTypes'
import type {
  LearningBlockMetrics,
  TeacherCoursePlan,
  TeacherCoursePlanBlock,
} from '../coursePlanTypes'
import type { ToastKind } from '../hooks/useToast'
import {
  addCoursePlanDays,
  appendCourseCoverageAttestation,
  compareCoursePlanDates,
  countCoursePlanWorkdaysInclusive,
  createTeacherCoursePlan,
  evaluateTeacherCoursePlan,
  isCourseGoalCovered,
  loadTeacherCoursePlan,
  migrateTeacherCoursePlanBaseline,
  parseCoursePlanDate,
  resolveAtomicGoalDescendants,
  reviseTeacherCoursePlan,
  saveTeacherCoursePlan,
  toggleCourseGoalCoverage,
  undoLastTeacherCoursePlanRevision,
} from '../utils/localTeacherCoursePlan'
import { getCoursePlanCopy } from '../utils/coursePlanCopy'
import {
  materializeLearnerLearningPlanCopy,
  type LearnerLearningPlanCopy,
} from '../utils/learnerCoursePlanPublication'
import {
  getLearnerLearningPlan,
  LearnerLearningPlanApiError,
  saveLearnerLearningPlan,
} from '../utils/learnerLearningPlanApi'
import { fetchLearnerPlanningScope } from '../utils/learnerPlanningScope'
import {
  berlinDateKey,
  millisecondsUntilNextBerlinDateBoundary,
} from '../utils/learnerLearningPlanReadModel'
import { PacingGauge, type PacingGaugeStatus } from './PacingGauge'

type CoursePlanBlockKind = TeacherCoursePlanBlock['kind']

interface CoursePlanPilotViewProps {
  classId: string
  classLabel: string
  goals: ReadonlyMap<string, UiGoal>
  visibleChildrenByParent?: ReadonlyMap<string, readonly string[]>
  learnerId?: string
  landscapeId?: string
  language: 'de' | 'en'
  onNotify?: (kind: ToastKind, message: string) => void
}

interface BlockDraft {
  kind: CoursePlanBlockKind
  goalId: string
  title: string
  startDate: string
  endDate: string
}

interface PlanPublicationConfirmation {
  learnerId: string
  landscapeId: string
  sourcePlanRevision: number
  expectedRevision: number
  existingPlan: boolean
  copy: LearnerLearningPlanCopy
}

const randomId = (prefix: string) => {
  const suffix = globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}-${suffix}`
}

const createDraft = (asOf: string): BlockDraft => ({
  kind: 'learning',
  goalId: '',
  title: '',
  startDate: asOf,
  endDate: addCoursePlanDays(asOf, 13) ?? asOf,
})

const serializeDraft = (draft: BlockDraft) => JSON.stringify(draft)

const formatDate = (value: string, language: 'de' | 'en', options?: Intl.DateTimeFormatOptions) => {
  const parsed = parseCoursePlanDate(value)
  if (!parsed) return value
  const date = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day))
  return new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
    ...options,
  }).format(date)
}

const formatDateRange = (
  block: TeacherCoursePlanBlock,
  language: 'de' | 'en',
) => block.kind === 'milestone'
  ? formatDate(block.date, language)
  : `${formatDate(block.startDate, language)} – ${formatDate(block.endDate, language)}`

const formatNumber = (value: number, language: 'de' | 'en') => new Intl.NumberFormat(
  language === 'de' ? 'de-DE' : 'en-GB',
  { maximumFractionDigits: 1 },
).format(value)

const blockSortDate = (block: TeacherCoursePlanBlock) => (
  block.kind === 'milestone' ? block.date : block.startDate
)

const sortedBlocks = (blocks: readonly TeacherCoursePlanBlock[]) => [...blocks].sort((left, right) => (
  blockSortDate(left).localeCompare(blockSortDate(right))
  || left.id.localeCompare(right.id)
))

const statusPresentation = (
  status: LearningBlockMetrics['coverageStatus'] | undefined,
  copy: ReturnType<typeof getCoursePlanCopy>,
) => {
  if (status === 'on-track') {
    return {
      label: copy.planStatusOnTrack,
      className: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-100',
    }
  }
  if (status === 'ahead') {
    return {
      label: copy.planStatusAhead,
      className: 'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-900/70 dark:bg-sky-950/30 dark:text-sky-100',
    }
  }
  if (status === 'behind') {
    return {
      label: copy.planStatusBehind,
      className: 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100',
    }
  }
  return {
    label: copy.planStatusUnavailable,
    className: 'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100',
  }
}

const pacingUnavailableReason = (
  reason: ReturnType<typeof evaluateTeacherCoursePlan>['pacingGauge']['reason'],
  copy: ReturnType<typeof getCoursePlanCopy>,
) => {
  if (reason === 'coverage-not-attested') return copy.paceUnavailableAttestation
  if (reason === 'coverage-history-missing') return copy.paceUnavailableHistory
  if (reason === 'plan-revision-too-recent') return copy.paceUnavailableNew
  if (reason === 'no-expected-progress-in-window') {
    return copy.planningBasisHint
  }
  return copy.planStatusUnavailable
}

const planForClass = (classId: string, asOf: string) => {
  const loaded = loadTeacherCoursePlan(classId)
  if (loaded.quality.status === 'invalid') {
    return { plan: null, storageInvalid: true }
  }
  return {
    plan: loaded.plan ?? createTeacherCoursePlan({
      classId,
      createdOn: asOf,
      recordedAt: new Date().toISOString(),
    }),
    storageInvalid: false,
  }
}

export const CoursePlanPilotView = ({
  classId,
  classLabel,
  goals,
  visibleChildrenByParent,
  learnerId,
  landscapeId,
  language,
  onNotify,
}: CoursePlanPilotViewProps) => {
  const copy = useMemo(() => getCoursePlanCopy(language), [language])
  const [asOf, setAsOf] = useState(() => berlinDateKey())
  const initial = useMemo(() => planForClass(classId, asOf), [asOf, classId])
  const [plan, setPlan] = useState<TeacherCoursePlan | null>(initial.plan)
  const [storageInvalid, setStorageInvalid] = useState(initial.storageInvalid)
  const [planLabelDraft, setPlanLabelDraft] = useState(initial.plan?.schoolYearLabel ?? '')
  const [draft, setDraft] = useState<BlockDraft>(() => createDraft(asOf))
  const [draftBaseline, setDraftBaseline] = useState<string | null>(null)
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
  const [showBlockForm, setShowBlockForm] = useState(false)
  const [formError, setFormError] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [goalSearch, setGoalSearch] = useState('')
  const [baselineLoadState, setBaselineLoadState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [baselineRetry, setBaselineRetry] = useState(0)
  const [savingBlock, setSavingBlock] = useState(false)
  const [publicationState, setPublicationState] = useState<'idle' | 'checking' | 'saving'>('idle')
  const [publicationConfirmation, setPublicationConfirmation] = useState<PlanPublicationConfirmation | null>(null)
  const [publicationMessage, setPublicationMessage] = useState('')
  const [publicationError, setPublicationError] = useState('')
  const [coverageEffectiveOn, setCoverageEffectiveOn] = useState(asOf)
  const previousAsOfRef = useRef(asOf)
  const planRef = useRef(plan)
  const blockFormRef = useRef<HTMLElement | null>(null)
  const blockFormHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const saveBlockRequestRef = useRef<{ token: number; controller: AbortController | null }>({
    token: 0,
    controller: null,
  })
  const publicationRequestRef = useRef<{ token: number; controller: AbortController | null }>({
    token: 0,
    controller: null,
  })
  planRef.current = plan

  useEffect(() => {
    let boundaryTimer: ReturnType<typeof setTimeout> | null = null

    const refreshDate = () => {
      const nextAsOf = berlinDateKey()
      const previousAsOf = previousAsOfRef.current
      if (nextAsOf === previousAsOf) return
      previousAsOfRef.current = nextAsOf
      setCoverageEffectiveOn((current) => current === previousAsOf ? nextAsOf : current)
      setAsOf(nextAsOf)
    }
    const scheduleBoundary = () => {
      if (boundaryTimer !== null) clearTimeout(boundaryTimer)
      boundaryTimer = setTimeout(() => {
        refreshDate()
        scheduleBoundary()
      }, millisecondsUntilNextBerlinDateBoundary())
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return
      refreshDate()
      scheduleBoundary()
    }

    scheduleBoundary()
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      if (boundaryTimer !== null) clearTimeout(boundaryTimer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const normalizedPublicationLearnerId = learnerId?.trim() ?? ''
  const normalizedPublicationLandscapeId = landscapeId?.trim() ?? ''
  const publicationContextKey = JSON.stringify([
    normalizedPublicationLearnerId,
    normalizedPublicationLandscapeId,
  ])
  const latestPublicationContextRef = useRef({
    learnerId: normalizedPublicationLearnerId,
    landscapeId: normalizedPublicationLandscapeId,
  })
  const previousPublicationContextKeyRef = useRef(publicationContextKey)
  latestPublicationContextRef.current = {
    learnerId: normalizedPublicationLearnerId,
    landscapeId: normalizedPublicationLandscapeId,
  }

  const requiresLearnerBaseline = Boolean(learnerId && landscapeId)
  const canPublishToLearner = Boolean(
    normalizedPublicationLearnerId && normalizedPublicationLandscapeId,
  )
  const hasLearningBlock = plan?.blocks.some((block) => block.kind === 'learning') === true
  const landscapeBaseline = plan?.planningBaseline?.source === 'learner-planning-landscape-v1'
    ? plan.planningBaseline
    : null
  const baselineMatchesContext = !requiresLearnerBaseline
    || !hasLearningBlock
    || (landscapeBaseline?.landscapeId === landscapeId)
  const needsLearnerBaseline = requiresLearnerBaseline
    && hasLearningBlock
    && (!plan?.planningBaseline || plan.planningBaseline.source === 'learner-planning-scope-v1')

  const evaluation = useMemo(() => (
    plan && !needsLearnerBaseline && baselineMatchesContext
      ? evaluateTeacherCoursePlan(plan, goals, asOf, visibleChildrenByParent)
      : null
  ), [asOf, baselineMatchesContext, goals, needsLearnerBaseline, plan, visibleChildrenByParent])
  const planLabelDirty = planLabelDraft.trim() !== (plan?.schoolYearLabel ?? '')
  const blockDraftDirty = showBlockForm
    && draftBaseline !== null
    && serializeDraft(draft) !== draftBaseline
  const hasUnsavedDraft = planLabelDirty || blockDraftDirty
  const publicationPlanReady = Boolean(
    evaluation
    && evaluation.quality.status !== 'invalid'
    && evaluation.metrics
    && evaluation.metrics.plannedGoalCount > 0,
  )

  const assignmentByBlockId = useMemo(() => new Map(
    (evaluation?.assignments ?? []).map((assignment) => [assignment.blockId, assignment]),
  ), [evaluation?.assignments])
  const metricByBlockId = useMemo(() => new Map(
    (evaluation?.blocks ?? []).map((metric) => [metric.blockId, metric]),
  ), [evaluation?.blocks])
  const coveredGoalIds = useMemo(
    () => new Set(evaluation?.coverage?.coveredGoalIds ?? []),
    [evaluation?.coverage?.coveredGoalIds],
  )

  const plannableGoalOptions = useMemo(() => {
    const scopeGoalIds = landscapeBaseline
      ? new Set(landscapeBaseline.scopeAtomicGoalIds)
      : null
    const openGoalIds = landscapeBaseline
      ? new Set(landscapeBaseline.openAtomicGoalIds)
      : null
    return Array.from(goals.values())
      .map((goal) => {
        const resolution = resolveAtomicGoalDescendants(goal.id, goals, visibleChildrenByParent)
        const scopeAtomicGoalIds = resolution.quality.status === 'complete'
          ? scopeGoalIds
            ? resolution.atomicGoalIds.filter((goalId) => scopeGoalIds.has(goalId))
            : resolution.atomicGoalIds
          : []
        return {
          goal,
          totalCount: scopeAtomicGoalIds.length,
          count: openGoalIds
            ? scopeAtomicGoalIds.filter((goalId) => openGoalIds.has(goalId)).length
            : scopeAtomicGoalIds.length,
        }
      })
      .filter(({ totalCount }) => totalCount > 0)
      .sort((left, right) => (
        left.goal.phase.localeCompare(right.goal.phase)
        || left.goal.title.localeCompare(right.goal.title, language === 'de' ? 'de-DE' : 'en-GB')
      ))
  }, [goals, landscapeBaseline, language, visibleChildrenByParent])

  const goalOptions = useMemo(() => {
    const normalizedSearch = goalSearch.trim().toLocaleLowerCase(language === 'de' ? 'de-DE' : 'en-GB')
    return plannableGoalOptions
      .filter(({ goal }) => {
        if (!normalizedSearch || goal.id === draft.goalId) return true
        return `${goal.title} ${goal.phase} ${goal.area}`.toLocaleLowerCase(
          language === 'de' ? 'de-DE' : 'en-GB',
        ).includes(normalizedSearch)
      })
  }, [draft.goalId, goalSearch, language, plannableGoalOptions])

  const persist = (nextPlan: TeacherCoursePlan | null) => {
    if (!nextPlan) {
      onNotify?.('error', copy.saveFailed)
      return false
    }
    const result = saveTeacherCoursePlan(nextPlan)
    if (!result.ok) {
      setStorageInvalid(true)
      onNotify?.('error', copy.saveFailed)
      return false
    }
    planRef.current = nextPlan
    setPlan(nextPlan)
    setStorageInvalid(false)
    return true
  }

  const revise = (
    blocks: readonly TeacherCoursePlanBlock[],
    schoolYearLabel?: string,
    planningBaseline = plan?.planningBaseline,
  ) => {
    if (!plan) return false
    return persist(reviseTeacherCoursePlan(plan, {
      blocks,
      ...(schoolYearLabel === undefined ? {} : { schoolYearLabel }),
      ...(planningBaseline ? { planningBaseline } : {}),
      changedOn: asOf,
      recordedAt: new Date().toISOString(),
    }))
  }

  useEffect(() => {
    if (!plan || !needsLearnerBaseline || !learnerId || !landscapeId) {
      setBaselineLoadState('idle')
      return
    }
    const firstLearningBlock = sortedBlocks(plan.blocks).find((block) => block.kind === 'learning')
    if (!firstLearningBlock || firstLearningBlock.kind !== 'learning') return

    const controller = new AbortController()
    const sourceRevision = plan.revision
    let active = true
    setBaselineLoadState('loading')
    void fetchLearnerPlanningScope({
      learnerId,
      landscapeId,
      signal: controller.signal,
    }).then((planningBaseline) => {
      if (!active || planRef.current?.revision !== sourceRevision) return
      const revisionInput = {
        planningBaseline,
        changedOn: asOf,
        recordedAt: new Date().toISOString(),
      }
      const migrated = plan.planningBaseline?.source === 'learner-planning-scope-v1'
        ? migrateTeacherCoursePlanBaseline(plan, revisionInput)
        : reviseTeacherCoursePlan(plan, revisionInput)
      if (!migrated || !saveTeacherCoursePlan(migrated).ok) {
        throw new Error('Could not persist the authoritative planning basis.')
      }
      planRef.current = migrated
      setPlan(migrated)
      setStorageInvalid(false)
      setBaselineLoadState('idle')
    }).catch((error) => {
      if (!active || controller.signal.aborted) return
      console.warn('Could not load learner planning scope', error)
      setBaselineLoadState('error')
    })
    return () => {
      active = false
      controller.abort()
    }
  }, [asOf, baselineRetry, landscapeId, learnerId, needsLearnerBaseline, plan])

  useEffect(() => () => {
    saveBlockRequestRef.current.token += 1
    saveBlockRequestRef.current.controller?.abort()
    saveBlockRequestRef.current.controller = null
    publicationRequestRef.current.token += 1
    publicationRequestRef.current.controller?.abort()
    publicationRequestRef.current.controller = null
  }, [])

  useEffect(() => {
    if (previousPublicationContextKeyRef.current === publicationContextKey) return
    previousPublicationContextKeyRef.current = publicationContextKey
    publicationRequestRef.current.token += 1
    publicationRequestRef.current.controller?.abort()
    publicationRequestRef.current.controller = null
    setPublicationState('idle')
    setPublicationConfirmation(null)
    setPublicationMessage('')
    setPublicationError('')
  }, [publicationContextKey])

  useEffect(() => {
    if (!hasUnsavedDraft || !publicationConfirmation) return
    publicationRequestRef.current.token += 1
    publicationRequestRef.current.controller?.abort()
    publicationRequestRef.current.controller = null
    setPublicationState('idle')
    setPublicationConfirmation(null)
    setPublicationMessage('')
    setPublicationError(copy.planChangedDuringSave)
  }, [copy.planChangedDuringSave, hasUnsavedDraft, publicationConfirmation])

  useEffect(() => {
    if (!showBlockForm) return
    const form = blockFormRef.current
    const heading = blockFormHeadingRef.current
    if (!form || !heading) return
    form.scrollIntoView({ block: 'start' })
    heading.focus({ preventScroll: true })
  }, [editingBlockId, showBlockForm])

  const cancelPendingBlockSave = () => {
    saveBlockRequestRef.current.token += 1
    saveBlockRequestRef.current.controller?.abort()
    saveBlockRequestRef.current.controller = null
    setSavingBlock(false)
  }

  const cancelPublication = () => {
    publicationRequestRef.current.token += 1
    publicationRequestRef.current.controller?.abort()
    publicationRequestRef.current.controller = null
    setPublicationState('idle')
    setPublicationConfirmation(null)
  }

  const preparePublication = async () => {
    const currentPlan = planRef.current
    const normalizedLearnerId = normalizedPublicationLearnerId
    const normalizedLandscapeId = normalizedPublicationLandscapeId
    if (
      !currentPlan
      || !normalizedLearnerId
      || !normalizedLandscapeId
      || hasUnsavedDraft
      || !publicationPlanReady
      || publicationState !== 'idle'
      || publicationRequestRef.current.controller !== null
    ) return

    const materialized = materializeLearnerLearningPlanCopy({
      plan: currentPlan,
      fallbackPlanLabel: classLabel,
      goals,
      visibleChildrenByParent,
    })
    if (!materialized.ok) {
      setPublicationConfirmation(null)
      setPublicationMessage('')
      setPublicationError(copy.publishUnavailable)
      onNotify?.('error', copy.publishUnavailable)
      return
    }
    if (materialized.copy.atomicGoalCount === 0) {
      setPublicationConfirmation(null)
      setPublicationMessage('')
      setPublicationError(copy.publishUnavailable)
      onNotify?.('error', copy.publishUnavailable)
      return
    }

    const requestToken = publicationRequestRef.current.token + 1
    const controller = new AbortController()
    publicationRequestRef.current = { token: requestToken, controller }
    const sourcePlanRevision = currentPlan.revision
    setPublicationState('checking')
    setPublicationConfirmation(null)
    setPublicationMessage('')
    setPublicationError('')
    try {
      let existingPlan = false
      let expectedRevision = 0
      try {
        const cockpitPlan = await getLearnerLearningPlan(
          normalizedLearnerId,
          normalizedLandscapeId,
          asOf,
          { signal: controller.signal },
        )
        existingPlan = true
        expectedRevision = cockpitPlan.revision
      } catch (error) {
        if (!(error instanceof LearnerLearningPlanApiError) || error.status !== 404) throw error
      }
      if (
        controller.signal.aborted
        || publicationRequestRef.current.token !== requestToken
      ) return
      const latestContext = latestPublicationContextRef.current
      if (
        latestContext.learnerId !== normalizedLearnerId
        || latestContext.landscapeId !== normalizedLandscapeId
      ) return
      if (planRef.current?.revision !== sourcePlanRevision) {
        setPublicationError(copy.planChangedDuringSave)
        return
      }
      setPublicationConfirmation({
        learnerId: normalizedLearnerId,
        landscapeId: normalizedLandscapeId,
        sourcePlanRevision,
        expectedRevision,
        existingPlan,
        copy: materialized.copy,
      })
    } catch (error) {
      if (controller.signal.aborted || publicationRequestRef.current.token !== requestToken) return
      console.warn('Could not inspect learner cockpit plan', error)
      setPublicationError(copy.publishFailed)
      onNotify?.('error', copy.publishFailed)
    } finally {
      if (publicationRequestRef.current.token === requestToken) {
        publicationRequestRef.current.controller = null
        setPublicationState('idle')
      }
    }
  }

  const confirmPublication = async () => {
    const confirmation = publicationConfirmation
    const normalizedLearnerId = normalizedPublicationLearnerId
    const normalizedLandscapeId = normalizedPublicationLandscapeId
    if (
      !confirmation
      || !normalizedLearnerId
      || !normalizedLandscapeId
      || publicationState !== 'idle'
      || publicationRequestRef.current.controller !== null
    ) return
    if (hasUnsavedDraft) {
      setPublicationConfirmation(null)
      setPublicationMessage('')
      setPublicationError(copy.planChangedDuringSave)
      return
    }
    if (
      confirmation.learnerId !== normalizedLearnerId
      || confirmation.landscapeId !== normalizedLandscapeId
    ) {
      setPublicationConfirmation(null)
      setPublicationMessage('')
      setPublicationError(copy.publishFailed)
      return
    }
    if (planRef.current?.revision !== confirmation.sourcePlanRevision) {
      setPublicationConfirmation(null)
      setPublicationError(copy.planChangedDuringSave)
      return
    }

    const requestToken = publicationRequestRef.current.token + 1
    const controller = new AbortController()
    publicationRequestRef.current = { token: requestToken, controller }
    setPublicationState('saving')
    setPublicationMessage('')
    setPublicationError('')
    try {
      const savedPlan = await saveLearnerLearningPlan(
        normalizedLearnerId,
        normalizedLandscapeId,
        {
          expectedRevision: confirmation.expectedRevision,
          planLabel: confirmation.copy.planLabel,
          blocks: confirmation.copy.blocks,
        },
        { signal: controller.signal },
      )
      if (
        controller.signal.aborted
        || publicationRequestRef.current.token !== requestToken
      ) return
      const latestContext = latestPublicationContextRef.current
      if (
        latestContext.learnerId !== confirmation.learnerId
        || latestContext.landscapeId !== confirmation.landscapeId
      ) return
      const successMessage = copy.publishSuccess(
        savedPlan.revision,
        savedPlan.metrics.totalPlanned,
      )
      setPublicationConfirmation(null)
      setPublicationMessage(successMessage)
      onNotify?.('success', successMessage)
    } catch (error) {
      if (controller.signal.aborted || publicationRequestRef.current.token !== requestToken) return
      const revisionConflict = error instanceof LearnerLearningPlanApiError
        && error.status === 409
        && /revision|expectedRevision/iu.test(error.message)
      const noOpenGoals = error instanceof LearnerLearningPlanApiError
        && error.status === 409
        && /no currently open atomic goals/iu.test(error.message)
      const message = revisionConflict
        ? copy.publishConflict
        : noOpenGoals
          ? copy.publishNoOpenGoals
          : copy.publishFailed
      if (!revisionConflict && !noOpenGoals) {
        console.warn('Could not publish learner cockpit plan', error)
      }
      setPublicationConfirmation(null)
      setPublicationError(message)
      onNotify?.('error', message)
    } finally {
      if (publicationRequestRef.current.token === requestToken) {
        publicationRequestRef.current.controller = null
        setPublicationState('idle')
      }
    }
  }

  const savePlanLabel = () => {
    if (!plan || planLabelDraft.trim() === (plan.schoolYearLabel ?? '')) return
    revise(plan.blocks, planLabelDraft.trim())
  }

  const openNewBlock = () => {
    cancelPendingBlockSave()
    const nextDraft = createDraft(asOf)
    setDraft(nextDraft)
    setDraftBaseline(serializeDraft(nextDraft))
    setEditingBlockId(null)
    setFormError('')
    setGoalSearch('')
    setPendingDeleteId(null)
    setShowBlockForm(true)
  }

  const openEditBlock = (block: TeacherCoursePlanBlock) => {
    cancelPendingBlockSave()
    const nextDraft = block.kind === 'milestone'
      ? {
          kind: block.kind,
          goalId: block.goalId ?? '',
          title: block.title,
          startDate: block.date,
          endDate: block.date,
        }
      : {
          kind: block.kind,
          goalId: block.kind === 'learning' ? block.goalId : '',
          title: block.title ?? '',
          startDate: block.startDate,
          endDate: block.endDate,
        }
    setDraft(nextDraft)
    setDraftBaseline(serializeDraft(nextDraft))
    setEditingBlockId(block.id)
    setFormError('')
    setGoalSearch('')
    setPendingDeleteId(null)
    setShowBlockForm(true)
  }

  const saveBlock = async () => {
    if (!plan || savingBlock) return
    if (!parseCoursePlanDate(draft.startDate) || !parseCoursePlanDate(draft.endDate)) {
      setFormError(copy.invalidDateRange)
      return
    }
    if (draft.kind !== 'milestone' && compareCoursePlanDates(draft.startDate, draft.endDate) === 1) {
      setFormError(copy.invalidDateRange)
      return
    }
    if (draft.kind === 'learning') {
      if (!draft.goalId) {
        setFormError(copy.missingGoal)
        return
      }
      const resolution = resolveAtomicGoalDescendants(draft.goalId, goals, visibleChildrenByParent)
      if (resolution.quality.status !== 'complete' || resolution.atomicGoalIds.length === 0) {
        setFormError(copy.noPlannableGoals)
        return
      }
    } else if (draft.kind === 'milestone') {
      if (draft.goalId) {
        const resolution = resolveAtomicGoalDescendants(draft.goalId, goals, visibleChildrenByParent)
        if (resolution.quality.status !== 'complete' || resolution.atomicGoalIds.length === 0) {
          setFormError(copy.noPlannableGoals)
          return
        }
      }
      if (!draft.title.trim() && !draft.goalId) {
        setFormError(copy.missingTitle)
        return
      }
    } else if (!draft.title.trim()) {
      setFormError(copy.missingTitle)
      return
    }

    const id = editingBlockId ?? randomId('course-plan-block')
    const nextBlock: TeacherCoursePlanBlock = draft.kind === 'learning'
      ? {
          id,
          kind: 'learning',
          goalId: draft.goalId,
          ...(draft.title.trim() ? { title: draft.title.trim() } : {}),
          startDate: draft.startDate,
          endDate: draft.endDate,
        }
      : draft.kind === 'buffer'
        ? {
            id,
            kind: 'buffer',
            title: draft.title.trim(),
            startDate: draft.startDate,
            endDate: draft.endDate,
          }
        : {
            id,
            kind: 'milestone',
            title: draft.title.trim() || goals.get(draft.goalId)?.title || draft.goalId,
            ...(draft.goalId ? { goalId: draft.goalId } : {}),
            date: draft.startDate,
          }
    const nextBlocks = editingBlockId
      ? plan.blocks.map((block) => block.id === editingBlockId ? nextBlock : block)
      : [...plan.blocks, nextBlock]
    let planningBaseline = plan.planningBaseline?.source === 'learner-planning-landscape-v1'
      ? plan.planningBaseline
      : undefined
    if (draft.kind === 'learning' && requiresLearnerBaseline && !planningBaseline) {
      if (!learnerId || !landscapeId) {
        setFormError(copy.planningScopeLoadError)
        return
      }
      const requestToken = saveBlockRequestRef.current.token + 1
      const controller = new AbortController()
      saveBlockRequestRef.current.controller?.abort()
      saveBlockRequestRef.current = { token: requestToken, controller }
      const sourceRevision = plan.revision
      setSavingBlock(true)
      try {
        planningBaseline = await fetchLearnerPlanningScope({
          learnerId,
          landscapeId,
          signal: controller.signal,
        })
      } catch (error) {
        if (controller.signal.aborted || saveBlockRequestRef.current.token !== requestToken) return
        console.warn('Could not establish learner planning scope', error)
        setFormError(copy.planningScopeLoadError)
        return
      } finally {
        if (saveBlockRequestRef.current.token === requestToken) {
          saveBlockRequestRef.current.controller = null
          setSavingBlock(false)
        }
      }
      if (
        controller.signal.aborted
        || saveBlockRequestRef.current.token !== requestToken
        || planRef.current?.revision !== sourceRevision
      ) {
        if (!controller.signal.aborted && saveBlockRequestRef.current.token === requestToken) {
          setFormError(copy.planChangedDuringSave)
        }
        return
      }
    }
    const revisionInput = {
      blocks: nextBlocks,
      ...(planningBaseline ? { planningBaseline } : {}),
      changedOn: asOf,
      recordedAt: new Date().toISOString(),
    }
    const revised = plan.planningBaseline?.source === 'learner-planning-scope-v1' && planningBaseline
      ? migrateTeacherCoursePlanBaseline(plan, { ...revisionInput, planningBaseline })
      : reviseTeacherCoursePlan(plan, revisionInput)
    if (planningBaseline && draft.kind === 'learning') {
      const validation = revised
        ? evaluateTeacherCoursePlan(revised, goals, asOf, visibleChildrenByParent)
        : null
      if (!validation || validation.quality.status === 'invalid' || !validation.metrics) {
        setFormError(copy.noPlannableGoals)
        return
      }
      const savedAssignment = validation.assignments.find(({ blockId }) => blockId === id)
      if (!savedAssignment || savedAssignment.atomicGoalIds.length === 0) {
        setFormError(copy.noPlannableGoals)
        return
      }
    }
    if (persist(revised)) {
      setShowBlockForm(false)
      setDraftBaseline(null)
      setEditingBlockId(null)
      setFormError('')
      setGoalSearch('')
    }
  }

  const removeBlock = (blockId: string) => {
    if (!plan) return
    if (pendingDeleteId !== blockId) {
      setPendingDeleteId(blockId)
      return
    }
    if (revise(plan.blocks.filter((block) => block.id !== blockId))) {
      setPendingDeleteId(null)
      if (editingBlockId === blockId) {
        setEditingBlockId(null)
        setShowBlockForm(false)
        setDraftBaseline(null)
      }
    }
  }

  const undoLastChange = () => {
    if (!plan) return
    const undone = undoLastTeacherCoursePlanRevision(plan, {
      changedOn: asOf,
      recordedAt: new Date().toISOString(),
    })
    if (persist(undone)) {
      setPlanLabelDraft(undone?.schoolYearLabel ?? '')
      setShowBlockForm(false)
      setDraftBaseline(null)
      setEditingBlockId(null)
      setPendingDeleteId(null)
    }
  }

  const toggleCoverage = (goalId: string) => {
    if (!plan) return
    if (
      !parseCoursePlanDate(coverageEffectiveOn)
      || compareCoursePlanDates(coverageEffectiveOn, asOf) === 1
    ) {
      onNotify?.('error', copy.coverageEffectiveDateInvalid)
      return
    }
    persist(toggleCourseGoalCoverage(plan, {
      id: randomId('course-coverage-event'),
      goalId,
      effectiveOn: coverageEffectiveOn,
      recordedAt: new Date().toISOString(),
    }))
  }

  const attestCoverage = () => {
    if (!plan) return
    persist(appendCourseCoverageAttestation(plan, {
      id: randomId('course-coverage-attestation'),
      throughDate: asOf,
      recordedAt: new Date().toISOString(),
    }))
  }

  const exportPlan = () => {
    if (!plan) return
    const redactedPlan = Object.fromEntries(
      Object.entries(plan)
        .filter(([key]) => key !== 'classId' && key !== 'planningBaseline')
        .map(([key, value]) => [
          key,
          key === 'revisionHistory' && Array.isArray(value)
            ? value.map((snapshot) => Object.fromEntries(
                Object.entries(snapshot).filter(([snapshotKey]) => snapshotKey !== 'planningBaseline'),
              ))
            : value,
        ]),
    )
    const payload = {
      exportKind: 'skillpilot-local-course-plan-v1',
      exportedAt: new Date().toISOString(),
      localPreview: true,
      semantics: {
        plannedProgress: 'local weekday-based draft',
        confirmedTeachingCoverage: 'teacher-confirmed; never mastery',
        learnerDerivedPlanningBaselineIncluded: false,
        teacherEnteredFreeTextExportedUnchanged: true,
      },
      plan: redactedPlan,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `skillpilot-course-plan-${asOf}.json`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
    onNotify?.('success', copy.exportSuccess)
  }

  if (!plan || storageInvalid) {
    return (
      <main className="flex-1 overflow-y-auto bg-chat-bg p-6 lg:p-10" data-testid="trainer-course-plan-view">
        <div className="mx-auto max-w-4xl rounded-2xl border border-rose-300 bg-rose-50 p-6 text-rose-950 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-100" role="alert">
          <AlertTriangle aria-hidden="true" />
          <h1 className="mt-4 text-xl font-semibold">{copy.planStatusUnavailable}</h1>
          <p className="mt-2 leading-6">{copy.saveFailed}</p>
        </div>
      </main>
    )
  }

  const metrics = evaluation?.metrics
  const calculationUnavailable = !evaluation
    || evaluation.quality.status === 'invalid'
    || !metrics
  const invalidBlockIds = new Set(
    evaluation?.quality.issues.flatMap((issue) => issue.blockId ? [issue.blockId] : []) ?? [],
  )
  const isAttested = evaluation?.coverage?.isAttestedThroughAsOf === true
  const planStatus = statusPresentation(calculationUnavailable ? undefined : metrics.coverageStatus, copy)
  const hasPlanBlocks = plan.blocks.length > 0
  const hasLearningGoals = (metrics?.plannedGoalCount ?? 0) > 0
  const coverageEffectiveDateIsValid = Boolean(
    parseCoursePlanDate(coverageEffectiveOn)
    && compareCoursePlanDates(coverageEffectiveOn, asOf) !== 1,
  )
  const publishDisabledReason = publicationState !== 'idle'
    ? ''
    : hasUnsavedDraft
      ? copy.publishDisabledUnsaved
      : calculationUnavailable
        ? copy.publishDisabledNotCalculable
        : !hasLearningGoals
          ? copy.publishDisabledNoLearningGoals
          : ''
  const noLearningGoalsLabel = language === 'de'
    ? 'Noch keine Lernziele verplant'
    : 'No learning goals scheduled yet'
  const decisionText = calculationUnavailable
    ? copy.calculationUnavailableBody
    : !hasLearningGoals
      ? copy.decisionAddLearning
      : !isAttested
        ? copy.decisionDocument
        : metrics?.coverageStatus === 'behind'
          ? copy.decisionReview
          : copy.decisionNone
  const decisionClassName = calculationUnavailable
    || (hasLearningGoals && (!isAttested || metrics?.coverageStatus === 'behind'))
    ? 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100'
    : 'border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-900/70 dark:bg-sky-950/30 dark:text-sky-100'
  const gauge = evaluation?.pacingGauge
  const gaugeStatus: PacingGaugeStatus = gauge?.status === 'ready' ? 'provisional' : 'unavailable'
  const sorted = sortedBlocks(plan.blocks)
  const historyLength = plan.revisionHistory.length

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-chat-bg p-4 sm:p-6 lg:p-10" data-testid="trainer-course-plan-view">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">
              <span>{copy.planTab}</span>
              <span aria-hidden="true">·</span>
              <span>{copy.localPreviewBadge}</span>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">{copy.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">{copy.subtitle}</p>
            <p className="mt-1 truncate text-sm font-medium text-text-primary" title={classLabel}>{classLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={undoLastChange}
              disabled={historyLength === 0}
              title={historyLength === 0 ? copy.undoUnavailable : copy.undoLastChange}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-color bg-sidebar-bg px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-sky-400 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-sky-950/30"
            >
              <RotateCcw size={17} aria-hidden="true" />
              {copy.undoLastChange}
            </button>
            <button
              type="button"
              onClick={exportPlan}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-color bg-sidebar-bg px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30"
              title={copy.exportHint}
            >
              <Download size={17} aria-hidden="true" />
              {copy.exportPlan}
            </button>
            {canPublishToLearner && (
              <div className="max-w-xs">
                <button
                  type="button"
                  onClick={() => void preparePublication()}
                  disabled={!publicationPlanReady || hasUnsavedDraft || publicationState !== 'idle'}
                  aria-describedby={publishDisabledReason ? 'course-plan-publish-disabled-reason' : undefined}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-sky-500 bg-sidebar-bg px-4 py-2 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-sky-300 dark:hover:bg-sky-950/30"
                >
                  <Send size={17} aria-hidden="true" />
                  {publicationState === 'checking' ? copy.publishPlanLoading : copy.publishPlan}
                </button>
                {publishDisabledReason && (
                  <p id="course-plan-publish-disabled-reason" className="mt-1 text-xs leading-5 text-text-secondary">
                    {publishDisabledReason}
                  </p>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={openNewBlock}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-500"
            >
              <Plus size={18} aria-hidden="true" />
              {copy.addBlock}
            </button>
          </div>
        </header>

        {publicationConfirmation && (
          <section
            className="rounded-2xl border-2 border-sky-400 bg-sky-50 p-5 text-sky-950 shadow-sm dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-100"
            aria-labelledby="course-plan-publication-title"
            data-testid="course-plan-publication-confirmation"
          >
            <h2 id="course-plan-publication-title" className="text-lg font-semibold">
              {copy.publishConfirmTitle}
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6">{copy.publishIndependentCopyBody}</p>
            <p className="mt-3 text-sm font-semibold">
              {publicationConfirmation.existingPlan
                ? copy.publishReplaceBody(publicationConfirmation.expectedRevision)
                : copy.publishNewBody}
            </p>
            <p className="mt-2 text-xs text-sky-800 dark:text-sky-200">
              {copy.publishGoalCount(publicationConfirmation.copy.atomicGoalCount)}
              <span aria-hidden="true"> · </span>
              {publicationConfirmation.copy.blocks.length} {publicationConfirmation.copy.blocks.length === 1
                ? language === 'de' ? 'Planblock' : 'plan block'
                : language === 'de' ? 'Planblöcke' : 'plan blocks'}
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={cancelPublication}
                disabled={publicationState === 'saving'}
                className="min-h-11 rounded-lg border border-border-color bg-sidebar-bg px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800"
              >
                {copy.cancel}
              </button>
              <button
                type="button"
                onClick={() => void confirmPublication()}
                disabled={publicationState === 'saving'}
                className="min-h-11 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-wait disabled:opacity-60"
              >
                {publicationState === 'saving'
                  ? copy.publishPlanSaving
                  : publicationConfirmation.existingPlan
                    ? copy.publishConfirmReplace
                    : copy.publishConfirmNew}
              </button>
            </div>
          </section>
        )}

        {publicationError && (
          <p
            className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm font-medium text-rose-950 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-100"
            role="alert"
          >
            {publicationError}
          </p>
        )}

        {publicationMessage && (
          <p
            className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-medium text-emerald-950 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-100"
            role="status"
          >
            {publicationMessage}
          </p>
        )}

        <section className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-sky-300 bg-sky-50 p-5 text-sky-950 dark:border-sky-900/70 dark:bg-sky-950/30 dark:text-sky-100">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 shrink-0" size={22} aria-hidden="true" />
              <div>
                <h2 className="font-semibold">{copy.teacherLeadsTitle}</h2>
                <p className="mt-1 text-sm leading-6">{copy.teacherLeadsBody}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 shrink-0" size={21} aria-hidden="true" />
              <div>
                <h2 className="font-semibold">{copy.localPreviewTitle}</h2>
                <p className="mt-1 text-sm leading-6">{copy.localPreviewBody}</p>
              </div>
            </div>
          </div>
        </section>

        <section className={`rounded-2xl border p-5 ${decisionClassName}`} aria-labelledby="course-plan-decision-title">
          <h2 id="course-plan-decision-title" className="font-semibold">{copy.decisionTitle}</h2>
          <p className="mt-2 text-sm leading-6">{decisionText}</p>
        </section>

        {calculationUnavailable && hasPlanBlocks && (
          <section className="rounded-2xl border border-rose-300 bg-rose-50 p-5 text-rose-950 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-100" role="alert">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 shrink-0" size={21} aria-hidden="true" />
              <div>
                <h2 className="font-semibold">{copy.calculationUnavailableTitle}</h2>
                <p className="mt-1 text-sm leading-6">
                  {needsLearnerBaseline
                    ? baselineLoadState === 'loading'
                      ? copy.planningScopeOnSave
                      : copy.planningScopeLoadError
                    : copy.calculationUnavailableBody}
                </p>
                {needsLearnerBaseline && baselineLoadState === 'error' && (
                  <button
                    type="button"
                    onClick={() => setBaselineRetry((current) => current + 1)}
                    className="mt-3 min-h-10 rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
                  >
                    {copy.retryPlanningScope}
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-border-color bg-sidebar-bg p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <label className="block">
                <span className="text-sm font-semibold text-text-primary">{copy.schoolYearLabel}</span>
                <input
                  value={planLabelDraft}
                  onChange={(event) => setPlanLabelDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      savePlanLabel()
                    }
                  }}
                  maxLength={100}
                  placeholder={copy.schoolYearPlaceholder}
                  className="mt-2 min-h-11 w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-text-primary outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </label>
              <button
                type="button"
                onClick={savePlanLabel}
                disabled={planLabelDraft.trim() === (plan.schoolYearLabel ?? '')}
                className="mt-2 min-h-10 rounded-lg border border-border-color px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:border-sky-400 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-sky-950/30"
              >
                {copy.savePlanLabel}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary lg:justify-end">
              <span className="rounded-full border border-border-color px-3 py-1.5">{copy.revisionLabel(plan.revision)}</span>
              <span
                className={`rounded-full border px-3 py-1.5 ${hasUnsavedDraft ? 'border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100' : 'border-border-color'}`}
                role="status"
                data-testid="course-plan-save-status"
              >
                {hasUnsavedDraft ? copy.unsavedLocally : copy.savedLocally}
              </span>
              <span className="rounded-full border border-border-color px-3 py-1.5">{formatDate(asOf, language)}</span>
            </div>
          </div>
        </section>

        {showBlockForm && (
          <section ref={blockFormRef} className="scroll-mt-4 rounded-2xl border-2 border-sky-300 bg-sidebar-bg p-5 shadow-sm dark:border-sky-800" aria-labelledby="course-plan-form-title">
            <div className="flex items-center justify-between gap-3">
              <h2 ref={blockFormHeadingRef} id="course-plan-form-title" tabIndex={-1} className="text-lg font-semibold text-text-primary">
                {editingBlockId ? copy.formTitleEdit : copy.formTitleNew}
              </h2>
              <button
                type="button"
                onClick={() => {
                  cancelPendingBlockSave()
                  setShowBlockForm(false)
                  setDraftBaseline(null)
                  setEditingBlockId(null)
                  setFormError('')
                }}
                className="rounded-lg border border-border-color px-3 py-2 text-sm text-text-secondary hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                {copy.cancel}
              </button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-text-primary">{copy.kindLabel}</span>
                <select
                  value={draft.kind}
                  onChange={(event) => {
                    const kind = event.target.value as CoursePlanBlockKind
                    setDraft((current) => ({
                      ...current,
                      kind,
                      goalId: kind === 'buffer' ? '' : current.goalId,
                      title: kind === 'buffer' && !current.title ? copy.kindBuffer : current.title,
                      endDate: kind === 'milestone' ? current.startDate : current.endDate,
                    }))
                    setFormError('')
                  }}
                  className="mt-2 min-h-11 w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-text-primary outline-none focus:border-sky-500"
                >
                  <option value="learning">{copy.kindLearning}</option>
                  <option value="buffer">{copy.kindBuffer}</option>
                  <option value="milestone">{copy.kindMilestone}</option>
                </select>
              </label>

              {draft.kind !== 'buffer' ? (
                <div>
                  <label className="block">
                    <span className="text-sm font-medium text-text-primary">
                      {copy.goalLabel}{draft.kind === 'milestone' ? ` (${language === 'de' ? 'optional' : 'optional'})` : ''}
                    </span>
                    <input
                      type="search"
                      value={goalSearch}
                      onChange={(event) => setGoalSearch(event.target.value)}
                      placeholder={language === 'de' ? 'Liste filtern …' : 'Filter list …'}
                      className="mt-2 min-h-11 w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-text-primary outline-none focus:border-sky-500"
                    />
                  </label>
                  <label className="mt-2 block">
                    <span className="sr-only">{copy.goalLabel}</span>
                    <select
                      value={draft.goalId}
                      onChange={(event) => {
                        setDraft((current) => ({ ...current, goalId: event.target.value }))
                        setFormError('')
                      }}
                      className="min-h-11 w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-text-primary outline-none focus:border-sky-500"
                    >
                      <option value="">{copy.goalPlaceholder}</option>
                      {goalOptions.map(({ goal, count, totalCount }) => (
                        <option
                          key={goal.id}
                          value={goal.id}
                          disabled={draft.kind === 'learning' && Boolean(landscapeBaseline) && count === 0 && goal.id !== draft.goalId}
                        >
                          {goal.phase !== 'GLOBAL' ? `${goal.phase} · ` : ''}{goal.title} · {
                            draft.kind === 'learning' && requiresLearnerBaseline && !landscapeBaseline
                              ? copy.planningScopeOnSave
                              : draft.kind === 'learning' && landscapeBaseline
                                ? language === 'de'
                                  ? `${count} offen von ${totalCount} atomaren Zielen`
                                  : `${count} open of ${totalCount} atomic goals`
                              : copy.learningGoalCount(draft.kind === 'milestone' ? totalCount : count)
                          }
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : (
                <label className="block">
                  <span className="text-sm font-medium text-text-primary">{copy.customTitleLabel}</span>
                  <input
                    value={draft.title}
                    onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                    maxLength={500}
                    placeholder={copy.customTitlePlaceholder}
                    className="mt-2 min-h-11 w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-text-primary outline-none focus:border-sky-500"
                  />
                </label>
              )}

              {draft.kind !== 'buffer' && (
                <label className="block lg:col-span-2">
                  <span className="text-sm font-medium text-text-primary">
                    {copy.customTitleLabel} ({draft.kind === 'milestone'
                      ? language === 'de' ? 'optional bei gewähltem Lernziel' : 'optional when a learning goal is selected'
                      : language === 'de' ? 'optional' : 'optional'})
                  </span>
                  <input
                    value={draft.title}
                    onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                    maxLength={500}
                    placeholder={language === 'de' ? 'Leer lassen, um den Curriculum-Titel zu verwenden' : 'Leave blank to use the curriculum title'}
                    className="mt-2 min-h-11 w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-text-primary outline-none focus:border-sky-500"
                  />
                </label>
              )}

              {draft.kind === 'milestone' && (
                <p className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm leading-6 text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-100 lg:col-span-2">
                  {copy.milestonePlanningHint}
                </p>
              )}

              <label className="block">
                <span className="text-sm font-medium text-text-primary">{draft.kind === 'milestone' ? copy.dueDateLabel : copy.startDateLabel}</span>
                <input
                  type="date"
                  value={draft.startDate}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    startDate: event.target.value,
                    endDate: current.kind === 'milestone' ? event.target.value : current.endDate,
                  }))}
                  className="mt-2 min-h-11 w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-text-primary outline-none focus:border-sky-500"
                />
              </label>
              {draft.kind !== 'milestone' && (
                <label className="block">
                  <span className="text-sm font-medium text-text-primary">{copy.endDateLabel}</span>
                  <input
                    type="date"
                    value={draft.endDate}
                    onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))}
                    className="mt-2 min-h-11 w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-text-primary outline-none focus:border-sky-500"
                  />
                </label>
              )}
            </div>

            {formError && <p className="mt-4 text-sm font-medium text-rose-700 dark:text-rose-300" role="alert">{formError}</p>}
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={saveBlock}
                disabled={savingBlock || baselineLoadState === 'loading'}
                className="min-h-11 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-500 disabled:cursor-wait disabled:opacity-60"
              >
                {copy.saveBlock}
              </button>
            </div>
          </section>
        )}

        {!hasPlanBlocks ? (
          <section className="rounded-2xl border-2 border-dashed border-border-color bg-sidebar-bg p-6 sm:p-10" data-testid="course-plan-empty-state">
            <div className="mx-auto max-w-3xl text-center">
              <CalendarDays className="mx-auto text-sky-500" size={38} aria-hidden="true" />
              <h2 className="mt-4 text-2xl font-semibold text-text-primary">{copy.emptyTitle}</h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-text-secondary">{copy.emptyBody}</p>
              <ol className="mt-7 grid gap-3 text-left md:grid-cols-3">
                {copy.emptySteps.map((step, index) => (
                  <li key={step} className="rounded-xl border border-border-color bg-chat-bg p-4 text-sm leading-6 text-text-primary">
                    <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-800 dark:bg-sky-900/50 dark:text-sky-100">{index + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={openNewBlock}
                className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 font-semibold text-white hover:bg-sky-500"
              >
                <Plus size={18} aria-hidden="true" />
                {copy.addFirstBlock}
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label={copy.planStatusTitle}>
              <div className="rounded-2xl border border-border-color bg-sidebar-bg p-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary"><Target size={17} aria-hidden="true" />{copy.expectedLabel}</div>
                <p className="mt-3 text-2xl font-semibold tabular-nums text-text-primary">
                  {calculationUnavailable
                    ? copy.notCalculable
                    : copy.expectedValue(metrics.dueGoalIds.length, metrics.plannedGoalCount)}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {calculationUnavailable
                    ? '—'
                    : plan.planningBaseline
                      ? copy.plannedOpenGoalCount(metrics.plannedGoalCount, metrics.scopeAtomicGoalCount)
                      : copy.learningGoalCount(metrics.plannedGoalCount)}
                </p>
              </div>
              <div className="rounded-2xl border border-border-color bg-sidebar-bg p-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary"><CheckCircle2 size={17} aria-hidden="true" />{copy.coveredLabel}</div>
                <p className="mt-3 text-2xl font-semibold tabular-nums text-text-primary">
                  {calculationUnavailable
                    ? copy.notCalculable
                    : !hasLearningGoals
                      ? noLearningGoalsLabel
                      : isAttested
                      ? copy.confirmedValue(metrics.coveredGoalCount, metrics.plannedGoalCount)
                      : copy.minimumConfirmed(metrics.coveredGoalCount, metrics.plannedGoalCount)}
                </p>
                <p className="mt-1 text-xs text-text-secondary">{!hasLearningGoals ? copy.decisionAddLearning : isAttested ? copy.coverageAttested : copy.coverageOpen}</p>
              </div>
              <div className="rounded-2xl border border-border-color bg-sidebar-bg p-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary"><Clock3 size={17} aria-hidden="true" />{copy.bufferDaysLabel}</div>
                <p className="mt-3 text-2xl font-semibold tabular-nums text-text-primary">
                  {calculationUnavailable
                    ? copy.notCalculable
                    : `${metrics.remainingBufferWorkdays} / ${metrics.totalBufferWorkdays} ${language === 'de' ? 'Werktage' : 'weekdays'}`}
                </p>
                <p className="mt-1 text-xs text-text-secondary">{language === 'de' ? 'Geschützte Handlungsreserve; wird nicht automatisch verplant.' : 'Protected room for action; never allocated automatically.'}</p>
              </div>
              <div className="rounded-2xl border border-border-color bg-sidebar-bg p-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary"><CalendarDays size={17} aria-hidden="true" />{copy.nextMilestoneLabel}</div>
                {calculationUnavailable ? (
                  <p className="mt-3 text-lg font-semibold text-text-primary">{copy.notCalculable}</p>
                ) : metrics.nextMilestone ? (
                  <>
                    <p className="mt-3 truncate text-lg font-semibold text-text-primary" title={metrics.nextMilestone.title}>{metrics.nextMilestone.title}</p>
                    <p className="mt-1 text-sm tabular-nums text-text-secondary">{formatDate(metrics.nextMilestone.date, language)}</p>
                    {metrics.nextMilestone.goalId && (
                      <p className="mt-1 text-xs text-text-secondary">
                        {language === 'de' ? 'Lernziel' : 'Learning goal'}: {goals.get(metrics.nextMilestone.goalId)?.title ?? metrics.nextMilestone.goalId}
                      </p>
                    )}
                  </>
                ) : <p className="mt-3 text-lg font-semibold text-text-primary">{copy.noMilestone}</p>}
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
              <div className="rounded-2xl border border-border-color bg-sidebar-bg p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">{copy.planStatusTitle}</h2>
                    <p className="mt-1 text-sm text-text-secondary">{copy.coverageBody}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${planStatus.className}`}>{planStatus.label}</span>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between gap-3 text-xs text-text-secondary">
                      <span>{copy.expectedLabel}</span>
                      <span className="tabular-nums">{calculationUnavailable ? '—' : `${metrics.dueGoalIds.length} / ${metrics.plannedGoalCount}`}</span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
                      <div className="h-full rounded-full bg-sky-500" style={{ width: `${calculationUnavailable ? 0 : Math.min(100, metrics.plannedGoalCount > 0 ? (metrics.expectedGoalEquivalent / metrics.plannedGoalCount) * 100 : 0)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-3 text-xs text-text-secondary">
                      <span>{copy.coveredLabel}</span>
                      <span className="tabular-nums">{calculationUnavailable ? '—' : `${metrics.coveredGoalCount} / ${metrics.plannedGoalCount}`}</span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
                      <div className="h-full rounded-full bg-violet-500" style={{ width: `${calculationUnavailable ? 0 : Math.min(100, metrics.plannedGoalCount > 0 ? (metrics.coveredGoalCount / metrics.plannedGoalCount) * 100 : 0)}%` }} />
                    </div>
                  </div>
                </div>
                <div className={`mt-5 rounded-xl border p-4 text-sm ${isAttested ? 'border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-100' : 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100'}`}>
                  <p>{!hasLearningGoals ? copy.decisionAddLearning : isAttested ? copy.coverageAttested : copy.coverageOpen}</p>
                  {!calculationUnavailable && !isAttested && hasLearningGoals && (
                    <button
                      type="button"
                      onClick={attestCoverage}
                      className="mt-3 min-h-11 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                      {copy.coverageAttest}
                    </button>
                  )}
                </div>
              </div>

              <PacingGauge
                actual={gauge?.actualGoalsPerWeek ?? undefined}
                target={gauge?.expectedGoalsPerWeek ?? undefined}
                status={gaugeStatus}
                label={copy.paceTitle}
                statusLabel={gaugeStatus === 'provisional' ? copy.paceProvisional : copy.planStatusUnavailable}
                valueLabel={gauge?.status === 'ready'
                  ? `${copy.paceActual}: ${formatNumber(gauge.actualGoalsPerWeek ?? 0, language)} ${copy.paceUnit}`
                  : copy.planStatusUnavailable}
                targetLabel={gauge?.status === 'ready'
                  ? `${copy.paceTarget}: ${formatNumber(gauge.expectedGoalsPerWeek ?? 0, language)} ${copy.paceUnit}`
                  : undefined}
                unavailableReason={pacingUnavailableReason(gauge?.reason ?? 'invalid-plan-data', copy)}
              />
            </section>

            <section className="rounded-2xl border border-border-color bg-sidebar-bg p-5" aria-labelledby="course-plan-text-title">
              <h2 id="course-plan-text-title" className="text-lg font-semibold text-text-primary">{copy.timelineTitle}</h2>
              <p className="mt-1 text-sm text-text-secondary">{copy.timelineHint}</p>
              <ol className="mt-5 divide-y divide-border-color border-y border-border-color">
                {sorted.map((block) => {
                  const assignment = assignmentByBlockId.get(block.id)
                  const goal = block.kind === 'learning' ? goals.get(block.goalId) : undefined
                  const milestoneGoal = block.kind === 'milestone' && block.goalId
                    ? goals.get(block.goalId)
                    : undefined
                  const title = block.kind === 'learning' ? block.title || goal?.title || block.goalId : block.title
                  const detail = block.kind === 'learning'
                    ? assignment
                      ? copy.learningGoalCount(assignment.atomicGoalIds.length)
                      : copy.notCalculable
                    : block.kind === 'buffer'
                      ? `${countCoursePlanWorkdaysInclusive(block.startDate, block.endDate) ?? 0} ${language === 'de' ? 'geschützte Werktage' : 'protected weekdays'}`
                      : milestoneGoal
                        ? `${copy.kindMilestone} · ${milestoneGoal.title}`
                        : copy.kindMilestone
                  return (
                    <li key={block.id} className="grid gap-1 py-3 text-sm sm:grid-cols-[minmax(180px,0.35fr)_minmax(0,1fr)_auto] sm:items-baseline sm:gap-4">
                      <span className="tabular-nums text-text-secondary">{formatDateRange(block, language)}</span>
                      <span className="font-medium text-text-primary">{title}</span>
                      <span className="text-text-secondary sm:text-right">{detail}</span>
                    </li>
                  )
                })}
              </ol>
            </section>

            <section className="space-y-3" aria-labelledby="course-plan-blocks-title">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 id="course-plan-blocks-title" className="text-xl font-semibold text-text-primary">{language === 'de' ? 'Planblöcke und Unterrichtsabdeckung' : 'Plan blocks and teaching coverage'}</h2>
                  <p className="mt-1 text-sm text-text-secondary">{copy.coverageBody}</p>
                </div>
                <label className="block max-w-md rounded-xl border border-border-color bg-sidebar-bg p-3">
                  <span className="text-sm font-semibold text-text-primary">{copy.coverageEffectiveDateLabel}</span>
                  <input
                    type="date"
                    value={coverageEffectiveOn}
                    max={asOf}
                    onChange={(event) => setCoverageEffectiveOn(event.target.value)}
                    aria-describedby="course-plan-coverage-date-hint"
                    aria-invalid={!coverageEffectiveDateIsValid}
                    className="mt-2 min-h-11 w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-text-primary outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                  <span id="course-plan-coverage-date-hint" className={`mt-2 block text-xs leading-5 ${coverageEffectiveDateIsValid ? 'text-text-secondary' : 'text-rose-700 dark:text-rose-300'}`}>
                    {coverageEffectiveDateIsValid ? copy.coverageEffectiveDateHint : copy.coverageEffectiveDateInvalid}
                  </span>
                </label>
              </div>
              {sorted.map((block) => {
                const assignment = assignmentByBlockId.get(block.id)
                const metric = metricByBlockId.get(block.id)
                const learningMetric = metric?.kind === 'learning' ? metric : undefined
                const goal = block.kind === 'learning' ? goals.get(block.goalId) : undefined
                const milestoneGoal = block.kind === 'milestone' && block.goalId
                  ? goals.get(block.goalId)
                  : undefined
                const title = block.kind === 'learning' ? block.title || goal?.title || block.goalId : block.title
                const allBlockGoalIds = assignment
                  ? [...assignment.atomicGoalIds, ...assignment.duplicateAtomicGoalIds]
                  : []
                const workdays = block.kind === 'milestone'
                  ? 0
                  : countCoursePlanWorkdaysInclusive(block.startDate, block.endDate) ?? 0
                const weeklyQuota = block.kind === 'learning' && workdays > 0
                  ? ((assignment?.atomicGoalIds.length ?? 0) / workdays) * 5
                  : null
                const rowStatus = statusPresentation(learningMetric?.coverageStatus, copy)
                const blockCalculationUnavailable = invalidBlockIds.has(block.id)
                return (
                  <article key={block.id} className="rounded-2xl border border-border-color bg-sidebar-bg p-5" data-testid="course-plan-block">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                          <span>{block.kind === 'learning' ? copy.kindLearning : block.kind === 'buffer' ? copy.kindBuffer : copy.kindMilestone}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{formatDateRange(block, language)}</span>
                        </div>
                        <h3 className="mt-2 text-lg font-semibold text-text-primary">{title}</h3>
                        {block.kind === 'milestone' && block.goalId && (
                          <p className="mt-2 text-sm text-text-secondary">
                            {language === 'de' ? 'Konkretes Ziel' : 'Concrete target'}: {milestoneGoal?.title ?? block.goalId}
                          </p>
                        )}
                        {block.kind === 'learning' && (
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-secondary">
                            <span className="rounded-full border border-border-color px-2.5 py-1">{assignment ? copy.learningGoalCount(assignment.atomicGoalIds.length) : copy.notCalculable}</span>
                            <span className="rounded-full border border-border-color px-2.5 py-1">{copy.weeklyQuotaLabel}: {weeklyQuota === null ? copy.notCalculable : `${formatNumber(weeklyQuota, language)} ${copy.paceUnit}`}</span>
                            {assignment && assignment.duplicateAtomicGoalIds.length > 0 && (
                              <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100">{copy.duplicatedGoalCount(assignment.duplicateAtomicGoalIds.length)}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {block.kind === 'learning' && <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${rowStatus.className}`}>{rowStatus.label}</span>}
                        <button
                          type="button"
                          onClick={() => openEditBlock(block)}
                          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm text-text-primary hover:bg-gray-100 dark:hover:bg-slate-800"
                        >
                          <Pencil size={15} aria-hidden="true" />{copy.edit}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBlock(block.id)}
                          className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm ${pendingDeleteId === block.id ? 'border-rose-500 bg-rose-600 text-white' : 'border-border-color text-text-primary hover:border-rose-400 hover:bg-rose-50 hover:text-rose-800 dark:hover:bg-rose-950/30 dark:hover:text-rose-200'}`}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                          {pendingDeleteId === block.id ? copy.removeConfirm : copy.remove}
                        </button>
                      </div>
                    </div>

                    {blockCalculationUnavailable && (
                      <p className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-950 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-100" role="alert">
                        {copy.blockNotCalculable}
                      </p>
                    )}

                    {block.kind === 'learning' && learningMetric && (
                      <div className="mt-5 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl bg-chat-bg p-3">
                          <p className="text-xs text-text-secondary">{copy.expectedLabel}</p>
                          <p className="mt-1 font-semibold tabular-nums text-text-primary">{copy.expectedValue(learningMetric.dueGoalIds.length, learningMetric.plannedGoalCount)}</p>
                        </div>
                        <div className="rounded-xl bg-chat-bg p-3">
                          <p className="text-xs text-text-secondary">{copy.coveredLabel}</p>
                          <p className="mt-1 font-semibold tabular-nums text-text-primary">{isAttested ? copy.confirmedValue(learningMetric.coveredGoalCount, learningMetric.plannedGoalCount) : copy.minimumConfirmed(learningMetric.coveredGoalCount, learningMetric.plannedGoalCount)}</p>
                        </div>
                        <div className="rounded-xl bg-chat-bg p-3">
                          <p className="text-xs text-text-secondary">{language === 'de' ? 'Datenstand' : 'Data status'}</p>
                          <p className="mt-1 font-semibold text-text-primary">{isAttested ? copy.coverageAttested : copy.coverageOpen}</p>
                        </div>
                      </div>
                    )}

                    {block.kind === 'learning' && allBlockGoalIds.length > 0 && (
                      <details className="mt-5 rounded-xl border border-border-color bg-chat-bg">
                        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">{copy.goalsDetails}</summary>
                        <ul className="border-t border-border-color p-3">
                          {allBlockGoalIds.map((goalId) => {
                            const atomicGoal = goals.get(goalId)
                            const covered = coveredGoalIds.has(goalId)
                              || isCourseGoalCovered(plan, goalId, asOf) === true
                            const duplicate = assignment?.duplicateAtomicGoalIds.includes(goalId) === true
                            return (
                              <li key={goalId} className="flex items-start gap-3 border-b border-border-color py-3 last:border-b-0">
                                <input
                                  type="checkbox"
                                  checked={covered}
                                  onChange={() => toggleCoverage(goalId)}
                                  disabled={!coverageEffectiveDateIsValid}
                                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-border-color text-violet-600 focus:ring-violet-500"
                                  aria-label={`${covered ? copy.markOpen : copy.markCovered}: ${atomicGoal?.title ?? goalId}`}
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-text-primary">{atomicGoal?.title ?? goalId}</p>
                                  <p className="mt-1 text-xs text-text-secondary">
                                    {covered ? copy.markOpen : copy.markCovered}
                                    {duplicate ? ` · ${copy.duplicatedGoalCount(1)}` : ''}
                                  </p>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      </details>
                    )}
                  </article>
                )
              })}
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border-color bg-sidebar-bg p-5">
                <h2 className="font-semibold text-text-primary">{copy.planningBasis}</h2>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{copy.planningBasisHint}</p>
              </div>
              <div className="rounded-2xl border border-violet-300 bg-violet-50 p-5 text-violet-950 dark:border-violet-900/70 dark:bg-violet-950/30 dark:text-violet-100">
                <ShieldCheck size={21} aria-hidden="true" />
                <h2 className="mt-3 font-semibold">{copy.protectedExtensionTitle}</h2>
                <p className="mt-2 text-sm leading-6">{copy.protectedExtensionBody}</p>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
