export const TEACHER_COURSE_PLAN_SCHEMA_VERSION = 1 as const
export const TEACHER_COURSE_PLAN_STORAGE_KEY = 'skillpilot_teacher_course_plans_v1'
export const TEACHER_COURSE_PLAN_MAX_REVISION_HISTORY = 250

export type CoursePlanDate = string

/**
 * Immutable, learner-derived planning basis. It stores only curriculum goal
 * identifiers and aggregate counts; no learner ID or individual mastery value.
 */
export interface LegacyLearnerCoursePlanBaseline {
  source: 'learner-planning-scope-v1'
  curriculumId: string
  landscapeId: string
  scopeGoalId?: string
  focusGoalIds: string[]
  scopeAtomicGoalIds: string[]
  openAtomicGoalIds: string[]
  totalAtomicGoalCount: number
  masteredAtomicGoalCount: number
  capturedAt: string
}

export interface LearnerCoursePlanLandscapeBaseline {
  source: 'learner-planning-landscape-v1'
  curriculumId: string
  landscapeId: string
  scopeAtomicGoalIds: string[]
  openAtomicGoalIds: string[]
  totalAtomicGoalCount: number
  masteredAtomicGoalCount: number
  capturedAt: string
}

export type LearnerCoursePlanBaseline =
  | LegacyLearnerCoursePlanBaseline
  | LearnerCoursePlanLandscapeBaseline

export interface LearningCoursePlanBlock {
  id: string
  kind: 'learning'
  goalId: string
  title?: string
  startDate: CoursePlanDate
  endDate: CoursePlanDate
}

export interface BufferCoursePlanBlock {
  id: string
  kind: 'buffer'
  title: string
  startDate: CoursePlanDate
  endDate: CoursePlanDate
}

export interface MilestoneCoursePlanBlock {
  id: string
  kind: 'milestone'
  title: string
  /** Optional curriculum target made concrete by this deadline. */
  goalId?: string
  date: CoursePlanDate
}

export type TeacherCoursePlanBlock =
  | LearningCoursePlanBlock
  | BufferCoursePlanBlock
  | MilestoneCoursePlanBlock

/**
 * Coverage is an append-only journal. Corrections append `reopened`; existing
 * events are never edited or removed.
 */
export interface CourseCoverageEvent {
  id: string
  goalId: string
  action: 'covered' | 'reopened'
  effectiveOn: CoursePlanDate
  recordedAt: string
  planRevision: number
}

/**
 * An attestation says that the local coverage journal was complete through a
 * date. `coverageEventCount` invalidates it as soon as another event is added.
 */
export interface CourseCoverageAttestation {
  id: string
  throughDate: CoursePlanDate
  recordedAt: string
  planRevision: number
  coverageEventCount: number
}

export type TeacherCoursePlanRevisionOrigin = 'initial' | 'edit' | 'undo'

/**
 * Immutable local snapshot of the plan-owned fields before a new revision was
 * created. Coverage and attestations remain separate append-only journals.
 */
export interface TeacherCoursePlanRevisionSnapshot {
  revision: number
  revisionChangedOn: CoursePlanDate
  revisionChangedAt: string
  origin: TeacherCoursePlanRevisionOrigin
  restoredFromRevision?: number
  schoolYearLabel?: string
  planningBaseline?: LearnerCoursePlanBaseline
  blocks: TeacherCoursePlanBlock[]
}

export interface TeacherCoursePlan {
  schemaVersion: typeof TEACHER_COURSE_PLAN_SCHEMA_VERSION
  classId: string
  revision: number
  revisionChangedOn: CoursePlanDate
  revisionChangedAt: string
  revisionOrigin: TeacherCoursePlanRevisionOrigin
  restoredFromRevision?: number
  createdAt: string
  updatedAt: string
  schoolYearLabel?: string
  planningBaseline?: LearnerCoursePlanBaseline
  blocks: TeacherCoursePlanBlock[]
  revisionHistory: TeacherCoursePlanRevisionSnapshot[]
  coverageEvents: CourseCoverageEvent[]
  coverageAttestations: CourseCoverageAttestation[]
}

export interface TeacherCoursePlanStore {
  schemaVersion: typeof TEACHER_COURSE_PLAN_SCHEMA_VERSION
  plansByClassId: Record<string, TeacherCoursePlan>
}

export type CoursePlanDataQualityStatus = 'complete' | 'insufficient' | 'invalid'

export interface CoursePlanDataIssue {
  code: string
  message: string
  blockId?: string
  goalId?: string
}

export interface CoursePlanDataQuality {
  status: CoursePlanDataQualityStatus
  issues: CoursePlanDataIssue[]
}

export interface CoursePlanParseResult {
  store: TeacherCoursePlanStore
  quality: CoursePlanDataQuality
}

export interface LearningBlockGoalAssignment {
  blockId: string
  goalId: string
  scopeAtomicGoalIds: string[]
  atomicGoalIds: string[]
  duplicateAtomicGoalIds: string[]
}

export interface LearningBlockMetrics extends LearningBlockGoalAssignment {
  kind: 'learning'
  startDate: CoursePlanDate
  endDate: CoursePlanDate
  plannedGoalCount: number
  expectedGoalEquivalent: number
  dueGoalIds: string[]
  coveredGoalCount: number
  deltaGoalEquivalent: number | null
  coverageStatus: 'ahead' | 'on-track' | 'behind' | 'neutral'
  coverageStatusReason: string | null
}

export interface BufferBlockMetrics {
  blockId: string
  kind: 'buffer'
  startDate: CoursePlanDate
  endDate: CoursePlanDate
  totalWorkdays: number
  remainingWorkdays: number
}

export interface MilestoneBlockMetrics {
  blockId: string
  kind: 'milestone'
  date: CoursePlanDate
  timing: 'past' | 'today' | 'future'
}

export type CoursePlanBlockMetrics =
  | LearningBlockMetrics
  | BufferBlockMetrics
  | MilestoneBlockMetrics

export interface CourseCoverageSnapshot {
  asOf: CoursePlanDate
  coveredGoalIds: string[]
  coveredGoalCount: number
  attestedThrough: CoursePlanDate | null
  isAttestedThroughAsOf: boolean
  neutralReason: string | null
}

export interface TeacherCoursePlanMetrics {
  asOf: CoursePlanDate
  scopeAtomicGoalCount: number
  plannedGoalCount: number
  expectedGoalEquivalent: number
  dueGoalIds: string[]
  coveredGoalCount: number
  remainingGoalCount: number
  deltaGoalEquivalent: number | null
  coverageStatus: 'ahead' | 'on-track' | 'behind' | 'neutral'
  coverageStatusReason: string | null
  totalBufferWorkdays: number
  remainingBufferWorkdays: number
  nextMilestone: { blockId: string; title: string; goalId?: string; date: CoursePlanDate } | null
}

export type CoursePacingGaugeReason =
  | 'invalid-as-of-date'
  | 'invalid-plan-data'
  | 'plan-revision-too-recent'
  | 'coverage-not-attested'
  | 'coverage-history-missing'
  | 'no-expected-progress-in-window'

export interface CoursePacingGauge {
  status: 'ready' | 'neutral'
  asOf: CoursePlanDate
  windowStart: CoursePlanDate | null
  actualGoalsPerWeek: number | null
  expectedGoalsPerWeek: number | null
  ratio: number | null
  zone: 'green' | 'red' | null
  reason: CoursePacingGaugeReason | null
}

export interface TeacherCoursePlanEvaluation {
  quality: CoursePlanDataQuality
  assignments: LearningBlockGoalAssignment[]
  coverage: CourseCoverageSnapshot | null
  blocks: CoursePlanBlockMetrics[]
  metrics: TeacherCoursePlanMetrics | null
  pacingGauge: CoursePacingGauge
}
