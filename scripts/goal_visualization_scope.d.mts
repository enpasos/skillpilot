export interface GoalVisualizationScopeGoal {
  contains?: readonly unknown[] | null
  nodeKind?: unknown
  tags?: readonly unknown[] | null
  examData?: unknown
}

export function isOrdinaryAtomicGoalForVisualization(goal: unknown): goal is GoalVisualizationScopeGoal

export function normalizeGoalVisualizationSubject(value: unknown): string
