import type { UiGoal } from '../goalTypes'
import {
  TEACHER_COURSE_PLAN_MAX_REVISION_HISTORY,
  TEACHER_COURSE_PLAN_SCHEMA_VERSION,
  TEACHER_COURSE_PLAN_STORAGE_KEY,
  type CourseCoverageAttestation,
  type CourseCoverageEvent,
  type CourseCoverageSnapshot,
  type CoursePacingGauge,
  type CoursePlanBlockMetrics,
  type CoursePlanDataIssue,
  type CoursePlanDataQuality,
  type CoursePlanDate,
  type CoursePlanParseResult,
  type LearnerCoursePlanBaseline,
  type LearnerCoursePlanLandscapeBaseline,
  type LearningBlockGoalAssignment,
  type LearningBlockMetrics,
  type TeacherCoursePlan,
  type TeacherCoursePlanBlock,
  type TeacherCoursePlanEvaluation,
  type TeacherCoursePlanMetrics,
  type TeacherCoursePlanRevisionSnapshot,
  type TeacherCoursePlanStore,
} from '../coursePlanTypes'

const DAY_IN_MILLISECONDS = 86_400_000
const MAX_PLANS = 500
const MAX_BLOCKS = 2_000
const MAX_EVENTS = 100_000
const MAX_ATTESTATIONS = 10_000
const MAX_BASELINE_GOALS = 100_000
const MAX_ID_LENGTH = 240
const MAX_TITLE_LENGTH = 500
const MAX_SCHOOL_YEAR_LABEL_LENGTH = 100

export const COURSE_PLAN_ON_TRACK_TOLERANCE_GOALS = 0.5
export const COURSE_PACING_WINDOW_DAYS = 7
export const COURSE_PACING_GREEN_RATIO = 0.9

export interface ParsedCoursePlanDate {
  value: CoursePlanDate
  year: number
  month: number
  day: number
  epochDay: number
}

export interface StorageReader {
  getItem(key: string): string | null
}

export interface StorageWriter extends StorageReader {
  setItem(key: string, value: string): void
}

export interface CoursePlanWriteResult {
  ok: boolean
  quality: CoursePlanDataQuality
}

export interface NormalizedCoursePlanResult {
  plan: TeacherCoursePlan | null
  quality: CoursePlanDataQuality
}

export interface AtomicGoalResolution {
  atomicGoalIds: string[]
  quality: CoursePlanDataQuality
}

export interface LearningBlockAssignmentsResult {
  assignments: LearningBlockGoalAssignment[]
  quality: CoursePlanDataQuality
}

export interface AppendCoverageEventInput {
  id: string
  goalId: string
  action: CourseCoverageEvent['action']
  effectiveOn: CoursePlanDate
  recordedAt: string
}

export interface AppendCoverageAttestationInput {
  id: string
  throughDate: CoursePlanDate
  recordedAt: string
}

export interface ReviseTeacherCoursePlanInput {
  blocks?: readonly TeacherCoursePlanBlock[]
  schoolYearLabel?: string
  planningBaseline?: LearnerCoursePlanBaseline
  changedOn: CoursePlanDate
  recordedAt: string
}

export interface MigrateTeacherCoursePlanBaselineInput {
  planningBaseline: LearnerCoursePlanLandscapeBaseline
  blocks?: readonly TeacherCoursePlanBlock[]
  schoolYearLabel?: string
  changedOn: CoursePlanDate
  recordedAt: string
}

export interface UndoTeacherCoursePlanRevisionInput {
  changedOn: CoursePlanDate
  recordedAt: string
}

function emptyStore(): TeacherCoursePlanStore {
  return {
    schemaVersion: TEACHER_COURSE_PLAN_SCHEMA_VERSION,
    plansByClassId: {},
  }
}

function quality(
  status: CoursePlanDataQuality['status'],
  issues: CoursePlanDataIssue[] = [],
): CoursePlanDataQuality {
  return { status, issues }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizedBoundedString(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  if (normalized.length === 0 || normalized.length > maxLength) return null
  return normalized
}

function normalizedId(value: unknown): string | null {
  const id = normalizedBoundedString(value, MAX_ID_LENGTH)
  if (id === '__proto__' || id === 'prototype' || id === 'constructor') return null
  return id
}

function normalizedOptionalTitle(value: unknown): string | undefined | null {
  if (value === undefined) return undefined
  return normalizedBoundedString(value, MAX_TITLE_LENGTH)
}

function normalizedInstant(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) return null
  const normalized = new Date(timestamp).toISOString()
  return normalized.endsWith('Z') ? normalized : null
}

function positiveInteger(value: unknown): number | null {
  return Number.isSafeInteger(value) && Number(value) >= 1 ? Number(value) : null
}

function nonNegativeInteger(value: unknown): number | null {
  return Number.isSafeInteger(value) && Number(value) >= 0 ? Number(value) : null
}

function normalizeUniqueIds(value: unknown, allowEmpty = true): string[] | null {
  if (!Array.isArray(value) || value.length > MAX_BASELINE_GOALS || (!allowEmpty && value.length === 0)) {
    return null
  }
  const ids = value.map(normalizedId)
  if (ids.some((id) => id === null)) return null
  const normalized = ids as string[]
  return new Set(normalized).size === normalized.length ? normalized : null
}

export function normalizeLearnerCoursePlanBaseline(value: unknown): LearnerCoursePlanBaseline | null {
  if (
    !isRecord(value)
    || (value.source !== 'learner-planning-scope-v1' && value.source !== 'learner-planning-landscape-v1')
  ) return null
  const curriculumId = normalizedId(value.curriculumId)
  const landscapeId = normalizedId(value.landscapeId)
  const scopeAtomicGoalIds = normalizeUniqueIds(value.scopeAtomicGoalIds, false)
  const openAtomicGoalIds = normalizeUniqueIds(value.openAtomicGoalIds)
  const totalAtomicGoalCount = nonNegativeInteger(value.totalAtomicGoalCount)
  const masteredAtomicGoalCount = nonNegativeInteger(value.masteredAtomicGoalCount)
  const capturedAt = normalizedInstant(value.capturedAt)
  if (
    !curriculumId
    || !landscapeId
    || !scopeAtomicGoalIds
    || !openAtomicGoalIds
    || totalAtomicGoalCount === null
    || masteredAtomicGoalCount === null
    || !capturedAt
    || totalAtomicGoalCount !== scopeAtomicGoalIds.length
    || masteredAtomicGoalCount > totalAtomicGoalCount
    || openAtomicGoalIds.length !== totalAtomicGoalCount - masteredAtomicGoalCount
  ) return null
  const scopeIds = new Set(scopeAtomicGoalIds)
  if (openAtomicGoalIds.some((goalId) => !scopeIds.has(goalId))) return null
  if (value.source === 'learner-planning-landscape-v1') {
    return {
      source: 'learner-planning-landscape-v1',
      curriculumId,
      landscapeId,
      scopeAtomicGoalIds,
      openAtomicGoalIds,
      totalAtomicGoalCount,
      masteredAtomicGoalCount,
      capturedAt,
    }
  }

  const scopeGoalId = value.scopeGoalId === undefined
    ? undefined
    : normalizedId(value.scopeGoalId)
  const focusGoalIds = normalizeUniqueIds(value.focusGoalIds)
  if (scopeGoalId === null || !focusGoalIds) return null
  return {
    source: 'learner-planning-scope-v1',
    curriculumId,
    landscapeId,
    ...(scopeGoalId ? { scopeGoalId } : {}),
    focusGoalIds,
    scopeAtomicGoalIds,
    openAtomicGoalIds,
    totalAtomicGoalCount,
    masteredAtomicGoalCount,
    capturedAt,
  }
}

function clonePlanningBaseline(
  baseline: LearnerCoursePlanBaseline | undefined,
): LearnerCoursePlanBaseline | undefined {
  return baseline
    ? baseline.source === 'learner-planning-scope-v1'
      ? {
          ...baseline,
          focusGoalIds: [...baseline.focusGoalIds],
          scopeAtomicGoalIds: [...baseline.scopeAtomicGoalIds],
          openAtomicGoalIds: [...baseline.openAtomicGoalIds],
        }
      : {
          ...baseline,
          scopeAtomicGoalIds: [...baseline.scopeAtomicGoalIds],
          openAtomicGoalIds: [...baseline.openAtomicGoalIds],
        }
    : undefined
}

function samePlanningBaseline(
  left: LearnerCoursePlanBaseline,
  right: LearnerCoursePlanBaseline,
): boolean {
  const sameIds = (leftIds: readonly string[], rightIds: readonly string[]) => (
    leftIds.length === rightIds.length
    && leftIds.every((goalId, index) => goalId === rightIds[index])
  )
  return left.source === right.source
    && left.curriculumId === right.curriculumId
    && left.landscapeId === right.landscapeId
    && (
      left.source !== 'learner-planning-scope-v1'
      || (
        right.source === 'learner-planning-scope-v1'
        && left.scopeGoalId === right.scopeGoalId
        && sameIds(left.focusGoalIds, right.focusGoalIds)
      )
    )
    && sameIds(left.scopeAtomicGoalIds, right.scopeAtomicGoalIds)
    && sameIds(left.openAtomicGoalIds, right.openAtomicGoalIds)
    && left.totalAtomicGoalCount === right.totalAtomicGoalCount
    && left.masteredAtomicGoalCount === right.masteredAtomicGoalCount
    && left.capturedAt === right.capturedAt
}

export function parseCoursePlanDate(value: unknown): ParsedCoursePlanDate | null {
  if (typeof value !== 'string') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const utcMilliseconds = Date.UTC(year, month - 1, day)
  const parsed = new Date(utcMilliseconds)
  if (
    parsed.getUTCFullYear() !== year
    || parsed.getUTCMonth() !== month - 1
    || parsed.getUTCDate() !== day
  ) {
    return null
  }

  return {
    value,
    year,
    month,
    day,
    epochDay: Math.trunc(utcMilliseconds / DAY_IN_MILLISECONDS),
  }
}

export function compareCoursePlanDates(left: CoursePlanDate, right: CoursePlanDate): number | null {
  const parsedLeft = parseCoursePlanDate(left)
  const parsedRight = parseCoursePlanDate(right)
  if (!parsedLeft || !parsedRight) return null
  return Math.sign(parsedLeft.epochDay - parsedRight.epochDay)
}

export function addCoursePlanDays(value: CoursePlanDate, days: number): CoursePlanDate | null {
  const parsed = parseCoursePlanDate(value)
  if (!parsed || !Number.isSafeInteger(days)) return null
  return new Date((parsed.epochDay + days) * DAY_IN_MILLISECONDS).toISOString().slice(0, 10)
}

export function countCoursePlanWorkdaysInclusive(
  startDate: CoursePlanDate,
  endDate: CoursePlanDate,
): number | null {
  const start = parseCoursePlanDate(startDate)
  const end = parseCoursePlanDate(endDate)
  if (!start || !end || start.epochDay > end.epochDay) return null

  let workdays = 0
  for (let epochDay = start.epochDay; epochDay <= end.epochDay; epochDay += 1) {
    const weekday = new Date(epochDay * DAY_IN_MILLISECONDS).getUTCDay()
    if (weekday !== 0 && weekday !== 6) workdays += 1
  }
  return workdays
}

function normalizeBlock(value: unknown): TeacherCoursePlanBlock | null {
  if (!isRecord(value)) return null
  const id = normalizedId(value.id)
  if (!id) return null

  if (value.kind === 'milestone') {
    const title = normalizedBoundedString(value.title, MAX_TITLE_LENGTH)
    const goalId = value.goalId === undefined ? undefined : normalizedId(value.goalId)
    const date = parseCoursePlanDate(value.date)?.value
    if (!title || !date || goalId === null) return null
    return { id, kind: 'milestone', title, ...(goalId ? { goalId } : {}), date }
  }

  if (value.kind !== 'learning' && value.kind !== 'buffer') return null
  const startDate = parseCoursePlanDate(value.startDate)?.value
  const endDate = parseCoursePlanDate(value.endDate)?.value
  if (!startDate || !endDate || compareCoursePlanDates(startDate, endDate) === 1) return null

  if (value.kind === 'learning') {
    const goalId = normalizedId(value.goalId)
    const title = normalizedOptionalTitle(value.title)
    if (!goalId || title === null) return null
    return title
      ? { id, kind: 'learning', goalId, title, startDate, endDate }
      : { id, kind: 'learning', goalId, startDate, endDate }
  }

  const title = normalizedBoundedString(value.title, MAX_TITLE_LENGTH)
  return title ? { id, kind: 'buffer', title, startDate, endDate } : null
}

function normalizeBlocks(value: unknown): TeacherCoursePlanBlock[] | null {
  if (!Array.isArray(value) || value.length > MAX_BLOCKS) return null
  const blocks = value.map(normalizeBlock)
  if (blocks.some((block) => block === null)) return null
  const normalizedBlocks = blocks as TeacherCoursePlanBlock[]
  return hasDuplicateIds(normalizedBlocks) ? null : normalizedBlocks
}

function normalizeRevisionSnapshot(value: unknown): TeacherCoursePlanRevisionSnapshot | null {
  if (!isRecord(value)) return null
  const revision = positiveInteger(value.revision)
  const revisionChangedOn = parseCoursePlanDate(value.revisionChangedOn)?.value
  const revisionChangedAt = normalizedInstant(value.revisionChangedAt)
  const origin = value.origin
  const restoredFromRevision = value.restoredFromRevision === undefined
    ? undefined
    : positiveInteger(value.restoredFromRevision)
  const schoolYearLabel = value.schoolYearLabel === undefined
    ? undefined
    : normalizedBoundedString(value.schoolYearLabel, MAX_SCHOOL_YEAR_LABEL_LENGTH)
  const planningBaseline = value.planningBaseline === undefined
    ? undefined
    : normalizeLearnerCoursePlanBaseline(value.planningBaseline)
  const blocks = normalizeBlocks(value.blocks)
  if (
    !revision
    || !revisionChangedOn
    || !revisionChangedAt
    || (origin !== 'initial' && origin !== 'edit' && origin !== 'undo')
    || restoredFromRevision === null
    || schoolYearLabel === null
    || planningBaseline === null
    || !blocks
    || (origin === 'undo' && (!restoredFromRevision || restoredFromRevision >= revision))
    || (origin !== 'undo' && restoredFromRevision !== undefined)
  ) {
    return null
  }
  return {
    revision,
    revisionChangedOn,
    revisionChangedAt,
    origin,
    ...(restoredFromRevision ? { restoredFromRevision } : {}),
    ...(schoolYearLabel ? { schoolYearLabel } : {}),
    ...(planningBaseline ? { planningBaseline } : {}),
    blocks,
  }
}

function normalizeCoverageEvent(value: unknown): CourseCoverageEvent | null {
  if (!isRecord(value)) return null
  const id = normalizedId(value.id)
  const goalId = normalizedId(value.goalId)
  const effectiveOn = parseCoursePlanDate(value.effectiveOn)?.value
  const recordedAt = normalizedInstant(value.recordedAt)
  const planRevision = positiveInteger(value.planRevision)
  const action = value.action
  if (
    !id
    || !goalId
    || !effectiveOn
    || !recordedAt
    || !planRevision
    || (action !== 'covered' && action !== 'reopened')
  ) {
    return null
  }
  return { id, goalId, effectiveOn, recordedAt, planRevision, action }
}

function normalizeCoverageAttestation(value: unknown): CourseCoverageAttestation | null {
  if (!isRecord(value)) return null
  const id = normalizedId(value.id)
  const throughDate = parseCoursePlanDate(value.throughDate)?.value
  const recordedAt = normalizedInstant(value.recordedAt)
  const planRevision = positiveInteger(value.planRevision)
  const coverageEventCount = nonNegativeInteger(value.coverageEventCount)
  if (!id || !throughDate || !recordedAt || !planRevision || coverageEventCount === null) return null
  return { id, throughDate, recordedAt, planRevision, coverageEventCount }
}

function hasDuplicateIds(values: readonly { id: string }[]): boolean {
  return new Set(values.map(({ id }) => id)).size !== values.length
}

function timestampsAreAppendOrdered(values: readonly { recordedAt: string }[]): boolean {
  return values.every((entry, index) => (
    index === 0 || entry.recordedAt >= values[index - 1]!.recordedAt
  ))
}

export function normalizeTeacherCoursePlan(value: unknown): NormalizedCoursePlanResult {
  const invalid = (code: string, message: string): NormalizedCoursePlanResult => ({
    plan: null,
    quality: quality('invalid', [{ code, message }]),
  })
  if (!isRecord(value)) return invalid('CP-PARSE-PLAN', 'Course plan must be an object.')
  if (value.schemaVersion !== TEACHER_COURSE_PLAN_SCHEMA_VERSION) {
    return invalid('CP-PARSE-VERSION', 'Unsupported course-plan schema version.')
  }

  const classId = normalizedId(value.classId)
  const revision = positiveInteger(value.revision)
  const revisionChangedOn = parseCoursePlanDate(value.revisionChangedOn)?.value
  const revisionChangedAt = normalizedInstant(value.revisionChangedAt)
  const revisionOrigin = value.revisionOrigin
  const restoredFromRevision = value.restoredFromRevision === undefined
    ? undefined
    : positiveInteger(value.restoredFromRevision)
  const createdAt = normalizedInstant(value.createdAt)
  const updatedAt = normalizedInstant(value.updatedAt)
  const schoolYearLabel = value.schoolYearLabel === undefined
    ? undefined
    : normalizedBoundedString(value.schoolYearLabel, MAX_SCHOOL_YEAR_LABEL_LENGTH)
  const planningBaseline = value.planningBaseline === undefined
    ? undefined
    : normalizeLearnerCoursePlanBaseline(value.planningBaseline)
  if (
    !classId
    || !revision
    || !revisionChangedOn
    || !revisionChangedAt
    || (revisionOrigin !== 'initial' && revisionOrigin !== 'edit' && revisionOrigin !== 'undo')
    || restoredFromRevision === null
    || !createdAt
    || !updatedAt
    || schoolYearLabel === null
    || planningBaseline === null
    || (revisionOrigin === 'undo' && (!restoredFromRevision || restoredFromRevision >= revision))
    || (revisionOrigin !== 'undo' && restoredFromRevision !== undefined)
    || (revision === 1 && revisionOrigin !== 'initial')
    || (revision > 1 && revisionOrigin === 'initial')
  ) {
    return invalid('CP-PARSE-FIELDS', 'Course plan has missing or invalid required fields.')
  }
  if (createdAt > revisionChangedAt || revisionChangedAt > updatedAt) {
    return invalid('CP-PARSE-TIME-ORDER', 'Course-plan update timestamp predates its creation timestamp.')
  }

  const normalizedBlocks = normalizeBlocks(value.blocks)
  if (!normalizedBlocks) {
    return invalid('CP-PARSE-BLOCK', 'At least one course-plan block is invalid.')
  }

  if (
    !Array.isArray(value.revisionHistory)
    || value.revisionHistory.length > TEACHER_COURSE_PLAN_MAX_REVISION_HISTORY
  ) {
    return invalid('CP-PARSE-REVISION-HISTORY', 'Plan revision history is missing or exceeds the safe limit.')
  }
  const snapshots = value.revisionHistory.map(normalizeRevisionSnapshot)
  if (snapshots.some((snapshot) => snapshot === null)) {
    return invalid('CP-PARSE-REVISION-SNAPSHOT', 'At least one plan revision snapshot is invalid.')
  }
  const revisionHistory = snapshots as TeacherCoursePlanRevisionSnapshot[]
  if (
    revisionHistory.length !== revision - 1
    || revisionHistory.some((snapshot, index) => (
      snapshot.revision !== index + 1
      || snapshot.revisionChangedAt < createdAt
      || snapshot.revisionChangedAt > revisionChangedAt
      || snapshot.revisionChangedOn > revisionChangedOn
      || (index === 0 && snapshot.origin !== 'initial')
      || (index > 0 && snapshot.origin === 'initial')
      || (
        index > 0
        && (
          snapshot.revisionChangedAt < revisionHistory[index - 1]!.revisionChangedAt
          || snapshot.revisionChangedOn < revisionHistory[index - 1]!.revisionChangedOn
        )
      )
    ))
  ) {
    return invalid('CP-PARSE-REVISION-ORDER', 'Plan revision history is incomplete or inconsistent.')
  }

  if (!Array.isArray(value.coverageEvents) || value.coverageEvents.length > MAX_EVENTS) {
    return invalid('CP-PARSE-EVENTS', 'Coverage events are missing or exceed the safe limit.')
  }
  const events = value.coverageEvents.map(normalizeCoverageEvent)
  if (events.some((event) => event === null)) {
    return invalid('CP-PARSE-EVENT', 'At least one coverage event is invalid.')
  }
  const coverageEvents = events as CourseCoverageEvent[]
  if (
    hasDuplicateIds(coverageEvents)
    || !timestampsAreAppendOrdered(coverageEvents)
    || coverageEvents.some((event) => event.planRevision > revision || event.recordedAt > updatedAt)
  ) {
    return invalid('CP-PARSE-EVENT-ORDER', 'Coverage event history is inconsistent.')
  }

  if (!Array.isArray(value.coverageAttestations) || value.coverageAttestations.length > MAX_ATTESTATIONS) {
    return invalid('CP-PARSE-ATTESTATIONS', 'Coverage attestations are missing or exceed the safe limit.')
  }
  const attestations = value.coverageAttestations.map(normalizeCoverageAttestation)
  if (attestations.some((attestation) => attestation === null)) {
    return invalid('CP-PARSE-ATTESTATION', 'At least one coverage attestation is invalid.')
  }
  const coverageAttestations = attestations as CourseCoverageAttestation[]
  if (
    hasDuplicateIds(coverageAttestations)
    || !timestampsAreAppendOrdered(coverageAttestations)
    || coverageAttestations.some((attestation) => (
      attestation.planRevision > revision
      || attestation.coverageEventCount > coverageEvents.length
      || attestation.recordedAt > updatedAt
      || (
        attestation.coverageEventCount > 0
        && coverageEvents[attestation.coverageEventCount - 1]!.recordedAt > attestation.recordedAt
      )
    ))
  ) {
    return invalid('CP-PARSE-ATTESTATION-ORDER', 'Coverage attestation history is inconsistent.')
  }

  return {
    plan: {
      schemaVersion: TEACHER_COURSE_PLAN_SCHEMA_VERSION,
      classId,
      revision,
      revisionChangedOn,
      revisionChangedAt,
      revisionOrigin,
      ...(restoredFromRevision ? { restoredFromRevision } : {}),
      createdAt,
      updatedAt,
      ...(schoolYearLabel ? { schoolYearLabel } : {}),
      ...(planningBaseline ? { planningBaseline } : {}),
      blocks: normalizedBlocks,
      revisionHistory,
      coverageEvents,
      coverageAttestations,
    },
    quality: quality('complete'),
  }
}

export function parseTeacherCoursePlanStore(raw: string | null): CoursePlanParseResult {
  if (raw === null || raw.trim() === '') return { store: emptyStore(), quality: quality('complete') }

  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return {
      store: emptyStore(),
      quality: quality('invalid', [{ code: 'CP-STORE-JSON', message: 'Stored course plans are not valid JSON.' }]),
    }
  }
  if (
    !isRecord(value)
    || value.schemaVersion !== TEACHER_COURSE_PLAN_SCHEMA_VERSION
    || !isRecord(value.plansByClassId)
  ) {
    return {
      store: emptyStore(),
      quality: quality('invalid', [{ code: 'CP-STORE-SCHEMA', message: 'Stored course plans use an unsupported schema.' }]),
    }
  }

  const entries = Object.entries(value.plansByClassId)
  if (entries.length > MAX_PLANS) {
    return {
      store: emptyStore(),
      quality: quality('invalid', [{ code: 'CP-STORE-LIMIT', message: 'Stored course plans exceed the safe limit.' }]),
    }
  }

  const plansByClassId: Record<string, TeacherCoursePlan> = {}
  const issues: CoursePlanDataIssue[] = []
  for (const [storedClassId, storedPlan] of entries) {
    const classId = normalizedId(storedClassId)
    const parsed = normalizeTeacherCoursePlan(storedPlan)
    if (!classId || !parsed.plan || parsed.plan.classId !== classId) {
      issues.push({
        code: 'CP-STORE-PLAN',
        message: `Stored course plan for class "${storedClassId}" is invalid and was ignored.`,
      })
      continue
    }
    plansByClassId[classId] = parsed.plan
  }

  return {
    store: { schemaVersion: TEACHER_COURSE_PLAN_SCHEMA_VERSION, plansByClassId },
    quality: issues.length > 0 ? quality('invalid', issues) : quality('complete'),
  }
}

function resolvedStorage(storage?: StorageReader): StorageReader | null {
  if (storage) return storage
  if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) return null
  return globalThis.localStorage
}

export function loadTeacherCoursePlanStore(storage?: StorageReader): CoursePlanParseResult {
  const target = resolvedStorage(storage)
  if (!target) {
    return {
      store: emptyStore(),
      quality: quality('invalid', [{ code: 'CP-STORE-UNAVAILABLE', message: 'Local storage is unavailable.' }]),
    }
  }
  try {
    return parseTeacherCoursePlanStore(target.getItem(TEACHER_COURSE_PLAN_STORAGE_KEY))
  } catch {
    return {
      store: emptyStore(),
      quality: quality('invalid', [{ code: 'CP-STORE-READ', message: 'Local course plans could not be read.' }]),
    }
  }
}

export function loadTeacherCoursePlan(
  classId: string,
  storage?: StorageReader,
): { plan: TeacherCoursePlan | null; quality: CoursePlanDataQuality } {
  const normalizedClassId = normalizedId(classId)
  if (!normalizedClassId) {
    return {
      plan: null,
      quality: quality('invalid', [{ code: 'CP-CLASS-ID', message: 'Class ID is invalid.' }]),
    }
  }
  const result = loadTeacherCoursePlanStore(storage)
  if (result.quality.status === 'invalid') return { plan: null, quality: result.quality }
  return { plan: result.store.plansByClassId[normalizedClassId] ?? null, quality: result.quality }
}

export function saveTeacherCoursePlan(
  plan: TeacherCoursePlan,
  storage?: StorageWriter,
): CoursePlanWriteResult {
  const target = storage ?? (
    typeof globalThis !== 'undefined' && 'localStorage' in globalThis
      ? globalThis.localStorage
      : null
  )
  if (!target) {
    return {
      ok: false,
      quality: quality('invalid', [{ code: 'CP-STORE-UNAVAILABLE', message: 'Local storage is unavailable.' }]),
    }
  }
  const normalized = normalizeTeacherCoursePlan(plan)
  if (!normalized.plan) return { ok: false, quality: normalized.quality }
  const current = loadTeacherCoursePlanStore(target)
  if (current.quality.status === 'invalid') return { ok: false, quality: current.quality }

  const next: TeacherCoursePlanStore = {
    schemaVersion: TEACHER_COURSE_PLAN_SCHEMA_VERSION,
    plansByClassId: {
      ...current.store.plansByClassId,
      [normalized.plan.classId]: normalized.plan,
    },
  }
  try {
    target.setItem(TEACHER_COURSE_PLAN_STORAGE_KEY, JSON.stringify(next))
    return { ok: true, quality: quality('complete') }
  } catch {
    return {
      ok: false,
      quality: quality('invalid', [{ code: 'CP-STORE-WRITE', message: 'Local course plan could not be saved.' }]),
    }
  }
}

export function createTeacherCoursePlan(input: {
  classId: string
  createdOn: CoursePlanDate
  recordedAt: string
  schoolYearLabel?: string
}): TeacherCoursePlan | null {
  const candidate: TeacherCoursePlan = {
    schemaVersion: TEACHER_COURSE_PLAN_SCHEMA_VERSION,
    classId: input.classId,
    revision: 1,
    revisionChangedOn: input.createdOn,
    revisionChangedAt: input.recordedAt,
    revisionOrigin: 'initial',
    createdAt: input.recordedAt,
    updatedAt: input.recordedAt,
    ...(input.schoolYearLabel ? { schoolYearLabel: input.schoolYearLabel } : {}),
    blocks: [],
    revisionHistory: [],
    coverageEvents: [],
    coverageAttestations: [],
  }
  return normalizeTeacherCoursePlan(candidate).plan
}

function cloneCoursePlanBlocks(
  blocks: readonly TeacherCoursePlanBlock[],
): TeacherCoursePlanBlock[] {
  return blocks.map((block) => ({ ...block }))
}

function snapshotCurrentPlanRevision(plan: TeacherCoursePlan): TeacherCoursePlanRevisionSnapshot {
  return {
    revision: plan.revision,
    revisionChangedOn: plan.revisionChangedOn,
    revisionChangedAt: plan.revisionChangedAt,
    origin: plan.revisionOrigin,
    ...(plan.restoredFromRevision ? { restoredFromRevision: plan.restoredFromRevision } : {}),
    ...(plan.schoolYearLabel ? { schoolYearLabel: plan.schoolYearLabel } : {}),
    blocks: cloneCoursePlanBlocks(plan.blocks),
  }
}

export function reviseTeacherCoursePlan(
  plan: TeacherCoursePlan,
  input: ReviseTeacherCoursePlanInput,
): TeacherCoursePlan | null {
  const normalized = normalizeTeacherCoursePlan(plan).plan
  if (
    !normalized
    || normalized.revisionHistory.length >= TEACHER_COURSE_PLAN_MAX_REVISION_HISTORY
  ) return null
  const requestedBaseline = input.planningBaseline === undefined
    ? undefined
    : normalizeLearnerCoursePlanBaseline(input.planningBaseline)
  if (input.planningBaseline !== undefined && !requestedBaseline) return null
  if (
    normalized.planningBaseline
    && requestedBaseline
    && !samePlanningBaseline(normalized.planningBaseline, requestedBaseline)
  ) return null
  const planningBaseline = normalized.planningBaseline ?? requestedBaseline
  const candidate: TeacherCoursePlan = {
    ...normalized,
    revision: normalized.revision + 1,
    revisionChangedOn: input.changedOn,
    revisionChangedAt: input.recordedAt,
    revisionOrigin: 'edit',
    restoredFromRevision: undefined,
    updatedAt: input.recordedAt,
    ...(input.schoolYearLabel === undefined
      ? {}
      : input.schoolYearLabel.trim()
        ? { schoolYearLabel: input.schoolYearLabel }
        : { schoolYearLabel: undefined }),
    ...(planningBaseline
      ? { planningBaseline: clonePlanningBaseline(planningBaseline) }
      : {}),
    blocks: input.blocks ? cloneCoursePlanBlocks(input.blocks) : cloneCoursePlanBlocks(normalized.blocks),
    revisionHistory: [
      ...normalized.revisionHistory,
      snapshotCurrentPlanRevision(normalized),
    ],
  }
  return normalizeTeacherCoursePlan(candidate).plan
}

export function migrateTeacherCoursePlanBaseline(
  plan: TeacherCoursePlan,
  input: MigrateTeacherCoursePlanBaselineInput,
): TeacherCoursePlan | null {
  const normalized = normalizeTeacherCoursePlan(plan).plan
  const requestedBaseline = normalizeLearnerCoursePlanBaseline(input.planningBaseline)
  if (
    !normalized
    || normalized.revisionHistory.length >= TEACHER_COURSE_PLAN_MAX_REVISION_HISTORY
    || normalized.planningBaseline?.source !== 'learner-planning-scope-v1'
    || requestedBaseline?.source !== 'learner-planning-landscape-v1'
    || normalized.planningBaseline.curriculumId !== requestedBaseline.curriculumId
    || normalized.planningBaseline.landscapeId !== requestedBaseline.landscapeId
  ) return null

  const candidate: TeacherCoursePlan = {
    ...normalized,
    revision: normalized.revision + 1,
    revisionChangedOn: input.changedOn,
    revisionChangedAt: input.recordedAt,
    revisionOrigin: 'edit',
    restoredFromRevision: undefined,
    updatedAt: input.recordedAt,
    ...(input.schoolYearLabel === undefined
      ? {}
      : input.schoolYearLabel.trim()
        ? { schoolYearLabel: input.schoolYearLabel }
        : { schoolYearLabel: undefined }),
    planningBaseline: clonePlanningBaseline(requestedBaseline),
    blocks: input.blocks ? cloneCoursePlanBlocks(input.blocks) : cloneCoursePlanBlocks(normalized.blocks),
    revisionHistory: [
      ...normalized.revisionHistory,
      snapshotCurrentPlanRevision(normalized),
    ],
  }
  return normalizeTeacherCoursePlan(candidate).plan
}

export function undoLastTeacherCoursePlanRevision(
  plan: TeacherCoursePlan,
  input: UndoTeacherCoursePlanRevisionInput,
): TeacherCoursePlan | null {
  const normalized = normalizeTeacherCoursePlan(plan).plan
  if (
    !normalized
    || normalized.revisionHistory.length === 0
    || normalized.revisionHistory.length >= TEACHER_COURSE_PLAN_MAX_REVISION_HISTORY
  ) return null
  const restored = normalized.revisionHistory.at(-1)!
  const candidate: TeacherCoursePlan = {
    ...normalized,
    revision: normalized.revision + 1,
    revisionChangedOn: input.changedOn,
    revisionChangedAt: input.recordedAt,
    revisionOrigin: 'undo',
    restoredFromRevision: restored.revision,
    updatedAt: input.recordedAt,
    schoolYearLabel: restored.schoolYearLabel,
    planningBaseline: clonePlanningBaseline(normalized.planningBaseline),
    blocks: cloneCoursePlanBlocks(restored.blocks),
    revisionHistory: [
      ...normalized.revisionHistory,
      snapshotCurrentPlanRevision(normalized),
    ],
  }
  return normalizeTeacherCoursePlan(candidate).plan
}

export function appendCourseCoverageEvent(
  plan: TeacherCoursePlan,
  input: AppendCoverageEventInput,
): TeacherCoursePlan | null {
  const normalized = normalizeTeacherCoursePlan(plan).plan
  if (!normalized || normalized.coverageEvents.some(({ id }) => id === input.id)) return null
  const candidate: TeacherCoursePlan = {
    ...normalized,
    updatedAt: input.recordedAt,
    coverageEvents: [
      ...normalized.coverageEvents,
      { ...input, planRevision: normalized.revision },
    ],
  }
  return normalizeTeacherCoursePlan(candidate).plan
}

export function isCourseGoalCovered(
  plan: TeacherCoursePlan,
  goalId: string,
  asOf: CoursePlanDate,
): boolean | null {
  const normalized = normalizeTeacherCoursePlan(plan).plan
  const normalizedGoalId = normalizedId(goalId)
  if (!normalized || !normalizedGoalId || !parseCoursePlanDate(asOf)) return null
  return coverageSetAt(normalized, asOf, new Set([normalizedGoalId])).has(normalizedGoalId)
}

export function toggleCourseGoalCoverage(
  plan: TeacherCoursePlan,
  input: Omit<AppendCoverageEventInput, 'action'>,
): TeacherCoursePlan | null {
  const currentlyCovered = isCourseGoalCovered(plan, input.goalId, input.effectiveOn)
  if (currentlyCovered === null) return null
  return appendCourseCoverageEvent(plan, {
    ...input,
    action: currentlyCovered ? 'reopened' : 'covered',
  })
}

export function appendCourseCoverageAttestation(
  plan: TeacherCoursePlan,
  input: AppendCoverageAttestationInput,
): TeacherCoursePlan | null {
  const normalized = normalizeTeacherCoursePlan(plan).plan
  if (!normalized || normalized.coverageAttestations.some(({ id }) => id === input.id)) return null
  const candidate: TeacherCoursePlan = {
    ...normalized,
    updatedAt: input.recordedAt,
    coverageAttestations: [
      ...normalized.coverageAttestations,
      {
        ...input,
        planRevision: normalized.revision,
        coverageEventCount: normalized.coverageEvents.length,
      },
    ],
  }
  return normalizeTeacherCoursePlan(candidate).plan
}

function childrenForGoal(
  goal: UiGoal,
  visibleChildren?: ReadonlyMap<string, readonly string[]>,
): readonly string[] {
  return visibleChildren?.has(goal.id)
    ? visibleChildren.get(goal.id) ?? []
    : goal.contains
}

export function resolveAtomicGoalDescendants(
  rootGoalId: string,
  goalIndex: ReadonlyMap<string, UiGoal>,
  visibleChildren?: ReadonlyMap<string, readonly string[]>,
): AtomicGoalResolution {
  const issues: CoursePlanDataIssue[] = []
  const atomicGoalIds: string[] = []
  const emitted = new Set<string>()
  const visiting = new Set<string>()
  const visited = new Set<string>()

  const visit = (goalId: string) => {
    if (visited.has(goalId)) return
    if (visiting.has(goalId)) {
      issues.push({ code: 'CP-GOAL-CYCLE', message: 'Goal hierarchy contains a cycle.', goalId })
      return
    }
    const goal = goalIndex.get(goalId)
    if (!goal) {
      issues.push({ code: 'CP-GOAL-MISSING', message: 'Referenced goal is unavailable.', goalId })
      return
    }

    const children = childrenForGoal(goal, visibleChildren)
    const isAtomic = goal.type === 'atomic' || (goal.type !== 'cluster' && children.length === 0)
    if (isAtomic) {
      if (children.length > 0) {
        issues.push({
          code: 'CP-GOAL-ATOMIC-CHILDREN',
          message: 'An atomic goal unexpectedly contains visible children.',
          goalId,
        })
        return
      }
      if (!emitted.has(goalId)) {
        emitted.add(goalId)
        atomicGoalIds.push(goalId)
      }
      visited.add(goalId)
      return
    }

    if (children.length === 0) {
      if (
        goal.type === 'cluster'
        && goal.extendedData?.compositionEntryKind === 'goalEntry'
      ) {
        // A direct composition goalEntry can intentionally present a canonical
        // cluster as an opaque leaf. It remains non-atomic for planning and must
        // not invalidate otherwise plannable atomic siblings.
        visited.add(goalId)
        return
      }
      issues.push({ code: 'CP-GOAL-EMPTY-CLUSTER', message: 'Cluster has no visible atomic goals.', goalId })
      return
    }
    visiting.add(goalId)
    children.forEach(visit)
    visiting.delete(goalId)
    visited.add(goalId)
  }

  visit(rootGoalId)
  if (issues.length > 0) {
    const status = issues.some(({ code }) => code !== 'CP-GOAL-EMPTY-CLUSTER')
      ? 'invalid'
      : 'insufficient'
    return { atomicGoalIds: [], quality: quality(status, issues) }
  }
  return { atomicGoalIds, quality: quality('complete') }
}

function chronologicalLearningBlocks(plan: TeacherCoursePlan) {
  return plan.blocks
    .map((block, index) => ({ block, index }))
    .filter((entry): entry is { block: Extract<TeacherCoursePlanBlock, { kind: 'learning' }>; index: number } => (
      entry.block.kind === 'learning'
    ))
    .sort((left, right) => (
      left.block.startDate.localeCompare(right.block.startDate)
      || left.block.endDate.localeCompare(right.block.endDate)
      || left.index - right.index
      || left.block.id.localeCompare(right.block.id)
    ))
}

export function assignAtomicGoalsToLearningBlocks(
  plan: TeacherCoursePlan,
  goalIndex: ReadonlyMap<string, UiGoal>,
  visibleChildren?: ReadonlyMap<string, readonly string[]>,
): LearningBlockAssignmentsResult {
  const normalized = normalizeTeacherCoursePlan(plan)
  if (!normalized.plan) return { assignments: [], quality: normalized.quality }

  const counted = new Set<string>()
  const assignments: LearningBlockGoalAssignment[] = []
  const issues: CoursePlanDataIssue[] = []
  const baseline = normalized.plan.planningBaseline
  const baselineScope = baseline ? new Set(baseline.scopeAtomicGoalIds) : null
  const baselineOpen = baseline ? new Set(baseline.openAtomicGoalIds) : null
  if (baseline) {
    for (const goalId of baseline.scopeAtomicGoalIds) {
      const goal = goalIndex.get(goalId)
      const children = goal ? childrenForGoal(goal, visibleChildren) : []
      if (!goal || (goal.type !== 'atomic' && (goal.type === 'cluster' || children.length > 0))) {
        issues.push({
          code: 'CP-BASELINE-GOAL',
          message: 'The authoritative planning basis references an unavailable or non-atomic goal.',
          goalId,
        })
      }
    }
  }
  for (const { block } of chronologicalLearningBlocks(normalized.plan)) {
    const resolution = resolveAtomicGoalDescendants(block.goalId, goalIndex, visibleChildren)
    if (resolution.quality.status !== 'complete') {
      issues.push(...resolution.quality.issues.map((issue) => ({ ...issue, blockId: block.id })))
      assignments.push({
        blockId: block.id,
        goalId: block.goalId,
        scopeAtomicGoalIds: [],
        atomicGoalIds: [],
        duplicateAtomicGoalIds: [],
      })
      continue
    }

    const scopeAtomicGoalIds = baselineScope
      ? resolution.atomicGoalIds.filter((goalId) => baselineScope.has(goalId))
      : resolution.atomicGoalIds
    if (baselineScope && scopeAtomicGoalIds.length === 0) {
      issues.push({
        code: 'CP-GOAL-OUTSIDE-BASELINE',
        message: 'Learning block contains no goal from the authoritative planning basis.',
        blockId: block.id,
        goalId: block.goalId,
      })
    }
    const plannableAtomicGoalIds = baselineOpen
      ? scopeAtomicGoalIds.filter((goalId) => baselineOpen.has(goalId))
      : scopeAtomicGoalIds
    const atomicGoalIds: string[] = []
    const duplicateAtomicGoalIds: string[] = []
    for (const goalId of plannableAtomicGoalIds) {
      if (counted.has(goalId)) duplicateAtomicGoalIds.push(goalId)
      else {
        counted.add(goalId)
        atomicGoalIds.push(goalId)
      }
    }
    assignments.push({
      blockId: block.id,
      goalId: block.goalId,
      scopeAtomicGoalIds,
      atomicGoalIds,
      duplicateAtomicGoalIds,
    })
  }

  if (issues.length > 0) {
    return {
      assignments,
      quality: quality(
        issues.some(({ code }) => code !== 'CP-GOAL-EMPTY-CLUSTER') ? 'invalid' : 'insufficient',
        issues,
      ),
    }
  }
  return { assignments, quality: quality('complete') }
}

function workdayProgressFraction(
  startDate: CoursePlanDate,
  endDate: CoursePlanDate,
  asOf: CoursePlanDate,
): number | null {
  const dateOrder = compareCoursePlanDates(startDate, endDate)
  const beforeStart = compareCoursePlanDates(asOf, startDate)
  const afterEnd = compareCoursePlanDates(asOf, endDate)
  if (dateOrder === null || beforeStart === null || afterEnd === null || dateOrder === 1) return null
  const total = countCoursePlanWorkdaysInclusive(startDate, endDate)
  if (total === null || total === 0) return null
  if (beforeStart === -1) return 0
  if (afterEnd >= 0) return 1

  const elapsed = countCoursePlanWorkdaysInclusive(startDate, asOf)
  if (elapsed === null) return null
  return elapsed / total
}

function coverageSetAt(
  plan: TeacherCoursePlan,
  asOf: CoursePlanDate,
  allowedGoalIds: ReadonlySet<string>,
): Set<string> {
  const covered = new Set<string>()
  for (const event of plan.coverageEvents) {
    if (!allowedGoalIds.has(event.goalId) || event.effectiveOn > asOf) continue
    if (event.action === 'covered') covered.add(event.goalId)
    else covered.delete(event.goalId)
  }
  return covered
}

function validAttestationThrough(
  plan: TeacherCoursePlan,
  asOf: CoursePlanDate,
): CourseCoverageAttestation | null {
  for (let index = plan.coverageAttestations.length - 1; index >= 0; index -= 1) {
    const attestation = plan.coverageAttestations[index]!
    if (
      attestation.planRevision === plan.revision
      && attestation.coverageEventCount === plan.coverageEvents.length
      && attestation.throughDate >= asOf
    ) {
      return attestation
    }
  }
  return null
}

export function deriveCourseCoverageSnapshot(
  plan: TeacherCoursePlan,
  asOf: CoursePlanDate,
  plannedGoalIds: ReadonlySet<string>,
): CourseCoverageSnapshot | null {
  const normalized = normalizeTeacherCoursePlan(plan).plan
  if (!normalized || !parseCoursePlanDate(asOf)) return null
  const attestation = validAttestationThrough(normalized, asOf)
  const coveredGoalIds = [...coverageSetAt(normalized, asOf, plannedGoalIds)].sort()
  return {
    asOf,
    coveredGoalIds,
    coveredGoalCount: coveredGoalIds.length,
    attestedThrough: attestation?.throughDate ?? null,
    isAttestedThroughAsOf: Boolean(attestation),
    neutralReason: attestation ? null : 'coverage-not-attested',
  }
}

function coverageStatus(
  actual: number,
  expected: number,
  attested: boolean,
): Pick<LearningBlockMetrics, 'deltaGoalEquivalent' | 'coverageStatus' | 'coverageStatusReason'> {
  if (!attested) {
    return {
      deltaGoalEquivalent: null,
      coverageStatus: 'neutral',
      coverageStatusReason: 'coverage-not-attested',
    }
  }
  const deltaGoalEquivalent = actual - expected
  if (deltaGoalEquivalent < -COURSE_PLAN_ON_TRACK_TOLERANCE_GOALS) {
    return { deltaGoalEquivalent, coverageStatus: 'behind', coverageStatusReason: null }
  }
  if (deltaGoalEquivalent > COURSE_PLAN_ON_TRACK_TOLERANCE_GOALS) {
    return { deltaGoalEquivalent, coverageStatus: 'ahead', coverageStatusReason: null }
  }
  return { deltaGoalEquivalent, coverageStatus: 'on-track', coverageStatusReason: null }
}

function expectedGoalsAt(
  plan: TeacherCoursePlan,
  assignments: readonly LearningBlockGoalAssignment[],
  asOf: CoursePlanDate,
): number | null {
  const assignmentByBlockId = new Map(assignments.map((assignment) => [assignment.blockId, assignment]))
  let expected = 0
  for (const block of plan.blocks) {
    if (block.kind !== 'learning') continue
    const fraction = workdayProgressFraction(block.startDate, block.endDate, asOf)
    const assignment = assignmentByBlockId.get(block.id)
    if (fraction === null || !assignment) return null
    expected += fraction * assignment.atomicGoalIds.length
  }
  return expected
}

function neutralGauge(asOf: CoursePlanDate, reason: CoursePacingGauge['reason']): CoursePacingGauge {
  return {
    status: 'neutral',
    asOf,
    windowStart: null,
    actualGoalsPerWeek: null,
    expectedGoalsPerWeek: null,
    ratio: null,
    zone: null,
    reason,
  }
}

export function calculateCoursePacingGauge(
  plan: TeacherCoursePlan,
  assignments: readonly LearningBlockGoalAssignment[],
  asOf: CoursePlanDate,
  attestedThroughAsOf: boolean,
): CoursePacingGauge {
  const parsedAsOf = parseCoursePlanDate(asOf)
  if (!parsedAsOf) return neutralGauge(asOf, 'invalid-as-of-date')
  const normalized = normalizeTeacherCoursePlan(plan).plan
  if (!normalized) return neutralGauge(asOf, 'invalid-plan-data')
  const windowStart = addCoursePlanDays(asOf, -COURSE_PACING_WINDOW_DAYS)
  if (!windowStart) return neutralGauge(asOf, 'invalid-as-of-date')
  if (normalized.revisionChangedOn > windowStart) {
    return neutralGauge(asOf, 'plan-revision-too-recent')
  }
  if (!attestedThroughAsOf) return neutralGauge(asOf, 'coverage-not-attested')

  const plannedGoalIds = new Set(assignments.flatMap(({ atomicGoalIds }) => atomicGoalIds))
  const historyExists = normalized.coverageEvents.some((event) => (
    plannedGoalIds.has(event.goalId) && event.effectiveOn <= asOf
  ))
  if (!historyExists) return neutralGauge(asOf, 'coverage-history-missing')

  const expectedAtStart = expectedGoalsAt(normalized, assignments, windowStart)
  const expectedAtEnd = expectedGoalsAt(normalized, assignments, asOf)
  if (expectedAtStart === null || expectedAtEnd === null) {
    return neutralGauge(asOf, 'invalid-plan-data')
  }
  const expectedGoalsPerWeek = expectedAtEnd - expectedAtStart
  if (expectedGoalsPerWeek <= 0) return neutralGauge(asOf, 'no-expected-progress-in-window')

  const coveredAtStart = coverageSetAt(normalized, windowStart, plannedGoalIds).size
  const coveredAtEnd = coverageSetAt(normalized, asOf, plannedGoalIds).size
  const actualGoalsPerWeek = coveredAtEnd - coveredAtStart
  const ratio = actualGoalsPerWeek / expectedGoalsPerWeek
  return {
    status: 'ready',
    asOf,
    windowStart,
    actualGoalsPerWeek,
    expectedGoalsPerWeek,
    ratio,
    zone: ratio >= COURSE_PACING_GREEN_RATIO ? 'green' : 'red',
    reason: null,
  }
}

function invalidEvaluation(asOf: CoursePlanDate, resultQuality: CoursePlanDataQuality): TeacherCoursePlanEvaluation {
  return {
    quality: resultQuality,
    assignments: [],
    coverage: null,
    blocks: [],
    metrics: null,
    pacingGauge: neutralGauge(asOf, parseCoursePlanDate(asOf) ? 'invalid-plan-data' : 'invalid-as-of-date'),
  }
}

export function evaluateTeacherCoursePlan(
  plan: TeacherCoursePlan,
  goalIndex: ReadonlyMap<string, UiGoal>,
  asOf: CoursePlanDate,
  visibleChildren?: ReadonlyMap<string, readonly string[]>,
): TeacherCoursePlanEvaluation {
  if (!parseCoursePlanDate(asOf)) {
    return invalidEvaluation(
      asOf,
      quality('invalid', [{ code: 'CP-AS-OF', message: 'Evaluation date is invalid.' }]),
    )
  }
  const normalized = normalizeTeacherCoursePlan(plan)
  if (!normalized.plan) return invalidEvaluation(asOf, normalized.quality)
  const milestoneGoalIssues = normalized.plan.blocks.flatMap((block): CoursePlanDataIssue[] => {
    if (block.kind !== 'milestone' || !block.goalId) return []
    const resolution = resolveAtomicGoalDescendants(block.goalId, goalIndex, visibleChildren)
    return resolution.quality.status === 'complete'
      ? []
      : resolution.quality.issues.map((issue) => ({ ...issue, blockId: block.id }))
  })
  if (milestoneGoalIssues.length > 0) {
    return invalidEvaluation(asOf, quality('invalid', milestoneGoalIssues))
  }
  const assignmentsResult = assignAtomicGoalsToLearningBlocks(normalized.plan, goalIndex, visibleChildren)
  if (assignmentsResult.quality.status !== 'complete') {
    return invalidEvaluation(asOf, assignmentsResult.quality)
  }

  const assignmentByBlockId = new Map(
    assignmentsResult.assignments.map((assignment) => [assignment.blockId, assignment]),
  )
  const plannedGoalIds = new Set(
    assignmentsResult.assignments.flatMap(({ atomicGoalIds }) => atomicGoalIds),
  )
  const coverage = deriveCourseCoverageSnapshot(normalized.plan, asOf, plannedGoalIds)
  if (!coverage) {
    return invalidEvaluation(asOf, quality('invalid', [{ code: 'CP-COVERAGE', message: 'Coverage could not be calculated.' }]))
  }
  const coveredGoalIds = new Set(coverage.coveredGoalIds)
  const blockMetrics: CoursePlanBlockMetrics[] = []
  let expectedGoalEquivalent = 0
  let totalBufferWorkdays = 0
  let remainingBufferWorkdays = 0
  const metricIssues: CoursePlanDataIssue[] = []
  const learningProgressByBlockId = new Map<string, {
    expected: number
    dueGoalIds: string[]
  }>()
  let cumulativeExpectedGoalEquivalent = 0
  let cumulativeRoundedDueGoalCount = 0

  for (const { block } of chronologicalLearningBlocks(normalized.plan)) {
    const assignment = assignmentByBlockId.get(block.id)
    const fraction = workdayProgressFraction(block.startDate, block.endDate, asOf)
    if (!assignment || fraction === null) {
      metricIssues.push({
        code: 'CP-WORKDAYS',
        message: 'Learning block has no usable Monday-to-Friday duration.',
        blockId: block.id,
      })
      continue
    }
    const expected = fraction * assignment.atomicGoalIds.length
    cumulativeExpectedGoalEquivalent += expected
    const nextRoundedDueGoalCount = Math.round(cumulativeExpectedGoalEquivalent + 1e-9)
    const blockDueGoalCount = Math.max(
      0,
      Math.min(
        assignment.atomicGoalIds.length,
        nextRoundedDueGoalCount - cumulativeRoundedDueGoalCount,
      ),
    )
    cumulativeRoundedDueGoalCount += blockDueGoalCount
    learningProgressByBlockId.set(block.id, {
      expected,
      dueGoalIds: assignment.atomicGoalIds.slice(0, blockDueGoalCount),
    })
  }

  for (const block of normalized.plan.blocks) {
    if (block.kind === 'learning') {
      const assignment = assignmentByBlockId.get(block.id)
      const progress = learningProgressByBlockId.get(block.id)
      if (!assignment || !progress) continue
      const { expected, dueGoalIds } = progress
      const covered = assignment.atomicGoalIds.filter((goalId) => coveredGoalIds.has(goalId)).length
      expectedGoalEquivalent += expected
      blockMetrics.push({
        ...assignment,
        kind: 'learning',
        startDate: block.startDate,
        endDate: block.endDate,
        plannedGoalCount: assignment.atomicGoalIds.length,
        expectedGoalEquivalent: expected,
        dueGoalIds,
        coveredGoalCount: covered,
        ...coverageStatus(covered, expected, coverage.isAttestedThroughAsOf),
      })
      continue
    }

    if (block.kind === 'buffer') {
      const totalWorkdays = countCoursePlanWorkdaysInclusive(block.startDate, block.endDate)
      if (totalWorkdays === null) {
        metricIssues.push({ code: 'CP-BUFFER-DATES', message: 'Buffer dates are invalid.', blockId: block.id })
        continue
      }
      const remainingStart = asOf > block.startDate ? asOf : block.startDate
      const remaining = asOf > block.endDate
        ? 0
        : countCoursePlanWorkdaysInclusive(remainingStart, block.endDate) ?? 0
      totalBufferWorkdays += totalWorkdays
      remainingBufferWorkdays += remaining
      blockMetrics.push({
        blockId: block.id,
        kind: 'buffer',
        startDate: block.startDate,
        endDate: block.endDate,
        totalWorkdays,
        remainingWorkdays: remaining,
      })
      continue
    }

    blockMetrics.push({
      blockId: block.id,
      kind: 'milestone',
      date: block.date,
      timing: block.date < asOf ? 'past' : block.date === asOf ? 'today' : 'future',
    })
  }

  if (metricIssues.length > 0) return invalidEvaluation(asOf, quality('invalid', metricIssues))

  const planCoverageStatus = coverageStatus(
    coverage.coveredGoalCount,
    expectedGoalEquivalent,
    coverage.isAttestedThroughAsOf,
  )
  const nextMilestoneBlock = normalized.plan.blocks
    .filter((block): block is Extract<TeacherCoursePlanBlock, { kind: 'milestone' }> => (
      block.kind === 'milestone' && block.date >= asOf
    ))
    .sort((left, right) => left.date.localeCompare(right.date) || left.id.localeCompare(right.id))[0]
  const metrics: TeacherCoursePlanMetrics = {
    asOf,
    scopeAtomicGoalCount: new Set(
      assignmentsResult.assignments.flatMap(({ scopeAtomicGoalIds }) => scopeAtomicGoalIds),
    ).size,
    plannedGoalCount: plannedGoalIds.size,
    expectedGoalEquivalent,
    dueGoalIds: chronologicalLearningBlocks(normalized.plan).flatMap(({ block }) => {
      const blockMetric = blockMetrics.find((metric) => (
        metric.kind === 'learning' && metric.blockId === block.id
      ))
      return blockMetric?.kind === 'learning' ? blockMetric.dueGoalIds : []
    }),
    coveredGoalCount: coverage.coveredGoalCount,
    remainingGoalCount: plannedGoalIds.size - coverage.coveredGoalCount,
    ...planCoverageStatus,
    totalBufferWorkdays,
    remainingBufferWorkdays,
    nextMilestone: nextMilestoneBlock
      ? {
          blockId: nextMilestoneBlock.id,
          title: nextMilestoneBlock.title,
          ...(nextMilestoneBlock.goalId ? { goalId: nextMilestoneBlock.goalId } : {}),
          date: nextMilestoneBlock.date,
        }
      : null,
  }
  const pacingGauge = calculateCoursePacingGauge(
    normalized.plan,
    assignmentsResult.assignments,
    asOf,
    coverage.isAttestedThroughAsOf,
  )
  const dataIssues: CoursePlanDataIssue[] = []
  if (!coverage.isAttestedThroughAsOf) {
    dataIssues.push({
      code: 'CP-DATA-NOT-ATTESTED',
      message: 'Coverage documentation is not attested through the evaluation date.',
    })
  }
  if (pacingGauge.reason === 'coverage-history-missing') {
    dataIssues.push({
      code: 'CP-DATA-NO-HISTORY',
      message: 'No coverage history is available for planned goals.',
    })
  }

  return {
    quality: dataIssues.length > 0 ? quality('insufficient', dataIssues) : quality('complete'),
    assignments: assignmentsResult.assignments,
    coverage,
    blocks: blockMetrics,
    metrics,
    pacingGauge,
  }
}
