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
  nonce: number
}
