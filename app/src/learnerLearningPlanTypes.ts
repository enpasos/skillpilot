export type LearnerLearningPlanDate = string

export interface LearnerLearningPlanPeriod {
  startDate: LearnerLearningPlanDate
  endDate: LearnerLearningPlanDate
}

export interface LearnerLearningPlanCurrentBlock {
  blockId: string
  kind: 'learning' | 'buffer'
  title: string
  goalId?: string
  startDate: LearnerLearningPlanDate
  endDate: LearnerLearningPlanDate
}

export interface LearnerLearningPlanMilestone {
  blockId: string
  title: string
  goalId?: string
  date: LearnerLearningPlanDate
}

export interface LearnerLearningPlanMetrics {
  dueThroughToday: number
  completedDueThroughToday: number
  openDueThroughToday: number
  dueToday: number
  completedDueToday: number
  openDueToday: number
  totalPlanned: number
}

export interface LearnerLearningPlanNextEligibleGoal {
  goalId: string
}

export interface LearnerLearningPlanBuffer {
  totalWorkdays: number
  remainingWorkdays: number
}

/**
 * The first plan release deliberately exposes no red/green pace judgement.
 * `reason` explains why the status remains neutral without exposing internal
 * implementation details in the UI.
 */
export interface LearnerLearningPlanPace {
  status: 'neutral'
  reason: string
}

export type LearnerLearningPlanContinueReason =
  | 'learning-plan-following-disabled'
  | 'personal-curriculum-changed'
  | 'no-open-due-frontier-goal'
  | 'active-goal-in-progress'
  | null

export interface LearnerLearningPlanSummary {
  planId: string
  revision: number
  landscapeId: string
  planLabel: string | null
  stale: boolean
  period: LearnerLearningPlanPeriod
  currentBlock: LearnerLearningPlanCurrentBlock | null
  nextMilestone: LearnerLearningPlanMilestone | null
  metrics: LearnerLearningPlanMetrics
  buffer: LearnerLearningPlanBuffer
  pace: LearnerLearningPlanPace
  nextEligibleGoal: LearnerLearningPlanNextEligibleGoal | null
  continueReason: LearnerLearningPlanContinueReason
  canContinue: boolean
}

export interface LearnerLearningPlansResponse {
  asOf: LearnerLearningPlanDate
  followLearningPlans: boolean
  plans: LearnerLearningPlanSummary[]
}

export interface LearnerLearningPlanLearningBlock {
  id: string
  kind: 'learning'
  goalId?: string
  title?: string
  startDate: LearnerLearningPlanDate
  endDate: LearnerLearningPlanDate
  /** Server-materialized, chronologically deduplicated open atomic goals. */
  atomicGoalIds?: string[]
}

export interface LearnerLearningPlanBufferBlock {
  id: string
  kind: 'buffer'
  title: string
  startDate: LearnerLearningPlanDate
  endDate: LearnerLearningPlanDate
}

export interface LearnerLearningPlanMilestoneBlock {
  id: string
  kind: 'milestone'
  title: string
  goalId?: string
  date: LearnerLearningPlanDate
}

export type LearnerLearningPlanBlock =
  | LearnerLearningPlanLearningBlock
  | LearnerLearningPlanBufferBlock
  | LearnerLearningPlanMilestoneBlock

export interface LearnerLearningPlanDetail extends LearnerLearningPlanSummary {
  blocks: LearnerLearningPlanBlock[]
}

export interface SaveLearnerLearningPlanLearningBlock {
  id: string
  kind: 'learning'
  goalId?: string
  title?: string
  startDate: LearnerLearningPlanDate
  endDate: LearnerLearningPlanDate
  atomicGoalIds: string[]
}

export interface SaveLearnerLearningPlanBufferBlock {
  id: string
  kind: 'buffer'
  title: string
  startDate: LearnerLearningPlanDate
  endDate: LearnerLearningPlanDate
}

export interface SaveLearnerLearningPlanMilestoneBlock {
  id: string
  kind: 'milestone'
  title: string
  goalId?: string
  date: LearnerLearningPlanDate
}

export type SaveLearnerLearningPlanBlock =
  | SaveLearnerLearningPlanLearningBlock
  | SaveLearnerLearningPlanBufferBlock
  | SaveLearnerLearningPlanMilestoneBlock

export interface SaveLearnerLearningPlanRequest {
  /** Zero creates a plan; later writes must match the current revision. */
  expectedRevision: number
  planLabel?: string
  blocks: SaveLearnerLearningPlanBlock[]
}

export interface ContinueLearnerLearningPlanRequest {
  expectedRevision: number
  /** Optional test/reconciliation guard. Normal Cockpit actions use the server's current Europe/Berlin date. */
  asOf?: LearnerLearningPlanDate
}

export interface ContinueLearnerLearningPlanResponse {
  planId: string
  revision: number
  landscapeId: string
  focusGoalId: string
  activeGoalId: string
  state: Record<string, unknown>
}

export interface ReconcileLearnerLearningPlansRequest {
  /** The server-provided Europe/Berlin day from the current plans read model. */
  asOf: LearnerLearningPlanDate
}

export interface SwitchLearnerLearningPlanRequest {
  expectedRevision: number
  /** The server-provided Europe/Berlin day from the current plans read model. */
  asOf: LearnerLearningPlanDate
}

/**
 * Reconcile may return no selected target when nothing is due or when it only
 * clears a completed active pointer. `changed` describes canonical state, so
 * it may still be true while all target fields are null.
 */
export interface LearnerLearningPlanTransitionResponse {
  planId: string | null
  revision: number | null
  landscapeId: string | null
  focusGoalId: string | null
  activeGoalId: string | null
  changed: boolean
  state: Record<string, unknown>
}

export interface ActivateLearnerLearningPlanEntry {
  landscapeId: string
  expectedRevision: number
  planLabel?: string
  blocks: SaveLearnerLearningPlanBlock[]
}

export interface ActivateLearnerLearningPlansRequest {
  /** The server-provided Europe/Berlin day used for the atomic activation. */
  asOf: LearnerLearningPlanDate
  plans: ActivateLearnerLearningPlanEntry[]
}

export interface ActivateLearnerLearningPlansResponse {
  asOf: LearnerLearningPlanDate
  followLearningPlans: true
  plans: LearnerLearningPlanDetail[]
  selectedPlanId: string | null
  selectedLandscapeId: string | null
  focusGoalId: string | null
  activeGoalId: string | null
  state: Record<string, unknown>
}

/** Read-only projection of the proposed batch using the learner's current mastery. */
export interface PreviewLearnerLearningPlansResponse {
  asOf: LearnerLearningPlanDate
  days: Array<{
    date: LearnerLearningPlanDate
    subjects: Array<{ landscapeId: string; metrics: LearnerLearningPlanMetrics }>
    totals: LearnerLearningPlanMetrics
  }>
}
