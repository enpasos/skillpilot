import type { TeacherCoursePlan } from '../coursePlanTypes'
import type { UiGoal } from '../goalTypes'
import type { LandscapeEntry } from '../hooks/useLandscapes'
import type { ActivateLearnerLearningPlansRequest, LearnerLearningPlanDetail } from '../learnerLearningPlanTypes'
import type { ClassSession } from '../trainerTypes'
import {
  applyCompositionViewProjection,
  deriveRuntimeCompositionScope,
  deriveRuntimeGoalPlacementFilters,
} from './compositionViewRuntime'
import { normalizeCompositionView } from './authoring/compositionViewAuthoring'
import { isRepositoryGymnasiumFramework } from './curriculumDisplay'
import { getExistingLearnerSubjectIds, selectExistingLearnerSubject } from './existingLearnerClass'
import { goalMatchesFilters } from './goalFilters'
import { applyGoalPlacementProjection } from './goalPlacementProjection'
import { materializeLearnerLearningPlanCopy, type LearnerLearningPlanCopy } from './learnerCoursePlanPublication'
import { loadTeacherCoursePlan, type StorageReader } from './localTeacherCoursePlan'
import { goalMatchesGlobalStageScope } from './personalCurriculumStageScope'
import {
  findRuntimeRootLandscapeId,
  resolveLearnerRuntimeOfferingId,
  resolveRuntimeApiHref,
  type RuntimeCurriculumCatalogState,
} from './runtimeCurriculumCatalog'
import { getTeacherCoursePlanStorageId } from './teacherCoursePlanContext'
import { buildDirectChildrenMap } from './treeProjectionRuntime'
import { getLearnerLearningPlan, getLearnerLearningPlans, LearnerLearningPlanApiError } from './learnerLearningPlanApi'

export type TeacherLearningPlanActivationStatus =
  | 'draft'
  | 'not-ready'
  | 'ready'
  | 'current'
  | 'cockpit-only'
  | 'update-required'
  | 'unavailable'

export interface TeacherLearningPlanActivationSubject {
  landscapeId: string
  label: string
  storageId: string
  localPlan: TeacherCoursePlan | null
  copy: LearnerLearningPlanCopy | null
  serverPlan: LearnerLearningPlanDetail | null
  expectedRevision: number
  activationSource: 'local' | 'server' | null
  status: TeacherLearningPlanActivationStatus
  issue: string | null
}

export interface TeacherLearningPlanContext {
  classSession: ClassSession
  learnerId: string
  landscapeEntries: LandscapeEntry[]
  runtimeCatalogState: RuntimeCurriculumCatalogState
  language: 'de' | 'en'
}

export interface TeacherLearningPlanActivationSnapshot {
  asOf: string
  followLearningPlans: boolean
  subjects: TeacherLearningPlanActivationSubject[]
}

/** Read both the mode and the revision-checked subject copies; existence alone is not activation. */
export const loadTeacherLearningPlanActivation = async (
  context: TeacherLearningPlanContext,
  asOf: string,
  signal?: AbortSignal,
): Promise<TeacherLearningPlanActivationSnapshot> => {
  const { classSession, learnerId, landscapeEntries, runtimeCatalogState, language } = context
  const subjectIds = getExistingLearnerSubjectIds(
    classSession.personalConfig ?? {}, landscapeEntries, classSession.rootLandscapeId,
  )
  const collection = await getLearnerLearningPlans(learnerId, asOf, { signal })
  if (collection.asOf !== asOf) throw new Error('learning-plan-date-mismatch')
  if (collection.plans.some((plan) => !plan.stale && !subjectIds.includes(plan.landscapeId))) {
    throw new Error('learning-plan-subject-scope-changed')
  }
  const subjects = await Promise.all(subjectIds.map(async (landscapeId, index) => {
    const entry = landscapeEntries.find((entry) => entry.meta.landscapeId === landscapeId)
    const label = entry?.meta.subject?.trim() || entry?.meta.title?.trim()
      || (language === 'de' ? `Fach ${index + 1}` : `Subject ${index + 1}`)
    let serverPlan: LearnerLearningPlanDetail | null = null
    let serverAvailable = true
    const summary = collection.plans.find((plan) => plan.landscapeId === landscapeId)
    try {
      serverPlan = await getLearnerLearningPlan(learnerId, landscapeId, asOf, { signal })
      serverAvailable = Boolean(summary && summary.planId === serverPlan.planId
        && summary.revision === serverPlan.revision && summary.stale === serverPlan.stale)
    } catch (error) {
      if (signal?.aborted) throw error
      serverAvailable = error instanceof LearnerLearningPlanApiError && error.status === 404 && !summary
    }
    const subject = await loadTeacherLearningPlanActivationSubject({
      classSession, landscapeId, label, landscapeEntries, runtimeCatalogState,
      serverPlan, serverAvailable, signal,
    })
    if (!collection.followLearningPlans && (subject.status === 'current' || subject.status === 'cockpit-only')) {
      return { ...subject, status: 'ready' as const }
    }
    return subject
  }))
  return { asOf, followLearningPlans: collection.followLearningPlans, subjects }
}

export const teacherLearningPlanActivationRequest = (
  asOf: string,
  subjects: readonly TeacherLearningPlanActivationSubject[],
): ActivateLearnerLearningPlansRequest => ({
  asOf,
  plans: subjects.filter((subject) => subject.copy !== null).map((subject) => ({
    landscapeId: subject.landscapeId,
    expectedRevision: subject.expectedRevision,
    planLabel: subject.copy!.planLabel,
    blocks: subject.copy!.blocks,
  })),
})

export const teacherLearningPlanSubjectsBlocked = (subjects: readonly TeacherLearningPlanActivationSubject[]) => (
  subjects.some((subject) => subject.status === 'unavailable'
    || ((Boolean(subject.serverPlan) || Boolean(subject.localPlan?.blocks.length)) && !subject.copy))
)

export const teacherLearningPlanDraftsMatch = (
  subjects: readonly TeacherLearningPlanActivationSubject[],
  storage?: StorageReader,
) => (
  subjects.every((subject) => {
    const current = loadTeacherCoursePlan(subject.storageId, storage)
    if (current.quality.status !== 'complete') return false
    if (subject.activationSource === 'server') return !current.plan?.blocks.length
    if (subject.activationSource === null && !subject.copy && !subject.serverPlan) {
      return !current.plan?.blocks.length
    }
    return subject.activationSource === 'local' && Boolean(current.plan)
      && JSON.stringify(current.plan) === JSON.stringify(subject.localPlan)
  })
)

interface SubjectProjection {
  goals: ReadonlyMap<string, UiGoal>
  visibleChildrenByParent: ReadonlyMap<string, readonly string[]>
}

const collectGoalIdsBelowEntryRoots = (
  entry: LandscapeEntry | null,
  goalIndex: ReadonlyMap<string, UiGoal>,
) => {
  const goalIds = new Set<string>()
  const pending = (entry?.goals ?? [])
    .filter((goal) => (goal.tags ?? []).includes('root'))
    .map((goal) => goal.id)
  while (pending.length > 0) {
    const goalId = pending.pop()
    if (!goalId || goalIds.has(goalId)) continue
    const goal = goalIndex.get(goalId)
    if (!goal) continue
    goalIds.add(goalId)
    ;(goal.contains ?? []).forEach((childId) => {
      if (!goalIds.has(childId)) pending.push(childId)
    })
  }
  return goalIds
}

const fetchCompositionView = async ({
  session,
  landscapeEntries,
  runtimeCatalogState,
  fetchImpl,
  signal,
}: {
  session: ClassSession
  landscapeEntries: LandscapeEntry[]
  runtimeCatalogState: RuntimeCurriculumCatalogState
  fetchImpl: typeof fetch
  signal?: AbortSignal
}) => {
  const sourceEntry = landscapeEntries.find(
    (entry) => entry.meta.landscapeId === session.landscapeId,
  )
  const rootLandscapeId = runtimeCatalogState.mode === 'package'
    ? findRuntimeRootLandscapeId(runtimeCatalogState.catalog, session.landscapeId)
      ?? session.rootLandscapeId
    : session.rootLandscapeId
  const scopeEnabled = runtimeCatalogState.mode === 'package'
    || isRepositoryGymnasiumFramework(sourceEntry?.meta.frameworkId)
  const personalCurriculum = JSON.stringify({ personalCurriculum: session.personalConfig ?? {} })
  const scope = deriveRuntimeCompositionScope({
    landscapeId: session.landscapeId,
    rootLandscapeId,
    scopeEnabled,
    catalogJurisdictions: runtimeCatalogState.mode === 'package'
      ? runtimeCatalogState.catalog.offerings
          .filter((offering) => offering.landscapeId === session.landscapeId)
          .map((offering) => offering.scope.jurisdiction)
          .filter((jurisdiction): jurisdiction is string => typeof jurisdiction === 'string')
      : undefined,
    activeFilter: session.activeFilter,
    learnerPersonalCurriculum: personalCurriculum,
  })

  if (!scopeEnabled) return null
  if (!scope) throw new Error('composition-scope-unavailable')
  if (runtimeCatalogState.mode === 'loading' || runtimeCatalogState.mode === 'unavailable') {
    throw new Error('curriculum-catalog-unavailable')
  }

  let url: string | null = null
  if (runtimeCatalogState.mode === 'repository') {
    const params = new URLSearchParams({
      landscapeId: scope.landscapeId,
      schoolForm: scope.schoolForm ?? '',
      jurisdiction: scope.jurisdiction ?? '',
      stage: scope.stage ?? '',
      courseProfile: scope.courseProfile ?? '',
      durationModel: scope.durationModel ?? '',
    })
    url = `/api/ui/composition-views/match?${params.toString()}`
  } else {
    const requestedScope = Object.entries(scope).reduce<Record<string, string>>(
      (result, [key, value]) => {
        if (key !== 'landscapeId' && typeof value === 'string' && value.length > 0) {
          result[key] = value
        }
        return result
      },
      {},
    )
    const offeringId = resolveLearnerRuntimeOfferingId(
      runtimeCatalogState.catalog,
      session.landscapeId,
      requestedScope,
    )
    if (offeringId) {
      url = resolveRuntimeApiHref(
        runtimeCatalogState.apiBase,
        `/api/ui/composition-views/offerings/${encodeURIComponent(offeringId)}`,
      )
    }
  }
  if (!url) throw new Error('composition-view-unavailable')

  const response = await fetchImpl(url, { signal, cache: 'no-store' })
  if (response.status === 204) throw new Error('composition-view-unavailable')
  if (!response.ok) throw new Error(`composition-view-unavailable:${response.status}`)
  const view = normalizeCompositionView(await response.json())
  if (view.landscapeId !== session.landscapeId) {
    throw new Error('composition-view-landscape-mismatch')
  }
  return view
}

export const resolveTeacherLearningPlanSubjectProjection = async ({
  classSession,
  landscapeId,
  landscapeEntries,
  runtimeCatalogState,
  fetchImpl = fetch,
  signal,
}: {
  classSession: ClassSession
  landscapeId: string
  landscapeEntries: LandscapeEntry[]
  runtimeCatalogState: RuntimeCurriculumCatalogState
  fetchImpl?: typeof fetch
  signal?: AbortSignal
}): Promise<SubjectProjection> => {
  const session = selectExistingLearnerSubject(classSession, landscapeId, landscapeEntries)
  if (session.landscapeId !== landscapeId) throw new Error('subject-context-unavailable')
  const personalCurriculum = JSON.stringify({ personalCurriculum: session.personalConfig ?? {} })
  const placementFilters = deriveRuntimeGoalPlacementFilters({
    landscapeId,
    rootLandscapeId: session.rootLandscapeId,
    activeFilter: session.activeFilter,
    learnerPersonalCurriculum: personalCurriculum,
  })
  const placementProjectedEntries = applyGoalPlacementProjection(landscapeEntries, placementFilters)
  const compositionView = await fetchCompositionView({
    session,
    landscapeEntries,
    runtimeCatalogState,
    fetchImpl,
    signal,
  })
  const projectedEntries = compositionView
    ? applyCompositionViewProjection(
        landscapeEntries.map((entry) => (
          entry.meta.landscapeId === landscapeId
            ? entry
            : placementProjectedEntries.find(
                (candidate) => candidate.meta.landscapeId === entry.meta.landscapeId,
              ) ?? entry
        )),
        compositionView,
      )
    : placementProjectedEntries
  const activeEntry = projectedEntries.find((entry) => entry.meta.landscapeId === landscapeId) ?? null
  if (!activeEntry) throw new Error('subject-landscape-unavailable')
  const allGoals = projectedEntries.flatMap((entry) => entry.goals)
  const allGoalIndex = new Map(allGoals.map((goal) => [goal.id, goal] as const))
  const allChildren = compositionView ? buildDirectChildrenMap(allGoalIndex) : undefined
  const compositionTargetIds = compositionView
    ? collectGoalIdsBelowEntryRoots(activeEntry, allGoalIndex)
    : null
  const goals = new Map<string, UiGoal>()
  allGoalIndex.forEach((goal, goalId) => {
    const isVisible = compositionTargetIds
      ? compositionTargetIds.has(goalId)
      : goalMatchesGlobalStageScope(
          goal,
          session.personalConfig ?? {},
          { rootLandscapeId: session.rootLandscapeId },
        ) && goalMatchesFilters(goal, placementFilters)
    if (isVisible) goals.set(goalId, goal)
  })
  const visibleChildrenByParent = new Map<string, readonly string[]>()
  goals.forEach((goal) => {
    const children = allChildren?.get(goal.id) ?? goal.contains ?? []
    visibleChildrenByParent.set(goal.id, children.filter((childId) => goals.has(childId)))
  })
  return { goals, visibleChildrenByParent }
}

type ComparableLearningPlanBlock =
  | LearnerLearningPlanDetail['blocks'][number]
  | LearnerLearningPlanCopy['blocks'][number]

const comparableBlock = (block: ComparableLearningPlanBlock) => {
  if (block.kind === 'learning') {
    return {
      id: block.id,
      kind: block.kind,
      ...(block.goalId ? { goalId: block.goalId } : {}),
      ...(block.title ? { title: block.title } : {}),
      startDate: block.startDate,
      endDate: block.endDate,
      atomicGoalIds: block.atomicGoalIds ?? [],
    }
  }
  if (block.kind === 'buffer') {
    return {
      id: block.id,
      kind: block.kind,
      title: block.title,
      startDate: block.startDate,
      endDate: block.endDate,
    }
  }
  return {
    id: block.id,
    kind: block.kind,
    title: block.title,
    ...(block.goalId ? { goalId: block.goalId } : {}),
    date: block.date,
  }
}

const canonicalComparableBlocks = (
  blocks: readonly ComparableLearningPlanBlock[],
) => blocks
  .map((block, originalIndex) => ({
    block: comparableBlock(block),
    originalIndex,
    sortDate: block.kind === 'milestone' ? block.date : block.startDate,
    sortEndDate: block.kind === 'milestone' ? block.date : block.endDate,
  }))
  .sort((left, right) => (
    left.sortDate.localeCompare(right.sortDate)
    || left.sortEndDate.localeCompare(right.sortEndDate)
    || left.originalIndex - right.originalIndex
    || left.block.id.localeCompare(right.block.id)
  ))
  .map(({ block }) => block)

export const learnerPlanCopyMatchesServer = (
  copy: LearnerLearningPlanCopy,
  serverPlan: LearnerLearningPlanDetail,
) => (
  copy.planLabel === (serverPlan.planLabel ?? '')
  && JSON.stringify(canonicalComparableBlocks(copy.blocks))
    === JSON.stringify(canonicalComparableBlocks(serverPlan.blocks))
)

const copyStoredServerPlan = (
  serverPlan: LearnerLearningPlanDetail,
): LearnerLearningPlanCopy | null => {
  const blocks: LearnerLearningPlanCopy['blocks'] = []
  const atomicGoalIds = new Set<string>()
  for (const block of serverPlan.blocks) {
    if (block.kind === 'learning') {
      if (!block.atomicGoalIds || block.atomicGoalIds.length === 0) return null
      block.atomicGoalIds.forEach((goalId) => atomicGoalIds.add(goalId))
      blocks.push({
        id: block.id,
        kind: block.kind,
        ...(block.goalId ? { goalId: block.goalId } : {}),
        ...(block.title ? { title: block.title } : {}),
        startDate: block.startDate,
        endDate: block.endDate,
        atomicGoalIds: [...block.atomicGoalIds],
      })
      continue
    }
    if (block.kind === 'buffer') {
      blocks.push({
        id: block.id,
        kind: block.kind,
        title: block.title,
        startDate: block.startDate,
        endDate: block.endDate,
      })
      continue
    }
    blocks.push({
      id: block.id,
      kind: block.kind,
      title: block.title,
      ...(block.goalId ? { goalId: block.goalId } : {}),
      date: block.date,
    })
  }
  if (atomicGoalIds.size === 0) return null
  return {
    planLabel: serverPlan.planLabel ?? '',
    blocks,
    atomicGoalCount: atomicGoalIds.size,
  }
}

export const loadTeacherLearningPlanActivationSubject = async ({
  classSession,
  landscapeId,
  label,
  landscapeEntries,
  runtimeCatalogState,
  serverPlan,
  serverAvailable,
  storage,
  fetchImpl,
  signal,
}: {
  classSession: ClassSession
  landscapeId: string
  label: string
  landscapeEntries: LandscapeEntry[]
  runtimeCatalogState: RuntimeCurriculumCatalogState
  serverPlan: LearnerLearningPlanDetail | null
  serverAvailable: boolean
  storage?: StorageReader
  fetchImpl?: typeof fetch
  signal?: AbortSignal
}): Promise<TeacherLearningPlanActivationSubject> => {
  const subjectSession = selectExistingLearnerSubject(classSession, landscapeId, landscapeEntries)
  const storageId = getTeacherCoursePlanStorageId(subjectSession)
  const loaded = loadTeacherCoursePlan(storageId, storage)
  if (loaded.quality.status === 'invalid') {
    return {
      landscapeId,
      label,
      storageId,
      localPlan: null,
      copy: null,
      serverPlan,
      expectedRevision: serverPlan?.revision ?? 0,
      activationSource: null,
      status: 'unavailable',
      issue: 'local-storage-unavailable',
    }
  }
  if (!serverAvailable) {
    return {
      landscapeId,
      label,
      storageId,
      localPlan: loaded.plan,
      copy: null,
      serverPlan,
      expectedRevision: serverPlan?.revision ?? 0,
      activationSource: null,
      status: 'unavailable',
      issue: 'server-plan-unavailable',
    }
  }
  if (serverPlan && serverPlan.landscapeId !== landscapeId) {
    return {
      landscapeId,
      label,
      storageId,
      localPlan: loaded.plan,
      copy: null,
      serverPlan,
      expectedRevision: serverPlan.revision,
      activationSource: null,
      status: 'unavailable',
      issue: 'server-plan-landscape-mismatch',
    }
  }
  if (!loaded.plan || loaded.plan.blocks.length === 0) {
    const serverCopy = serverPlan ? copyStoredServerPlan(serverPlan) : null
    return {
      landscapeId,
      label,
      storageId,
      localPlan: loaded.plan,
      copy: serverCopy,
      serverPlan,
      expectedRevision: serverPlan?.revision ?? 0,
      activationSource: serverCopy ? 'server' : null,
      status: !serverPlan
        ? 'draft'
        : !serverCopy
          ? 'unavailable'
          : serverPlan.stale
            ? 'update-required'
            : 'cockpit-only',
      issue: serverPlan && !serverCopy ? 'server-plan-not-replayable' : null,
    }
  }

  try {
    const projection = await resolveTeacherLearningPlanSubjectProjection({
      classSession,
      landscapeId,
      landscapeEntries,
      runtimeCatalogState,
      fetchImpl,
      signal,
    })
    const materialized = materializeLearnerLearningPlanCopy({
      plan: loaded.plan,
      fallbackPlanLabel: label,
      goals: projection.goals,
      visibleChildrenByParent: projection.visibleChildrenByParent,
    })
    if (!materialized.ok || materialized.copy.atomicGoalCount === 0) {
      return {
        landscapeId,
        label,
        storageId,
        localPlan: loaded.plan,
        copy: null,
        serverPlan,
        expectedRevision: serverPlan?.revision ?? 0,
        activationSource: null,
        status: 'not-ready',
        issue: 'plan-not-calculable',
      }
    }
    const status = !serverPlan
      ? 'ready'
      : serverPlan.stale || !learnerPlanCopyMatchesServer(materialized.copy, serverPlan)
        ? 'update-required'
        : 'current'
    return {
      landscapeId,
      label,
      storageId,
      localPlan: loaded.plan,
      copy: materialized.copy,
      serverPlan,
      expectedRevision: serverPlan?.revision ?? 0,
      activationSource: 'local',
      status,
      issue: null,
    }
  } catch (error) {
    if (signal?.aborted) throw error
    return {
      landscapeId,
      label,
      storageId,
      localPlan: loaded.plan,
      copy: null,
      serverPlan,
      expectedRevision: serverPlan?.revision ?? 0,
      activationSource: null,
      status: 'not-ready',
      issue: error instanceof Error ? error.message : 'plan-not-calculable',
    }
  }
}
