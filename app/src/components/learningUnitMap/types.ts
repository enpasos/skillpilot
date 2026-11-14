export type MapEntryKind = 'unit' | 'cluster' | 'motivation' | 'goal' | 'assessment' | 'memory'

/** A compact record of actual atomic demand, never a new completion contract. */
export interface LearningMapRequirement {
  requiredGoalId: string
  dependentGoalId: string
  authoredOnGoalId?: string
  inherited: boolean
  sourceGoalIds: string[]
  unresolved: boolean
}

export interface LearningMapRelation {
  source: string
  target: string
  kind: 'requirement' | 'summary'
  provenance: LearningMapRequirement[]
  /**
   * Unit map only, between two child units of one unit: `declared` follows an
   * `after` (target lies after source); `derived` stems from goal demand that
   * no `after` covers yet. Absent for every other relation.
   */
  unitOrder?: 'declared' | 'derived'
  /** Unit map only: demand against the declared order (Rückgriff). The source lies after the target. */
  backward?: true
}

export interface LearningMapEntry {
  id: string
  title: string
  description: string
  kind: MapEntryKind
  children?: string[]
  requires: string[]
  position: { x: number; y: number }
  eyebrow?: string
  /** Unit map only: landscape IDs of the subjects whose goals the entry is or contains. */
  subjects?: string[]
  /** Unit map only: a goal the prerequisite closure added from outside the plan. */
  preparation?: true
  /** Unit map only: which kind of unit (concept §3.1) a `unit` entry is; it names the unit in the map. */
  unitType?: 'unit' | 'unitWithAssessments'
}

export interface LearningMapFixture {
  rootId: string
  title: string
  entries: Record<string, LearningMapEntry>
  /** Native projections provide scope-relative inverse prerequisite edges. */
  scopeRelations?: Record<string, LearningMapRelation[]>
  /** Requirements outside a board stay context, never extra target nodes. */
  scopeContext?: Record<string, Record<string, LearningMapRequirement[]>>
  contextGoalTitles?: Record<string, string>
  entryPaths?: Record<string, string[]>
  /** Original direct demand, expanded only when the learner inspects context. */
  getRequirementContext?: (goalId: string) => LearningMapRequirement[]
}

/** Read-only projection supplied by the caller; never a persisted unit result. */
export interface LearningEntryProgress {
  total: number
  explicit: number
  implicit: number
  explicitRatio?: number
  implicitRatio?: number
  implicitScopeLabel?: string
  waiverLabel?: string
}

export interface LearningMapCommand {
  entryId: string
  /** Monotonic explicit-reveal sequence; ordinary selections retain its value. */
  nonce: number
  /** Requested reveal target, which may precede the routed selected entryId. */
  revealEntryId?: string
}
