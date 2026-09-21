import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  Download,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Send,
  Trash2,
} from 'lucide-react'

import type { UiGoal } from '../goalTypes'
import type {
  TeacherCoursePlan,
  TeacherCoursePlanBlock,
} from '../coursePlanTypes'
import type { ToastKind } from '../hooks/useToast'
import {
  addCoursePlanDays,
  compareCoursePlanDates,
  countCoursePlanWorkdaysInclusive,
  createTeacherCoursePlan,
  evaluateTeacherCoursePlan,
  loadTeacherCoursePlan,
  migrateTeacherCoursePlanBaseline,
  parseCoursePlanDate,
  resolveAtomicGoalDescendants,
  reviseTeacherCoursePlan,
  saveTeacherCoursePlan,
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
import { ConfirmModal } from './ConfirmModal'
import { CoursePlanLearningBook } from './CoursePlanLearningBook'
import { CoursePlanTimeline } from './CoursePlanTimeline'

type CoursePlanBlockKind = TeacherCoursePlanBlock['kind']
export type CoursePlanSection = 'plan' | 'preview' | 'teaching'

interface CoursePlanPilotViewProps {
  classId: string
  classLabel: string
  goals: ReadonlyMap<string, UiGoal>
  visibleChildrenByParent?: ReadonlyMap<string, readonly string[]>
  learnerId?: string
  landscapeId?: string
  language: 'de' | 'en'
  sharedActivationPanel?: ReactNode
  sharedActivationAvailable?: boolean
  sharedPreviewPanel?: ReactNode
  learnerProgressPanel?: ReactNode
  section?: CoursePlanSection
  onSectionChange?: (section: CoursePlanSection) => void
  onLocalPlanChange?: () => void
  onDraftStateChange?: (hasUnsavedDraft: boolean) => void
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

const blockSortDate = (block: TeacherCoursePlanBlock) => (
  block.kind === 'milestone' ? block.date : block.startDate
)

const sortedBlocks = (blocks: readonly TeacherCoursePlanBlock[]) => [...blocks].sort((left, right) => (
  blockSortDate(left).localeCompare(blockSortDate(right))
  || left.id.localeCompare(right.id)
))

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
  sharedActivationPanel,
  sharedActivationAvailable = false,
  sharedPreviewPanel,
  learnerProgressPanel,
  section: controlledSection,
  onSectionChange,
  onLocalPlanChange,
  onDraftStateChange,
  onNotify,
}: CoursePlanPilotViewProps) => {
  const copy = useMemo(() => getCoursePlanCopy(language), [language])
  const [localSection, setLocalSection] = useState<CoursePlanSection>('plan')
  const section = controlledSection ?? localSection
  const changeSection = (next: CoursePlanSection) => {
    setLocalSection(next)
    onSectionChange?.(next)
  }
  const moreActionsRef = useRef<HTMLDetailsElement | null>(null)
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
  const [pendingDraftAction, setPendingDraftAction] = useState<(() => void) | null>(null)
  const [goalSearch, setGoalSearch] = useState('')
  const [baselineLoadState, setBaselineLoadState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [baselineRetry, setBaselineRetry] = useState(0)
  const [savingBlock, setSavingBlock] = useState(false)
  const [publicationState, setPublicationState] = useState<'idle' | 'checking' | 'saving'>('idle')
  const [publicationConfirmation, setPublicationConfirmation] = useState<PlanPublicationConfirmation | null>(null)
  const [publicationMessage, setPublicationMessage] = useState('')
  const [publicationError, setPublicationError] = useState('')
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
  const guardDraftReplacement = (action: () => void, includeLabel = false) => {
    if (blockDraftDirty || (includeLabel && planLabelDirty)) {
      setPendingDraftAction(() => action)
    } else {
      action()
    }
  }
  const publicationPlanReady = Boolean(
    evaluation
    && evaluation.quality.status !== 'invalid'
    && evaluation.metrics
    && evaluation.metrics.plannedGoalCount > 0,
  )

  useEffect(() => {
    onDraftStateChange?.(hasUnsavedDraft)
    return () => onDraftStateChange?.(false)
  }, [hasUnsavedDraft, onDraftStateChange])

  const assignmentByBlockId = useMemo(() => new Map(
    (evaluation?.assignments ?? []).map((assignment) => [assignment.blockId, assignment]),
  ), [evaluation?.assignments])
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
          atomicGoalIds: openGoalIds
            ? scopeAtomicGoalIds.filter((goalId) => openGoalIds.has(goalId))
            : scopeAtomicGoalIds,
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
  const plannedGoalIds = useMemo(() => evaluation?.quality.status === 'complete' && evaluation.metrics
    ? new Set(evaluation.assignments.flatMap((assignment) => assignment.atomicGoalIds))
    : null, [evaluation])

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
    onLocalPlanChange?.()
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
      onLocalPlanChange?.()
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
  }, [asOf, baselineRetry, landscapeId, learnerId, needsLearnerBaseline, onLocalPlanChange, plan])

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
    if (!showBlockForm || section !== 'plan') return
    const form = blockFormRef.current
    const heading = blockFormHeadingRef.current
    if (!form || !heading) return
    form.scrollIntoView({ block: 'start' })
    heading.focus({ preventScroll: true })
  }, [editingBlockId, section, showBlockForm])

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
      const successMessage = copy.publishSuccess(savedPlan.revision)
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

  const prepareNewBlock = (goalId = '') => guardDraftReplacement(() => {
    if (goalId && !plannableGoalOptions.some((option) => option.goal.id === goalId && option.count > 0)) return
    changeSection('plan')
    cancelPendingBlockSave()
    const initialDraft = createDraft(asOf)
    const nextDraft = { ...initialDraft, goalId }
    setDraft(nextDraft)
    setDraftBaseline(serializeDraft(initialDraft))
    setEditingBlockId(null)
    setFormError('')
    setGoalSearch('')
    setPendingDeleteId(null)
    setShowBlockForm(true)
  })
  const openNewBlock = () => prepareNewBlock()

  const openEditBlock = (block: TeacherCoursePlanBlock) => guardDraftReplacement(() => {
    changeSection('plan')
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
  })

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

  const undoLastChange = () => guardDraftReplacement(() => {
    cancelPendingBlockSave()
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
  }, true)

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
        historicalTeachingCoverage: 'legacy records; not learning progress',
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
  const hasPlanBlocks = plan.blocks.length > 0
  const hasLearningGoals = (metrics?.plannedGoalCount ?? 0) > 0
  const publishDisabledReason = publicationState !== 'idle'
    ? ''
    : hasUnsavedDraft
      ? copy.publishDisabledUnsaved
      : calculationUnavailable
        ? copy.publishDisabledNotCalculable
        : !hasLearningGoals
          ? copy.publishDisabledNoLearningGoals
          : ''
  const sorted = sortedBlocks(plan.blocks)
  const historyLength = plan.revisionHistory.length

  const blockForm = showBlockForm ? (
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
                                  ? `${count} von ${totalCount} Zielen bei Planerstellung offen`
                                  : `${count} of ${totalCount} goals open when the plan was created`
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
        ) : null

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-chat-bg p-4 sm:p-6 lg:p-8" data-testid="trainer-course-plan-view">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">{language === 'de' ? 'Kurse planen' : 'Course planning'}</p>
            <h1 className="mt-1 break-words text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">{language === 'de' ? 'Planung für' : 'Planning for'} {classLabel}</h1>
            <p className="mt-2 text-sm text-text-secondary">{sharedActivationAvailable
              ? language === 'de' ? 'Fächer gemeinsam planen. Der Schüler wird im Chat geführt.' : 'Plan subjects together. The learner is guided in chat.'
              : language === 'de' ? 'Abschnitte und Termine planen. Gespeicherte Lernfortschritte ansehen.' : 'Plan sections and dates. View saved learning progress.'}</p>
          </div>
          <details ref={moreActionsRef} className="relative shrink-0" onKeyDown={(event) => {
            if (event.key === 'Escape' && moreActionsRef.current) {
              moreActionsRef.current.open = false
              moreActionsRef.current.querySelector('summary')?.focus()
            }
          }}>
            <summary aria-label={language === 'de' ? 'Weitere Aktionen' : 'More actions'} className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-lg border border-border-color bg-sidebar-bg text-text-primary focus-visible:outline-sky-500"><MoreHorizontal size={22} /></summary>
            <div className="absolute right-0 z-20 mt-2 flex w-72 max-w-[80vw] flex-col gap-2 rounded-xl border border-border-color bg-sidebar-bg p-3 shadow-xl" onClick={(event) => {
              const button = event.target instanceof Element ? event.target.closest('button') : null
              if (button && !button.disabled && moreActionsRef.current) moreActionsRef.current.open = false
            }}>
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
                  className={`inline-flex min-h-11 items-center gap-2 rounded-lg border bg-sidebar-bg px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${sharedActivationAvailable
                    ? 'border-border-color font-medium text-text-secondary hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30'
                    : 'border-sky-500 font-semibold text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950/30'}`}
                >
                  <Send size={17} aria-hidden="true" />
                  {publicationState === 'checking'
                    ? copy.publishPlanLoading
                    : sharedActivationAvailable
                      ? language === 'de' ? 'Nur dieses Fach aktualisieren' : 'Update this subject only'
                      : copy.publishPlan}
                </button>
                {publishDisabledReason && (
                  <p id="course-plan-publish-disabled-reason" className="mt-1 text-xs leading-5 text-text-secondary">
                    {publishDisabledReason}
                  </p>
                )}
              </div>
            )}

            </div>
          </details>
        </header>
        {sharedActivationPanel}
        <p role="status" data-testid="course-plan-save-status" className={`text-xs ${hasUnsavedDraft ? 'font-medium text-amber-800 dark:text-amber-200' : 'text-text-secondary'}`}>
          {hasUnsavedDraft ? copy.unsavedLocally : copy.savedLocally}
          {sharedActivationAvailable && !hasUnsavedDraft && <span> · {language === 'de' ? 'Für den Schüler gelten nur übernommene Änderungen.' : 'Only applied changes affect the learner.'}</span>}
        </p>
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


        <nav aria-label={language === 'de' ? 'Planungsbereiche' : 'Planning sections'} className="flex flex-wrap gap-1 border-b border-border-color">
          {([
            ['plan', language === 'de' ? 'Plan bearbeiten' : 'Edit plan'],
            ...(sharedActivationAvailable ? [['preview', language === 'de' ? 'Schülervorschau' : 'Learner preview']] : []),
            ['teaching', language === 'de' ? 'Lernfortschritt' : 'Learning progress'],
          ] as [CoursePlanSection, string][]).map(([value, label]) => (
            <button key={value} type="button" aria-current={section === value ? 'page' : undefined} aria-controls={`course-plan-section-${value}`} onClick={() => changeSection(value)} className={`min-h-11 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${section === value ? 'border-sky-600 text-sky-700 dark:text-sky-300' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>{label}</button>
          ))}
        </nav>
        <div id="course-plan-section-plan" hidden={section !== 'plan'} className="space-y-4">
        <CoursePlanLearningBook options={plannableGoalOptions} goals={goals} plannedGoalIds={plannedGoalIds} language={language} onPrepareGoal={prepareNewBlock} />
        {hasPlanBlocks && <CoursePlanTimeline blocks={plan.blocks} goals={goals} language={language} onEditBlock={openEditBlock} />}
        {evaluation?.quality.issues.some((issue) => issue.code === 'CP-GOAL-PREREQUISITE-SCHEDULE') && (
          <p role="alert" className="rounded-lg border border-amber-300 p-3 text-sm text-amber-900 dark:text-amber-100">{language === 'de'
            ? 'Voraussetzungen und Zeiträume passen noch nicht zusammen. Prüfe die betroffenen Abschnitte; dies ist keine Aussage zum Lernstand.'
            : 'Prerequisites and planned periods do not align yet. Review the affected sections; this does not describe mastery.'}</p>
        )}
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


          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-lg font-semibold text-text-primary">{language === 'de' ? 'Planabschnitte' : 'Plan sections'}</h2><p className="mt-1 text-sm text-text-secondary">{language === 'de' ? 'Was soll bis wann gelernt werden?' : 'What should be learned by when?'}</p></div>
            <button type="button" onClick={openNewBlock} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-sky-300 bg-sidebar-bg px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950/30"><Plus size={18} />{copy.addBlock}</button>
          </div>
          {editingBlockId === null && blockForm}
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
            <section className="space-y-3" aria-label={language === 'de' ? 'Planabschnitte bearbeiten' : 'Edit plan sections'}>
              {sorted.map((block) => {
                const assignment = assignmentByBlockId.get(block.id)
                const title = block.kind === 'learning' ? block.title || goals.get(block.goalId)?.title || block.goalId : block.title
                const workdays = block.kind === 'milestone' ? 0 : countCoursePlanWorkdaysInclusive(block.startDate, block.endDate) ?? 0
                return (
                  <article key={block.id} className="rounded-xl border border-border-color bg-sidebar-bg p-4" data-testid="course-plan-block">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 basis-56">
                        <p className="text-xs font-medium text-text-secondary">{block.kind === 'learning' ? copy.kindLearning : block.kind === 'buffer' ? copy.kindBuffer : copy.kindMilestone} · {formatDateRange(block, language)}</p>
                        <h3 className="mt-1 break-words font-semibold text-text-primary">{title}</h3>
                        <p className="mt-1 text-sm text-text-secondary">{block.kind === 'learning'
                          ? assignment ? copy.learningGoalCount(assignment.atomicGoalIds.length) : copy.notCalculable
                          : block.kind === 'buffer' ? `${workdays} ${language === 'de' ? 'geschützte Werktage' : 'protected weekdays'}` : copy.kindMilestone}</p>
                        {assignment && assignment.duplicateAtomicGoalIds.length > 0 && <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">{copy.duplicatedGoalCount(assignment.duplicateAtomicGoalIds.length)}</p>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => openEditBlock(block)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm text-text-primary hover:bg-sky-50 dark:hover:bg-sky-950/30"><Pencil size={15} />{copy.edit}</button>
                        <button type="button" onClick={() => removeBlock(block.id)} className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm ${pendingDeleteId === block.id ? 'border-rose-600 bg-rose-600 text-white' : 'border-border-color text-text-secondary hover:border-rose-400'}`}><Trash2 size={15} />{pendingDeleteId === block.id ? copy.removeConfirm : copy.remove}</button>
                      </div>
                    </div>
                    {invalidBlockIds.has(block.id) && <p role="alert" className="mt-3 text-sm text-rose-700 dark:text-rose-300">{copy.blockNotCalculable}</p>}
                    {editingBlockId === block.id && <div className="mt-4">{blockForm}</div>}
                    {assignment && assignment.atomicGoalIds.length > 0 && <details className="mt-3 border-t border-border-color pt-2"><summary className="min-h-10 cursor-pointer py-2 text-sm text-text-secondary">{language === 'de' ? 'Enthaltene Lernziele' : 'Included learning goals'}</summary><ul className="space-y-2 pb-2 text-sm text-text-primary">{assignment.atomicGoalIds.map((id) => <li key={id}>{goals.get(id)?.title ?? id}</li>)}</ul></details>}
                  </article>
                )
              })}
            </section>
          )}
          <details className="rounded-xl border border-border-color bg-sidebar-bg"><summary className="min-h-11 cursor-pointer px-4 py-3 text-sm font-medium text-text-secondary">{language === 'de' ? 'Planname & Details' : 'Plan name & details'}</summary>
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

              <span className="rounded-full border border-border-color px-3 py-1.5">{formatDate(asOf, language)}</span>
            </div>
          </div>
        </section>


          </details>
        </div>
        <div id="course-plan-section-preview" hidden={section !== 'preview'}>{sharedPreviewPanel}</div>
        <div id="course-plan-section-teaching" hidden={section !== 'teaching'} className="space-y-5">
          <h2 className="text-xl font-semibold text-text-primary">
            {language === 'de' ? 'Lernfortschritt' : 'Learning progress'}
          </h2>
          {learnerProgressPanel ?? (
            <p className="text-sm text-text-secondary">
              {language === 'de'
                ? 'Wähle eine lernende Person, um ihre gespeicherten Lernzielergebnisse anzuzeigen.'
                : 'Select a learner to view their saved learning-goal results.'}
            </p>
          )}
        </div>
      </div>
      <ConfirmModal isOpen={pendingDraftAction !== null} onClose={() => setPendingDraftAction(null)} onConfirm={() => {
        const action = pendingDraftAction
        setPendingDraftAction(null)
        action?.()
      }} title={language === 'de' ? 'Ungespeicherte Eingaben verwerfen?' : 'Discard unsaved changes?'} confirmText={language === 'de' ? 'Verwerfen und fortfahren' : 'Discard and continue'}>
        {language === 'de' ? 'Der gespeicherte Plan bleibt erhalten. Die noch nicht gespeicherten Eingaben werden verworfen.' : 'The saved plan is kept. Unsaved form changes will be discarded.'}
      </ConfirmModal>
    </main>
  )
}
